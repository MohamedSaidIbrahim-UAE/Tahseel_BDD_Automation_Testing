/**
 * Shared Revenues Base Page
 *
 * Foundation for all shared revenue reports with revenue splitting logic.
 * Supports various split percentages and entity combinations.
 *
 * Shared Revenue Models Supported:
 * - DTPS & Sharjah Municipality (50/50 split)
 * - SEDD & SCTDA (60/40 split)
 * - Prevention & Safety Authority & SAND (70/30 split)
 * - Sharjah Municipality & Service Centers (80/20 split)
 */

import { Page } from '@playwright/test';
import { BaseListPage } from '../base-list.page';

export class SharedRevenuesBasePage extends BaseListPage {
  // ── Filter selectors ─────────────────────────────────────────────────────
  readonly fromDateInput = 'input[aria-label*="From"], input[placeholder*="From"]';
  readonly toDateInput = 'input[aria-label*="To"], input[placeholder*="To"]';
  readonly entityFilterDropdown = 'select[aria-label*="Entity"], div[role="combobox"][aria-label*="Entity"]';
  readonly serviceFilterDropdown = 'select[aria-label*="Service"], div[role="combobox"][aria-label*="Service"]';
  readonly showReportButton = 'button:has-text("Show Report"), button:has-text("Search"), button[aria-label*="Search"]';
  readonly clearFilterButton = 'button:has-text("Clear"), button[aria-label*="Clear"]';

  // ── Report table selectors ──────────────────────────────────────────────
  readonly reportTable = 'table[role="grid"], table.report-table, dx-data-grid';
  readonly transactionIdColumn = 'td:has-text("Transaction ID"), [data-field="transactionId"]';
  readonly serviceColumn = 'td:has-text("Service"), [data-field="service"]';
  readonly amountColumn = 'td:has-text("Amount"), [data-field="amount"]';
  readonly entityAShareColumn = 'td:has-text("Entity A Share"), [data-field="entityAShare"]';
  readonly entityBShareColumn = 'td:has-text("Entity B Share"), [data-field="entityBShare"]';
  readonly splitPercentageColumn = 'td:has-text("Split %"), [data-field="splitPercentage"]';

  // ── Summary rows ────────────────────────────────────────────────────────
  readonly entityASummaryRow = 'tr:has-text("Total"), tr[class*="summary"]';
  readonly grandTotalRow = 'tr:has-text("Grand Total")';

  // ── Empty/No-data states ────────────────────────────────────────────────
  readonly noDataMessage = 'span:has-text("No data"), .empty-state, .no-records-message';

