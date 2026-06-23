/**
 * MCP Playwright Inspector - Leverage Playwright MCP for dynamic element inspection
 * 
 * This utility uses the Playwright MCP server to dynamically inspect pages,
 * find selectors, and validate element locators without hardcoding.
 */

import { Page, Locator } from '@playwright/test';

/**
 * Element inspection result
 */
export interface ElementInspection {
  tag: string;
  classes: string[];
  id?: string;
  ariaLabel?: string;
  role?: string;
  text?: string;
  xpath?: string;
  attributes: { [key: string]: string };
}

/**
 * Selector validation result
 */
export interface SelectorValidation {
  selector: string;
  isValid: boolean;
  elementCount: number;
  firstElement?: ElementInspection;
  timing: number;
}

/**
 * Page structure snapshot
 */
export interface PageStructure {
  url: string;
  title: string;
  tables: number;
  forms: number;
  buttons: number;
  inputs: number;
  dialogs: number;
  elements: ElementInspection[];
  timestamp: Date;
}

/**
 * MCP Playwright Inspector for dynamic element inspection
 */
export class MCPPlaywrightInspector {
  /**
   * Inspect a page and extract structure information
   */
  static async inspectPageStructure(page: Page): Promise<PageStructure> {
    const structure = await page.evaluate(() => {
      const tables = document.querySelectorAll('table, [role="grid"], [role="table"]');
      const forms = document.querySelectorAll('form');
      const buttons = document.querySelectorAll('button, [role="button"]');
      const inputs = document.querySelectorAll('input, textarea, select');
      const dialogs = document.querySelectorAll('[role="dialog"]');

      return {
        url: window.location.href,
        title: document.title,
        tables: tables.length,
        forms: forms.length,
        buttons: buttons.length,
        inputs: inputs.length,
        dialogs: dialogs.length,
      };
    });

    return {
      ...structure,
      elements: [],
      timestamp: new Date(),
    };
  }

  /**
   * Find selector for element with text
   */
  static async findSelectorForElementByText(
    page: Page,
    elementText: string,
    elementType: string = '*'
  ): Promise<string | null> {
    try {
      const selector = await page.evaluate(
        ({ text, type }) => {
          const xpath = `//${type}[contains(text(), '${text}')]`;
          const result = document.evaluate(
            xpath,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
          );
          return result.singleNodeValue ? xpath : null;
        },
        { text: elementText, type: elementType }
      );

      if (selector) {
        console.log(`[MCP] Found selector for "${elementText}": ${selector}`);
        return selector;
      }

      return null;
    } catch (error) {
      console.warn(`[MCP] Error finding selector for "${elementText}":`, error);
      return null;
    }
  }

