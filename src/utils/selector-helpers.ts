/**
 * Selector Helpers Utility
 * Provides resilient selector strategies and builder patterns
 * Used to construct reliable locators across all 209 modules
 */

import { Page, Locator } from '@playwright/test';

export interface SelectorOptions {
  exact?: boolean;
  timeout?: number;
  visible?: boolean;
}

export class SelectorHelpers {
  /**
   * Build selector by role and name
   * More resilient than CSS selectors
   */
  static byRole(role: string, name: string): string {
    return `[role="${role}"]:has-text("${name}")`;
  }

  /**
   * Build selector by label text (for form fields)
   */
  static byLabel(labelText: string): string {
    return `label:has-text("${labelText}") ~ input, [aria-label="${labelText}"]`;
  }

  /**
   * Build selector by test ID attribute
   * More reliable than other approaches
   */
  static byTestId(testId: string): string {
    return `[data-testid="${testId}"], [data-test-id="${testId}"], [test-id="${testId}"]`;
  }

  /**
   * Build selector by placeholder text
   */
  static byPlaceholder(placeholder: string): string {
    return `input[placeholder*="${placeholder}"], textarea[placeholder*="${placeholder}"]`;
  }

  /**
   * Build selector by aria-label
   */
  static byAriaLabel(label: string): string {
    return `[aria-label="${label}"]`;
  }

  /**
   * Build selector for button by text
   */
  static byButtonText(text: string): string {
    return `button:has-text("${text}"), [role="button"]:has-text("${text}")`;
  }

  /**
   * Build selector for link by text
   */
  static byLinkText(text: string): string {
    return `a:has-text("${text}"), [role="link"]:has-text("${text}")`;
  }

  /**
   * Build selector for heading by text
   */
  static byHeadingText(text: string, level = 1): string {
    return `h${level}:has-text("${text}")`;
  }

  /**
   * Build selector for table cell
   */
  static byTableCell(rowText: string, columnText: string): string {
    return `tr:has-text("${rowText}") td:has-text("${columnText}")`;
  }

  /**
   * Build selector by class name
   */
  static byClass(className: string): string {
    return `.${className}`;
  }

  /**
   * Build selector by multiple classes
   */
  static byClasses(...classNames: string[]): string {
    return classNames.map(c => `.${c}`).join('');
  }

  /**
   * Build selector by ID
   */
  static byId(id: string): string {
    return `#${id}`;
  }

  /**
   * Build selector by attribute
   */
  static byAttribute(attribute: string, value: string): string {
    return `[${attribute}="${value}"]`;
  }

  /**
   * Build selector by attribute containing value
   */
  static byAttributeContains(attribute: string, value: string): string {
    return `[${attribute}*="${value}"]`;
  }

  /**
   * Build selector by data attribute
   */
  static byDataAttribute(key: string, value: string): string {
    return `[data-${key}="${value}"]`;
  }

  /**
   * Combine multiple selectors with OR logic
   */
  static combine(...selectors: string[]): string {
    return selectors.join(', ');
  }

  /**
   * Build selector for element containing text
   */
  static containing(selector: string, text: string): string {
    return `${selector}:has-text("${text}")`;
  }

  /**
   * Build selector for element within parent
   */
  static within(parentSelector: string, childSelector: string): string {
    return `${parentSelector} ${childSelector}`;
  }

  /**
   * Build selector for nth child
   */
  static nthChild(selector: string, index: number): string {
    return `${selector}:nth-child(${index})`;
  }

  /**
   * Build selector for first element
   */
  static first(selector: string): string {
    return `${selector}:first-child`;
  }

  /**
   * Build selector for last element
   */
  static last(selector: string): string {
    return `${selector}:last-child`;
  }

  /**
   * Build selector using XPath (more powerful but slower)
   */
  static xpath(expression: string): string {
    return `xpath=${expression}`;
  }

  /**
   * Build XPath for text matching
   */
  static xpathByText(tagName: string, text: string): string {
    return this.xpath(`//${tagName}[contains(text(), '${text}')]`);
  }

  /**
   * Build XPath for element containing text
   */
  static xpathContaining(tagName: string, text: string): string {
    return this.xpath(`//${tagName}[contains(., '${text}')]`);
  }

  /**
   * Build XPath for ancestor element
   */
  static xpathAncestor(elementXPath: string, ancestorTag: string): string {
    return `${elementXPath}${this.xpath(`ancestor::${ancestorTag}[1]`)}`;
  }

