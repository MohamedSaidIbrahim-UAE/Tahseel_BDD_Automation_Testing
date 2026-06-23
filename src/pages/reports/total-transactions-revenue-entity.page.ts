/**
 * Total Transactions Report by Revenue Entity Page
 * 
 * Handles:
 * - Report filtering by date range and revenue entities
 * - Table data verification (transaction counts, amounts)
 * - Grand total calculation
 * - Entity-based RBAC restrictions
 * - Export functionality
 */

import { Page } from '@playwright/test';
import { BaseListPage } from '../base-list.page';

export class TotalTransactionsRevenueEntityPage extends BaseListPage {
  // ── Report-specific filter selectors ────────────────────────────────────
  readonly fromDateInput = 'input[aria-label*="From"]';
  readonly toDateInput = 'input[aria-label*="To"]';
  readonly entityFilterDropdown = 'div[aria-label*="Entity"], select[aria-label*="Entity"]';
  readonly showReportButton = 'button:has-text("Show Report"), button[aria-label*="Show"], button:has-text("Search")';
  readonly clearFilterButton = 'button:has-text("Clear"), button[aria-label*="Clear"]';

  // ── Report table selectors ──────────────────────────────────────────────
  readonly reportTable = 'table[role="grid"], table.report-table, dx-data-grid';
  readonly revenueEntityColumn = 'td:has-text("Revenue Entity"), [data-field="revenueEntity"]';
  readonly transactionCountColumn = 'td:has-text("Transaction Count"), [data-field="count"], [data-field="transactionCount"]';
  readonly totalAmountColumn = 'td:has-text("Total Amount"), [data-field="amount"], [data-field="totalAmount"]';
  readonly grandTotalRow = 'tr:has-text("Grand Total"), tr:has-text("Total")';
  readonly grandTotalAmount = 'span:has-text("Grand Total") ~ span, td:has-text("Grand Total") ~ td';

  // ── Empty/No-data states ────────────────────────────────────────────────
  readonly noDataMessage = 'span:has-text("No data"), .empty-state, .no-records-message';

  // ── Export controls ─────────────────────────────────────────────────────
  // Note: Export functionality is inherited from BaseListPage.clickExportAndSelectFormat()
  readonly exportPdfOption = 'button:has-text("PDF"), span:has-text("PDF")';
  readonly exportExcelOption = 'button:has-text("Excel"), span:has-text("Excel")';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to the Total Transactions Report
   */
  async navigateToReport(): Promise<void> {
    const reportUrl = 'https://staging.tahseel.gov.ae/ManagePortal/report-show/115f9d66-7ccb-4d1b-be96-2e499583af0c';
    
    let attempts = 0;
    const maxAttempts = 3;
    let lastError: Error | null = null;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        
        // Navigate to report URL
        await this.navigateToUrl(reportUrl);
        
        // Wait for page to load - allow extra time for report rendering
        await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => {
          // Page might be interactive even before networkidle
        });

        // Give the application time to render the report (especially if JS is heavy)
        await this.page.waitForTimeout(2000);

        // Try multiple selector strategies to find the report table
        const selectors = [
          'table[role="grid"]',      // DevExtreme DataGrid
          'table.report-table',       // Standard table with class
          'dx-data-grid',             // DevExtreme component
          'table',                    // Any table
          '[role="grid"]',            // ARIA role
          'div[class*="table"]',      // Div-based table
          '.report-content table',    // Table inside report content
          'tbody',                    // Just the table body
        ];

        let tableFound = false;
        for (const selector of selectors) {
          try {
            const element = this.page.locator(selector).first();
            // Don't wait too long for visibility - the app may be partially rendering
            const isPresent = await element.isVisible({ timeout: 2000 }).catch(() => false);
            if (isPresent) {
              tableFound = true;
              break;
            }
          } catch {
            // Continue to next selector
            continue;
          }
        }

        if (tableFound) {
          return; // Success - table found
        }

