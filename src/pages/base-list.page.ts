/**
 * BaseListPage — shared base for all read-only list/filter modules.
 *
 * Extends BasePage with:
 *  - Generic filter form helpers (date pickers, text inputs, dropdowns)
 *  - Search / Clear button actions
 *  - Pagination assertions
 *  - Detail action button (last row, last cell, dx-button)
 *  - API interception helpers
 *  - Empty-state detection
 */

import { Page, expect, APIResponse } from '@playwright/test';
import { BasePage } from './base.page';
import { config } from '../config/config';
import {
  getItemCount,
  captureItemCountSnapshot,
  verifyItemCountIncreased,
  verifyItemCountUnchanged,
  verifyItemCountAfterMultipleSaves,
  moduleSupportsItemCounting,
  ItemCountSnapshot,
} from '../utils/list-item-counter';

export abstract class BaseListPage extends BasePage {
  // ── Generic filter bar selectors ───────────────────────────────────────────
  readonly searchBtn = 'div[aria-label="Search"]';
  readonly searchButton = 'button.btn-primary';
  readonly clearBtn = 'div[aria-label*="Clear"], div[aria-label="Reset"]';

  // ── Pagination ─────────────────────────────────────────────────────────────
  readonly pagerSelector = 'div.dx-datagrid-pager';
  readonly pageSizeSelector = 'div.dx-page-size';

  // ── Detail action button (last row, last cell, dx-button) ──────────────────
  readonly detailActionBtn = 'table tbody tr:last-child td:last-child .dx-button';
  protected detailButtonSelector = '[aria-label="arrowright"], table tr:last-child td:last-child button';

  // ── Detail screen primary action button ────────────────────────────────────
  readonly detailPrimaryBtn = 'button.btn-primary, .btn-primary, [class*="double-down"]';
  readonly menuContent = 'div.menu-content';

  // ── Empty / no-data state ──────────────────────────────────────────────────
  readonly noDataSelector = 'span[class*="nodata"], .dx-datagrid-nodata, .no-data, .empty-state';
  readonly noDataText = "No data";

  constructor(page: Page) {
    super(page);
  }



  // ── Date picker fill (DevExtreme dx-date-box pattern) ─────────────────────

  /**
   * Fills a DevExtreme date picker input.
   * Targets the visible text input inside the dx-texteditor-container.
   */
  async fillDatePicker(inputSelector: string, value: string): Promise<void> {
    const input = this.page.locator(inputSelector).first();
    await input.waitFor({ state: 'visible', timeout: config.timeout });
    await input.clear();
    await input.fill(value);
    await input.press('Tab');
  }

  /**
   * Fills a date picker by its position among dx-date-box components.
   * index=0 → first, index=-1 → last
   */
  async fillDatePickerByIndex(index: number, value: string): Promise<void> {
    const boxes = this.page.locator('dx-date-box');
    const count = await boxes.count();
    const target = index < 0 ? boxes.nth(count + index) : boxes.nth(index);
    const input = target.locator('input.dx-texteditor-input').first();
    await input.waitFor({ state: 'visible', timeout: config.timeout });
    await input.clear();
    await input.fill(value);
    await input.press('Tab');
  }

  // ── Generic input fill ─────────────────────────────────────────────────────

  async fillFilterInput(selector: string, value: string): Promise<void> {
    const input = this.page.locator(selector).first();
    await input.waitFor({ state: 'visible', timeout: config.timeout });
    await input.clear();
    await input.fill(value);
  }

  // ── Dropdown select ────────────────────────────────────────────────────────

  async selectFilterDropdown(inputSelector: string, value: string): Promise<void> {
    const input = this.page.locator(inputSelector).first();
    await input.waitFor({ state: 'visible', timeout: config.timeout });
    await input.click();
    const option = this.page
      .locator("div[class*='list-item-content'], div[role='option']")
      .filter({ hasText: new RegExp(`^${value}$`, 'i') })
      .first();
    await option.waitFor({ state: 'visible', timeout: config.timeout });
    await option.click();
  }

  // ── Search / Clear ─────────────────────────────────────────────────────────

  async clickSearch(): Promise<void> {
    await this.page.locator(this.searchBtn).first().click();
    await this.page.waitForTimeout(1000);
  }

  async clickActionSearch(): Promise<void> {
    await this.page.locator(this.searchButton).first().click();
    await this.page.waitForTimeout(1000);
  }

  async clickClear(): Promise<void> {
    await this.page.locator(this.clearBtn).first().click();
    await this.page.waitForTimeout(800);
  }

  // ── Grid search ────────────────────────────────────────────────────────────