  /**
   * Get all possible selector variations for resilience
   * Returns array of selectors from most to least specific
   */
  static getAllVariations(
    elementName: string,
    elementType: 'button' | 'input' | 'link' | 'text' | 'generic' = 'generic'
  ): string[] {
    const variations: string[] = [];

    if (elementType === 'button') {
      variations.push(this.byButtonText(elementName));
      variations.push(this.byTestId(elementName.toLowerCase().replace(/\s+/g, '-')));
      variations.push(this.byAriaLabel(elementName));
      variations.push(this.containing('button', elementName));
      variations.push(this.containing('[role="button"]', elementName));
    } else if (elementType === 'input') {
      variations.push(this.byLabel(elementName));
      variations.push(this.byTestId(elementName.toLowerCase().replace(/\s+/g, '-')));
      variations.push(this.byAriaLabel(elementName));
      variations.push(this.byPlaceholder(elementName));
    } else if (elementType === 'link') {
      variations.push(this.byLinkText(elementName));
      variations.push(this.byTestId(elementName.toLowerCase().replace(/\s+/g, '-')));
      variations.push(this.containing('a', elementName));
    } else if (elementType === 'text') {
      variations.push(this.containing('div', elementName));
      variations.push(this.containing('span', elementName));
      variations.push(this.containing('[role="status"]', elementName));
      variations.push(this.containing('[class*="message"]', elementName));
    }

    return variations;
  }

  /**
   * Try multiple selectors and return first that exists
   */
  static async findWithFallback(
    page: Page,
    selectors: string[]
  ): Promise<Locator | null> {
    for (const selector of selectors) {
      try {
        const locator = page.locator(selector);
        const count = await locator.count();
        if (count > 0) {
          return locator;
        }
      } catch {
        // Continue to next selector
      }
    }
    return null;
  }

  /**
   * Get locator with fallback selectors
   */
  static async getLocatorWithFallback(
    page: Page,
    primarySelector: string,
    fallbackSelectors: string[] = []
  ): Promise<Locator> {
    const allSelectors = [primarySelector, ...fallbackSelectors];
    
    for (const selector of allSelectors) {
      try {
        const locator = page.locator(selector);
        if (await locator.count() > 0) {
          return locator;
        }
      } catch {
        // Continue to next
      }
    }

    throw new Error(
      `No elements found for any of the selectors: ${allSelectors.join(', ')}`
    );
  }

  /**
   * Build complex selector for data grid cell
   */
  static dataGridCell(rowIdentifier: string, columnName: string): string {
    return `[role="gridcell"][data-column="${columnName}"]:has-text("${rowIdentifier}"), 
            [class*="cell"]:has-text("${rowIdentifier}"):has-text("${columnName}")`;
  }

  /**
   * Build complex selector for table row
   */
  static tableRow(identifier: string): string {
    return `tr:has-text("${identifier}"), [role="row"]:has-text("${identifier}")`;
  }

  /**
   * Build selector for list item
   */
  static listItem(itemText: string): string {
    return `li:has-text("${itemText}"), [role="listitem"]:has-text("${itemText}")`;
  }

  /**
   * Build selector for menu item
   */
  static menuItem(itemText: string): string {
    return `[role="menuitem"]:has-text("${itemText}"), div[class*="menu-item"]:has-text("${itemText}")`;
  }

  /**
   * Build selector for tab
   */
  static tab(tabName: string): string {
    return `[role="tab"]:has-text("${tabName}"), [class*="tab"]:has-text("${tabName}")`;
  }

  /**
   * Build selector for dialog/modal
   */
  static modal(title?: string): string {
    if (title) {
      return `[role="dialog"]:has-text("${title}"), [class*="modal"]:has-text("${title}")`;
    }
    return `[role="dialog"], [class*="modal"]`;
  }

  /**
   * Build selector for form
   */
  static form(formName?: string): string {
    if (formName) {
      return `form:has-text("${formName}"), [role="form"]:has-text("${formName}")`;
    }
    return `form, [role="form"]`;
  }

  /**
   * Build selector for error message
   */
  static errorMessage(message?: string): string {
    if (message) {
      return `[role="alert"]:has-text("${message}"), [class*="error"]:has-text("${message}")`;
    }
    return `[role="alert"], [class*="error"], [class*="validation"]`;
  }

  /**
   * Build selector for success message
   */
  static successMessage(message?: string): string {
    if (message) {
      return `[role="status"]:has-text("${message}"), [class*="success"]:has-text("${message}")`;
    }
    return `[role="status"], [class*="success"]`;
  }

  /**
   * Build selector for warning message
   */
  static warningMessage(message?: string): string {
    if (message) {
      return `[class*="warning"]:has-text("${message}"), [role="alert"]:has-text("${message}")`;
    }
    return `[class*="warning"], [role="alert"]`;
  }
}
