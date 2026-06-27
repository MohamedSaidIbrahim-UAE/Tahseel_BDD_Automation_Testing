/**
 * Report Filter Utility for Report Form Interactions
 * 
 * Migrated from Python ReportAutomationConsoleSaveToExcel.py
 * Handles date pickers, dropdowns, radio buttons, and multi-select controls
 */

import { Page } from '@playwright/test';
import { WaitHelper } from './wait.helper';

export interface FilterOptions {
  timeout?: number;
  waitForNetworkIdle?: boolean;
}

export class ReportFilterUtility {
  private page: Page;
  private waitHelper: WaitHelper;

  constructor(page: Page) {
    this.page = page;
    this.waitHelper = new WaitHelper(page);
  }

  /**
   * Set date picker value (DevExtreme dx-date-box)
   */
  async setDatePickerValue(
    datePickerSelector: string,
    dateValue: string,
    options: FilterOptions = {}
  ): Promise<void> {
    const { timeout = 10000, waitForNetworkIdle = true } = options;

    // Find the input element within the date picker
    const input = await this.page.waitForSelector(
      `${datePickerSelector} input[type="text"]`,
      { timeout }
    );

    if (!input) {
      throw new Error(`Date picker input not found: ${datePickerSelector}`);
    }

    // Click to focus
    await input.click();

    // Clear existing value
    await input.fill('');

    // Type new value
    await input.type(dateValue);

    // Tab to trigger change event
    await input.press('Tab');

    if (waitForNetworkIdle) {
      await this.page.waitForLoadState('networkidle');
    }
  }

  /**
   * Set from date
   */
  async setFromDate(
    fromDateSelector: string,
    dateValue: string,
    options: FilterOptions = {}
  ): Promise<void> {
    await this.setDatePickerValue(fromDateSelector, dateValue, options);
  }

  /**
   * Set to date
   */
  async setToDate(
    toDateSelector: string,
    dateValue: string,
    options: FilterOptions = {}
  ): Promise<void> {
    await this.setDatePickerValue(toDateSelector, dateValue, options);
  }

