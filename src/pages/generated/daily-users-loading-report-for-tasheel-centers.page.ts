/**
 * DailyUsersLoadingReportForTasheelCenters Page Object Model
 * 
 * Module: Daily Users Loading Report For Tasheel Centers
 * URL: https://staging.tahseel.gov.ae/ManagePortal/report-show/fc7bfacb-c3b7-4383-bd6e-9cd253f018d2
 * 
 * This POM class encapsulates all interactions with the Daily Users Loading Report For Tasheel Centers module.
 * Extends BasePage to inherit common functionality and utilities.
 * 
 * @category Page Objects
 * @module DailyUsersLoadingReportForTasheelCenters
 */

import { Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { ElementInteractions } from '../../utils/element-interactions';
import { AssertionHelpers } from '../../utils/assertion-helpers';
import { WaitAndRetry } from '../../utils/wait-and-retry';
import { SelectorHelpers } from '../../utils/selector-helpers';

/**
 * DailyUsersLoadingReportForTasheelCenters
 * 
 * Provides page object methods for Daily Users Loading Report For Tasheel Centers module.
 * 
 * Usage:
 * ```typescript
 * const page = new DailyUsersLoadingReportForTasheelCenters(playwrightPage);
 * await page.navigateToModule();
 * await page.verifyPageLoaded();
 * ```
 */
export class DailyUsersLoadingReportForTasheelCenters extends BasePage {
  /**
   * Module name for identification
   */
  readonly moduleName = 'Daily Users Loading Report For Tasheel Centers';

  /**
   * Module URL from audit data
   */
  readonly moduleUrl = 'https://staging.tahseel.gov.ae/ManagePortal/report-show/fc7bfacb-c3b7-4383-bd6e-9cd253f018d2';

  readonly selectors: Record<string, string> = {
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
    await this.navigateToUrl('https://staging.tahseel.gov.ae/ManagePortal/report-show/fc7bfacb-c3b7-4383-bd6e-9cd253f018d2');
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