  async fillGridSearch(term: string, spyAPI: string): Promise<void> {
    await Promise.all([
      // 1. Setup Guard: Uses a precise URL slice to prevent false positives
      this.page.waitForResponse(
        (response) => response.url().includes(spyAPI) && response.status() === 200,
        { timeout: 25000 }
      ),

      // 2. Action: Triggers the payload concurrently
      this.fillGridSearchImpl(term)
    ]);
  }

  async fillGridSearchImpl(term: string): Promise<void> {
    const input = this.page.locator(this.searchInput).first();
    await input.waitFor({ state: 'visible', timeout: config.timeout });
    await input.fill(term);
    await input.press('Enter');
    await this.page.waitForTimeout(800);
  }

  async clearGridSearch(): Promise<void> {
    await this.page.locator(this.searchInput).first().clear();
    await this.page.waitForTimeout(800);
  }

  // ── Pagination ─────────────────────────────────────────────────────────────

  async verifyPagerVisible(): Promise<void> {
    await expect(this.page.locator(this.pagerSelector).first()).toBeVisible({ timeout: config.timeout });
  }

  async verifyPageSizeOptions(sizes: string[]): Promise<void> {
    for (const size of sizes) {
      await expect(
        this.page.locator(this.pageSizeSelector).filter({ hasText: size }).first()
      ).toBeVisible({ timeout: config.timeout });
    }
  }

  async selectPageSize(size: string): Promise<void> {
    await this.page.locator(this.pageSizeSelector).filter({ hasText: size }).first().click();
    await this.page.waitForTimeout(1000);
  }

  // ── Table assertions ───────────────────────────────────────────────────────

  async verifyTableVisible(): Promise<void> {
    // Wait for the datagrid rows view — more specific than 'table' which can match
    // hidden tables. Falls back to the generic table selector.
    const datagrid = this.page.locator('.dx-datagrid-rowsview').first();
    const table = this.page.locator('table').first();
    const found = await datagrid.waitFor({ state: 'visible', timeout: config.timeout })
      .then(() => true)
      .catch(() => false);
    if (!found) {
      await expect(table).toBeVisible({ timeout: config.timeout });
    }
  }

  async verifyTableHasRecords(): Promise<void> {
    // Wait for at least one data row (not header, not free-space row)
    const dataRows = this.page.locator(
      'tbody tr:not(.dx-freespace-row):not(.dx-header-row), [role="rowgroup"] [role="row"]:not([aria-rowindex="1"])'
    );
    await expect(dataRows.first()).toBeVisible({ timeout: config.timeout });
  }


  /**
   * Asserts that the data grid has loaded multiple valid records.
   * Uses index visibility polling to avoid snapshot race conditions.
   */
  async verifyTableHasMultipleRecords(): Promise<void> {
    // 1. Isolate genuine data rows by excluding DevExtreme utility layers
    const realDataRows = this.page.locator('tbody tr').filter({
      hasNot: this.page.locator('.dx-freespace-row, .dx-header-row, .dx-group-row')
    });

    // 2. Define standard fallback ARIA rowgroups
    const ariaDataRows = this.page.locator('[role="rowgroup"] [role="row"]:not([aria-rowindex="1"])');

    // 3. Combine both structural locators using OR syntax
    const activeTableRows = realDataRows.or(ariaDataRows);

    // 4. Professional Assertion: Target the 2nd row (index 1) directly.
    // If index 1 becomes visible, the table mathematically contains at least 2 records.
    // Playwright will auto-retry this for up to 5000ms waiting for the network to finish.
    const secondRow = activeTableRows.nth(1);

    await expect(secondRow).toBeVisible({
      timeout: 7000
    });
  }
  /**
   * Asserts that the data grid contains no active records.
   * Built specifically to handle DevExtreme (dx) grid noise rows and standard ARIA tables.
   */
  async verifyTableIsEmpty(): Promise<void> {
    // 1. Isolate genuine data rows by excluding DevExtreme utility rows
    const realDataRows = this.page.locator('tbody tr').filter({
      hasNot: this.page.locator('.dx-freespace-row, .dx-header-row, .dx-group-row')
    });

    // 2. Define standard fallback ARIA rowgroups if the table layout shifts
    const ariaDataRows = this.page.locator('[role="rowgroup"] [role="row"]:not([aria-rowindex="1"])');

    // 3. Fallback logic: Combine locators using OR syntax so Playwright monitors both structures
    const activeTableRows = realDataRows.or(ariaDataRows);

    // 4. Professional Assertion: Leverage Playwright's web-first 'toHaveCount' 
    // This automatically auto-retries for up to 5000ms if a backend API is still updating the grid state.
    await expect(activeTableRows).toHaveCount(0, { timeout: config.timeout });
  }

