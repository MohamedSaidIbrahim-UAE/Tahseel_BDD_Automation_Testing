/**
 * BaseFormPage — shared base for all form-based modules.
 *
 * Extends BasePage with:
 *  - Generic form field filling
 *  - Form validation error detection
 *  - Standardized submit actions
 */

import { Page } from '@playwright/test';
import { BasePage } from './base.page';
import { config } from '../config/config';

export abstract class BaseFormPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Generic method to fill a form field
   */
  async fillField(selector: string, value: string): Promise<void> {
    const input = this.page.locator(selector).first();
    await input.waitFor({ state: 'visible', timeout: config.timeout });
    await input.clear();
    await input.fill(value);
  }

  /**
   * Generic method to handle form submission
   */
  async submitForm(submitButtonSelector: string): Promise<void> {
    const button = this.page.locator(submitButtonSelector).first();
    await button.waitFor({ state: 'visible', timeout: config.timeout });
    await button.click();
  }

  /**
   * Check for validation error messages
   */
  async hasValidationError(errorSelector: string): Promise<boolean> {
    return await this.page.locator(errorSelector).first().isVisible();
  }
}
