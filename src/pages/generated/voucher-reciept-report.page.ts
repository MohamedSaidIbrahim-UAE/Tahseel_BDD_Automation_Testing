/**
 * VoucherRecieptReport Page Object Model
 * 
 * Module: Voucher Reciept Report
 * URL: https://staging.tahseel.gov.ae/ManagePortal/report-show/49af9d44-219a-4ce4-a632-b62b8d940a09
 * 
 * This POM class encapsulates all interactions with the Voucher Reciept Report module.
 * Extends BasePage to inherit common functionality and utilities.
 * 
 * @category Page Objects
 * @module VoucherRecieptReport
 */

import { Page } from '@playwright/test';
import { BaseListPage } from '../base-list.page';
import { ElementInteractions } from '../../utils/element-interactions';
import { AssertionHelpers } from '../../utils/assertion-helpers';
import { WaitAndRetry } from '../../utils/wait-and-retry';
import { SelectorHelpers } from '../../utils/selector-helpers';

/**
 * VoucherRecieptReport
 * 
 * Provides page object methods for Voucher Reciept Report module.
 * 
 * Usage:
 * ```typescript
 * const page = new VoucherRecieptReport(playwrightPage);
 * await page.navigateToModule();
 * await page.verifyPageLoaded();
 * ```
 */
export class VoucherRecieptReport extends BaseListPage {
  /**
   * Module name for identification
   */
  readonly moduleName = 'Voucher Reciept Report';

  /**
   * Module URL from audit data
   */
  readonly moduleUrl = 'https://staging.tahseel.gov.ae/ManagePortal/report-show/49af9d44-219a-4ce4-a632-b62b8d940a09';

  readonly selectors: Record<string, string> = {
    mainContainer: '[data-module], main, [role="main"]',
    // Form fields
    date_fromField: '[aria-label="Date From"], label:has-text("Date From") ~ input',
    to_dateField: '[aria-label="To Date"], label:has-text("To Date") ~ input',
    registration_loactionField: '[aria-label="Registration Loaction"], label:has-text("Registration Loaction") ~ input',
    user_nameField: '[aria-label="User Name"], label:has-text("User Name") ~ input',
    company_nameField: '[aria-label="Company Name"], label:has-text("Company Name") ~ input',
    reciept_numberField: '[aria-label="Reciept Number"], label:has-text("Reciept Number") ~ input',
    dark_modeField: '[aria-label="Dark Mode"], label:has-text("Dark Mode") ~ input',
    // Table selectors
    dataTable: '[role="table"], table, [role="grid"]',
    tableRows: '[role="table"] [role="row"], table tbody tr',
    tableCells: '[role="cell"], td, th',
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
    await this.navigateToUrl('https://staging.tahseel.gov.ae/ManagePortal/report-show/49af9d44-219a-4ce4-a632-b62b8d940a09');
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
   * Get table row count
   */
  async getTableRowCount(): Promise<number> {
    return await this.getLocatorCount(this.selectors.tableRows);
  }

  /**
   * Verify table contains data
   */
  async verifyTableHasData(): Promise<void> {
    const count = await this.getTableRowCount();
    if (count === 0) {
      throw new Error('Table has no data rows');
    }
  }

  /**
   * Search in table
   */
  async searchTable(term: string): Promise<void> {
    if (this.selectors.searchInput) {
      await super.fillGridSearchImpl(term);
      await this.page.waitForTimeout(500);
    }
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
