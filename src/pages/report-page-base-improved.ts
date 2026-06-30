/**
 * Improved Report Page Base Class
 * 
 * Production-grade report page handling with robust locators and retry logic.
 * Uses LocatorHelper for resilient element finding.
 * 
 * Replaces fragile XPath and text selectors with:
 * - Multiple fallback selectors
 * - Intelligent retry logic
 * - Better timeout handling
 * - Detailed logging
 * 
 * @category Page Objects
 * @module report-page-base-improved
 */

import { Page } from '@playwright/test';
import { BaseListPage } from './base-list.page';
import { LocatorHelper, LocatorConfig } from './base-page-locator-helper';

/**
 * Improved Report Page Base - Production-grade report handling
 */
export class ImprovedReportPageBase extends BaseListPage {
  protected locatorHelper: LocatorHelper;

  // ── Production-grade locator configurations ────────────────────────────────
  
  protected reportTableConfig: LocatorConfig = {
    primary: 'dx-data-grid',
    fallbacks: [
      '[role="grid"]',
      'table[role="grid"]',
      'table.report-table',
      '.dx-datagrid',
      '[class*="grid"]',
    ],
    timeout: 30000,
    waitForVisible: true,
    retry: 3,
  };

  protected showReportButtonConfig: LocatorConfig = {
    primary: 'button[type="submit"]',
    fallbacks: [
      'button.dx-button-submit',
      'button[aria-label*="Show"]',
      'button[aria-label*="Report"]',
      'button:has-text("Show Report")',
      'button:has-text("View Report")',
      'button:has-text("Generate")',
      'button:has-text("Search")',
      'dx-button[type="default"][icon="search"]',
    ],
    timeout: 15000,
    waitForVisible: true,
    retry: 3,
  };

  protected fromDateInputConfig: LocatorConfig = {
    primary: 'input[type="date"]:first-of-type',
    fallbacks: [
      'dx-date-box:first-of-type input',
      'input[aria-label*="From"]',
      'input[placeholder*="From"]',
      'input[name*="from"]',
      'input[id*="from"]',
    ],
    timeout: 15000,
    retry: 2,
  };

  protected toDateInputConfig: LocatorConfig = {
    primary: 'input[type="date"]:last-of-type',
    fallbacks: [
      'dx-date-box:last-of-type input',
      'input[aria-label*="To"]',
      'input[placeholder*="To"]',
      'input[name*="to"]',
      'input[id*="to"]',
    ],
    timeout: 15000,
    retry: 2,
  };

  protected entityFilterConfig: LocatorConfig = {
    primary: 'dx-select-box[aria-label*="Entity"]',
    fallbacks: [
      'select[aria-label*="Entity"]',
      '[role="combobox"][aria-label*="Entity"]',
      'dx-select-box[aria-label*="Department"]',
      'select[name*="entity"]',
    ],
    timeout: 15000,
    retry: 2,
  };

  protected noDataMessageConfig: LocatorConfig = {
    primary: '.dx-empty-row',
    fallbacks: [
      'span:has-text("No data")',
      'span:has-text("No records")',
      '.empty-state',
      '[class*="no-data"]',
      '[class*="empty"]',
      'div:has-text("No matching")',
    ],
    timeout: 10000,
    retry: 1,
  };

  protected clearFilterButtonConfig: LocatorConfig = {
    primary: 'button:has-text("Clear")',
    fallbacks: [
      'button:has-text("Reset")',
      'button[aria-label*="Clear"]',
      'button[aria-label*="Reset"]',
      'button[title*="Clear"]',
    ],
    timeout: 15000,
    retry: 2,
  };

  protected exportButtonConfig: LocatorConfig = {
    primary: 'button:has-text("Export")',
    fallbacks: [
      'button:has-text("Download")',
      'button[aria-label*="Export"]',
      'button[title*="Export"]',
      'dx-button[icon="export"]',
    ],
    timeout: 15000,
    retry: 2,
  };

  constructor(page: Page) {
    super(page);
    this.locatorHelper = new LocatorHelper(page);
  }

  /**
   * Set from date with robust retry logic
   */
  async setFromDate(date: string): Promise<void> {
    await this.locatorHelper.executeWithRetry(
      async () => {
        await this.locatorHelper.safeFill(this.fromDateInputConfig, date);
      },
      { description: `Set from date to ${date}`, maxAttempts: 2 }
    );
  }

