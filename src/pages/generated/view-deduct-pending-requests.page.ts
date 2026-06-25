/**
 * ViewDeductPendingRequests Page Object Model
 * 
 * Module: View Deduct Pending Requests
 * URL: https://staging.tahseel.gov.ae/ManagePortal/load-and-deduct-balance/pending-deduct-requests-list
 * 
 * This POM class encapsulates all interactions with the View Deduct Pending Requests module.
 * Extends BasePage to inherit common functionality and utilities.
 * 
 * @category Page Objects
 * @module ViewDeductPendingRequests
 */

import { Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { ElementInteractions } from '../../utils/element-interactions';
import { AssertionHelpers } from '../../utils/assertion-helpers';
import { WaitAndRetry } from '../../utils/wait-and-retry';
import { SelectorHelpers } from '../../utils/selector-helpers';

/**
 * ViewDeductPendingRequests
 * 
 * Provides page object methods for View Deduct Pending Requests module.
 * 
 * Usage:
 * ```typescript
 * const page = new ViewDeductPendingRequests(playwrightPage);
 * await page.navigateToModule();
 * await page.verifyPageLoaded();
 * ```
 */
export class ViewDeductPendingRequests extends BasePage {
  /**
   * Module name for identification
   */
  readonly moduleName = 'View Deduct Pending Requests';

  /**
   * Module URL from audit data
   */
  readonly moduleUrl = 'https://staging.tahseel.gov.ae/ManagePortal/load-and-deduct-balance/pending-deduct-requests-list';

  readonly selectors: Record<string, string> = {
    mainContainer: '[data-module], main, [role="main"]',
    // Form fields
    dark_modeField: '[aria-label="Dark Mode"], label:has-text("Dark Mode") ~ input',
    // Table selectors
    dataTable: '[role="table"], table, [role="grid"]',
    tableRows: '[role="table"] [role="row"], table tbody tr',
    tableCells: '[role="cell"], td, th',
    // Action buttons
    exportButton: 'button:has-text("Export"), [aria-label*="Export"]',
    columnChooserButton: 'button:has-text("Columns"), [aria-label*="Column"]',
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
    await this.navigateToUrl('https://staging.tahseel.gov.ae/ManagePortal/load-and-deduct-balance/pending-deduct-requests-list');
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