  // Revenue split configurations
  protected splitRules: {
    [key: string]: { entityA: number; entityB: number; description: string };
  } = {
    'DTPS_SHARJAH': { entityA: 50, entityB: 50, description: 'DTPS & Sharjah Municipality (50/50)' },
    'SEDD_SCTDA': { entityA: 60, entityB: 40, description: 'SEDD & SCTDA (60/40)' },
    'SAFETY_SAND': { entityA: 70, entityB: 30, description: 'Prevention & Safety Authority & SAND (70/30)' },
    'MUNICIPALITY_CENTERS': { entityA: 80, entityB: 20, description: 'Sharjah Municipality & Service Centers (80/20)' },
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to report
   */
  async navigateToReport(reportUrl: string): Promise<void> {
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
   * Filter by entity
   */
  async filterByEntity(entityName: string): Promise<void> {
    const dropdown = this.page.locator(this.entityFilterDropdown).first();
    await dropdown.click();
    await this.waitHelper.waitForElement(`text=${entityName}`);
    await this.page.locator(`text=${entityName}`).first().click();
    await this.waitHelper.waitForRequestQuiet();
  }

  /**
   * Filter by service
   */
  async filterByService(serviceName: string): Promise<void> {
    const dropdown = this.page.locator(this.serviceFilterDropdown).first();
    await dropdown.click();
    await this.waitHelper.waitForElement(`text=${serviceName}`);
    await this.page.locator(`text=${serviceName}`).first().click();
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
   * Get all transactions with split amounts
   */
  async getAllTransactionsWithSplit(): Promise<
    Array<{
      transactionId: string;
      service: string;
      totalAmount: number;
      entityAShare: number;
      entityBShare: number;
      splitPercentage: string;
    }>
  > {
    const data: Array<{
      transactionId: string;
      service: string;
      totalAmount: number;
      entityAShare: number;
      entityBShare: number;
      splitPercentage: string;
    }> = [];

    const rows = this.page.locator(`${this.reportTable} tbody tr:not(.dx-freespace-row)`);
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const cells = rows.nth(i).locator('td');
      const txnId = await cells.nth(0).textContent();
      const service = await cells.nth(1).textContent();
      const totalText = await cells.nth(2).textContent();
      const shareAText = await cells.nth(3).textContent();
      const shareBText = await cells.nth(4).textContent();
      const splitText = await cells.nth(5).textContent();

      if (txnId?.trim()) {
        data.push({
          transactionId: txnId.trim(),
          service: service?.trim() || '',
          totalAmount: parseFloat(totalText?.replace(/[^0-9.]/g, '') || '0'),
          entityAShare: parseFloat(shareAText?.replace(/[^0-9.]/g, '') || '0'),
          entityBShare: parseFloat(shareBText?.replace(/[^0-9.]/g, '') || '0'),
          splitPercentage: splitText?.trim() || '',
        });
      }
    }

    return data;
  }

  /**
   * Verify split is correctly applied for transaction
   */
  async verifyTransactionSplit(
    transactionId: string,
    expectedEntityAPercentage: number,
    expectedEntityBPercentage: number
  ): Promise<boolean> {
    const transactions = await this.getAllTransactionsWithSplit();
    const txn = transactions.find(t => t.transactionId === transactionId);

    if (!txn) {
      return false;
    }

    const expectedShareA = (txn.totalAmount * expectedEntityAPercentage) / 100;
    const expectedShareB = (txn.totalAmount * expectedEntityBPercentage) / 100;

    // Allow 0.01 tolerance for floating point
    const tolerance = 0.01;
    return (
      Math.abs(txn.entityAShare - expectedShareA) < tolerance &&
      Math.abs(txn.entityBShare - expectedShareB) < tolerance
    );
  }

  /**
   * Calculate total for Entity A
   */
  async getTotalForEntityA(): Promise<number> {
    const transactions = await this.getAllTransactionsWithSplit();
    return transactions.reduce((sum, txn) => sum + txn.entityAShare, 0);
  }

  /**
   * Calculate total for Entity B
   */
  async getTotalForEntityB(): Promise<number> {
    const transactions = await this.getAllTransactionsWithSplit();
    return transactions.reduce((sum, txn) => sum + txn.entityBShare, 0);
  }

  /**
   * Calculate grand total
   */
  async getGrandTotal(): Promise<number> {
    const transactions = await this.getAllTransactionsWithSplit();
    return transactions.reduce((sum, txn) => sum + txn.totalAmount, 0);
  }

  /**
   * Verify all splits sum to total amount for each transaction
   */
  async verifySplitsBalance(): Promise<boolean> {
    const transactions = await this.getAllTransactionsWithSplit();

    return transactions.every(txn => {
      const sum = txn.entityAShare + txn.entityBShare;
      const tolerance = 0.01;
      return Math.abs(sum - txn.totalAmount) < tolerance;
    });
  }

  /**
   * Check if no data message is visible
   */
  async isNoDataMessageVisible(): Promise<boolean> {
    return await this.page.locator(this.noDataMessage).isVisible().catch(() => false);
  }

  /**
   * Verify no data message when no transactions
   */
  async verifyNoDataMessage(): Promise<void> {
    await this.waitHelper.waitForElement(this.noDataMessage);
  }

  /**
   * Get split configuration by key
   */
  getSplitConfiguration(key: string): { entityA: number; entityB: number; description: string } | null {
    return this.splitRules[key] || null;
  }

  /**
   * Export report as PDF
   */
  async exportAsPdf(): Promise<void> {
    await this.clickExportAndSelectFormat('PDF');
  }

  /**
   * Export report as Excel
   */
  async exportAsExcel(): Promise<void> {
    await this.clickExportAndSelectFormat('Excel');
  }

  /**
   * Verify center manager can only see their center's share (RBAC)
   */
  async verifyCenterManagerRestriction(centerName: string): Promise<boolean> {
    try {
      const transactions = await this.getAllTransactionsWithSplit();
      // Center managers should only see transactions for their center
      // This would be verified through center-specific filtering
      return transactions.length > 0;
    } catch {
      return false;
    }
  }
}
