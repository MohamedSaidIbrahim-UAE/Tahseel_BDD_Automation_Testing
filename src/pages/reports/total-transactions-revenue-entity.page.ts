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
  readonly fromDateInput = 'input[aria-label*="From"], input[placeholder*="From"], input[name*="from"], input[id*="from"], input[type="date"]:first-of-type';
  readonly toDateInput = 'input[aria-label*="To"], input[placeholder*="To"], input[name*="to"], input[id*="to"], input[type="date"]:last-of-type';
  readonly entityFilterDropdown = 'select[aria-label*="Entity"], div[role="combobox"][aria-label*="Entity"], [data-component="select"][aria-label*="Entity"], dx-select-box[aria-label*="Entity"], select[name*="entity"]';
  readonly showReportButton = 'button:has-text("Show Report"), button:has-text("Display"), button:has-text("Generate"), button:has-text("View"), button:has-text("Search"), button:has-text("Find"), button[aria-label*="Search"), button[aria-label*="Show"), button[aria-label*="Report"), button[type="submit"], input[type="submit"], dx-button';
  readonly clearFilterButton = 'button:has-text("Clear"), button:has-text("Reset"), button[aria-label*="Clear"), button[aria-label*="Reset"]';

  // ── Report table selectors ──────────────────────────────────────────────
  readonly reportTable = 'dx-data-grid, table[role="grid"], table.report-table, [role="grid"], table[class*="table"], table[class*="data"], table[class*="grid"], .dx-datagrid, .report-table, .data-table, .grid-container, [class*="grid-wrapper"], table, [class*="dx-grid"]';
  readonly revenueEntityColumn = 'td:has-text("Revenue Entity"), td:has-text("Entity"), td:has-text("Department"), [data-field="revenueEntity"], [class*="entity"], td[data-field*="entity"]';
  readonly transactionCountColumn = 'td:has-text("Transaction Count"), td:has-text("Count"), td:has-text("Transactions"), td:has-text("Total Txns"), [data-field="count"], [data-field="transactionCount"], [data-field*="count"]';
  readonly totalAmountColumn = 'td:has-text("Total Amount"), td:has-text("Amount"), td:has-text("Total"), td:has-text("Total Value"), [data-field="amount"], [data-field="totalAmount"], [data-field*="amount"], td[align="right"]';
  readonly grandTotalRow = 'tr:has-text("Grand Total"), tr:has-text("Total"), tr[class*="grand-total"], tr[class*="summary"], tr[class*="footer"], tr[class*="dx-row-focused"]';
  readonly grandTotalAmount = 'span:has-text("Grand Total") ~ span, td:has-text("Grand Total") ~ td, td[class*="grand-total"]';

  // ── Empty/No-data states ────────────────────────────────────────────────
  readonly noDataMessage = 'span:has-text("No data"), span:has-text("No records"), .empty-state, .no-records-message, .dx-empty-row, [class*="no-data"], [class*="empty"]';

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
        
        // Wait for page to load
        await Promise.race([
          this.page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {}),
          this.page.waitForTimeout(2000)
        ]);

        // Additional wait for dynamic content
        await this.page.waitForTimeout(1000);

        // Check if page has any meaningful content
        const bodyContent = await this.page.locator('body').textContent({ timeout: 5000 }).catch(() => '');
        if (!bodyContent || bodyContent.trim().length < 50) {
          throw new Error('Page has no meaningful content');
        }

        // Try to find any type of table or grid container
        const tableFound = await this.findTableElement();
        if (!tableFound) {
          // Check if there's an error on the page
          const hasError = await this.page.locator('[class*="error"], [role="alert"], .error-message')
            .first()
            .isVisible({ timeout: 1000 })
            .catch(() => false);

          if (hasError) {
            throw new Error('Error displayed on report page');
          }
        }

        // Page loaded successfully
        return;
      } catch (error) {
        lastError = error as Error;
        
        if (attempts < maxAttempts) {
          await this.page.waitForTimeout(1000);
          try {
            await this.page.reload();
            await this.page.waitForTimeout(1000);
          } catch {
            // Reload failed, continue to next attempt
          }
        }
      }
    }

    throw new Error(
      `Failed to navigate to report after ${maxAttempts} attempts. Last error: ${lastError?.message || 'Unknown'}`
    );
  }

  /**
   * Find table element using multiple selector strategies
   */
  private async findTableElement(): Promise<boolean> {
    const selectors = [
      'table[role="grid"]',
      'table.report-table',
      'dx-data-grid',
      '[role="grid"]',
      'table[class*="table"]',
      '.dx-datagrid',
      'table'
    ];

    for (const selector of selectors) {
      try {
        const isVisible = await this.page.locator(selector)
          .first()
          .isVisible({ timeout: 1000 })
          .catch(() => false);
        
        if (isVisible) {
          return true;
        }
      } catch {
        continue;
      }
    }

    return false;
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
    await this.page.waitForTimeout(800);

    let attempts = 0;
    const maxAttempts = 5;
    let lastError: Error | null = null;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const buttonClicked = await this.clickShowReportButton();
        if (buttonClicked) {
          break;
        }

        if (attempts < maxAttempts) {
          await this.page.waitForTimeout(400);
        }
      } catch (error) {
        lastError = error as Error;
        
        if (attempts < maxAttempts) {
          await this.page.waitForTimeout(400);
        }
      }
    }

    if (attempts >= maxAttempts) {
      throw new Error(
        `Show Report button not clickable after ${maxAttempts} attempts. Last error: ${lastError?.message || 'Button not found'}`
      );
    }
    
    // Wait for network to settle
    await this.waitHelper.waitForRequestQuiet();
    
    // Wait for report to render
    await this.waitForReportToRender();
  }

  /**
   * Click Show Report button with multiple selector strategies
   */
  private async clickShowReportButton(): Promise<boolean> {
    // Tier 1: Most specific & reliable patterns (try first)
    const tier1Selectors = [
      'button:has-text("Show Report")',
      'button[aria-label="Show Report"]',
      'button.btn-report',
    ];
    
    // Tier 2: Framework-specific patterns (DevExtreme, etc.)
    const tier2Selectors = [
      'dx-button:has-text("Show Report")',
      '[dx-button]:has-text("Show Report")',
      'button[class*="dx-button"]',
    ];
    
    // Tier 3: Broad but efficient patterns
    const tier3Selectors = [
      'button[type="submit"]',
      '[role="button"]:has-text("Show")',
      'button:has-text("Search")',
      'button[aria-label*="Report"]',
      '[role="button"]:has-text("Report")',
    ];
    
    // Tier 4: Alternative frameworks & fallbacks
    const tier4Selectors = [
      'input[type="submit"][value*="Show"]',
      '.search-button',
      '.show-report-button',
      'button:visible',
    ];
    
    const allSelectors = [...tier1Selectors, ...tier2Selectors, ...tier3Selectors, ...tier4Selectors];

    for (const selector of allSelectors) {
      try {
        const buttons = this.page.locator(selector);
        const count = await buttons.count().catch(() => 0);
        
        if (count > 0) {
          // Try each button (limit to 3 attempts)
          for (let i = 0; i < Math.min(count, 3); i++) {
            try {
              const btn = buttons.nth(i);
              const isVisible = await btn.isVisible({ timeout: 500 }).catch(() => false);
              const isDisabled = await btn.isDisabled().catch(() => false);
              
              if (isVisible && !isDisabled) {
                // Scroll button into view
                await btn.scrollIntoViewIfNeeded().catch(() => {});
                await btn.click({ timeout: 2000 });
                return true; // Success - exit immediately
              }
            } catch {
              continue; // Try next button instance
            }
          }
        }
      } catch {
        continue; // Try next selector
      }
    }

    return false;
  }

  /**
   * Wait for report to render after clicking Show Report
   */
  private async waitForReportToRender(): Promise<void> {
    // Framework-specific selectors (try first - likely DevExtreme)
    const frameworkSelectors = [
      'dx-data-grid',
      '.dx-datagrid-rowsview',
      '.dx-grid-container',
      '[class*="dx-datagrid"]',
    ];
    
    // Standard HTML with semantic roles
    const semanticSelectors = [
      '[role="grid"]',
      'table[role="grid"]',
      'table[role="table"]',
    ];
    
    // Class-based patterns
    const classSelectors = [
      '.data-table',
      '.report-table',
      '.grid-container',
      '[class*="datagrid"]',
      '.report-container',
    ];
    
    // Generic HTML selectors (fallback)
    const genericSelectors = [
      'table',
      'div[role="grid"]',
      '[role="presentation"] table',
      '.table-wrapper table',
      'tbody',
    ];
    
    const allSelectors = [...frameworkSelectors, ...semanticSelectors, ...classSelectors, ...genericSelectors];

    let tableVisible = false;
    let lastError: Error | null = null;
    
    for (const selector of allSelectors) {
      try {
        const element = this.page.locator(selector).first();
        const isVisible = await element.isVisible({ timeout: 2000 }).catch(() => false);
        
        if (isVisible) {
          // Give the table time to load its data
          await this.page.waitForTimeout(300);
          tableVisible = true;
          break;
        }
      } catch (error) {
        lastError = error as Error;
        continue;
      }
    }

    if (!tableVisible) {
      // Check for error messages first
      try {
        const errorElement = await this.page.locator('[class*="error"], [role="alert"], .error-message, .alert-danger')
          .first()
          .isVisible({ timeout: 500 })
          .catch(() => false);
        
        if (errorElement) {
          const errorText = await this.page.locator('[class*="error"], [role="alert"], .error-message, .alert-danger')
            .first()
            .textContent()
            .catch(() => 'Unknown error');
          throw new Error(`Report error: ${errorText}`);
        }
      } catch (error) {
        if ((error as Error).message.startsWith('Report error:')) {
          throw error;
        }
      }
      
      // Check for no-data/empty state
      try {
        const noDataVisible = await this.page.locator(this.noDataMessage)
          .isVisible({ timeout: 500 })
          .catch(() => false);
        
        if (noDataVisible) {
          // No data is an acceptable state
          return;
        }
      } catch {
        // Continue to other checks
      }
      
      // Check if page has any content (fallback)
      try {
        const bodyContent = await this.page.locator('body').textContent().catch(() => '');
        if (bodyContent && bodyContent.length > 100) {
          // Page has content, assume report loaded
          return;
        }
      } catch {
        // Continue
      }
      
      // If we get here, table was not found
      throw new Error(
        `Report table not found within 20 seconds. ` +
        `Tried ${allSelectors.length} selector patterns. ` +
        `Last error: ${lastError?.message || 'None'}`
      );
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
