/**
 * Element Interactions Utility
 * Provides reusable methods for interacting with page elements
 * Used across all 209 modules for consistent behavior
 */

import { Page, Locator, expect } from '@playwright/test';
import { config } from '../config/config';

export class ElementInteractions {
  /**
   * Safely click an element with retry logic
   */
  static async clickElement(page: Page, selector: string, retries = 3): Promise<void> {
    let lastError: Error | null = null;
    
    for (let i = 0; i < retries; i++) {
      try {
        await page.locator(selector).first().click({ timeout: config.timeout });
        return;
      } catch (error) {
        lastError = error as Error;
        if (i < retries - 1) {
          await page.waitForTimeout(500 * (i + 1));
        }
      }
    }
    
    throw new Error(
      `Failed to click element "${selector}" after ${retries} retries. Last error: ${lastError?.message}`
    );
  }

  /**
   * Safely fill text input with clear-first approach
   */
  static async typeText(
    page: Page,
    selector: string,
    text: string,
    clearFirst = true
  ): Promise<void> {
    const locator = page.locator(selector).first();
    await locator.waitFor({ state: 'visible', timeout: config.timeout });
    
    if (clearFirst) {
      await locator.triple(); // Select all
    }
    
    await locator.type(text, { delay: 50 });
  }

  /**
   * Select option from dropdown/select element
   */
  static async selectOption(
    page: Page,
    selector: string,
    value: string
  ): Promise<void> {
    const locator = page.locator(selector).first();
    await locator.waitFor({ state: 'visible', timeout: config.timeout });
    
    // Check if it's a native select
    const tagName = await locator.evaluate((el: HTMLElement) => el.tagName.toLowerCase());
    
    if (tagName === 'select') {
      await locator.selectOption(value);
    } else {
      // DevExtreme or custom dropdown
      await locator.click();
      const option = page.locator(`[aria-label="${value}"], div:has-text("${value}")`).first();
      await option.click();
    }
  }

  /**
   * Check a checkbox/toggle
   */
  static async checkCheckbox(page: Page, selector: string): Promise<void> {
    const locator = page.locator(selector).first();
    await locator.waitFor({ state: 'visible', timeout: config.timeout });
    
    const isChecked = await locator.evaluate(
      (el: HTMLElement) => (el as HTMLInputElement).checked
    ).catch(() => false);
    
    if (!isChecked) {
      await locator.click();
    }
  }

  /**
   * Uncheck a checkbox/toggle
   */
  static async uncheckCheckbox(page: Page, selector: string): Promise<void> {
    const locator = page.locator(selector).first();
    await locator.waitFor({ state: 'visible', timeout: config.timeout });
    
    const isChecked = await locator.evaluate(
      (el: HTMLElement) => (el as HTMLInputElement).checked
    ).catch(() => false);
    
    if (isChecked) {
      await locator.click();
    }
  }

  /**
   * Upload file to file input
   */
  static async uploadFile(page: Page, selector: string, filePath: string): Promise<void> {
    const locator = page.locator(selector).first();
    await locator.setInputFiles(filePath);
  }

  /**
   * Clear input field
   */
  static async clearInput(page: Page, selector: string): Promise<void> {
    const locator = page.locator(selector).first();
    await locator.waitFor({ state: 'visible', timeout: config.timeout });
    await locator.fill('');
  }

  /**
   * Get element text content
   */
  static async getElementText(page: Page, selector: string): Promise<string> {
    const locator = page.locator(selector).first();
    const text = await locator.textContent() || '';
    return text.trim();
  }

  /**
   * Get element value (for inputs)
   */
  static async getElementValue(page: Page, selector: string): Promise<string> {
    const locator = page.locator(selector).first();
    return await locator.inputValue() || '';
  }

  /**
   * Get element attribute value
   */
  static async getElementAttribute(
    page: Page,
    selector: string,
    attribute: string
  ): Promise<string | null> {
    const locator = page.locator(selector).first();
    return await locator.getAttribute(attribute);
  }

  /**
   * Get all text content from elements matching selector
   */
  static async getAllElementTexts(page: Page, selector: string): Promise<string[]> {
    return await page.locator(selector).allTextContents();
  }

  /**
   * Hover over element
   */
  static async hoverElement(page: Page, selector: string): Promise<void> {
    const locator = page.locator(selector).first();
    await locator.hover({ timeout: config.timeout });
  }

  /**
   * Scroll element into view
   */
  static async scrollIntoView(page: Page, selector: string): Promise<void> {
    const locator = page.locator(selector).first();
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Focus on element
   */
  static async focusElement(page: Page, selector: string): Promise<void> {
    const locator = page.locator(selector).first();
    await locator.focus();
  }

  /**
   * Double-click element
   */
  static async doubleClickElement(page: Page, selector: string): Promise<void> {
    const locator = page.locator(selector).first();
    await locator.dblclick({ timeout: config.timeout });
  }

  /**
   * Right-click element
   */
  static async rightClickElement(page: Page, selector: string): Promise<void> {
    const locator = page.locator(selector).first();
    await locator.click({ button: 'right', timeout: config.timeout });
  }

  /**
   * Press keyboard key
   */
  static async pressKey(page: Page, key: string): Promise<void> {
    await page.keyboard.press(key);
  }

  /**
   * Type text into keyboard (for input simulation)
   */
  static async typeKeyboardText(page: Page, text: string): Promise<void> {
    await page.keyboard.type(text, { delay: 50 });
  }

  /**
   * Get count of elements matching selector
   */
  static async getElementCount(page: Page, selector: string): Promise<number> {
    return await page.locator(selector).count();
  }

  /**
   * Check if element exists (not just visible)
   */
  static async elementExists(page: Page, selector: string): Promise<boolean> {
    return (await page.locator(selector).count()) > 0;
  }

  /**
   * Check if element is visible
   */
  static async isElementVisible(page: Page, selector: string): Promise<boolean> {
    try {
      return await page.locator(selector).first().isVisible({ timeout: 3000 });
    } catch {
      return false;
    }
  }

  /**
   * Check if element is enabled
   */
  static async isElementEnabled(page: Page, selector: string): Promise<boolean> {
    try {
      return await page.locator(selector).first().isEnabled({ timeout: 3000 });
    } catch {
      return false;
    }
  }

  /**
   * Check if element is disabled
   */
  static async isElementDisabled(page: Page, selector: string): Promise<boolean> {
    return !(await this.isElementEnabled(page, selector));
  }

  /**
   * Get locator for advanced operations
   */
  static getLocator(page: Page, selector: string): Locator {
    return page.locator(selector);
  }
}
