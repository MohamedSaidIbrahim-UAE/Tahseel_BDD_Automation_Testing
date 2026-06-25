/**
 * TransactionSummaryTaxReportRevenue Page Object Model
 * 
 * Module: Transaction Summary Tax Report - Revenue
 * URL: https://staging.tahseel.gov.ae/ManagePortal/report-show/9c2e914b-06d2-4e8f-bd5c-5da22fbe8a0c
 * 
 * This POM class encapsulates all interactions with the Transaction Summary Tax Report - Revenue module.
 * Extends BasePage to inherit common functionality and utilities.
 * 
 * @category Page Objects
 * @module TransactionSummaryTaxReportRevenue
 */

import { Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { ElementInteractions } from '../../utils/element-interactions';
import { AssertionHelpers } from '../../utils/assertion-helpers';
import { WaitAndRetry } from '../../utils/wait-and-retry';
import { SelectorHelpers } from '../../utils/selector-helpers';

/**
 * TransactionSummaryTaxReportRevenue
 * 
 * Provides page object methods for Transaction Summary Tax Report - Revenue module.
 * 
 * Usage:
 * ```typescript
 * const page = new TransactionSummaryTaxReportRevenue(playwrightPage);
 * await page.navigateToModule();
 * await page.verifyPageLoaded();
 * ```
 */
export class TransactionSummaryTaxReportRevenue extends BasePage {
  /**
   * Module name for identification
   */
  readonly moduleName = 'Transaction Summary Tax Report - Revenue';

  /**
   * Module URL from audit data
   */
  readonly moduleUrl = 'https://staging.tahseel.gov.ae/ManagePortal/report-show/9c2e914b-06d2-4e8f-bd5c-5da22fbe8a0c';

  readonly selectors: Record<string, string> = {
    mainContainer: '[data-module], main, [role="main"]',
    // Form fields
    entityField: '[aria-label="Entity"], label:has-text("Entity") ~ input',
    sub_departmentField: '[aria-label="Sub Department"], label:has-text("Sub Department") ~ input',
    branchField: '[aria-label="Branch"], label:has-text("Branch") ~ input',
    payment_methodField: '[aria-label="Payment Method"], label:has-text("Payment Method") ~ input',
    from_dateField: '[aria-label="From Date"], label:has-text("From Date") ~ input',
    to_dateField: '[aria-label="To Date"], label:has-text("To Date") ~ input',
    userField: '[aria-label="User"], label:has-text("User") ~ input',
    transaction_typeField: '[aria-label="Transaction Type"], label:has-text("Transaction Type") ~ input',
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
    await this.navigateToUrl('https://staging.tahseel.gov.ae/ManagePortal/report-show/9c2e914b-06d2-4e8f-bd5c-5da22fbe8a0c');
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
      await this.fill(this.selectors.searchInput as string, term);
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
