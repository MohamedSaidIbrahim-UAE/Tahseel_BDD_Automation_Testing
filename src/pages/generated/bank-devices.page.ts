/**
 * BankDevices Page Object Model
 * 
 * Module: Bank Devices
 * URL: https://staging.tahseel.gov.ae/ManagePortal/bank-devices/bank-devices
 * 
 * This POM class encapsulates all interactions with the Bank Devices module.
 * Extends BasePage to inherit common functionality and utilities.
 * 
 * @category Page Objects
 * @module BankDevices
 */

import { Page } from '@playwright/test';
import { BaseListPage } from '../base-list.page';

/**
 * BankDevices
 * 
 * Provides page object methods for Bank Devices module.
 * 
 * Usage:
 * ```typescript
 * const page = new BankDevices(playwrightPage);
 * await page.navigateToModule();
 * await page.verifyPageLoaded();
 * ```
 */
export class BankDevices extends BaseListPage {
  /**
   * Module name for identification
   */
  readonly moduleName = 'Bank Devices';

  /**
   * Module URL from audit data
   */
  readonly moduleUrl = 'https://staging.tahseel.gov.ae/ManagePortal/bank-devices/bank-devices';

  readonly selectors: Record<string, string> = {
    mainContainer: '[data-module], main, [role="main"]',
    // Form fields
    bank_devicesField: '[aria-label="Bank Devices"], label:has-text("Bank Devices") ~ input',
    dark_modeField: '[aria-label="Dark Mode"], label:has-text("Dark Mode") ~ input',
    // Table selectors
    dataTable: '[role="table"], table, [role="grid"]',
    tableRows: '[role="table"] [role="row"], table tbody tr',
    tableCells: '[role="cell"], td, th',
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
    await this.navigateToUrl('https://staging.tahseel.gov.ae/ManagePortal/bank-devices/bank-devices');
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
    const selector = this.selectors[`${fieldName}Field`];
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
    await super.verifyTableHasRecords();
  }

  /**
   * Search in table
   */
  async searchTable(term: string): Promise<void> {
    if (this.selectors.searchInput) {
      await super.fillGridSearchImpl(term);
    }
  }

  /**
   * Export data
   */
  async exportData(format: string = 'Excel'): Promise<void> {
    await super.clickExportAndSelectFormat(format);
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
