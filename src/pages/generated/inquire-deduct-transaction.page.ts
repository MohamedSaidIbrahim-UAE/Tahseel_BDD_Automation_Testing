/**
 * InquireDeductTransaction Page Object Model
 * 
 * Module: Inquire Deduct Transaction
 * URL: https://staging.tahseel.gov.ae/ManagePortal/deduct/inquiry
 * 
 * This POM class encapsulates all interactions with the Inquire Deduct Transaction module.
 * Extends BasePage to inherit common functionality and utilities.
 * 
 * @category Page Objects
 * @module InquireDeductTransaction
 */

import { Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { ElementInteractions } from '../../utils/element-interactions';
import { AssertionHelpers } from '../../utils/assertion-helpers';
import { WaitAndRetry } from '../../utils/wait-and-retry';
import { SelectorHelpers } from '../../utils/selector-helpers';

/**
 * InquireDeductTransaction
 * 
 * Provides page object methods for Inquire Deduct Transaction module.
 * 
 * Usage:
 * ```typescript
 * const page = new InquireDeductTransaction(playwrightPage);
 * await page.navigateToModule();
 * await page.verifyPageLoaded();
 * ```
 */
export class InquireDeductTransaction extends BasePage {
  /**
   * Module name for identification
   */
  readonly moduleName = 'Inquire Deduct Transaction';

  /**
   * Module URL from audit data
   */
  readonly moduleUrl = 'https://staging.tahseel.gov.ae/ManagePortal/deduct/inquiry';

  readonly selectors = {
    mainContainer: '[data-module], main, [role="main"]',
    // Form fields
    inquire_deduct_transactionField: '[aria-label="Inquire Deduct Transaction"], label:has-text("Inquire Deduct Transaction") ~ input',
    from_dateField: '[aria-label="From Date"], label:has-text("From Date") ~ input',
    to_dateField: '[aria-label="To Date"], label:has-text("To Date") ~ input',
    transaction_statusallField: '[aria-label="Transaction StatusAll"], label:has-text("Transaction StatusAll") ~ input',
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
    await this.navigateToUrl('https://staging.tahseel.gov.ae/ManagePortal/deduct/inquiry');
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
      await this.fill(selector, value);
    }
  }

  /**
   * Submit form
   */
  async submitForm(): Promise<void> {
    await this.clickSave();
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
