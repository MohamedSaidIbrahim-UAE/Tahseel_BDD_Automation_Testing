/**
 * Assertion Helpers Utility
 * Provides common assertion patterns used across all 209 modules
 * Ensures consistent validation and error messages
 */

import { Page, expect } from '@playwright/test';
import { config } from '../config/config';

export class AssertionHelpers {
  /**
   * Assert element is visible on page
   */
  static async assertElementVisible(
    page: Page,
    selector: string,
    message?: string
  ): Promise<void> {
    try {
      await expect(page.locator(selector).first()).toBeVisible({ timeout: config.timeout });
    } catch (error) {
      throw new Error(
        message || `Element "${selector}" is not visible. ${(error as Error).message}`
      );
    }
  }

  /**
   * Assert element is hidden/not visible
   */
  static async assertElementHidden(
    page: Page,
    selector: string,
    message?: string
  ): Promise<void> {
    try {
      await expect(page.locator(selector).first()).toBeHidden({ timeout: config.timeout });
    } catch (error) {
      throw new Error(
        message || `Element "${selector}" is visible but should be hidden. ${(error as Error).message}`
      );
    }
  }

  /**
   * Assert element exists in DOM
   */
  static async assertElementExists(
    page: Page,
    selector: string,
    message?: string
  ): Promise<void> {
    const count = await page.locator(selector).count();
    if (count === 0) {
      throw new Error(message || `Element "${selector}" does not exist in DOM.`);
    }
  }

  /**
   * Assert element does not exist in DOM
   */
  static async assertElementNotExists(
    page: Page,
    selector: string,
    message?: string
  ): Promise<void> {
    const count = await page.locator(selector).count();
    if (count > 0) {
      throw new Error(
        message || `Element "${selector}" exists but should not. Found ${count} element(s).`
      );
    }
  }

  /**
   * Assert element contains text
   */
  static async assertElementText(
    page: Page,
    selector: string,
    text: string,
    caseSensitive = false,
    message?: string
  ): Promise<void> {
    try {
      if (caseSensitive) {
        await expect(page.locator(selector).first()).toContainText(text);
      } else {
        const actualText = await page.locator(selector).first().textContent() || '';
        if (!actualText.toLowerCase().includes(text.toLowerCase())) {
          throw new Error(`Text not found`);
        }
      }
    } catch (error) {
      throw new Error(
        message ||
        `Element "${selector}" does not contain text "${text}". ${(error as Error).message}`
      );
    }
  }

  /**
   * Assert element has exact text
   */
  static async assertElementExactText(
    page: Page,
    selector: string,
    text: string,
    message?: string
  ): Promise<void> {
    try {
      await expect(page.locator(selector).first()).toHaveText(text);
    } catch (error) {
      throw new Error(
        message ||
        `Element "${selector}" does not have exact text "${text}". ${(error as Error).message}`
      );
    }
  }

  /**
   * Assert element has attribute value
   */
  static async assertElementAttribute(
    page: Page,
    selector: string,
    attribute: string,
    value: string,
    message?: string
  ): Promise<void> {
    try {
      await expect(page.locator(selector).first()).toHaveAttribute(attribute, value);
    } catch (error) {
      throw new Error(
        message ||
        `Element "${selector}" attribute "${attribute}" is not "${value}". ${(error as Error).message}`
      );
    }
  }

  /**
   * Assert element has CSS class
   */
  static async assertElementHasClass(
    page: Page,
    selector: string,
    className: string,
    message?: string
  ): Promise<void> {
    const classAttr = await page.locator(selector).first().getAttribute('class') || '';
    if (!classAttr.includes(className)) {
      throw new Error(
        message || `Element "${selector}" does not have class "${className}".`
      );
    }
  }

  /**
   * Assert element does not have CSS class
   */
  static async assertElementNotHasClass(
    page: Page,
    selector: string,
    className: string,
    message?: string
  ): Promise<void> {
    const classAttr = await page.locator(selector).first().getAttribute('class') || '';
    if (classAttr.includes(className)) {
      throw new Error(
        message || `Element "${selector}" has class "${className}" but should not.`
      );
    }
  }

  /**
   * Assert element is enabled
   */
  static async assertElementEnabled(
    page: Page,
    selector: string,
    message?: string
  ): Promise<void> {
    try {
      await expect(page.locator(selector).first()).toBeEnabled({ timeout: config.timeout });
    } catch (error) {
      throw new Error(
        message || `Element "${selector}" is not enabled. ${(error as Error).message}`
      );
    }
  }

  /**
   * Assert element is disabled
   */
  static async assertElementDisabled(
    page: Page,
    selector: string,
    message?: string
  ): Promise<void> {
    try {
      await expect(page.locator(selector).first()).toBeDisabled({ timeout: config.timeout });
    } catch (error) {
      throw new Error(
        message || `Element "${selector}" is not disabled. ${(error as Error).message}`
      );
    }
  }

