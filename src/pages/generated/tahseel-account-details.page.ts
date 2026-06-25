/**
 * TahseelAccountDetails Page Object Model
 * 
 * Module: Tahseel Account Details
 * URL: https://staging.tahseel.gov.ae/ManagePortal/system-users/user-inquiry
 * 
 * This POM class encapsulates all interactions with the Tahseel Account Details module.
 * Extends BasePage to inherit common functionality and utilities.
 * 
 * @category Page Objects
 * @module TahseelAccountDetails
 */

import { Page } from '@playwright/test';
import { BaseFormPage } from '../base-form.page';
import { ElementInteractions } from '../../utils/element-interactions';
import { AssertionHelpers } from '../../utils/assertion-helpers';
import { WaitAndRetry } from '../../utils/wait-and-retry';
import { SelectorHelpers } from '../../utils/selector-helpers';

/**
 * TahseelAccountDetails
 * 
 * Provides page object methods for Tahseel Account Details module.
 * 
 * Usage:
 * ```typescript
 * const page = new TahseelAccountDetails(playwrightPage);
 * await page.navigateToModule();
 * await page.verifyPageLoaded();
 * ```
 */
export class TahseelAccountDetails extends BaseFormPage {
  /**
   * Module name for identification
   */
  readonly moduleName = 'Tahseel Account Details';

  /**
   * Module URL from audit data
   */
  readonly moduleUrl = 'https://staging.tahseel.gov.ae/ManagePortal/system-users/user-inquiry';

  readonly selectors: Record<string, string> = {
    mainContainer: '[data-module], main, [role="main"]',
    // Form fields
    search_criteriaField: '[aria-label="Search Criteria"], label:has-text("Search Criteria") ~ input',
    account_typechooseField: '[aria-label="Account TypeChoose..."], label:has-text("Account TypeChoose...") ~ input',
    // Action buttons
    saveButton: 'button:has-text("Save"), [aria-label*="Save"]',
    cancelButton: 'button:has-text("Cancel"), [aria-label*="Cancel"]',
    submitButton: 'button:has-text("Submit"), [aria-label*="Submit"]',
    successMessage: '[role="status"]:has-text("Success"), [class*="success"]',
    errorMessage: '[role="alert"], [class*="error"]',
  };

  /**
   * Constructor
   * 
   * @param page Playwright Page instance
   */
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to this module
   */
  async navigateToModule(): Promise<void> {
    // URL will be set from audit data during generation
    await this.navigateToUrl('https://staging.tahseel.gov.ae/ManagePortal/system-users/user-inquiry');
  }

  /**
   * Verify module page is loaded
   */
  async verifyPageLoaded(): Promise<void> {
    await this.expectElementVisible(this.selectors.mainContainer);
  }

  /**
   * Fill form field
   */
  async fillField(fieldName: string, value: string): Promise<void> {
    const selector = this.selectors[`${fieldName}Field`] as string;
    if (selector) {
      await super.fillField(selector, value);
    }
  }

  /**
   * Submit form
   */
  async submitForm(): Promise<void> {
    await super.submitForm(this.selectors.submitButton);
  }

  /**
   * Verify form validation error
   */
  async verifyValidationError(fieldName: string): Promise<void> {
    await this.expectElementVisible(this.selectors.errorMessage);
  }

  /**
   * Add new record
   */
  async addNew(): Promise<void> {
    await this.clickAddNew();
  }

  /**
   * Verify success message
   */
  async verifySuccessMessage(): Promise<void> {
    await this.expectElementVisible(this.selectors.successMessage);
  }

}
