/**
 * InquireElectronicReceipt Page Object Model
 * 
 * Module: Inquire Electronic Receipt
 * URL: https://staging.tahseel.gov.ae/ManagePortal/packaging-fund-management/voucher-inquire
 * 
 * This POM class encapsulates all interactions with the Inquire Electronic Receipt module.
 * Extends BasePage to inherit common functionality and utilities.
 * 
 * @category Page Objects
 * @module InquireElectronicReceipt
 */

import { Page } from '@playwright/test';
import { BaseFormPage } from '../base-form.page';
import { ElementInteractions } from '../../utils/element-interactions';
import { AssertionHelpers } from '../../utils/assertion-helpers';
import { WaitAndRetry } from '../../utils/wait-and-retry';
import { SelectorHelpers } from '../../utils/selector-helpers';

/**
 * InquireElectronicReceipt
 * 
 * Provides page object methods for Inquire Electronic Receipt module.
 * 
 * Usage:
 * ```typescript
 * const page = new InquireElectronicReceipt(playwrightPage);
 * await page.navigateToModule();
 * await page.verifyPageLoaded();
 * ```
 */
export class InquireElectronicReceipt extends BaseFormPage {
  /**
   * Module name for identification
   */
  readonly moduleName = 'Inquire Electronic Receipt';

  /**
   * Module URL from audit data
   */
  readonly moduleUrl = 'https://staging.tahseel.gov.ae/ManagePortal/packaging-fund-management/voucher-inquire';

  readonly selectors: Record<string, string> = {
    mainContainer: '[data-module], main, [role="main"]',
    // Form fields
    inquire_status_of_electronic_receiptField: '[aria-label="Inquire status of electronic receipt"], label:has-text("Inquire status of electronic receipt") ~ input',
    departmentchoose_departmentField: '[aria-label="DepartmentChoose department"], label:has-text("DepartmentChoose department") ~ input',
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
    await this.navigateToUrl('https://staging.tahseel.gov.ae/ManagePortal/packaging-fund-management/voucher-inquire');
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