  /**
   * Set to date with robust retry logic
   */
  async setToDate(date: string): Promise<void> {
    await this.locatorHelper.executeWithRetry(
      async () => {
        await this.locatorHelper.safeFill(this.toDateInputConfig, date);
      },
      { description: `Set to date to ${date}`, maxAttempts: 2 }
    );
  }

  /**
   * Click show report button with intelligent fallbacks
   */
  async clickShowReport(): Promise<void> {
    await this.locatorHelper.executeWithRetry(
      async () => {
        await this.locatorHelper.safeClick(this.showReportButtonConfig);

        // Wait for report to render
        await this.page.waitForTimeout(2000);
      },
      { description: 'Click show report button', maxAttempts: 3 }
    );
  }

  /**
   * Wait for report table to load
   */
  async waitForReportTable(): Promise<void> {
    await this.locatorHelper.executeWithRetry(
      async () => {
        await this.locatorHelper.waitForElement(this.reportTableConfig);
      },
      { description: 'Wait for report table', maxAttempts: 5, delayMs: 1000 }
    );
  }

  /**
   * Check if no data message is visible
   */
  async isNoDataVisible(): Promise<boolean> {
    try {
      const locator = await this.locatorHelper.findElement(this.noDataMessageConfig);
      const count = await locator.count();
      return count > 0;
    } catch {
      return false;
    }
  }

  /**
   * Get all table rows
   */
  async getTableRowCount(): Promise<number> {
    await this.waitForReportTable();
    const table = await this.locatorHelper.findElement(this.reportTableConfig);
    const rows = table.locator('[role="row"]');
    return await rows.count();
  }

  /**
   * Get table cell value by row and column
   */
  async getTableCellValue(rowIndex: number, columnIndex: number): Promise<string> {
    await this.waitForReportTable();
    const table = await this.locatorHelper.findElement(this.reportTableConfig);
    const cell = table.locator(`[role="row"]:nth-child(${rowIndex + 1}) [role="gridcell"]:nth-child(${columnIndex + 1})`);
    const cellText = await cell.textContent({ timeout: 5000 });
    return cellText?.trim() || '';
  }

  /**
   * Clear all filters
   */
  async clearFilters(): Promise<void> {
    try {
      await this.locatorHelper.safeClick(this.clearFilterButtonConfig);
      await this.page.waitForTimeout(1000);
    } catch (error) {
      // Clear button might not exist, which is okay
      console.warn(`Clear filters button not found: ${(error as Error).message}`);
    }
  }

  /**
   * Export report
   */
  async exportReport(format: 'pdf' | 'excel' = 'excel'): Promise<void> {
    await this.locatorHelper.executeWithRetry(
      async () => {
        // Click export button
        await this.locatorHelper.safeClick(this.exportButtonConfig);

        // Wait for format option to appear
        await this.page.waitForTimeout(500);

        // Select format
        const formatButtonText = format.toUpperCase();
        const formatConfig: LocatorConfig = {
          primary: `button:has-text("${formatButtonText}")`,
          fallbacks: [
            `span:has-text("${formatButtonText}")`,
            `a:has-text("${formatButtonText}")`,
          ],
          timeout: 10000,
          retry: 2,
        };

        await this.locatorHelper.safeClick(formatConfig);
      },
      { description: `Export report as ${format}`, maxAttempts: 2 }
    );
  }

  /**
   * Navigate to report URL with robust error handling
   */
  async navigateToReportUrl(url: string): Promise<void> {
    await this.locatorHelper.executeWithRetry(
      async () => {
        await this.navigateToUrl(url);

        // Wait for page to load
        await Promise.race([
          this.page.waitForLoadState('domcontentloaded', { timeout: 15000 }),
          this.page.waitForTimeout(3000),
        ]);

        // Verify page has content
        const bodyText = await this.page.locator('body').textContent({ timeout: 5000 });
        if (!bodyText || bodyText.trim().length === 0) {
          throw new Error('Page has no content after navigation');
        }
      },
      { description: `Navigate to report URL: ${url}`, maxAttempts: 2 }
    );
  }
}
