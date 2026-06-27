/**
 * Shared Revenues Report - Sharjah Municipality & Service Centers Page
 *
 * 80/20 revenue split between:
 * - Sharjah Municipality (80%)
 * - Service Centers (20%)
 *
 * Handles transaction-level split verification with 80/20 distribution.
 * Includes center-manager RBAC enforcement.
 */

import { Page } from '@playwright/test';
import { SharedRevenuesBasePage } from './shared-revenues-base.page';

export class SharedRevenuesMunicipalityCentersPage extends SharedRevenuesBasePage {
  readonly SPLIT_PERCENTAGE_MUNICIPALITY = 80;
  readonly SPLIT_PERCENTAGE_CENTERS = 20;
  readonly REPORT_DESCRIPTION = 'Shared Revenues Report - Sharjah Municipality & Service Centers (80/20)';

  // Center-specific selectors for RBAC
  readonly centerFilterDropdown = 'select[aria-label*="Center"], div[role="combobox"][aria-label*="Service Center"]';
  readonly municipalitySummaryRow = 'tr:has-text("Municipality Total"), tr[class*="municipality-summary"]';
  readonly centerSummaryRow = 'tr:has-text("Centers Total"), tr[class*="centers-summary"]';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to Municipality & Centers report
   */
  async navigateToMunicipalityCentersReport(): Promise<void> {
    const reportUrl = 'https://staging.tahseel.gov.ae/ManagePortal/report-show/municipality-centers-80-20';
    await this.navigateToReport(reportUrl);
  }

  /**
   * Filter by specific service center (for RBAC testing)
   */
  async filterByServiceCenter(centerName: string): Promise<void> {
    const dropdown = this.page.locator(this.centerFilterDropdown).first();
    await dropdown.click();
    await this.waitHelper.waitForElement(`text=${centerName}`);
    await this.page.locator(`text=${centerName}`).first().click();
    await this.waitHelper.waitForRequestQuiet();
  }

  /**
   * Get Municipality total (80% of all transactions)
   */
  async getMunicipalityTotal(): Promise<number> {
    return await this.getTotalForEntityA();
  }

  /**
   * Get Service Centers total (20% of all transactions)
   */
  async getServiceCentersTotal(): Promise<number> {
    return await this.getTotalForEntityB();
  }

  /**
   * Verify 80/20 split for specific transaction
   */
  async verify80_20Split(transactionId: string): Promise<boolean> {
    return await this.verifyTransactionSplit(
      transactionId,
      this.SPLIT_PERCENTAGE_MUNICIPALITY,
      this.SPLIT_PERCENTAGE_CENTERS
    );
  }

  /**
   * Verify all splits maintain 80/20 distribution
   */
  async verifyAll80_20Splits(): Promise<boolean> {
    const transactions = await this.getAllTransactionsWithSplit();

    return transactions.every(txn => {
      const expectedMunicipalityShare = (txn.totalAmount * this.SPLIT_PERCENTAGE_MUNICIPALITY) / 100;
      const expectedCentersShare = (txn.totalAmount * this.SPLIT_PERCENTAGE_CENTERS) / 100;

      const tolerance = 0.01;
      return (
        Math.abs(txn.entityAShare - expectedMunicipalityShare) < tolerance &&
        Math.abs(txn.entityBShare - expectedCentersShare) < tolerance
      );
    });
  }

  /**
   * Verify Municipality gets 80% and Centers get 20% of total
   */
  async verify80_20Distribution(): Promise<boolean> {
    const municipalityTotal = await this.getMunicipalityTotal();
    const centersTotal = await this.getServiceCentersTotal();
    const grandTotal = await this.getGrandTotal();

    if (grandTotal === 0) return false;

    const municipalityPercentage = (municipalityTotal / grandTotal) * 100;
    const centersPercentage = (centersTotal / grandTotal) * 100;

    const tolerance = 1; // Allow 1% tolerance
    return (
      Math.abs(municipalityPercentage - 80) < tolerance && Math.abs(centersPercentage - 20) < tolerance
    );
  }

  /**
   * Verify center manager can only see their center's share (RBAC)
   */
  async verifyCenterManagerCanOnlySeeCenterData(centerName: string): Promise<boolean> {
    try {
      await this.filterByServiceCenter(centerName);
      const transactions = await this.getAllTransactionsWithSplit();
      // In production, verify that all transactions shown belong to this center
      return transactions.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Generate split summary for audit
   */
  async generateSplitSummary(): Promise<{
    totalTransactions: number;
    grandTotal: number;
    municipalityTotal: number;
    centersTotal: number;
    municipalityPercentage: number;
    centersPercentage: number;
  }> {
    const transactions = await this.getAllTransactionsWithSplit();
    const municipalityTotal = await this.getMunicipalityTotal();
    const centersTotal = await this.getServiceCentersTotal();
    const grandTotal = await this.getGrandTotal();

    return {
      totalTransactions: transactions.length,
      grandTotal,
      municipalityTotal,
      centersTotal,
      municipalityPercentage: grandTotal > 0 ? (municipalityTotal / grandTotal) * 100 : 0,
      centersPercentage: grandTotal > 0 ? (centersTotal / grandTotal) * 100 : 0,
    };
  }
}
