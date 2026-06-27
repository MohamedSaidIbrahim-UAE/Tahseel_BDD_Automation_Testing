/**
 * TransactionsSentByPaymentLink Page Object Model
 * 
 * Module: Transactions Sent By Payment Link
 * URL: https://staging.tahseel.gov.ae/ManagePortal/transactions/payment-link-transaction
 * 
 * This POM class encapsulates all interactions with the Transactions Sent By Payment Link module.
 * Extends BasePage to inherit common functionality and utilities.
 * 
 * @category Page Objects
 * @module TransactionsSentByPaymentLink
 */

import { Page } from '@playwright/test';
import { BaseListPage } from '../base-list.page';
import { ElementInteractions } from '../../utils/element-interactions';
import { AssertionHelpers } from '../../utils/assertion-helpers';
import { WaitAndRetry } from '../../utils/wait-and-retry';
import { SelectorHelpers } from '../../utils/selector-helpers';

/**
 * TransactionsSentByPaymentLink
 * 
 * Provides page object methods for Transactions Sent By Payment Link module.
 * 
 * Usage:
 * ```typescript
 * const page = new TransactionsSentByPaymentLink(playwrightPage);
 * await page.navigateToModule();
 * await page.verifyPageLoaded();
 * ```
 */
export class TransactionsSentByPaymentLink extends BaseListPage {
  /**
   * Module name for identification
   */
  readonly moduleName = 'Transactions Sent By Payment Link';

  /**
   * Module URL from audit data
   */
  readonly moduleUrl = 'https://staging.tahseel.gov.ae/ManagePortal/transactions/payment-link-transaction';

  readonly selectors: Record<string, string> = {
    mainContainer: '[data-module], main, [role="main"]',
    // Form fields
    search_criteriaField: '[aria-label="Search Criteria"], label:has-text("Search Criteria") ~ input',
    reference_numberField: '[aria-label="Reference Number:"], label:has-text("Reference Number:") ~ input',
    date_fromField: '[aria-label="Date (From):"], label:has-text("Date (From):") ~ input',
    date_to_Field: '[aria-label="Date (To) :"], label:has-text("Date (To) :") ~ input',
    emailField: '[aria-label="Email:"], label:has-text("Email:") ~ input',
    mobileField: '[aria-label="Mobile:"], label:has-text("Mobile:") ~ input',
    created_byselectField: '[aria-label="Created By:Select..."], label:has-text("Created By:Select...") ~ input',
    // Action buttons
    exportButton: 'button:has-text("Export"), [aria-label*="Export"]',
    searchInput: 'input[placeholder*="Search"], [aria-label*="Search"]',
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
    await this.navigateToUrl('https://staging.tahseel.gov.ae/ManagePortal/transactions/payment-link-transaction');
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
      await super.fillFilterInput(selector, value);
    }
  }

  /**
   * Submit form
   */
  async submitForm(): Promise<void> {
    await super.clickActionSearch();
  }

  /**
   * Verify form validation error
   */
  async verifyValidationError(fieldName: string): Promise<void> {
    await this.expectElementVisible(this.selectors.errorMessage);
  }

  /**
   * Export data
   */
  async exportData(format: string = 'Excel'): Promise<void> {
    await this.clickExport();
    // Select export format (implementation depends on UI)
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