  /**
   * Select second option from dropdown
   */
  async selectSecondOptionFromDropdown(
    dropdownButtonSelector: string,
    expectedOptionText: string,
    options: FilterOptions = {}
  ): Promise<void> {
    const { timeout = 20000 } = options;

    // Click dropdown to open
    const dropdownButton = await this.page.waitForSelector(
      dropdownButtonSelector,
      { timeout }
    );

    if (!dropdownButton) {
      throw new Error(`Dropdown button not found: ${dropdownButtonSelector}`);
    }

    // Use JS click to avoid interception issues
    await this.page.evaluate((el) => {
      (el as HTMLElement).click();
    }, dropdownButton);

    // Wait for dropdown overlay to appear
    await this.page.waitForSelector(
      "div[class*='dx-overlay-content'][style*='visibility: visible']",
      { timeout }
    );

    // Find and click the option
    const optionSelector = `//div[contains(@class,'dx-overlay-content') and contains(@style,'visibility: visible')]//div[contains(@class,'dx-item') and contains(., '${expectedOptionText}')]`;
    const option = await this.page.waitForSelector(optionSelector, { timeout });

    if (!option) {
      throw new Error(`Dropdown option not found: ${expectedOptionText}`);
    }

    // Scroll into view and click
    await this.page.evaluate((el) => {
      (el as HTMLElement).scrollIntoView(true);
    }, option);

    await option.click();

    // Wait for network to settle
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Select radio button option
   */
  async selectRadioButtonOption(
    optionText: string,
    options: FilterOptions = {}
  ): Promise<void> {
    const { timeout = 15000 } = options;

    const radioSelector = `//div[@class='dx-item-content' and contains(text(), '${optionText}')]/parent::div[@role='radio']`;
    
    const radioButton = await this.page.waitForSelector(radioSelector, {
      timeout
    });

    if (!radioButton) {
      throw new Error(`Radio button not found: ${optionText}`);
    }

    // Scroll into view
    await this.page.evaluate((el) => {
      (el as HTMLElement).scrollIntoView();
    }, radioButton);

    // Click using JS to avoid interception
    await this.page.evaluate((el) => {
      (el as HTMLElement).click();
    }, radioButton);

    // Wait for change to apply
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Select multiple items from tag box (multi-select)
   */
  async selectFromTagBox(
    tagBoxSelector: string,
    itemsToSelect: string[],
    options: FilterOptions = {}
  ): Promise<void> {
    const { timeout = 10000 } = options;

    // Click to open tag box
    const tagBox = await this.page.waitForSelector(tagBoxSelector, {
      timeout
    });

    if (!tagBox) {
      throw new Error(`Tag box not found: ${tagBoxSelector}`);
    }

    await tagBox.click();

    // Select each item
    for (const item of itemsToSelect) {
      // Find the item in the list
      const itemSelector = `//div[contains(@class,'dx-list-item')]`;
      const items = await this.page.$$(itemSelector);

      let found = false;
      for (const el of items) {
        const text = await el.evaluate((node) => (node as HTMLElement).innerText);
        if (text.includes(item)) {
          await el.scrollIntoViewIfNeeded();
          await el.click();
          found = true;
          break;
        }
      }

      if (!found) {
        console.warn(`⚠️ Could not find/select tag box item: ${item}`);
      }
    }

    // Wait for changes to apply
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click OK/Confirm button in modal
   */
  async clickConfirmButton(
    confirmButtonSelector: string,
    options: FilterOptions = {}
  ): Promise<void> {
    const { timeout = 5000 } = options;

    const button = await this.page.waitForSelector(confirmButtonSelector, {
      timeout
    });

    if (!button) {
      throw new Error(`Confirm button not found: ${confirmButtonSelector}`);
    }

    // Scroll into view
    await this.page.evaluate((el) => {
      (el as HTMLElement).scrollIntoView(true);
    }, button);

    // Try regular click first
    try {
      await button.click();
    } catch {
      // Fallback to JS click
      await this.page.evaluate((el) => {
        (el as HTMLElement).click();
      }, button);
    }

    // Wait for modal to close/network to settle
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click search/submit button
   */
  async clickSearchButton(
    searchButtonSelector: string,
    options: FilterOptions = {}
  ): Promise<void> {
    const { timeout = 10000, waitForNetworkIdle = true } = options;

    const button = await this.page.waitForSelector(searchButtonSelector, {
      timeout
    });

    if (!button) {
      throw new Error(`Search button not found: ${searchButtonSelector}`);
    }

    // Use JS click to avoid interception
    await this.page.evaluate((el) => {
      (el as HTMLElement).click();
    }, button);

    if (waitForNetworkIdle) {
      await this.page.waitForLoadState('networkidle');
    }
  }

  /**
   * Set text input value
   */
  async setTextInput(
    inputSelector: string,
    value: string,
    options: FilterOptions = {}
  ): Promise<void> {
    const { timeout = 5000 } = options;

    const input = await this.page.waitForSelector(inputSelector, { timeout });

    if (!input) {
      throw new Error(`Input not found: ${inputSelector}`);
    }

    await input.click();
    await input.fill('');
    await input.type(value);
  }

  /**
   * Select option from dx-select-box dropdown
   */
  async selectDxSelectOption(
    selectBoxSelector: string,
    optionText: string,
    options: FilterOptions = {}
  ): Promise<void> {
    const { timeout = 10000 } = options;

    // Find and click the dropdown button
    const dropdownBtn = await this.page.$(`${selectBoxSelector} .dx-dropdowneditor-button`);

    if (!dropdownBtn) {
      throw new Error(`Select box not found: ${selectBoxSelector}`);
    }

    await this.page.evaluate((el) => {
      (el as HTMLElement).click();
    }, dropdownBtn);

    // Wait for overlay and select option
    await this.page.waitForSelector(
      "div[class*='dx-overlay-content'][style*='visibility: visible']",
      { timeout }
    );

    const optionSelector = `//div[contains(@class,'dx-item') and contains(., '${optionText}')]`;
    const option = await this.page.waitForSelector(optionSelector, { timeout });

    if (!option) {
      throw new Error(`Option not found: ${optionText}`);
    }

    await this.page.evaluate((el) => {
      (el as HTMLElement).click();
    }, option);

    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Format date to Arabic display format
   * Input: Date object
   * Output: "DD/MM/YYYY HH:MM AM/PM" with Arabic AM/PM
   */
  formatDateToArabic(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    let hours = date.getHours();
    let minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'م' : 'ص';

    if (hours > 12) {
      hours -= 12;
    } else if (hours === 0) {
      hours = 12;
    }

    const hoursStr = String(hours).padStart(2, '0');

    return `${day}/${month}/${year} ${hoursStr}:${minutes} ${ampm}`;
  }

  /**
   * Parse flexible date string (handles various formats)
   */
  parseDateString(dateStr: string): Date {
    // Normalize separators
    let normalized = dateStr.trim().replace(/-/g, '/').replace(/\./g, '/');

    // Handle 8-digit format like 18092025 → 18/09/2025
    if (/^\d{8}$/.test(normalized)) {
      normalized = `${normalized.substring(0, 2)}/${normalized.substring(2, 4)}/${normalized.substring(4)}`;
    }

    const date = new Date(normalized);

    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date format: ${dateStr}`);
    }

    return date;
  }

  /**
   * Clear all filters on report
   */
  async clearAllFilters(clearButtonSelector: string): Promise<void> {
    const clearBtn = await this.page.$(clearButtonSelector);

    if (clearBtn) {
      await clearBtn.click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  /**
   * Wait for report table to load
   */
  async waitForReportTable(
    tableSelector: string = "table[role='grid'], div.dx-datagrid",
    timeout: number = 30000
  ): Promise<void> {
    await this.page.waitForSelector(tableSelector, { timeout, state: 'visible' });
  }

  /**
   * Check if filter is applied
   */
  async isFilterApplied(filterIndicatorSelector: string): Promise<boolean> {
    const indicator = await this.page.$(filterIndicatorSelector);
    return indicator !== null && (await indicator?.isVisible());
  }

  /**
   * Get filter values (useful for verification)
   */
  async getFilterValues(
    fromDateSelector: string,
    toDateSelector: string
  ): Promise<{ fromDate: string; toDate: string }> {
    const fromInput = await this.page.$(
      `${fromDateSelector} input[type="text"]`
    );
    const toInput = await this.page.$(`${toDateSelector} input[type="text"]`);

    const fromDate = fromInput ? await fromInput.inputValue() : '';
    const toDate = toInput ? await toInput.inputValue() : '';

    return { fromDate, toDate };
  }
}