  /**
   * Find selector for element with aria-label
   */
  static async findSelectorByAriaLabel(page: Page, ariaLabel: string): Promise<string | null> {
    try {
      const selector = `[aria-label="${ariaLabel}"]`;
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`[MCP] Found element with aria-label: ${selector}`);
        return selector;
      }
      return null;
    } catch (error) {
      console.warn(`[MCP] Error finding element by aria-label:`, error);
      return null;
    }
  }

  /**
   * Validate selector - returns whether it's valid and element count
   */
  static async validateSelector(page: Page, selector: string): Promise<SelectorValidation> {
    const startTime = Date.now();

    try {
      const locator = page.locator(selector);
      const count = await locator.count();

      const validation: SelectorValidation = {
        selector,
        isValid: count > 0,
        elementCount: count,
        timing: Date.now() - startTime,
      };

      if (count > 0) {
        validation.firstElement = await this.inspectElement(page, selector);
      }

      return validation;
    } catch (error) {
      console.warn(`[MCP] Selector validation failed for "${selector}":`, error);
      return {
        selector,
        isValid: false,
        elementCount: 0,
        timing: Date.now() - startTime,
      };
    }
  }

  /**
   * Validate multiple selectors (fallback chain)
   */
  static async validateSelectorChain(page: Page, selectors: string[]): Promise<SelectorValidation[]> {
    const validations: SelectorValidation[] = [];

    for (const selector of selectors) {
      const validation = await this.validateSelector(page, selector);
      validations.push(validation);

      if (validation.isValid) {
        console.log(`[MCP] Selector chain - found valid: ${selector}`);
        break;
      }
    }

    return validations;
  }

  /**
   * Inspect element properties
   */
  static async inspectElement(page: Page, selector: string): Promise<ElementInspection> {
    const inspection = await page.evaluate(
      (sel) => {
        const element = document.querySelector(sel) as any;
        if (!element) {
          return null;
        }

        return {
          tag: element.tagName,
          classes: Array.from(element.classList),
          id: element.id || undefined,
          ariaLabel: element.getAttribute('aria-label'),
          role: element.getAttribute('role'),
          text: element.textContent?.substring(0, 100),
          attributes: Object.fromEntries(
            Array.from(element.attributes).map((attr: any) => [attr.name, attr.value])
          ),
        };
      },
      selector
    );

    if (!inspection) {
      throw new Error(`Element not found for selector: ${selector}`);
    }

    return inspection as ElementInspection;
  }

  /**
   * Find all buttons on page
   */
  static async findAllButtons(page: Page): Promise<{ selector: string; text: string }[]> {
    const buttons = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button, [role="button"]');
      return Array.from(buttons).map((btn: any) => ({
        selector: btn.id ? `#${btn.id}` : btn.getAttribute('aria-label') || 'button',
        text: btn.textContent?.trim() || btn.getAttribute('aria-label') || 'Unknown',
      }));
    });

    return buttons;
  }

  /**
   * Find all form fields on page
   */
  static async findAllFormFields(page: Page): Promise<{ selector: string; label: string; type: string }[]> {
    const fields = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input, textarea, select');
      return Array.from(inputs).map((field: any) => {
        const label = document.querySelector(`label[for="${field.id}"]`)?.textContent?.trim() || field.placeholder || '';
        return {
          selector: field.id ? `#${field.id}` : field.name ? `[name="${field.name}"]` : 'input',
          label,
          type: field.type || field.tagName,
        };
      });
    });

    return fields;
  }

  /**
   * Find table structure
   */
  static async inspectTable(page: Page, tableSelector: string): Promise<object> {
    const tableInfo = await page.evaluate(
      (selector) => {
        const table = document.querySelector(selector) as any;
        if (!table) {
          return null;
        }

        const headers = Array.from(table.querySelectorAll('th')).map((th: any) => th.textContent?.trim());
        const rows = table.querySelectorAll('tbody tr');
        const firstRowData = Array.from(rows[0]?.querySelectorAll('td') || []).map((td: any) => td.textContent?.trim());

        return {
          headerCount: headers.length,
          headers,
          rowCount: rows.length,
          firstRowData,
          columnCount: firstRowData.length,
        };
      },
      tableSelector
    );

    return tableInfo || {};
  }

  /**
   * Wait for element to be actionable
   */
  static async waitForElementActionable(page: Page, selector: string, timeout: number = 30000): Promise<boolean> {
    try {
      const locator = page.locator(selector);
      await locator.first().waitFor({ state: 'visible', timeout });

      // Check if it's clickable
      const isClickable = await page.evaluate((sel) => {
        const element = document.querySelector(sel) as any;
        if (!element) return false;

        const rect = element.getBoundingClientRect();
        const isInViewport = rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth;
        const isNotHidden = window.getComputedStyle(element).visibility !== 'hidden' && window.getComputedStyle(element).display !== 'none';

        return isInViewport && isNotHidden;
      }, selector);

      return isClickable;
    } catch (error) {
      console.warn(`[MCP] Element not actionable: ${selector}`, error);
      return false;
    }
  }

  /**
   * Get page diagnostics for debugging
   */
  static async getPageDiagnostics(page: Page): Promise<object> {
    const diagnostics = await page.evaluate(() => ({
      url: window.location.href,
      title: document.title,
      ready: document.readyState,
      errors: window.onerror ? 'Yes' : 'No',
      elements: {
        total: document.querySelectorAll('*').length,
        visible: Array.from(document.querySelectorAll('*')).filter((el: any) => {
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && style.visibility !== 'hidden';
        }).length,
      },
      performance: {
        navigationStart: (performance as any).timing?.navigationStart,
        loadComplete: (performance as any).timing?.loadEventEnd,
        domReady: (performance as any).timing?.domContentLoadedEventEnd,
      },
    }));

    return diagnostics;
  }

  /**
   * Take annotated screenshot highlighting selector
   */
  static async takeAnnotatedScreenshot(
    page: Page,
    selector: string,
    outputPath: string
  ): Promise<void> {
    try {
      // Highlight element
      await page.evaluate((sel) => {
        const element = document.querySelector(sel) as any;
        if (element) {
          element.style.border = '3px solid red';
          element.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.5)';
        }
      }, selector);

      // Take screenshot
      await page.screenshot({ path: outputPath });

      // Remove highlight
      await page.evaluate((sel) => {
        const element = document.querySelector(sel) as any;
        if (element) {
          element.style.border = '';
          element.style.boxShadow = '';
        }
      }, selector);

      console.log(`[MCP] Annotated screenshot saved: ${outputPath}`);
    } catch (error) {
      console.warn(`[MCP] Error taking annotated screenshot:`, error);
    }
  }
}

