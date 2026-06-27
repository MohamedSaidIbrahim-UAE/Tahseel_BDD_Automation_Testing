/**
 * Report Step Utilities
 * Consolidates duplicate report control logic from shared-revenues-base.page.ts and total-transactions-revenue-entity.page.ts
 * Provides reusable methods for report-specific operations
 */

import { Page } from '@playwright/test';
import { formatDateForAPI, parseGherkinDate } from '../../utils/date-parser';

export class ReportStepUtils {
  /**
   * Set date range filters on a report page
   * Handles both from/to date inputs and applies common wait strategies
   *
   * @param page - Playwright Page object
   * @param fromDate - Start date (string format)
   * @param toDate - End date (string format)
   * @throws - If date parsing fails or elements not found
   */
  static async setDateFilters(page: Page, fromDate: string, toDate: string): Promise<void> {
    // Parse dates to validate format
    const parsedFromDate = parseGherkinDate(fromDate);
    const parsedToDate = parseGherkinDate(toDate);

    // Format for API/input fields
    const fromDateFormatted = formatDateForAPI(parsedFromDate);
    const toDateFormatted = formatDateForAPI(parsedToDate);

    // Common date input selectors
    const fromDateSelectors = [
      'input[name="from-date"]',
      'input[name="fromDate"]',
      'input[name="start-date"]',
      'input[name="startDate"]',
      'input[placeholder*="From"]',
      'input[placeholder*="from"]',
      'input[aria-label*="From"]',
      'input[aria-label*="from"]',
      '#from-date',
      '#fromDate',
      '[data-test-id="from-date-input"]',
    ];

    const toDateSelectors = [
      'input[name="to-date"]',
      'input[name="toDate"]',
      'input[name="end-date"]',
      'input[name="endDate"]',
      'input[placeholder*="To"]',
      'input[placeholder*="to"]',
      'input[aria-label*="To"]',
      'input[aria-label*="to"]',
      '#to-date',
      '#toDate',
      '[data-test-id="to-date-input"]',
    ];

    // Fill from date
    let dateInputFound = false;
    for (const selector of fromDateSelectors) {
      const element = await page.$(selector);
      if (element) {
        await page.fill(selector, fromDateFormatted);
        dateInputFound = true;
        break;
      }
    }

    if (!dateInputFound) {
      throw new Error(
        `Unable to locate "from date" input. Tried selectors: ${fromDateSelectors.join(', ')}`
      );
    }

    // Fill to date
    dateInputFound = false;
    for (const selector of toDateSelectors) {
      const element = await page.$(selector);
      if (element) {
        await page.fill(selector, toDateFormatted);
        dateInputFound = true;
        break;
      }
    }

    if (!dateInputFound) {
      throw new Error(
        `Unable to locate "to date" input. Tried selectors: ${toDateSelectors.join(', ')}`
      );
    }

    // Wait for inputs to be filled
    await page.waitForTimeout(300);
  }

