/**
 * Shared Revenues Report - SEDD & SCTDA Page
 *
 * 60/40 revenue split between:
 * - SEDD (Sharjah Economic Development Department)
 * - SCTDA (Sharjah Cultural and Tourism Development Authority)
 *
 * Handles transaction-level split verification with 60/40 distribution.
 */

import { Page } from '@playwright/test';
import { SharedRevenuesBasePage } from './shared-revenues-base.page';

export class SharedRevenuesSEDDSCTDAPage extends SharedRevenuesBasePage {
  readonly SPLIT_PERCENTAGE_SEDD = 60;
  readonly SPLIT_PERCENTAGE_SCTDA = 40;
  readonly REPORT_DESCRIPTION = 'Shared Revenues Report - SEDD & SCTDA (60/40)';

  // Report-specific selectors
  readonly reportUrl = 'https://staging.tahseel.gov.ae/ManagePortal/report-show/[SEDD_SCTDA_REPORT_ID]';
  readonly seddSummaryRow = 'tr:has-text("SEDD Total"), tr[class*="sedd-summary"]';
  readonly sctdaSummaryRow = 'tr:has-text("SCTDA Total"), tr[class*="sctda-summary"]';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to SEDD & SCTDA report
   */
  async navigateToSEDDSCTDAReport(): Promise<void> {
    const reportUrl = 'https://staging.tahseel.gov.ae/ManagePortal/report-show/sedd-sctda-60-40';
    await this.navigateToReport(reportUrl);
  }

  /**
   * Get SEDD total (60% of all transactions)
   */
  async getSEDDTotal(): Promise<number> {
    return await this.getTotalForEntityA();
  }

  /**
   * Get SCTDA total (40% of all transactions)
   */
  async getSCTDATotal(): Promise<number> {
    return await this.getTotalForEntityB();
  }

  /**
   * Verify 60/40 split for specific transaction
   */
  async verify60_40Split(transactionId: string): Promise<boolean> {
    return await this.verifyTransactionSplit(transactionId, this.SPLIT_PERCENTAGE_SEDD, this.SPLIT_PERCENTAGE_SCTDA);
  }

  /**
   * Verify all splits maintain 60/40 distribution
   */
  async verifyAll60_40Splits(): Promise<boolean> {
    const transactions = await this.getAllTransactionsWithSplit();

    return transactions.every(txn => {
      const expectedSeddShare = (txn.totalAmount * this.SPLIT_PERCENTAGE_SEDD) / 100;
      const expectedSctdaShare = (txn.totalAmount * this.SPLIT_PERCENTAGE_SCTDA) / 100;

      const tolerance = 0.01;
      return (
        Math.abs(txn.entityAShare - expectedSeddShare) < tolerance &&
        Math.abs(txn.entityBShare - expectedSctdaShare) < tolerance
      );
    });
  }

  /**
   * Verify SEDD gets 60% and SCTDA gets 40% of total
   */
  async verify60_40Distribution(): Promise<boolean> {
    const seddTotal = await this.getSEDDTotal();
    const sctdaTotal = await this.getSCTDATotal();
    const grandTotal = await this.getGrandTotal();

    if (grandTotal === 0) return false;

    const seddPercentage = (seddTotal / grandTotal) * 100;
    const sctdaPercentage = (sctdaTotal / grandTotal) * 100;

    const tolerance = 1; // Allow 1% tolerance
    return Math.abs(seddPercentage - 60) < tolerance && Math.abs(sctdaPercentage - 40) < tolerance;
  }

  /**
   * Generate split summary for audit
   */
  async generateSplitSummary(): Promise<{
    totalTransactions: number;
    grandTotal: number;
    seddTotal: number;
    sctdaTotal: number;
    seddPercentage: number;
    sctdaPercentage: number;
  }> {
    const transactions = await this.getAllTransactionsWithSplit();
    const seddTotal = await this.getSEDDTotal();
    const sctdaTotal = await this.getSCTDATotal();
    const grandTotal = await this.getGrandTotal();

    return {
      totalTransactions: transactions.length,
      grandTotal,
      seddTotal,
      sctdaTotal,
      seddPercentage: grandTotal > 0 ? (seddTotal / grandTotal) * 100 : 0,
      sctdaPercentage: grandTotal > 0 ? (sctdaTotal / grandTotal) * 100 : 0,
    };
  }
}
