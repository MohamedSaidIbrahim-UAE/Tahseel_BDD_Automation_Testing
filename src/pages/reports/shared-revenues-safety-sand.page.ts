/**
 * Shared Revenues Report - Prevention & Safety Authority & SAND Page
 *
 * 70/30 revenue split between:
 * - Prevention & Safety Authority
 * - SAND (Sharjah Antinarcotics Department)
 *
 * Handles transaction-level split verification with 70/30 distribution.
 */

import { Page } from '@playwright/test';
import { SharedRevenuesBasePage } from './shared-revenues-base.page';

export class SharedRevenuesSafetySANDPage extends SharedRevenuesBasePage {
  readonly SPLIT_PERCENTAGE_SAFETY = 70;
  readonly SPLIT_PERCENTAGE_SAND = 30;
  readonly REPORT_DESCRIPTION = 'Shared Revenues Report - Prevention & Safety Authority & SAND (70/30)';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to Safety & SAND report
   */
  async navigateToSafetySANDReport(): Promise<void> {
    const reportUrl = 'https://staging.tahseel.gov.ae/ManagePortal/report-show/safety-sand-70-30';
    await this.navigateToReport(reportUrl);
  }

  /**
   * Get Prevention & Safety Authority total (70%)
   */
  async getSafetyTotal(): Promise<number> {
    return await this.getTotalForEntityA();
  }

  /**
   * Get SAND total (30%)
   */
  async getSANDTotal(): Promise<number> {
    return await this.getTotalForEntityB();
  }

  /**
   * Verify 70/30 split for specific transaction
   */
  async verify70_30Split(transactionId: string): Promise<boolean> {
    return await this.verifyTransactionSplit(transactionId, this.SPLIT_PERCENTAGE_SAFETY, this.SPLIT_PERCENTAGE_SAND);
  }

  /**
   * Verify all splits maintain 70/30 distribution
   */
  async verifyAll70_30Splits(): Promise<boolean> {
    const transactions = await this.getAllTransactionsWithSplit();

    return transactions.every(txn => {
      const expectedSafetyShare = (txn.totalAmount * this.SPLIT_PERCENTAGE_SAFETY) / 100;
      const expectedSandShare = (txn.totalAmount * this.SPLIT_PERCENTAGE_SAND) / 100;

      const tolerance = 0.01;
      return (
        Math.abs(txn.entityAShare - expectedSafetyShare) < tolerance &&
        Math.abs(txn.entityBShare - expectedSandShare) < tolerance
      );
    });
  }

  /**
   * Verify Safety gets 70% and SAND gets 30% of total
   */
  async verify70_30Distribution(): Promise<boolean> {
    const safetyTotal = await this.getSafetyTotal();
    const sandTotal = await this.getSANDTotal();
    const grandTotal = await this.getGrandTotal();

    if (grandTotal === 0) return false;

    const safetyPercentage = (safetyTotal / grandTotal) * 100;
    const sandPercentage = (sandTotal / grandTotal) * 100;

    const tolerance = 1; // Allow 1% tolerance
    return Math.abs(safetyPercentage - 70) < tolerance && Math.abs(sandPercentage - 30) < tolerance;
  }

  /**
   * Generate split summary for audit
   */
  async generateSplitSummary(): Promise<{
    totalTransactions: number;
    grandTotal: number;
    safetyTotal: number;
    sandTotal: number;
    safetyPercentage: number;
    sandPercentage: number;
  }> {
    const transactions = await this.getAllTransactionsWithSplit();
    const safetyTotal = await this.getSafetyTotal();
    const sandTotal = await this.getSANDTotal();
    const grandTotal = await this.getGrandTotal();

    return {
      totalTransactions: transactions.length,
      grandTotal,
      safetyTotal,
      sandTotal,
      safetyPercentage: grandTotal > 0 ? (safetyTotal / grandTotal) * 100 : 0,
      sandPercentage: grandTotal > 0 ? (sandTotal / grandTotal) * 100 : 0,
    };
  }
}