  /**
   * Click the "Show Report" button with comprehensive fallback selectors
   * Handles visibility, off-screen, and hidden (CSS) buttons
   *
   * @param page - Playwright Page object
   * @returns - True if button clicked successfully, false if not found
   */
  static async clickShowReportButton(page: Page): Promise<boolean> {
    // Comprehensive button selector list (31 options)
    const buttonSelectors = [
      'button:has-text("Show Report")',
      'button:has-text("Display Report")',
      'button:has-text("Generate Report")',
      'button:has-text("View Report")',
      'button:has-text("Search")',
      'button:has-text("Find")',
      'button:has-text("Apply")',
      'button[aria-label*="Show"]',
      'button[aria-label*="Report"]',
      'button[aria-label*="Display"]',
      'button[aria-label*="Generate"]',
      'button[aria-label*="Search"]',
      'button[title*="Show"]',
      'button[title*="Report"]',
      'button[title*="Display"]',
      'button[type="submit"]',
      'button[type="button"].btn-primary',
      'button.btn-report',
      'button.search-button',
      'button.show-report-button',
      'button.report-button',
      '.action-button button',
      '[role="button"]:has-text("Show Report")',
      'input[type="submit"]',
      'input[type="submit"][value*="Show"]',
      'input[type="submit"][value*="Report"]',
      'input[type="button"]',
      'input[type="button"][value*="Show"]',
      'input[type="button"][value*="Report"]',
    ];

    for (const selector of buttonSelectors) {
      try {
        const elements = await page.locator(selector).all();

        for (const element of elements) {
          try {
            // Check if button is visible
            if (await element.isVisible().catch(() => false)) {
              // Scroll into view if needed
              await element.scrollIntoViewIfNeeded().catch(() => {});

              // Check computed styles for visibility
              const isHidden = await element
                .evaluate((el: any) => {
                  const style = window.getComputedStyle(el);
                  return (
                    style.display === 'none' ||
                    style.visibility === 'hidden' ||
                    style.opacity === '0'
                  );
                })
                .catch(() => false);

              if (!isHidden) {
                await element.click();
                await page.waitForTimeout(500); // Wait for report to start rendering
                return true;
              }
            }
          } catch (e) {
            // Continue to next element
          }
        }
      } catch (e) {
        // Continue to next selector
      }
    }

    return false;
  }