/**
 * Dynamic selector discovery helper
 */
export class SelectorDiscovery {
  /**
   * Discover best selector for an element by text and type
   */
  static async discoverSelector(
    page: Page,
    elementText: string,
    elementType: string = 'button'
  ): Promise<string | null> {
    const strategies = [
      // Strategy 1: By aria-label
      async () => {
        const selector = `[aria-label="${elementText}"]`;
        const count = await page.locator(selector).count();
        return count > 0 ? selector : null;
      },

      // Strategy 2: By text content
      async () => {
        const selector = `${elementType}:has-text("${elementText}")`;
        const count = await page.locator(selector).count();
        return count > 0 ? selector : null;
      },

      // Strategy 3: By role and text
      async () => {
        const selector = `[role="button"]:has-text("${elementText}")`;
        const count = await page.locator(selector).count();
        return count > 0 ? selector : null;
      },

      // Strategy 4: By title attribute
      async () => {
        const selector = `[title="${elementText}"]`;
        const count = await page.locator(selector).count();
        return count > 0 ? selector : null;
      },
    ];

    for (const strategy of strategies) {
      try {
        const selector = await strategy();
        if (selector) {
          console.log(`[SelectorDiscovery] Found selector: ${selector}`);
          return selector;
        }
      } catch (error) {
        // Continue to next strategy
      }
    }

    console.warn(`[SelectorDiscovery] No selector found for: ${elementText}`);
    return null;
  }

  /**
   * Discover all interactive elements on page
   */
  static async discoverInteractiveElements(page: Page): Promise<Map<string, string>> {
    const elements = new Map<string, string>();

    const discovered = await page.evaluate(() => {
      const clickables = document.querySelectorAll('button, [role="button"], a, input[type="submit"], input[type="button"]');
      return Array.from(clickables).map((el: any) => ({
        text: el.textContent?.trim() || el.getAttribute('aria-label') || el.value || 'Unknown',
        type: el.tagName,
        role: el.getAttribute('role'),
      }));
    });

    for (const item of discovered) {
      const selector = await this.discoverSelector(page, item.text, item.type.toLowerCase());
      if (selector) {
        elements.set(item.text, selector);
      }
    }

    return elements;
  }
}
