/**
 * Shared Revenues Report - DTPS & Sharjah Municipality Page
 *
 * 50/50 revenue split between:
 * - DTPS (Department of Tourism and Planning Services)
 * - Sharjah Municipality
 *
 * Handles transaction-level split verification and summary reporting.
 */

import { Page } from '@playwright/test';
import { SharedRevenuesBasePage } from './shared-revenues-base.page';

export class SharedRevenuesDTPSSharjahPage extends SharedRevenuesBasePage {
  readonly SPLIT_PERCENTAGE_DTPS = 50;
  readonly SPLIT_PERCENTAGE_SHARJAH = 50;
  readonly REPORT_DESCRIPTION = 'Shared Revenues Report - DTPS & Sharjah Municipality (50/50)';

  // Report-specific selectors
  readonly reportUrl = 'https://staging.tahseel.gov.ae/ManagePortal/report-show/[DTPS_REPORT_ID]';
  readonly dTPSSummaryRow = 'tr:has-text("DTPS Total"), tr[class*="dtps-summary"]';
  readonly sharjahSummaryRow = 'tr:has-text("Sharjah Municipality"), tr[class*="sharjah-summary"]';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to DTPS & Sharjah Municipality report
   */
  async navigateToDTPSSharjahReport(): Promise<void> {
    const reportUrl = 'https://staging.tahseel.gov.ae/ManagePortal/report-show/dtps-sharjah-50-50';
    await this.navigateToReport(reportUrl);
  }

  /**
   * Get DTPS total (50% of all transactions)
   */
  async getDTPSTotal(): Promise<number> {
    return await this.getTotalForEntityA();
  }

  /**
   * Get Sharjah Municipality total (50% of all transactions)
   */
  async getSharjahTotal(): Promise<number> {
    return await this.getTotalForEntityB();
  }

  /**
   * Verify 50/50 split for specific transaction
   */
  async verify50_50Split(transactionId: string): Promise<boolean> {
    return await this.verifyTransactionSplit(transactionId, this.SPLIT_PERCENTAGE_DTPS, this.SPLIT_PERCENTAGE_SHARJAH);
  }

  /**
   * Verify all splits maintain 50/50 distribution
   */
  async verifyAll50_50Splits(): Promise<boolean> {
    const transactions = await this.getAllTransactionsWithSplit();

    return transactions.every(txn => {
      const expectedDtpsShare = (txn.totalAmount * this.SPLIT_PERCENTAGE_DTPS) / 100;
      const expectedSharjahShare = (txn.totalAmount * this.SPLIT_PERCENTAGE_SHARJAH) / 100;

      const tolerance = 0.01;
      return (
        Math.abs(txn.entityAShare - expectedDtpsShare) < tolerance &&
        Math.abs(txn.entityBShare - expectedSharjahShare) < tolerance
      );
    });
  }

  /**
   * Verify DTPS and Sharjah totals are equal (50/50)
   */
  async verifyEqualSplitTotals(): Promise<boolean> {
    const dTPSTotal = await this.getDTPSTotal();
    const sharjahTotal = await this.getSharjahTotal();

    const tolerance = 0.01;
    return Math.abs(dTPSTotal - sharjahTotal) < tolerance;
  }

  /**
   * Generate split summary for audit
   */
  async generateSplitSummary(): Promise<{
    totalTransactions: number;
    grandTotal: number;
    dTPSTotal: number;
    sharjahTotal: number;
    dTPSPercentage: number;
    sharjahPercentage: number;
  }> {
    const transactions = await this.getAllTransactionsWithSplit();
    const dTPSTotal = await this.getDTPSTotal();
    const sharjahTotal = await this.getSharjahTotal();
    const grandTotal = await this.getGrandTotal();

    return {
      totalTransactions: transactions.length,
      grandTotal,
      dTPSTotal,
      sharjahTotal,
      dTPSPercentage: grandTotal > 0 ? (dTPSTotal / grandTotal) * 100 : 0,
      sharjahPercentage: grandTotal > 0 ? (sharjahTotal / grandTotal) * 100 : 0,
    };
  }

  /**
   * Verify mid-period rule change impact on report
   * Simulates updating sharing rule during the period and verifying affected transactions
   */
  async verifyMidPeriodRuleChange(
    changeDate: string,
    newDTPSPercentage: number,
    newSharjahPercentage: number
  ): Promise<{
    beforeChange: number;
    afterChange: number;
    differenceInSplit: number;
  }> {
    const transactions = await this.getAllTransactionsWithSplit();

    const beforeChange = transactions
      .filter(t => t.splitPercentage.includes('50'))
      .reduce((sum, t) => sum + t.entityAShare, 0);

    const afterChange = transactions
      .filter(t => !t.splitPercentage.includes('50'))
      .reduce((sum, t) => sum + t.entityAShare, 0);

    return {
      beforeChange,
      afterChange,
      differenceInSplit: Math.abs(beforeChange - afterChange),
    };
  }
}