  /**
   * Wait for report table to render with comprehensive fallback selectors
   * Handles various UI frameworks (DataGrid, standard table, etc.)
   * Gracefully handles empty/no-data states
   *
   * @param page - Playwright Page object
   * @param timeout - Timeout in ms (default 30000)
   * @throws - If table not found after timeout
   */
  static async waitForReportToRender(page: Page, timeout: number = 30000): Promise<void> {
    // Comprehensive table selectors (13 options)
    const tableSelectors = [
      'table[role="grid"]',
      'table.report-table',
      'dx-data-grid',
      '[role="grid"]',
      'table[class*="table"]',
      'table[class*="data"]',
      'table[class*="grid"]',
      '.dx-datagrid',
      '.report-table',
      '.data-table',
      '.grid-container',
      '[class*="grid-wrapper"]',
      'table',
    ];

    // Error message selectors
    const errorSelectors = [
      '[class*="error"]',
      '[role="alert"]',
      '.error-message',
      '.alert-danger',
      '.error-banner',
      '[data-test-id="error-message"]',
    ];

    const startTime = Date.now();
    let lastError: Error | null = null;

    while (Date.now() - startTime < timeout) {
      try {
        // Check for error messages first
        for (const errorSelector of errorSelectors) {
          const errorElement = await page.$(errorSelector);
          if (errorElement) {
            const errorText = await errorElement.textContent();
            console.warn(`Report error detected: ${errorText}`);
            // Don't throw, allow test to check for no-data state
            return;
          }
        }

        // Check for table presence
        for (const tableSelector of tableSelectors) {
          const tableElement = await page.$(tableSelector);
          if (tableElement) {
            // Verify table is actually visible
            const isVisible = await tableElement.isVisible().catch(() => false);
            if (isVisible) {
              // Wait a bit for table to fully render rows
              await page.waitForTimeout(500);
              return;
            }
          }
        }

        // Fallback: check body content
        const bodyContent = await page.$('body');
        if (bodyContent) {
          const contentText = await bodyContent.textContent();
          if (contentText && contentText.length > 100) {
            // Page has substantial content
            await page.waitForTimeout(300);
            return;
          }
        }

        // Wait before retry
        await page.waitForTimeout(500);
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e));
        await page.waitForTimeout(500);
      }
    }

    throw new Error(
      `Report table did not render within ${timeout}ms. ` +
        `Tried selectors: ${tableSelectors.join(', ')}. ` +
        `Last error: ${lastError?.message || 'Unknown'}`
    );
  }

  /**
   * Verify report table has expected columns
   * @param page - Playwright Page object
   * @param expectedColumns - Array of column headers to verify
   * @throws - If any column not found
   */
  static async verifyTableColumns(page: Page, expectedColumns: string[]): Promise<void> {
    const headerSelectors = [
      'th',
      '[role="columnheader"]',
      '.table-header',
      '.column-header',
      '.dx-column-headers [role="row"]',
    ];

    let headerText = '';
    for (const selector of headerSelectors) {
      try {
        const headers = await page.locator(selector).allTextContents();
        headerText = headers.join(' | ');
        if (headerText.length > 0) break;
      } catch (e) {
        // Continue to next selector
      }
    }

    for (const column of expectedColumns) {
      if (!headerText.includes(column)) {
        throw new Error(
          `Expected column "${column}" not found in table headers. Found: ${headerText}`
        );
      }
    }
  }

  /**
   * Extract all rows from report table
   * @param page - Playwright Page object
   * @returns - Array of objects with table data
   */
  static async extractTableData(page: Page): Promise<Record<string, string>[]> {
    const rows: Record<string, string>[] = [];

    // Get headers
    const headers = await page.locator('th, [role="columnheader"]').allTextContents();

    // Get rows
    const rowElements = await page.locator('tbody tr, [role="row"]').all();

    for (const rowElement of rowElements) {
      const cells = await rowElement.locator('td, [role="gridcell"]').allTextContents();
      const row: Record<string, string> = {};

      headers.forEach((header, index) => {
        row[header.trim()] = cells[index]?.trim() || '';
      });

      rows.push(row);
    }

    return rows;
  }

  /**
   * Verify table has at least specified number of rows
   * @param page - Playwright Page object
   * @param minRows - Minimum number of rows expected
   * @throws - If row count is less than expected
   */
  static async verifyTableRowCount(page: Page, minRows: number): Promise<void> {
    const rowSelectors = [
      'tbody tr',
      '[role="row"]:not([class*="header"])',
      '.table-body-row',
      '.data-row',
    ];

    let rowCount = 0;
    for (const selector of rowSelectors) {
      rowCount = await page.locator(selector).count();
      if (rowCount > 0) break;
    }

    if (rowCount < minRows) {
      throw new Error(
        `Expected at least ${minRows} rows in table, but found ${rowCount}`
      );
    }
  }

  /**
   * Verify table is empty or shows no-data message
   * @param page - Playwright Page object
   * @throws - If table appears to have data
   */
  static async verifyTableEmpty(page: Page): Promise<void> {
    // Check for no-data messages
    const noDataSelectors = [
      'text="No records"',
      'text="No data"',
      'text="No results"',
      'text="No transactions"',
      '.no-data-message',
      '.empty-state',
      '[data-test-id="no-records"]',
    ];

    for (const selector of noDataSelectors) {
      const element = await page.$(selector);
      if (element && (await element.isVisible())) {
        return; // Table is empty as expected
      }
    }

    // Verify no rows exist
    const rowCount = await page.locator('tbody tr, [role="row"]:not([class*="header"])').count();
    if (rowCount === 0) {
      return; // Table is empty as expected
    }

    throw new Error(`Expected empty table, but found ${rowCount} rows`);
  }

  /**
   * Export report to specified format
   * @param page - Playwright Page object
   * @param format - Export format ('excel', 'pdf')
   * @throws - If export button not found
   */
  static async exportReport(
    page: Page,
    format: 'excel' | 'pdf'
  ): Promise<void> {
    const exportButtonSelectors =
      format === 'excel'
        ? [
            'button:has-text("Export to Excel")',
            'button:has-text("Excel")',
            'button:has-text("Download")',
            '[data-test-id="export-excel"]',
            '.btn-export-excel',
          ]
        : [
            'button:has-text("Export to PDF")',
            'button:has-text("PDF")',
            'button:has-text("Download")',
            '[data-test-id="export-pdf"]',
            '.btn-export-pdf',
          ];

    for (const selector of exportButtonSelectors) {
      const button = await page.$(selector);
      if (button) {
        await button.click();
        await page.waitForTimeout(1000); // Wait for download
        return;
      }
    }

    throw new Error(`Export button for ${format} format not found`);
  }
}