  async verifyTableColumns(columns: string[]): Promise<void> {
    // Gather visible header texts for diagnostics
    const headers = await this.page.locator('th, [role="columnheader"]').allTextContents().catch(() => []);
    for (const col of columns) {
      const exactRole = this.page.getByRole('columnheader', { name: col, exact: true }).first();
      if (await exactRole.isVisible().catch(() => false)) continue;

      // case-insensitive contains match across header text
      const containsLocator = this.page.locator('th, [role="columnheader"]').filter({ hasText: new RegExp(col, 'i') }).first();
      if (await containsLocator.isVisible().catch(() => false)) continue;

      // plural/singular relaxation: allow minor variation like 'Action' vs 'Actions'
      const alt = col.endsWith('s') ? col.slice(0, -1) : `${col}s`;
      const altLocator = this.page.locator('th, [role="columnheader"]').filter({ hasText: new RegExp(alt, 'i') }).first();
      if (await altLocator.isVisible().catch(() => false)) continue;

      // None matched — fail with helpful diagnostics listing detected headers
      throw new Error(`Expected column '${col}' not found. Detected headers: ${headers.join(' | ')}`);
    }
  }

  async verifyEmptyOrNoDataState(): Promise<void> {
    const noData = this.page.getByText(this.noDataText);
    await expect(noData.first()).toBeVisible({ timeout: config.timeout });
  }

  async verifyTableHasResultsOrNoData(): Promise<void> {
    // Either rows are present OR a no-data message is shown — both are valid
    const noDataTextVisible = await this.page.getByText(this.noDataText).first().isVisible().catch(() => false);
    const noDataSelectorVisible = await this.page.locator(this.noDataSelector).first().isVisible().catch(() => false);
    const rows = this.page.locator('tbody tr:not(.dx-freespace-row)');
    const rowCount = await rows.count().catch(() => 0);

    // Also consider validation messages or toasts as an acceptable UI feedback
    const validationVisible = await this.page.locator('.validation-message, .dx-toast-content, .alert, .message-content').first().isVisible().catch(() => false);

    expect(noDataTextVisible || noDataSelectorVisible || rowCount > 0 || validationVisible).toBe(true);
  }

  async verifySearchResultsContain(term: string): Promise<void> {
    // Target only data rows — exclude header and free-space rows
    const rows = this.page.locator(
      'tbody tr:not(.dx-freespace-row):not(.dx-header-row), [role="rowgroup"] [role="row"]:not([aria-rowindex="1"])'
    );
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
    const text = await rows.first().textContent();
    if (text?.trim()) {
      expect(text.toLowerCase()).toContain(term.toLowerCase());
    }
  }


  async verifyDetailPrimaryButtonVisible(): Promise<void> {
    await expect(this.page.locator(this.detailPrimaryBtn).first()).toBeVisible({ timeout: config.timeout });
  }

  // ── Detail action button ───────────────────────────────────────────────────

  /**
   * Clicks the detail action button in the last row of the last table on the page.
   * Pattern: table tbody (last) tr (last) td (last) dx-button
   */
  async clickLastRowDetailButton() {
    // Wait for the detail primary button to confirm navigation to detail screen
    const detailScreenPrimaryButton = this.page.locator(this.detailButtonSelector);
    await expect(detailScreenPrimaryButton.last()).toBeVisible({ timeout: config.timeout });
    await detailScreenPrimaryButton.last().click();
  }

  async clickDetailPrimaryButton(): Promise<void> {
    await this.page.locator(this.detailPrimaryBtn).first().click();
    await this.page.waitForTimeout(500);
  }

  async verifyMenuContentVisible(): Promise<void> {
    await expect(this.page.locator(this.menuContent).first()).toBeVisible({ timeout: config.timeout });
  }

  // ── Export ─────────────────────────────────────────────────────────────────

  async clickExportAndSelectFormat(format: string): Promise<void> {
    await this.clickExport();
    // Try multiple strategies to find the export option so tests are resilient
    const tries = [
      () => this.page.getByText(format, { exact: false }).first(),
      () => this.page.locator('div[role="option"]').filter({ hasText: new RegExp(format, 'i') }).first(),
      () => this.page.locator(`button:has-text("${format}")`).first()
    ];

    let lastError: any = null;
    for (const getLocator of tries) {
      const locator = getLocator();
      try {
        await locator.waitFor({ state: 'visible', timeout: Math.min(config.timeout, 30000) });
        await locator.click({ force: true });
        return;
      } catch (err) {
        lastError = err;
      }
    }
    // If none of the strategies worked, capture helpful diagnostics
    const menuHtml = await this.page.locator('body').innerHTML().catch(() => '<unable to read body>');
    throw new Error(`Could not find export option '${format}'. Last error: ${lastError?.message || lastError}\n--- page snapshot start ---\n${menuHtml.slice(0, 20000)}\n--- page snapshot truncated ---`);
  }

  // ── API interception ───────────────────────────────────────────────────────

