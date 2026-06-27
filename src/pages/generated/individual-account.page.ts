/**
 * IndividualAccount Page Object Model
 * 
 * Module: Individual Account
 * URL: https://staging.tahseel.gov.ae/ManagePortal/corporate/Addindividualaccount
 * 
 * This POM class encapsulates all interactions with the Individual Account module.
 * Extends BasePage to inherit common functionality and utilities.
 * 
 * @category Page Objects
 * @module IndividualAccount
 */

import { Page } from '@playwright/test';
import { BaseFormPage } from '../base-form.page';
import { ElementInteractions } from '../../utils/element-interactions';
import { AssertionHelpers } from '../../utils/assertion-helpers';
import { WaitAndRetry } from '../../utils/wait-and-retry';
import { SelectorHelpers } from '../../utils/selector-helpers';

/**
 * IndividualAccount
 * 
 * Provides page object methods for Individual Account module.
 * 
 * Usage:
 * ```typescript
 * const page = new IndividualAccount(playwrightPage);
 * await page.navigateToModule();
 * await page.verifyPageLoaded();
 * ```
 */
export class IndividualAccount extends BaseFormPage {
  /**
   * Module name for identification
   */
  readonly moduleName = 'Individual Account';

  /**
   * Module URL from audit data
   */
  readonly moduleUrl = 'https://staging.tahseel.gov.ae/ManagePortal/corporate/Addindividualaccount';

  readonly selectors: Record<string, string> = {
    mainContainer: '[data-module], main, [role="main"]',
    // Form fields
    emirate_id_Field: '[aria-label="Emirate ID *"], label:has-text("Emirate ID *") ~ input',
    emirate_idField: '[aria-label="Emirate ID"], label:has-text("Emirate ID") ~ input',
    passport_no_Field: '[aria-label="Passport No *"], label:has-text("Passport No *") ~ input',
    passport_noField: '[aria-label="Passport No"], label:has-text("Passport No") ~ input',
    full_name_ar_Field: '[aria-label="Full Name Ar *"], label:has-text("Full Name Ar *") ~ input',
    full_name_arField: '[aria-label="Full Name Ar"], label:has-text("Full Name Ar") ~ input',
    full_name_en_Field: '[aria-label="Full Name En *"], label:has-text("Full Name En *") ~ input',
    full_name_enField: '[aria-label="Full Name En"], label:has-text("Full Name En") ~ input',
    user_name_Field: '[aria-label="User Name *"], label:has-text("User Name *") ~ input',
    user_nameField: '[aria-label="User Name"], label:has-text("User Name") ~ input',
    nationalitychooseField: '[aria-label="NationalityChoose..."], label:has-text("NationalityChoose...") ~ input',
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
    await this.navigateToUrl('https://staging.tahseel.gov.ae/ManagePortal/corporate/Addindividualaccount');
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
