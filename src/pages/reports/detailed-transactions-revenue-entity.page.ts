/**
 * Detailed Transactions Report by Revenue Entity Page
 *
 * Handles:
 * - Detailed transaction listing by revenue entity
 * - Date range and entity filtering
 * - Transaction-level verification
 * - Revenue entity mapping validation
 * - Export to Excel/PDF
 * - Access control enforcement
 */

import { Page } from '@playwright/test';
import { BaseListPage } from '../base-list.page';

export class DetailedTransactionsRevenueEntityPage extends BaseListPage {
  // ── Filter selectors ─────────────────────────────────────────────────────
  readonly fromDateInput = 'input[aria-label*="From"], input[placeholder*="From"]';
  readonly toDateInput = 'input[aria-label*="To"], input[placeholder*="To"]';
  readonly entityFilterDropdown = 'select[aria-label*="Entity"], div[role="combobox"][aria-label*="Entity"]';
  readonly showReportButton = 'button:has-text("Show Report"), button:has-text("Search"), button[aria-label*="Search"]';
  readonly clearFilterButton = 'button:has-text("Clear"), button[aria-label*="Clear"]';

  // ── Report table selectors ──────────────────────────────────────────────
  readonly reportTable = 'table[role="grid"], table.report-table, dx-data-grid';
  readonly transactionIdColumn = 'td:has-text("Transaction ID"), [data-field="transactionId"]';
  readonly serviceColumn = 'td:has-text("Service"), [data-field="service"]';
  readonly revenueEntityColumn = 'td:has-text("Revenue Entity"), [data-field="revenueEntity"]';
  readonly amountColumn = 'td:has-text("Amount"), [data-field="amount"]';
  readonly paymentMethodColumn = 'td:has-text("Payment Method"), [data-field="paymentMethod"]';
  readonly transactionDateColumn = 'td:has-text("Date"), [data-field="date"], [data-field="transactionDate"]';

  // ── Summary/Total selectors ─────────────────────────────────────────────
  readonly entityTotalRow = 'tr:has-text("Total for"), tr[class*="summary"]';
  readonly grandTotalRow = 'tr:has-text("Grand Total"), tr:has-text("Total")';
  readonly grandTotalAmount = 'td:has-text("Grand Total") ~ td, span:has-text("Grand Total") ~ span';

  // ── Empty/No-data states ────────────────────────────────────────────────
  readonly noDataMessage = 'span:has-text("No data"), .empty-state, .no-records-message, div:has-text("No transactions")';
  readonly accessDeniedMessage = 'span:has-text("Access Denied"), div:has-text("Unauthorized"), div:has-text("Permission")';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to Detailed Transactions Report
   */
  async navigateToReport(): Promise<void> {
    const reportUrl = 'https://staging.tahseel.gov.ae/ManagePortal/report-show/7c9f7dcd-1163-4e89-91dd-02b841c24ed7';
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
   * Filter by revenue entity
   */
  async filterByEntity(entityName: string): Promise<void> {
    const dropdown = this.page.locator(this.entityFilterDropdown).first();
    await dropdown.click();
    await this.waitHelper.waitForElement(`text=${entityName}`);
    await this.page.locator(`text=${entityName}`).first().click();
    await this.waitHelper.waitForRequestQuiet();
  }

  /**
   * Apply filters and show report
   */
  async showReport(): Promise<void> {
    await this.click(this.showReportButton);
    await this.waitHelper.waitForRequestQuiet();
    await this.waitHelper.waitForElement(this.reportTable);
  }

  /**
   * Clear all filters
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
   * Get all transactions from report
   */
  async getAllTransactions(): Promise<Array<{
    transactionId: string;
    service: string;
    entity: string;
    amount: number;
    paymentMethod: string;
    date: string;
  }>> {
    const data: Array<{
      transactionId: string;
      service: string;
      entity: string;
      amount: number;
      paymentMethod: string;
      date: string;
    }> = [];
    const rows = this.page.locator(`${this.reportTable} tbody tr:not(.dx-freespace-row)`);
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const cells = rows.nth(i).locator('td');
      const txnId = await cells.nth(0).textContent();
      const service = await cells.nth(1).textContent();
      const entity = await cells.nth(2).textContent();
      const amountText = await cells.nth(3).textContent();
      const method = await cells.nth(4).textContent();
      const dateText = await cells.nth(5).textContent();

      if (txnId?.trim()) {
        data.push({
          transactionId: txnId.trim(),
          service: service?.trim() || '',
          entity: entity?.trim() || '',
          amount: parseFloat(amountText?.replace(/[^0-9.]/g, '') || '0'),
          paymentMethod: method?.trim() || '',
          date: dateText?.trim() || '',
        });
      }
    }

    return data;
  }

  /**
   * Get transactions for specific entity
   */
  async getTransactionsByEntity(entityName: string): Promise<Array<{
    transactionId: string;
    amount: number;
  }>> {
    const transactions: Array<{ transactionId: string; amount: number }> = [];
    const rows = this.page.locator(`${this.reportTable} tbody tr:not(.dx-freespace-row)`);
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const cells = rows.nth(i).locator('td');
      const entity = await cells.nth(2).textContent();
      if (entity?.trim() === entityName) {
        const txnId = await cells.nth(0).textContent();
        const amountText = await cells.nth(3).textContent();
        transactions.push({
          transactionId: txnId?.trim() || '',
          amount: parseFloat(amountText?.replace(/[^0-9.]/g, '') || '0'),
        });
      }
    }

    return transactions;
  }

  /**
   * Calculate total amount for entity
   */
  async calculateEntityTotal(entityName: string): Promise<number> {
    const transactions = await this.getTransactionsByEntity(entityName);
    return transactions.reduce((sum, txn) => sum + txn.amount, 0);
  }

  /**
   * Get grand total amount
   */
  async getGrandTotal(): Promise<number> {
    const grandTotalRow = this.page.locator(this.grandTotalRow).first();
    if (await grandTotalRow.isVisible()) {
      const amountCell = grandTotalRow.locator('td').last();
      const text = await amountCell.textContent();
      return parseFloat(text?.replace(/[^0-9.]/g, '') || '0');
    }
    return 0;
  }

  /**
   * Verify no data message
   */
  async verifyNoDataMessage(): Promise<void> {
    await this.waitHelper.waitForElement(this.noDataMessage);
  }

  /**
   * Check if no data message is visible
   */
  async isNoDataMessageVisible(): Promise<boolean> {
    return await this.page.locator(this.noDataMessage).isVisible().catch(() => false);
  }

  /**
   * Verify access denied message
   */
  async verifyAccessDeniedMessage(): Promise<void> {
    await this.waitHelper.waitForElement(this.accessDeniedMessage);
  }

  /**
   * Check if access denied message is visible
   */
  async isAccessDeniedMessageVisible(): Promise<boolean> {
    return await this.page.locator(this.accessDeniedMessage).isVisible().catch(() => false);
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
   * Verify transaction mapping for specific entity
   */
  async verifyTransactionMapping(transactionId: string, expectedEntity: string): Promise<boolean> {
    const transactions = await this.getAllTransactions();
    const txn = transactions.find(t => t.transactionId === transactionId);
    return txn ? txn.entity === expectedEntity : false;
  }

  /**
   * Verify all transactions have revenue entity mapping
   */
  async verifyAllTransactionsMapped(): Promise<boolean> {
    const transactions = await this.getAllTransactions();
    return transactions.every(txn => txn.entity && txn.entity.trim().length > 0);
  }
}
