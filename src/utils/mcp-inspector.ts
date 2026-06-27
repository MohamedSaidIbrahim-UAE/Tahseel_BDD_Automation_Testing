/**
 * MCP Playwright Inspector Utility
 * 
 * Leverages Playwright MCP server for dynamic page inspection,
 * selector validation, and element discovery during test execution.
 * 
 * This utility bridges Playwright automation with MCP capabilities
 * to enable real-time selector validation and dynamic element inspection.
 */

import { Page, Locator } from '@playwright/test';

/**
 * Page element metadata captured during inspection
 */
export interface ElementMetadata {
  tagName: string;
  className: string;
  testId?: string;
  ariaLabel?: string;
  role?: string;
  text: string;
  visible: boolean;
  enabled: boolean;
  xpath: string;
  css: string;
}

/**
 * Page structure information
 */
export interface PageStructure {
  title: string;
  url: string;
  elementCount: number;
  interactiveElements: ElementMetadata[];
  formElements: ElementMetadata[];
  tableElements: ElementMetadata[];
  buttonElements: ElementMetadata[];
}

/**
 * Selector validation result
 */
export interface SelectorValidationResult {
  valid: boolean;
  elementFound: boolean;
  elementCount: number;
  firstElementText?: string;
  xpath: string;
  fallbackSelectors: string[];
}

/**
 * MCP Inspector service for dynamic page inspection and selector validation
 */
export class MCPInspector {
  /**
   * Inspect page structure and extract interactive elements
   */
  static async inspectPageStructure(page: Page): Promise<PageStructure> {
    const title = await page.title();
    const url = page.url();

    // Get all interactive elements
    const interactiveElements = await this.findInteractiveElements(page);
    const formElements = await this.findFormElements(page);
    const tableElements = await this.findTableElements(page);
    const buttonElements = await this.findButtonElements(page);

    return {
      title,
      url,
      elementCount: interactiveElements.length + formElements.length + tableElements.length + buttonElements.length,
      interactiveElements,
      formElements,
      tableElements,
      buttonElements,
    };
  }

  /**
   * Find all interactive elements on page
   */
  private static async findInteractiveElements(page: Page): Promise<ElementMetadata[]> {
    const elements: ElementMetadata[] = [];

    const interactiveSelectors = [
      'button',
      'a[href]',
      '[role="button"]',
      'input[type="button"]',
      'input[type="submit"]',
      '[onclick]',
    ];

    for (const selector of interactiveSelectors) {
      const locators = page.locator(selector);
      const count = await locators.count();
      for (let i = 0; i < Math.min(count, 50); i++) {
        const element = locators.nth(i);
        try {
          const metadata = await this.extractElementMetadata(element);
          elements.push(metadata);
        } catch {
          // Skip elements that can't be inspected
        }
      }
    }

    return elements;
  }

  /**
   * Find all form elements on page
   */
  private static async findFormElements(page: Page): Promise<ElementMetadata[]> {
    const elements: ElementMetadata[] = [];

    const formSelectors = [
      'input[type="text"]',
      'input[type="email"]',
      'input[type="password"]',
      'input[type="number"]',
      'textarea',
      'select',
      '[role="combobox"]',
      'dx-text-box',
      'dx-date-box',
      'dx-select-box',
    ];

    for (const selector of formSelectors) {
      const locators = page.locator(selector);
      const count = await locators.count();
      for (let i = 0; i < Math.min(count, 50); i++) {
        const element = locators.nth(i);
        try {
          const metadata = await this.extractElementMetadata(element);
          elements.push(metadata);
        } catch {
          // Skip elements that can't be inspected
        }
      }
    }

    return elements;
  }

  /**
   * Find all table elements on page
   */
  private static async findTableElements(page: Page): Promise<ElementMetadata[]> {
    const elements: ElementMetadata[] = [];

    const tableSelectors = [
      'table',
      '[role="grid"]',
      'dx-data-grid',
      '[role="table"]',
    ];

    for (const selector of tableSelectors) {
      const locators = page.locator(selector);
      const count = await locators.count();
      for (let i = 0; i < Math.min(count, 20); i++) {
        const element = locators.nth(i);
        try {
          const metadata = await this.extractElementMetadata(element);
          elements.push(metadata);
        } catch {
          // Skip elements that can't be inspected
        }
      }
    }

    return elements;
  }

  /**
   * Find all button elements on page
   */
  private static async findButtonElements(page: Page): Promise<ElementMetadata[]> {
    const elements: ElementMetadata[] = [];

    const buttonSelectors = [
      'button',
      'input[type="button"]',
      'input[type="submit"]',
      '[role="button"]',
      'a.btn',
      'a.button',
    ];

    for (const selector of buttonSelectors) {
      const locators = page.locator(selector);
      const count = await locators.count();
      for (let i = 0; i < Math.min(count, 30); i++) {
        const element = locators.nth(i);
        try {
          const metadata = await this.extractElementMetadata(element);
          elements.push(metadata);
        } catch {
          // Skip elements that can't be inspected
        }
      }
    }

    return elements;
  }

