/**
 * Report Filter Utility for Report Form Interactions
 *
 * Migrated from Python ReportAutomationConsoleSaveToExcel.py
 * Handles DevExtreme components:
 *   - dx-date-box (calendar popup + Submit)
 *   - dx-tag-box (multi-select with applyvaluemode="useButtons" → OK button)
 *   - dx-select-box (dropdown)
 *   - dx-radio-group (radio buttons)
 *
 * Updated to use Playwright locator API (not deprecated ElementHandle methods).
 */

import { Page, Locator } from '@playwright/test';
import { WaitHelper } from './wait.helper';

export interface FilterOptions {
  timeout?: number;
}

export class ReportFilterUtility {
  private page: Page;
  private waitHelper: WaitHelper;

  constructor(page: Page) {
    this.page = page;
    this.waitHelper = new WaitHelper(page);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // DevExtreme dx-date-box (Date Picker with Calendar Popup)
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Set a DevExtreme dx-date-box value by typing into the text input.
   *
   * The dx-date-box has `openonfieldclick="true"` — clicking opens a calendar.
   * For typed dates (e.g., "01/06/2026 12:00 ص"), we type into the text input
   * and press Tab to trigger Angular change detection.
   *
   * If the calendar popup opens, we close it by clicking Submit.
   */
  async setDatePickerValue(
    datePickerXPath: string,
    dateValue: string,
    options: FilterOptions = {}
  ): Promise<void> {
    const { timeout = 15000 } = options;

    // Locate the input inside the dx-date-box
    const input = this.page
      .locator(`xpath=${datePickerXPath}`)
      .first();

    await input.waitFor({ state: 'visible', timeout });
    await input.click();
    await input.clear();
    await this.page.waitForTimeout(300);

    // Type the Arabic-formatted date
    await input.fill(dateValue);

    // Tab away to trigger Angular ngModel update
    await input.press('Tab');
    await this.page.waitForTimeout(500);

    // If the calendar popup opened, dismiss it
    await this.dismissCalendarPopup();
  }

  /**
   * Dismiss the dx-date-box calendar popup by clicking Submit if visible.
   */
  private async dismissCalendarPopup(): Promise<void> {
    try {
      const submitBtn = this.page.locator('.dx-popup-done').first();
      if (await submitBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await submitBtn.click();
        await this.page.waitForTimeout(300);
      }
    } catch { /* popup not open — that's fine */ }
  }

  /**
   * Set date by clicking a calendar cell directly.
   * Useful when typing doesn't trigger the Angular binding.
   *
   * @param dateBoxLocator - The dx-date-box wrapper or its input locator
   * @param day   - Day of month (1-31)
   * @param month - Month (1-12)
   * @param year  - Full year (e.g., 2026)
   */
  async setDateByCalendar(
    dateBoxLocator: Locator,
    day: number,
    month: number,
    year: number
  ): Promise<void> {
    // Click to open calendar
    await dateBoxLocator.click();
    await this.page.waitForTimeout(500);

    // Build the data-value attribute: "YYYY/MM/DD" with zero-padding
    const dataValue = `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;

    // Find and click the calendar cell
    const cell = this.page.locator(`td.dx-calendar-cell[data-value="${dataValue}"]`).first();
    await cell.waitFor({ state: 'visible', timeout: 10000 });
    await cell.click();
    await this.page.waitForTimeout(300);

    // Click Submit to close the popup
    const submitBtn = this.page.locator('.dx-popup-done').first();
    if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await submitBtn.click();
      await this.page.waitForTimeout(500);
    }
  }

  /** Convenience: set "From" date */
  async setFromDate(datePickerXPath: string, dateValue: string): Promise<void> {
    await this.setDatePickerValue(datePickerXPath, dateValue);
  }

  /** Convenience: set "To" date */
  async setToDate(datePickerXPath: string, dateValue: string): Promise<void> {
    await this.setDatePickerValue(datePickerXPath, dateValue);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // DevExtreme dx-select-box (Single-select Dropdown)
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Select an option from a dx-select-box dropdown.
   * Opens the dropdown, waits for the overlay, clicks the matching item.
   */
  async selectDropdownOption(
    dropdownButtonXPath: string,
    optionText: string,
    options: FilterOptions = {}
  ): Promise<void> {
    const { timeout = 20000 } = options;

    // Click the dropdown button to open
    const dropdownBtn = this.page.locator(`xpath=${dropdownButtonXPath}`).first();
    await dropdownBtn.waitFor({ state: 'visible', timeout });
    await this.safeClick(dropdownBtn);
    await this.page.waitForTimeout(500);

    // Wait for the dropdown overlay to become visible
    const overlay = this.page.locator(
      "div.dx-overlay-content:visible, div[class*='dx-overlay-content']:not(.dx-state-invisible)"
    ).first();
    await overlay.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {
      console.warn('[FilterUtil] Overlay not immediately visible, continuing...');
    });

    // Click the option item containing the expected text
    const option = this.page.locator(
      `div.dx-item:has-text("${optionText}"), ` +
      `div[role="option"]:has-text("${optionText}"), ` +
      `div.dx-list-item:has-text("${optionText}")`
    ).first();
    await option.waitFor({ state: 'visible', timeout });
    await this.safeClick(option);
    await this.page.waitForTimeout(500);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // DevExtreme dx-radio-group (Radio Buttons)
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Select a DevExtreme radio button by its label text.
   *
   * The pattern is:
   *   <div class="dx-item-content" ...>Option Text</div>
   *   ..parent::div[@role='radio']
   */
  async selectRadioOption(
    optionText: string,
    options: FilterOptions = {}
  ): Promise<void> {
    const { timeout = 15000 } = options;

    const radio = this.page.locator(
      `div.dx-item-content:has-text("${optionText}"):visible`
    ).locator('xpath=ancestor::div[@role="radio"]').first();

    await radio.waitFor({ state: 'visible', timeout });
    await radio.scrollIntoViewIfNeeded().catch(() => {});
    await this.safeClick(radio);
    await this.page.waitForTimeout(400);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // DevExtreme dx-tag-box (Multi-select with applyvaluemode="useButtons")
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Select multiple items from a dx-tag-box with `applyvaluemode="useButtons"`.
   *
   * Workflow:
   *   1. Click the tag-box to open the dropdown
   *   2. For each item text, find and click the matching dx-list-item
   *   3. Click the OK/Submit button (`.dx-popup-done`) to confirm selection
   */
  async selectFromTagBox(
    tagBoxXPath: string,
    itemsToSelect: string[],
    okButtonXPath?: string,
    options: FilterOptions = {}
  ): Promise<void> {
    const { timeout = 15000 } = options;

    // Step 1: Open the tag-box dropdown
    const tagBox = this.page.locator(`xpath=${tagBoxXPath}`).first();
    await tagBox.waitFor({ state: 'visible', timeout });
    await this.safeClick(tagBox);
    await this.page.waitForTimeout(600);

    // Step 2: Select each item
    for (const itemText of itemsToSelect) {
      await this.selectTagBoxItem(itemText, timeout);
    }

    // Step 3: Click OK button (applyvaluemode="useButtons" requires confirmation)
    await this.clickTagBoxOkButton(okButtonXPath, timeout);
  }

  /**
   * Select a single item inside an open tag-box dropdown.
   */
  private async selectTagBoxItem(itemText: string, timeout: number): Promise<void> {
    try {
      // DevExtreme multi-select items are dx-list-item divs in an overlay
      const item = this.page.locator(
        `div.dx-list-item:has-text("${itemText}"):visible, ` +
        `div[role="option"]:has-text("${itemText}"):visible`
      ).first();

      await item.waitFor({ state: 'visible', timeout: 3000 });
      await item.scrollIntoViewIfNeeded().catch(() => {});
      await this.safeClick(item);
      await this.page.waitForTimeout(250);
    } catch {
      console.warn(`[FilterUtil] Could not select tag-box item: ${itemText}`);
    }
  }

  /**
   * Click the OK button in the tag-box dropdown to confirm selections.
   * Try multiple selector strategies for the OK button.
   */
  private async clickTagBoxOkButton(
    okButtonXPath?: string,
    timeout: number = 5000
  ): Promise<void> {
    try {
      // Strategy 1: Explicit XPath if provided
      if (okButtonXPath) {
        const btn = this.page.locator(`xpath=${okButtonXPath}`).first();
        if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await this.safeClick(btn);
          await this.page.waitForTimeout(500);
          return;
        }
      }

      // Strategy 2: dx-popup-done class (the standard "Submit" button in DevExtreme overlays)
      const doneBtn = this.page.locator('.dx-popup-done').first();
      if (await doneBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await this.safeClick(doneBtn);
        await this.page.waitForTimeout(500);
        return;
      }

      // Strategy 3: Button with OK/موافق text
      const okBtn = this.page.locator(
        'button:has-text("OK"), button:has-text("موافق"), ' +
        'div[role="button"]:has-text("OK"), div[role="button"]:has-text("موافق")'
      ).first();
      if (await okBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
        await this.safeClick(okBtn);
        await this.page.waitForTimeout(500);
        return;
      }

      // Strategy 4: Press Escape to close (fallback — may or may not apply selection)
      console.warn('[FilterUtil] OK button not found for tag-box — pressing Escape');
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(300);
    } catch {
      console.warn('[FilterUtil] Failed to click OK button for tag-box');
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // Shared helpers
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Click an element using JS click (avoids visibility/overlap issues).
   */
  private async safeClick(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded().catch(() => {});
    try {
      await locator.click({ timeout: 3000 });
    } catch {
      // Fallback: force JS click
      await locator.evaluate((el: HTMLElement) => el.click());
    }
  }

  /**
   * Click a search/submit button using multiple fallback selectors.
   */
  async clickSearchButton(
    searchButtonXPath: string,
    options: FilterOptions = {}
  ): Promise<void> {
    const { timeout = 10000 } = options;

    const btn = this.page.locator(`xpath=${searchButtonXPath}`).first();
    await btn.waitFor({ state: 'visible', timeout });
    await this.safeClick(btn);
    await this.page.waitForTimeout(500);
  }

  /**
   * Format a JavaScript Date to Arabic display format.
   * Output: "DD/MM/YYYY HH:MM ص/م"
   */
  formatDateToArabic(date: Date, isFromDate: boolean = true): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    const hours = isFromDate ? 0 : 23;
    const minutes = isFromDate ? 0 : 59;
    const ampm = hours >= 12 ? 'م' : 'ص';

    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const hoursStr = String(displayHours).padStart(2, '0');
    const minutesStr = String(minutes).padStart(2, '0');

    return `${day}/${month}/${year} ${hoursStr}:${minutesStr} ${ampm}`;
  }

  /**
   * Parse flexible date string to Date object.
   */
  parseDateString(dateStr: string): Date {
    let normalized = dateStr.trim().replace(/-/g, '/').replace(/\./g, '/');
    if (/^\d{8}$/.test(normalized)) {
      normalized = `${normalized.substring(0, 2)}/${normalized.substring(2, 4)}/${normalized.substring(4)}`;
    }
    const date = new Date(normalized);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date format: ${dateStr}`);
    }
    return date;
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // Legacy compatibility methods (used by existing code)
  // ═══════════════════════════════════════════════════════════════════════════════

  /** @deprecated Use selectDropdownOption() instead */
  async selectSecondOptionFromDropdown(
    dropdownButtonSelector: string,
    expectedOptionText: string,
    options: FilterOptions = {}
  ): Promise<void> {
    await this.selectDropdownOption(dropdownButtonSelector, expectedOptionText, options);
  }

  /** @deprecated Use selectRadioOption() instead */
  async selectRadioButtonOption(
    optionText: string,
    options: FilterOptions = {}
  ): Promise<void> {
    await this.selectRadioOption(optionText, options);
  }

  /** @deprecated Use .dx-popup-done or specific button instead */
  async clickConfirmButton(
    confirmButtonSelector: string,
    options: FilterOptions = {}
  ): Promise<void> {
    const { timeout = 5000 } = options;
    const btn = this.page.locator(`xpath=${confirmButtonSelector}`).first();
    await btn.waitFor({ state: 'visible', timeout }).catch(() => {});
    await this.safeClick(btn);
  }
}
