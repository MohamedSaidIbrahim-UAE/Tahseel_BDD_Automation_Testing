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
    await this.navigateToUrl(reportUrl);
    await this.waitHelper.waitForElement(this.reportTable);
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
    await this.click(this.showReportButton);
    await this.waitHelper.waitForRequestQuiet();
    await this.waitHelper.waitForElement(this.reportTable);
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