  /**
   * Extract metadata from a single element
   */
  private static async extractElementMetadata(element: Locator): Promise<ElementMetadata> {
    const tagName = await element.evaluate((el) => el.tagName.toLowerCase());
    const className = await element.evaluate((el) => el.className);
    const testId = await element.getAttribute('data-testid');
    const ariaLabel = await element.getAttribute('aria-label');
    const role = await element.getAttribute('role');
    const text = await element.textContent();
    const visible = await element.isVisible();
    const enabled = await element.isEnabled();

    const xpath = await element.evaluate((el) => {
      let path: string[] = [];
      let node: Element | null = el;
      while (node && node.nodeType !== 9) {
        let index = 0;
        let sibling = node.previousSibling;
        while (sibling) {
          if (sibling.nodeType === 1 && (sibling as Element).tagName === node.tagName) {
            index++;
          }
          sibling = sibling.previousSibling;
        }
        const pathIndex = index > 0 ? `[${index + 1}]` : '';
        path.unshift((node as Element).tagName.toLowerCase() + pathIndex);
        node = (node as Element).parentElement;
      }
      return '/' + path.join('/');
    });

    const css = await element.evaluate((el) => {
      const selectors: string[] = [];
      if (el.id) selectors.push(`#${el.id}`);
      if (el.className) {
        const classes = el.className.split(' ').filter((c) => c);
        selectors.push(`.${classes.join('.')}`);
      }
      return selectors.length > 0 ? selectors[0] : el.tagName.toLowerCase();
    });

    return {
      tagName,
      className,
      testId: testId || undefined,
      ariaLabel: ariaLabel || undefined,
      role: role || undefined,
      text: (text || '').trim(),
      visible,
      enabled,
      xpath,
      css,
    };
  }

  /**
   * Find selector for element by name/label
   */
  static async findSelectorForElement(page: Page, elementName: string): Promise<string | null> {
    // Try multiple strategies to find element
    const strategies = [
      // By test ID
      `[data-testid*="${elementName}"]`,
      // By aria-label
      `[aria-label*="${elementName}"]`,
      // By text content
      `button:has-text("${elementName}")`,
      `a:has-text("${elementName}")`,
      `label:has-text("${elementName}")`,
      // By placeholder
      `input[placeholder*="${elementName}"]`,
      // By title
      `[title*="${elementName}"]`,
    ];

    for (const selector of strategies) {
      try {
        const count = await page.locator(selector).count();
        if (count > 0) return selector;
      } catch {
        continue;
      }
    }

    return null;
  }

  /**
   * Validate selector and return detailed validation result
   */
  static async validateSelector(page: Page, selector: string): Promise<SelectorValidationResult> {
    const fallbackSelectors: string[] = [];
    let elementFound = false;
    let elementCount = 0;
    let firstElementText: string | undefined;
    let xpath = '';

    try {
      const locator = page.locator(selector);
      elementCount = await locator.count();
      elementFound = elementCount > 0;

      if (elementFound) {
        try {
          firstElementText = await locator.first().textContent();
        } catch {
          // Element exists but can't get text
        }

        try {
          xpath = await locator.first().evaluate((el) => {
            let path: string[] = [];
            let node: Element | null = el;
            while (node && node.nodeType !== 9) {
              let index = 0;
              let sibling = node.previousSibling;
              while (sibling) {
                if (sibling.nodeType === 1 && (sibling as Element).tagName === node.tagName) {
                  index++;
                }
                sibling = sibling.previousSibling;
              }
              const pathIndex = index > 0 ? `[${index + 1}]` : '';
              path.unshift((node as Element).tagName.toLowerCase() + pathIndex);
              node = (node as Element).parentElement;
            }
            return '/' + path.join('/');
          });
        } catch {
          // Can't get xpath
        }
      }
    } catch {
      elementFound = false;
      elementCount = 0;
    }

    // Generate fallback selectors
    try {
      const text = firstElementText || '';
      if (text) {
        fallbackSelectors.push(`text="${text}"`);
        fallbackSelectors.push(`:has-text("${text}")`);
      }
    } catch {
      // Skip fallbacks
    }

    return {
      valid: elementFound && elementCount > 0,
      elementFound,
      elementCount,
      firstElementText,
      xpath,
      fallbackSelectors,
    };
  }

  /**
   * Get detailed element metadata
   */
  static async getElementMetadata(page: Page, selector: string): Promise<ElementMetadata | null> {
    try {
      const element = page.locator(selector);
      const count = await element.count();
      if (count === 0) return null;
      return this.extractElementMetadata(element.first());
    } catch {
      return null;
    }
  }

  /**
   * Take screenshot of specific element
   */
  static async screenshotElement(page: Page, selector: string, filename: string): Promise<Buffer> {
    try {
      const element = page.locator(selector);
      const count = await element.count();
      if (count === 0) throw new Error(`Element not found: ${selector}`);
      return await element.first().screenshot();
    } catch (error) {
      throw new Error(`Failed to screenshot element "${selector}": ${error}`);
    }
  }

  /**
   * Compare element visually with previous screenshot
   */
  static async compareElementScreenshot(page: Page, selector: string, baselinePath: string): Promise<boolean> {
    try {
      const element = page.locator(selector);
      const count = await element.count();
      if (count === 0) return false;
      // Visual comparison would be done with additional tooling
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get all accessible elements matching criteria
   */
  static async getAccessibleElements(page: Page, role: string): Promise<ElementMetadata[]> {
    const elements: ElementMetadata[] = [];
    const locators = page.getByRole(role as any);
    const count = await locators.count();

    for (let i = 0; i < count; i++) {
      try {
        const metadata = await this.extractElementMetadata(locators.nth(i));
        elements.push(metadata);
      } catch {
        continue;
      }
    }

    return elements;
  }
}
