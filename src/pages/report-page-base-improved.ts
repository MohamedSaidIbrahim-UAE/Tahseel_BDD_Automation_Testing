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
    primary: 'table[role="grid"]',
    fallbacks: [
      // DevExtreme selectors
      'dx-data-grid',
      '.dx-data-grid',
      '.dx-datagrid',
      '.dxDataGrid',
      '.dxg-grid-wrapper',
      '[class*="dxDataGrid"]',
      // Generic ARIA selectors
      '[role="grid"]',
      'div[role="grid"]',
      'table[role="grid"]',
      '[role="grid"][class*="data"]',
      // SSR Report Viewer selectors
      '#VisibleReportContentrepViewer_ctl13',
      '[id*="reportContent"]',
      '[id*="ReportContent"]',
      '[id*="ctl13"]', // SSR reports
      '[id^="repViewer"]',
      // Custom app selectors
      '[class*="grid-content"]',
      '[class*="report-grid"]',
      '[class*="data-table"]',
      'app-report-grid',
      'app-data-grid',
      '.report-grid',
      '.table-wrapper',
      '.report-table',
      'table.report-table',
      // Fallback any visible table
      'table:visible',
      'div[role="region"]:visible',
    ],
    timeout: 40000,
    waitForVisible: true,
    retry: 6,
  };

  protected showReportButtonConfig: LocatorConfig = {
    primary: 'button[type="submit"]:not(:disabled)',
    fallbacks: [
      // Arabic language support (RTL system)
      'button:has-text("عرض التقرير")',
      'button:has-text("عرض")',
      'button:has-text("تشغيل")',
      '[aria-label="عرض التقرير"]',
      '[aria-label="عرض"]',
      '[title="عرض التقرير"]',
      // English fallbacks
      'button:has-text("Show Report")',
      'button:has-text("View Report")',
      'button:has-text("Display Report")',
      'button:has-text("Run Report")',
      '[aria-label="Show Report"]',
      '[aria-label="Display Report"]',
      '[title="Show Report"]',
      // Generic safe selectors (most reliable)
      'button.dx-button-submit:not(:disabled)',
      'button[class*="submit"]:not(:disabled):visible',
      'button[class*="primary"]:not(:disabled):visible',
      'button[type="submit"]:not(:disabled):visible',
      'dx-button[type="default"]:not(:disabled)',
      '.btn-primary:not(:disabled)',
      // Fallback position-based (last resort)
      'button:visible:not(:disabled)',
    ],
    timeout: 25000,
    waitForVisible: true,
    retry: 5,
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
    primary: 'button[aria-label*="Export"]',
    fallbacks: [
      // Arabic language support
      'button[aria-label*="تصدير"]',
      'button:has-text("تصدير")',
      'button:has-text("حفظ")',
      '[title="تصدير"]',
      // English selectors
      'button[aria-label*="Export"]',
      'button:has-text("Export")',
      'button:has-text("Download")',
      'button[title*="Export"]',
      'button[title*="Download"]',
      // SSR Report Viewer specific
      '#repViewer_ctl09_ctl04_ctl00_ButtonLink',
      '[id*="ExportButton"]',
      '[id*="Export"]',
      // Generic button with export icon/class
      'button[class*="export"]',
      'button[class*="download"]',
      'dx-button[icon="export"]',
      'dx-button:has-text("Export")',
      // Link-based exports
      'a:has-text("Excel")',
      'a:has-text("PDF")',
      'a:has-text("إكسل")',
      'a:has-text("بي دي إف")',
      'a[title="Excel"]',
      'a[title="PDF"]',
      '[role="button"]:has-text("Export")',
      '[role="menuitem"]:has-text("Excel")',
    ],
    timeout: 20000,
    waitForVisible: true,
    retry: 3,
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

  /**
   * Enhanced SSR report content detection with multiple fallback strategies
   */
  async waitForSSRReportContent(): Promise<void> {
    // Strategy 1: Wait for async spinner to disappear
    await this.waitForAsyncSpinner();

    // Strategy 2: Wait for report content container
    await this.waitForReportContentContainer();

    // Strategy 3: Verify page has meaningful content
    await this.verifyPageHasContent();
  }

  /**
   * Wait for SSR async loading spinner to disappear
   */
  private async waitForAsyncSpinner(maxWaitMs = 300000): Promise<void> {
    const spinnerSelectors = [
      '#repViewer_AsyncWait_Wait',
      '[id*="AsyncWait"]',
      '[class*="async-wait"]',
      '[class*="spinner"]',
      '.loading-overlay',
      '[role="status"]:has-text("Loading")',
    ];

    try {
      for (const selector of spinnerSelectors) {
        try {
          await this.page.waitForSelector(selector, {
            state: 'hidden',
            timeout: 5000,
          });
          console.log(`[ReportTable] Async spinner gone: ${selector}`);
          return;
        } catch {
          // Try next selector
        }
      }
      console.log('[ReportTable] Async spinner not found, continuing...');
    } catch (error) {
      console.warn('[ReportTable] Async spinner wait failed:', error);
    }

    // Safety timeout
    await this.page.waitForTimeout(2000);
  }

  /**
   * Wait for report content container to be visible
   */
  private async waitForReportContentContainer(maxWaitMs = 60000): Promise<void> {
    const contentSelectors = [
      // SSR Report Viewer specific
      '#VisibleReportContentrepViewer_ctl13',
      '[id*="reportContent"]',
      '[id*="ReportContent"]',
      '[id*="ctl13"]',
      '[id^="repViewer"]',
      // Generic grid/table
      '[role="grid"]',
      'table[role="grid"]',
      'dx-data-grid',
      '.dx-data-grid',
      // Report regions
      '[role="region"][aria-label*="report"]',
      '[class*="report-viewer"]',
      '[class*="report-content"]',
      // Tables and containers
      'table',
      'div[role="region"]',
    ];

    const startTime = Date.now();
    let lastError: Error | null = null;

    for (const selector of contentSelectors) {
      try {
        if (Date.now() - startTime > maxWaitMs) break;

        const locator = this.page.locator(selector);
        const count = await locator.count().catch(() => 0);

        if (count > 0) {
          try {
            await locator.first().waitFor({
              state: 'visible',
              timeout: 10000,
            });
            console.log(`[ReportTable] Report content found: ${selector}`);
            return;
          } catch {
            // Try next selector
          }
        }
      } catch (error) {
        lastError = error as Error;
        // Continue to next selector
      }
    }

    // Last resort: check if page has any content
    const bodyText = await this.page.locator('body').textContent().catch(() => '');
    if (bodyText && bodyText.trim().length > 200) {
      console.log('[ReportTable] Page has content (fallback detection)');
      return;
    }

    throw new Error(
      `Report content not found after ${maxWaitMs}ms. Last error: ${lastError?.message || 'Unknown'}`
    );
  }

  /**
   * Verify page has meaningful content
   */
  private async verifyPageHasContent(): Promise<void> {
    try {
      const bodyText = await this.page.locator('body').textContent({ timeout: 5000 });
      const minContentLength = 100;

      if (!bodyText || bodyText.trim().length < minContentLength) {
        throw new Error(
          `Page content too short (${bodyText?.length || 0} chars, minimum ${minContentLength})`
        );
      }

      console.log('[ReportTable] Page content verified');
    } catch (error) {
      throw new Error(`Content verification failed: ${(error as Error).message}`);
    }
  }

  /**
   * Enhanced export button interaction with Arabic support
   */
  async clickExportButtonEnhanced(): Promise<void> {
    await this.locatorHelper.executeWithRetry(
      async () => {
        // First, ensure we can see the export button
        const exportBtn = await this.locatorHelper.findElement(this.exportButtonConfig);

        // Scroll into view if needed
        await exportBtn.scrollIntoViewIfNeeded().catch(() => { });

        // Click with evaluation (more reliable for complex UIs)
        await this.page.evaluate((el) => {
          (el as HTMLElement).click();
        }, await exportBtn.elementHandle());

        console.log('[ReportTable] Export button clicked');

        // Wait for export menu to appear
        await this.page.waitForTimeout(500);
      },
      { description: 'Click export button', maxAttempts: 2 }
    );
  }
}
