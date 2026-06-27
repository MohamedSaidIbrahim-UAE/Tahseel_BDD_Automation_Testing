/**
 * DeviceDeliveryToPlublishers Page Object Model
 * 
 * Module: Device Delivery To Plublishers
 * URL: https://staging.tahseel.gov.ae/ManagePortal/exhibition/device-delivery
 * 
 * This POM class encapsulates all interactions with the Device Delivery To Plublishers module.
 * Extends BasePage to inherit common functionality and utilities.
 * 
 * @category Page Objects
 * @module DeviceDeliveryToPlublishers
 */

import { Page } from '@playwright/test';
import { BaseFormPage } from '../base-form.page';
import { ElementInteractions } from '../../utils/element-interactions';
import { AssertionHelpers } from '../../utils/assertion-helpers';
import { WaitAndRetry } from '../../utils/wait-and-retry';
import { SelectorHelpers } from '../../utils/selector-helpers';

/**
 * DeviceDeliveryToPlublishers
 * 
 * Provides page object methods for Device Delivery To Plublishers module.
 * 
 * Usage:
 * ```typescript
 * const page = new DeviceDeliveryToPlublishers(playwrightPage);
 * await page.navigateToModule();
 * await page.verifyPageLoaded();
 * ```
 */
export class DeviceDeliveryToPlublishers extends BaseFormPage {
  /**
   * Module name for identification
   */
  readonly moduleName = 'Device Delivery To Plublishers';

  /**
   * Module URL from audit data
   */
  readonly moduleUrl = 'https://staging.tahseel.gov.ae/ManagePortal/exhibition/device-delivery';

  readonly selectors: Record<string, string> = {
    mainContainer: '[data-module], main, [role="main"]',
    // Form fields
    device_delivery_to_plublishersField: '[aria-label="Device Delivery To Plublishers"], label:has-text("Device Delivery To Plublishers") ~ input',
    exhibition_showexhibition_showField: '[aria-label="Exhibition ShowExhibition Show"], label:has-text("Exhibition ShowExhibition Show") ~ input',
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
    await this.navigateToUrl('https://staging.tahseel.gov.ae/ManagePortal/exhibition/device-delivery');
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