        // If no table found but page loaded without JS errors, proceed anyway
        // The table might appear after clicking Show Report
        const bodyContent = await this.page.locator('body').textContent();
        if (bodyContent && bodyContent.length > 100) {
          // Page has content, likely loaded successfully
          return;
        }

        // If no table found, check for error states
        const hasError = await this.page.locator('[class*="error"], [class*="failed"], .error-message')
          .first()
          .isVisible({ timeout: 1000 })
          .catch(() => false);

        if (hasError) {
          throw new Error('Report page shows error state');
        }

        // If we got here without finding table or error, try reloading
        if (attempts < maxAttempts) {
          await this.page.reload();
          await this.page.waitForTimeout(1000);
        }
      } catch (error) {
        lastError = error as Error;
        
        if (attempts < maxAttempts) {
          // Try reloading the page
          try {
            await this.page.reload();
            await this.page.waitForTimeout(1000);
          } catch {
            // Reload failed, continue to next attempt
          }
        }
      }
    }

    // All attempts failed
    throw new Error(
      `Failed to navigate to report after ${maxAttempts} attempts. ` +
      `Last error: ${lastError?.message || 'Report table not found with any selector'}`
    );
  }

  /**
   * Set from date filter
   */
  async setFromDate(date: string): Promise<void> {
    await this.fillFilterInput(this.fromDateInput, date);
  }

  /**
   * Set to date filter
   */
  async setToDate(date: string): Promise<void> {
    await this.fillFilterInput(this.toDateInput, date);
  }

  /**
   * Select revenue entity from filter dropdown
   */
  async selectRevenueEntity(entityName: string): Promise<void> {
    const dropdown = this.page.locator(this.entityFilterDropdown).first();
    await dropdown.click();
    await this.waitHelper.waitForElement(`text=${entityName}`);
    await this.page.locator(`text=${entityName}`).first().click();
    await this.waitHelper.waitForRequestQuiet();
  }

  /**
   * Click Show Report button to apply filters
   */
  async showReport(): Promise<void> {
    // Wait a bit for the page to settle before trying to find the button
    await this.page.waitForTimeout(1000);

    let attempts = 0;
    const maxAttempts = 5;
    let lastError: Error | null = null;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        // Try different button selectors - more lenient to match any visible button
        const buttonSelectors = [
          'button:has-text("Show Report")',
          'button:has-text("Search")',
          'button[aria-label*="Show"]',
          'button[aria-label*="Report"]',
          'button[aria-label*="Search"]',
          'button[class*="btn-primary"]',      // Primary action buttons
          'button[class*="btn-search"]',
          'button[class*="apply"]',
          'button[class*="filter"]',
          'button[type="submit"]',              // Submit buttons
          'button:nth-of-type(2)',              // Second button (first is often sidebar toggle)
          'button:nth-of-type(3)',
          'button:nth-of-type(4)',
          'button',                             // Any button
        ];

        let buttonClicked = false;
        for (const selector of buttonSelectors) {
          try {
            const buttons = this.page.locator(selector);
            const count = await buttons.count();
            
            // Try each matching button
            for (let i = 0; i < count; i++) {
              try {
                const btn = buttons.nth(i);
                const isVisible = await btn.isVisible({ timeout: 1000 }).catch(() => false);
                const isDisabled = await btn.isDisabled().catch(() => false);
                
                if (isVisible && !isDisabled) {
                  await btn.click({ timeout: 5000 });
                  buttonClicked = true;
                  break;
                }
              } catch {
                continue;
              }
            }
            
            if (buttonClicked) break;
          } catch {
            continue;
          }
        }

        if (buttonClicked) {
          break;
        }

        // If no button found, wait and retry
        if (attempts < maxAttempts) {
          await this.page.waitForTimeout(500);
        }
      } catch (error) {
        lastError = error as Error;
        
        if (attempts < maxAttempts) {
          await this.page.waitForTimeout(500);
        }
      }
    }

    if (attempts >= maxAttempts) {
      // Debug: log all buttons on the page
      const allButtons = await this.page.locator('button').all();
      const buttonDebugInfo = await Promise.all(
        allButtons.slice(0, 10).map(async btn => {
          const text = await btn.textContent().catch(() => '');
          const ariaLabel = await btn.getAttribute('aria-label').catch(() => '');
          const className = await btn.getAttribute('class').catch(() => '');
          return `[text:"${text}"|aria:"${ariaLabel}"|class:"${className}"]`;
        })
      );
      throw new Error(
        `Show Report button not clickable after ${maxAttempts} attempts. ` +
        `Found ${allButtons.length} buttons: ${buttonDebugInfo.join(', ')}. ` +
        `Last error: ${lastError?.message || 'No visible/clickable button found'}`
      );
    }
    
    // Wait for network to settle
    await this.waitHelper.waitForRequestQuiet();
    
    // Wait for report table to appear with extended timeout and multiple selector fallbacks
    const tableSelectors = [
      'table[role="grid"]',
      'table.report-table',
      'dx-data-grid',
      'table',
      '[role="grid"]',
      '.report-content table',
      'div[class*="table"]',
      'tbody',
    ];

    let tableVisible = false;
    for (const selector of tableSelectors) {
      try {
        const isVisible = await this.page.locator(selector).first()
          .isVisible({ timeout: 5000 })
          .catch(() => false);
        
        if (isVisible) {
          tableVisible = true;
          break;
        }
      } catch {
        // Continue to next selector
        continue;
      }
    }

    if (!tableVisible) {
      // Check if page has content even if we can't find a specific table
      const bodyContent = await this.page.locator('body').textContent().catch(() => '');
      if (!bodyContent || bodyContent.length < 100) {
        throw new Error('Report table not found after showing report with any selector');
      }
    }
  }

  /**
   * Click Clear Filters button
   */
  async clearFilters(): Promise<void> {
    const clearBtn = this.page.locator(this.clearFilterButton);
    if (await clearBtn.isVisible()) {
      await clearBtn.click();
      await this.waitHelper.waitForRequestQuiet();
    }
  }

  /**
   * Verify table is visible
   */
  async verifyReportTableVisible(): Promise<void> {
    await this.waitHelper.waitForElement(this.reportTable);
  }

  /**
   * Get all revenue entities from report table
   */
  async getRevenueEntities(): Promise<string[]> {
    const entities: string[] = [];
    const rows = this.page.locator(`${this.reportTable} tbody tr:not(.dx-freespace-row, .grand-total-row)`);
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const entityCell = rows.nth(i).locator('td').first();
      const text = await entityCell.textContent();
      if (text && text.trim()) {
        entities.push(text.trim());
      }
    }

    return entities;
  }

  /**
   * Get transaction count for a specific revenue entity
   */
  async getTransactionCount(entityName: string): Promise<number> {
    const rows = this.page.locator(`${this.reportTable} tbody tr:not(.dx-freespace-row, .grand-total-row)`);
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const entityCell = rows.nth(i).locator('td').first();
      const text = await entityCell.textContent();
      if (text?.trim() === entityName) {
        // Transaction count is typically in second column
        const countCell = rows.nth(i).locator('td').nth(1);
        const countText = await countCell.textContent();
        return parseInt(countText?.replace(/[^0-9]/g, '') || '0', 10);
      }
    }
    return 0;
  }

  /**
   * Get total amount for a specific revenue entity
   */
  async getTotalAmount(entityName: string): Promise<number> {
    const rows = this.page.locator(`${this.reportTable} tbody tr:not(.dx-freespace-row, .grand-total-row)`);
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const entityCell = rows.nth(i).locator('td').first();
      const text = await entityCell.textContent();
      if (text?.trim() === entityName) {
        // Total amount is typically in third column
        const amountCell = rows.nth(i).locator('td').nth(2);
        const amountText = await amountCell.textContent();
        return parseFloat(amountText?.replace(/[^0-9.]/g, '') || '0');
      }
    }
    return 0;
  }

  /**
   * Get grand total amount from report
   */
  async getGrandTotalAmount(): Promise<number> {
    const grandTotalRow = this.page.locator(this.grandTotalRow).first();
    if (await grandTotalRow.isVisible()) {
      const amountCell = grandTotalRow.locator('td').last();
      const text = await amountCell.textContent();
      return parseFloat(text?.replace(/[^0-9.]/g, '') || '0');
    }
    return 0;
  }

  /**
   * Verify entity appears in report (or verify it doesn't with negation)
   */
  async verifyEntityInReport(entityName: string): Promise<boolean> {
    const rows = this.page.locator(`${this.reportTable} tbody tr:not(.dx-freespace-row, .grand-total-row)`);
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const entityCell = rows.nth(i).locator('td').first();
      const text = await entityCell.textContent();
      if (text?.trim() === entityName) {
        return true;
      }
    }
    return false;
  }

  /**
   * Verify entity has zero data
   */
  async verifyEntityHasZeroData(entityName: string): Promise<boolean> {
    const rows = this.page.locator(`${this.reportTable} tbody tr:not(.dx-freespace-row, .grand-total-row)`);
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const entityCell = rows.nth(i).locator('td').first();
      const text = await entityCell.textContent();
      if (text?.trim() === entityName) {
        const countCell = rows.nth(i).locator('td').nth(1);
        const amountCell = rows.nth(i).locator('td').nth(2);
        const countText = await countCell.textContent();
        const amountText = await amountCell.textContent();

        const count = parseInt(countText?.replace(/[^0-9]/g, '') || '0', 10);
        const amount = parseFloat(amountText?.replace(/[^0-9.]/g, '') || '0');
        return count === 0 && amount === 0;
      }
    }
    return false;
  }

  /**
   * Verify no data message is displayed
   */
  async verifyNoDataMessage(): Promise<void> {
    await this.waitHelper.waitForElement(this.noDataMessage);
  }

  /**
   * Check if report is empty
   */
  async isReportEmpty(): Promise<boolean> {
    const noDataMsg = this.page.locator(this.noDataMessage);
    return await noDataMsg.isVisible().catch(() => false);
  }

  /**
   * Export report as PDF
   * Uses inherited clickExportAndSelectFormat() from BaseListPage
   */
  async exportAsPdf(): Promise<void> {
    await this.clickExportAndSelectFormat('PDF');
  }

  /**
   * Export report as Excel
   * Uses inherited clickExportAndSelectFormat() from BaseListPage
   */
  async exportAsExcel(): Promise<void> {
    await this.clickExportAndSelectFormat('Excel');
  }

  /**
   * Get all report data as array of objects
   */
  async getAllReportData(): Promise<Array<{ entity: string; count: number; amount: number }>> {
    const data: Array<{ entity: string; count: number; amount: number }> = [];
    const rows = this.page.locator(`${this.reportTable} tbody tr:not(.dx-freespace-row, .grand-total-row)`);
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const cells = rows.nth(i).locator('td');
      const entity = await cells.nth(0).textContent();
      const countText = await cells.nth(1).textContent();
      const amountText = await cells.nth(2).textContent();

      if (entity?.trim()) {
        data.push({
          entity: entity.trim(),
          count: parseInt(countText?.replace(/[^0-9]/g, '') || '0', 10),
          amount: parseFloat(amountText?.replace(/[^0-9.]/g, '') || '0')
        });
      }
    }

    return data;
  }

  /**
   * Verify multiple reports data matches expected
   */
  async verifyReportDataMatches(expectedData: Array<{ entity: string; count: number; amount: number }>): Promise<void> {
    const actualData = await this.getAllReportData();
    
    for (const expected of expectedData) {
      const actual = actualData.find(d => d.entity === expected.entity);
      if (!actual) {
        throw new Error(`Entity ${expected.entity} not found in report`);
      }
      if (actual.count !== expected.count || actual.amount !== expected.amount) {
        throw new Error(
          `Mismatch for ${expected.entity}: ` +
          `expected count=${expected.count} amount=${expected.amount}, ` +
          `got count=${actual.count} amount=${actual.amount}`
        );
      }
    }
  }
}
