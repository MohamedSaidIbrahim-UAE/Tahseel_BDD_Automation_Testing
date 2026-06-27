/**
 * SmartReceiptDetails Page Object Model
 * 
 * Module: Smart Receipt Details
 * URL: https://staging.tahseel.gov.ae/ManagePortal/smart-receipt/inquiry
 * 
 * This POM class encapsulates all interactions with the Smart Receipt Details module.
 * Extends BasePage to inherit common functionality and utilities.
 * 
 * @category Page Objects
 * @module SmartReceiptDetails
 */

import { Page } from '@playwright/test';
import { BaseFormPage } from '../base-form.page';
import { ElementInteractions } from '../../utils/element-interactions';
import { AssertionHelpers } from '../../utils/assertion-helpers';
import { WaitAndRetry } from '../../utils/wait-and-retry';
import { SelectorHelpers } from '../../utils/selector-helpers';

/**
 * SmartReceiptDetails
 * 
 * Provides page object methods for Smart Receipt Details module.
 * 
 * Usage:
 * ```typescript
 * const page = new SmartReceiptDetails(playwrightPage);
 * await page.navigateToModule();
 * await page.verifyPageLoaded();
 * ```
 */
export class SmartReceiptDetails extends BaseFormPage {
  /**
   * Module name for identification
   */
  readonly moduleName = 'Smart Receipt Details';

  /**
   * Module URL from audit data
   */
  readonly moduleUrl = 'https://staging.tahseel.gov.ae/ManagePortal/smart-receipt/inquiry';

  readonly selectors: Record<string, string> = {
    mainContainer: '[data-module], main, [role="main"]',
    // Form fields
    search_criteriaField: '[aria-label="Search Criteria"], label:has-text("Search Criteria") ~ input',
    date_fromField: '[aria-label="Date (From)"], label:has-text("Date (From)") ~ input',
    date_toField: '[aria-label="Date (To)"], label:has-text("Date (To)") ~ input',
    transaction_noField: '[aria-label="Transaction No"], label:has-text("Transaction No") ~ input',
    receipt_numberField: '[aria-label="Receipt Number"], label:has-text("Receipt Number") ~ input',
    reference_numberField: '[aria-label="Reference Number"], label:has-text("Reference Number") ~ input',
    bank_receipt_numberField: '[aria-label="Bank Receipt Number"], label:has-text("Bank Receipt Number") ~ input',
    bank_card_schemeselectField: '[aria-label="Bank Card SchemeSelect..."], label:has-text("Bank Card SchemeSelect...") ~ input',
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
    await this.navigateToUrl('https://staging.tahseel.gov.ae/ManagePortal/smart-receipt/inquiry');
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
