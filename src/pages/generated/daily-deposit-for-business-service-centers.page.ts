/**
 * DailyDepositForBusinessServiceCenters Page Object Model
 * 
 * Module: Daily deposit for Business Service Centers
 * URL: https://staging.tahseel.gov.ae/ManagePortal/deposite-settlement/tasheel
 * 
 * This POM class encapsulates all interactions with the Daily deposit for Business Service Centers module.
 * Extends BasePage to inherit common functionality and utilities.
 * 
 * @category Page Objects
 * @module DailyDepositForBusinessServiceCenters
 */

import { Page } from '@playwright/test';
import { BaseFormPage } from '../base-form.page';

/**
 * DailyDepositForBusinessServiceCenters
 * 
 * Provides page object methods for Daily deposit for Business Service Centers module.
 * 
 * Usage:
 * ```typescript
 * const page = new DailyDepositForBusinessServiceCenters(playwrightPage);
 * await page.navigateToModule();
 * await page.verifyPageLoaded();
 * ```
 */
export class DailyDepositForBusinessServiceCenters extends BaseFormPage {
  /**
   * Module name for identification
   */
  readonly moduleName = 'Daily deposit for Business Service Centers';

  /**
   * Module URL from audit data
   */
  readonly moduleUrl = 'https://staging.tahseel.gov.ae/ManagePortal/deposite-settlement/tasheel';

  readonly selectors: Record<string, string> = {
    mainContainer: '[data-module], main, [role="main"]',
    // Form fields
    daily_deposit_for_business_service_centersField: '[aria-label="Daily deposit for Business Service Centers"], label:has-text("Daily deposit for Business Service Centers") ~ input',
    groupField: '[aria-label="Group"], label:has-text("Group") ~ input',
    settlement_dateField: '[aria-label="Settlement Date"], label:has-text("Settlement Date") ~ input',
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
    await this.navigateToUrl('https://staging.tahseel.gov.ae/ManagePortal/deposite-settlement/tasheel');
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
      await super.fillField(this.selectors.searchInput, term);
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
