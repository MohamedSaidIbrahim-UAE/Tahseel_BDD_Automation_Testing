/**
 * DetailedTransactionsReportOfSeedAccordingToTheFeesEntityOwner Page Object Model
 * 
 * Module: Detailed transactions report of SEED According to the Fees entity owner
 * URL: https://staging.tahseel.gov.ae/ManagePortal/report-show/f78bc512-b32c-4307-9f34-230ecf0b7328
 * 
 * This POM class encapsulates all interactions with the Detailed transactions report of SEED According to the Fees entity owner module.
 * Extends BasePage to inherit common functionality and utilities.
 * 
 * @category Page Objects
 * @module DetailedTransactionsReportOfSeedAccordingToTheFeesEntityOwner
 */

import { Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { ElementInteractions } from '../../utils/element-interactions';
import { AssertionHelpers } from '../../utils/assertion-helpers';
import { WaitAndRetry } from '../../utils/wait-and-retry';
import { SelectorHelpers } from '../../utils/selector-helpers';

/**
 * DetailedTransactionsReportOfSeedAccordingToTheFeesEntityOwner
 * 
 * Provides page object methods for Detailed transactions report of SEED According to the Fees entity owner module.
 * 
 * Usage:
 * ```typescript
 * const page = new DetailedTransactionsReportOfSeedAccordingToTheFeesEntityOwner(playwrightPage);
 * await page.navigateToModule();
 * await page.verifyPageLoaded();
 * ```
 */
export class DetailedTransactionsReportOfSeedAccordingToTheFeesEntityOwner extends BasePage {
  /**
   * Module name for identification
   */
  readonly moduleName = 'Detailed transactions report of SEED According to the Fees entity owner';

  /**
   * Module URL from audit data
   */
  readonly moduleUrl = 'https://staging.tahseel.gov.ae/ManagePortal/report-show/f78bc512-b32c-4307-9f34-230ecf0b7328';

  readonly selectors = {
    mainContainer: '[data-module], main, [role="main"]',
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
    await this.navigateToUrl('https://staging.tahseel.gov.ae/ManagePortal/report-show/f78bc512-b32c-4307-9f34-230ecf0b7328');
  }

  /**
   * Verify module page is loaded
   */
  async verifyPageLoaded(): Promise<void> {
    await this.expectElementVisible(this.selectors.mainContainer);
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
