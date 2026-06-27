/**
 * EntitiesDepositsSummaryReport Page Object Model
 * 
 * Module: Entities Deposits - Summary Report
 * URL: https://staging.tahseel.gov.ae/ManagePortal/report-show/f33a1214-cce9-4872-9f16-62037287b60a
 * 
 * This POM class encapsulates all interactions with the Entities Deposits - Summary Report module.
 * Extends BasePage to inherit common functionality and utilities.
 * 
 * @category Page Objects
 * @module EntitiesDepositsSummaryReport
 */

import { Page } from '@playwright/test';
import { BaseListPage } from '../base-list.page';
import { ElementInteractions } from '../../utils/element-interactions';
import { AssertionHelpers } from '../../utils/assertion-helpers';
import { WaitAndRetry } from '../../utils/wait-and-retry';
import { SelectorHelpers } from '../../utils/selector-helpers';

/**
 * EntitiesDepositsSummaryReport
 * 
 * Provides page object methods for Entities Deposits - Summary Report module.
 * 
 * Usage:
 * ```typescript
 * const page = new EntitiesDepositsSummaryReport(playwrightPage);
 * await page.navigateToModule();
 * await page.verifyPageLoaded();
 * ```
 */
export class EntitiesDepositsSummaryReport extends BaseListPage {
  /**
   * Module name for identification
   */
  readonly moduleName = 'Entities Deposits - Summary Report';

  /**
   * Module URL from audit data
   */
  readonly moduleUrl = 'https://staging.tahseel.gov.ae/ManagePortal/report-show/f33a1214-cce9-4872-9f16-62037287b60a';

  readonly selectors: Record<string, string> = {
    mainContainer: '[data-module], main, [role="main"]',
    // Form fields
    deposit_entityField: '[aria-label="Deposit Entity"], label:has-text("Deposit Entity") ~ input',
    deposit_timeField: '[aria-label="Deposit Time"], label:has-text("Deposit Time") ~ input',
    from_dateField: '[aria-label="From Date"], label:has-text("From Date") ~ input',
    to_dateField: '[aria-label="To Date"], label:has-text("To Date") ~ input',
    deposit_typeField: '[aria-label="Deposit Type"], label:has-text("Deposit Type") ~ input',
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
    await this.navigateToUrl('https://staging.tahseel.gov.ae/ManagePortal/report-show/f33a1214-cce9-4872-9f16-62037287b60a');
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