  /**
   * Intercepts the next matching API request and returns the parsed JSON body.
   * Times out after config.timeout ms.
   */
  async interceptApiResponse(urlPattern: string | RegExp): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`API intercept timed out for: ${urlPattern}`)), config.timeout);
      this.page.on('response', async (response) => {
        const url = response.url();
        const matches = typeof urlPattern === 'string'
          ? url.includes(urlPattern)
          : urlPattern.test(url);
        if (matches && response.status() === 200) {
          clearTimeout(timer);
          try {
            const json = await response.json();
            resolve(json);
          } catch {
            resolve(null);
          }
        }
      });
    });
  }

  /**
   * Makes a direct authenticated API GET request using the authToken from
   * the storageState file. Avoids relying on browser session cookies alone.
   *
   * @param url - Full API URL to request
   * @param authToken - Bearer token (from AuthManager.getAuthToken())
   */
  async authenticatedApiGet(url: string, authToken: string): Promise<unknown> {
    const response = await this.page.request.get(url, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        Accept: 'application/json, text/javascript, */*; q=0.01',
        'X-Requested-With': 'XMLHttpRequest',
      },
      ignoreHTTPSErrors: true,
    });
    if (!response.ok()) {
      throw new Error(`API request failed: ${response.status()} ${response.statusText()} — ${url}`);
    }
    return response.json();
  }

  /**
 * Asserts that the sibling span next to a specific localized label contains "0".
 * @param translateKey - The dynamic label key (e.g., "TransactionDetail.Avc")
 */
  async verifyListViewsRowCounts(translateKey: string, expectedRowsCount: number): Promise<void> {
    // 1. Isolate the container/row that wraps both the label and its sibling span
    const rowContext = this.page.locator('div[class*="pagination"], div.row, .form-group, li').filter({
      has: this.page.locator(`label[translate="${translateKey}"]`)
    });

    // 2. Target the sibling span inside that explicit row boundary context
    const siblingSpan = rowContext.locator('span');

    // 3. Professional Assertion: Web-first polling verifies the text matches exactly
    await expect(siblingSpan).toHaveText(expectedRowsCount.toString(), {
      timeout: 10000
    });
  }

  // ── Item Count Tracking (for list view assertions) ────────────────────────

  /**
   * Gets the current item count from pagination info element
   * Returns null if pagination info is not available for this module
   * 
   * @param moduleName - Name of the module (for logging and module checks)
   * @returns Item count or null if not available
   */
  async getListItemCount(moduleName: string = 'List'): Promise<number | null> {
    return getItemCount(this.page, moduleName);
  }

  /**
   * Captures a snapshot of current item count with pagination details
   * Returns null if pagination info is not available
   * 
   * @param moduleName - Name of the module
   * @returns Snapshot with count and details, or null
   */
  async captureItemCountSnapshot(moduleName: string = 'List'): Promise<ItemCountSnapshot | null> {
    return captureItemCountSnapshot(this.page, moduleName);
  }

  /**
   * Verifies that item count increased by the expected amount
   * Used after successful ADD operations
   * Gracefully skips if pagination info not available
   * 
   * @param beforeCount - Item count before the action
   * @param expectedIncrease - Number of items expected to be added (default: 1)
   * @param moduleName - Name of the module
   */
  async verifyItemCountIncreased(
    beforeCount: number | null,
    expectedIncrease: number = 1,
    moduleName: string = 'List'
  ): Promise<void> {
    return verifyItemCountIncreased(this.page, beforeCount, expectedIncrease, moduleName);
  }

  /**
   * Verifies that item count remained unchanged
   * Used after UPDATE or CANCEL operations
   * Gracefully skips if pagination info not available
   * 
   * @param beforeCount - Item count before the action
   * @param moduleName - Name of the module
   */
  async verifyItemCountUnchanged(
    beforeCount: number | null,
    moduleName: string = 'List'
  ): Promise<void> {
    return verifyItemCountUnchanged(this.page, beforeCount, moduleName);
  }

  /**
   * Verifies item count after multiple save attempts
   * Ensures no duplicate items were created
   * Used for testing duplicate submission handling
   * 
   * @param beforeCount - Item count before the actions
   * @param moduleName - Name of the module
   */
  async verifyItemCountAfterMultipleSaves(
    beforeCount: number | null,
    moduleName: string = 'List'
  ): Promise<void> {
    return verifyItemCountAfterMultipleSaves(this.page, beforeCount, moduleName);
  }

  /**
   * Checks if a module supports item count assertions
   * Some modules (Site Configuration, Action Logs) don't have pagination info
   * 
   * @param moduleName - Name of the module to check
   * @returns true if module supports pagination info, false otherwise
   */
  supportsItemCounting(moduleName: string): boolean {
    return moduleSupportsItemCounting(moduleName);
  }

}