  /**
   * Assert element is in viewport
   */
  static async assertElementInViewport(
    page: Page,
    selector: string,
    message?: string
  ): Promise<void> {
    try {
      await expect(page.locator(selector).first()).toBeInViewport({ timeout: config.timeout });
    } catch (error) {
      throw new Error(
        message || `Element "${selector}" is not in viewport. ${(error as Error).message}`
      );
    }
  }

  /**
   * Assert page has title
   */
  static async assertPageTitle(page: Page, title: string, message?: string): Promise<void> {
    try {
      await expect(page).toHaveTitle(title);
    } catch (error) {
      const actualTitle = page.title();
      throw new Error(
        message ||
        `Page title is "${actualTitle}" but expected "${title}". ${(error as Error).message}`
      );
    }
  }

  /**
   * Assert page URL contains text
   */
  static async assertPageUrlContains(
    page: Page,
    urlPart: string,
    message?: string
  ): Promise<void> {
    try {
      await expect(page).toHaveURL(new RegExp(urlPart));
    } catch (error) {
      throw new Error(
        message ||
        `Page URL does not contain "${urlPart}". Current URL: ${page.url()}. ${(error as Error).message}`
      );
    }
  }

  /**
   * Assert validation error is displayed
   */
  static async assertValidationError(
    page: Page,
    errorMessage: string,
    message?: string
  ): Promise<void> {
    const errorLocator = page.locator(
      `div[class*="error"], span[class*="error"], [role="alert"]:has-text("${errorMessage}")`
    ).first();

    try {
      await expect(errorLocator).toBeVisible({ timeout: config.timeout });
    } catch (error) {
      throw new Error(
        message ||
        `Validation error "${errorMessage}" is not displayed. ${(error as Error).message}`
      );
    }
  }

  /**
   * Assert success message is displayed
   */
  static async assertSuccessMessage(
    page: Page,
    message: string
  ): Promise<void> {
    const successLocator = page.locator(
      `div[class*="success"], [role="status"]:has-text("${message}")`
    ).first();

    try {
      await expect(successLocator).toBeVisible({ timeout: config.timeout });
    } catch (error) {
      throw new Error(`Success message "${message}" is not displayed. ${(error as Error).message}`);
    }
  }

  /**
   * Assert table row count
   */
  static async assertTableRowCount(
    page: Page,
    tableSelector: string,
    expectedCount: number,
    message?: string
  ): Promise<void> {
    const rows = await page.locator(`${tableSelector} tbody tr, ${tableSelector} [role="row"]`).count();
    
    if (rows !== expectedCount) {
      throw new Error(
        message ||
        `Expected ${expectedCount} table rows but found ${rows}.`
      );
    }
  }

  /**
   * Assert table contains row with text
   */
  static async assertTableRowContains(
    page: Page,
    tableSelector: string,
    text: string,
    message?: string
  ): Promise<void> {
    const rowLocator = page.locator(`${tableSelector} tbody tr:has-text("${text}")`).first();

    try {
      await expect(rowLocator).toBeVisible({ timeout: config.timeout });
    } catch (error) {
      throw new Error(
        message ||
        `Table row containing "${text}" not found in ${tableSelector}. ${(error as Error).message}`
      );
    }
  }

  /**
   * Assert form is valid (no validation errors visible)
   */
  static async assertFormValid(page: Page, message?: string): Promise<void> {
    const errorCount = await page.locator('[class*="error"], [role="alert"]').count();
    
    if (errorCount > 0) {
      throw new Error(
        message || `Form has ${errorCount} validation error(s) but should be valid.`
      );
    }
  }

  /**
   * Assert form is invalid (has validation errors)
   */
  static async assertFormInvalid(page: Page, message?: string): Promise<void> {
    const errorCount = await page.locator('[class*="error"], [role="alert"]').count();
    
    if (errorCount === 0) {
      throw new Error(
        message || `Form is valid but should have validation errors.`
      );
    }
  }

  /**
   * Assert element count
   */
  static async assertElementCount(
    page: Page,
    selector: string,
    expectedCount: number,
    message?: string
  ): Promise<void> {
    const actualCount = await page.locator(selector).count();
    
    if (actualCount !== expectedCount) {
      throw new Error(
        message ||
        `Expected ${expectedCount} elements matching "${selector}" but found ${actualCount}.`
      );
    }
  }

  /**
   * Assert element count greater than
   */
  static async assertElementCountGreaterThan(
    page: Page,
    selector: string,
    minCount: number,
    message?: string
  ): Promise<void> {
    const actualCount = await page.locator(selector).count();
    
    if (actualCount <= minCount) {
      throw new Error(
        message ||
        `Expected more than ${minCount} elements matching "${selector}" but found ${actualCount}.`
      );
    }
  }

  /**
   * Assert element count less than
   */
  static async assertElementCountLessThan(
    page: Page,
    selector: string,
    maxCount: number,
    message?: string
  ): Promise<void> {
    const actualCount = await page.locator(selector).count();
    
    if (actualCount >= maxCount) {
      throw new Error(
        message ||
        `Expected less than ${maxCount} elements matching "${selector}" but found ${actualCount}.`
      );
    }
  }
}
