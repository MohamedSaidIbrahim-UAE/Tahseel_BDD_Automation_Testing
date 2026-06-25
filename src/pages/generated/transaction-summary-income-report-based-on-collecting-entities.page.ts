/**
 * TransactionSummaryIncomeReportBasedOnCollectingEntities Page Object Model
 * 
 * Module: Transaction summary income report based on collecting entities
 * URL: https://staging.tahseel.gov.ae/ManagePortal/report-show/4601182b-7894-4f5d-8bda-7fef3582714d
 * 
 * This POM class encapsulates all interactions with the Transaction summary income report based on collecting entities module.
 * Extends BasePage to inherit common functionality and utilities.
 * 
 * @category Page Objects
 * @module TransactionSummaryIncomeReportBasedOnCollectingEntities
 */

import { Page } from '@playwright/test';
import { BaseListPage } from '../base-list.page';
import { ElementInteractions } from '../../utils/element-interactions';
import { AssertionHelpers } from '../../utils/assertion-helpers';
import { WaitAndRetry } from '../../utils/wait-and-retry';
import { SelectorHelpers } from '../../utils/selector-helpers';

/**
 * TransactionSummaryIncomeReportBasedOnCollectingEntities
 * 
 * Provides page object methods for Transaction summary income report based on collecting entities module.
 * 
 * Usage:
 * ```typescript
 * const page = new TransactionSummaryIncomeReportBasedOnCollectingEntities(playwrightPage);
 * await page.navigateToModule();
 * await page.verifyPageLoaded();
 * ```
 */
export class TransactionSummaryIncomeReportBasedOnCollectingEntities extends BaseListPage {
  /**
   * Module name for identification
   */
  readonly moduleName = 'Transaction summary income report based on collecting entities';

  /**
   * Module URL from audit data
   */
  readonly moduleUrl = 'https://staging.tahseel.gov.ae/ManagePortal/report-show/4601182b-7894-4f5d-8bda-7fef3582714d';

  readonly selectors: Record<string, string> = {
    mainContainer: '[data-module], main, [role="main"]',
    // Form fields
    entityField: '[aria-label="Entity"], label:has-text("Entity") ~ input',
    sub_departmentField: '[aria-label="Sub Department"], label:has-text("Sub Department") ~ input',
    branchField: '[aria-label="Branch"], label:has-text("Branch") ~ input',
    userField: '[aria-label="User"], label:has-text("User") ~ input',
    payment_methodField: '[aria-label="Payment Method"], label:has-text("Payment Method") ~ input',
    service_typeField: '[aria-label="Service Type"], label:has-text("Service Type") ~ input',
    from_dateField: '[aria-label="From Date"], label:has-text("From Date") ~ input',
    to_dateField: '[aria-label="To Date"], label:has-text("To Date") ~ input',
    dispaly_periodField: '[aria-label="Dispaly period"], label:has-text("Dispaly period") ~ input',
    show_payment_methodField: '[aria-label="Show Payment Method"], label:has-text("Show Payment Method") ~ input',
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
    await this.navigateToUrl('https://staging.tahseel.gov.ae/ManagePortal/report-show/4601182b-7894-4f5d-8bda-7fef3582714d');
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
