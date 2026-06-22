/**
 * Report Test Data Factory
 * 
 * Generates and manages test data for report scenarios
 */

import {
  RevenueEntity,
  TransactionData,
  ReportData,
  REVENUE_ENTITIES,
  TEST_TRANSACTIONS,
  EXPECTED_REPORT_DATA
} from '../models/revenue-entity.model';

export class ReportTestDataFactory {
  /**
   * Get all test revenue entities
   */
  static getRevenueEntities(): RevenueEntity[] {
    return [
      REVENUE_ENTITIES.ENTITY_A,
      REVENUE_ENTITIES.ENTITY_B,
      REVENUE_ENTITIES.ENTITY_C
    ];
  }

  /**
   * Get entity by name
   */
  static getEntityByName(name: string): RevenueEntity | undefined {
    return this.getRevenueEntities().find(e => e.name === name);
  }

  /**
   * Get test transactions for June 2026
   */
  static getJuneTransactions(): TransactionData[] {
    return Object.entries(TEST_TRANSACTIONS.JUNE_2026).map(([entity, data]) => ({
      entity,
      count: data.count,
      totalAmount: data.amount
    }));
  }

  /**
   * Get expected report data (positive scenario)
   */
  static getExpectedReportData(): ReportData[] {
    return EXPECTED_REPORT_DATA.SUMMARY_AGGREGATION.map(data => ({
      revenueEntity: data.entity,
      transactionCount: data.count,
      totalAmount: data.amount
    }));
  }

  /**
   * Get grand total for report
   */
  static getGrandTotal() {
    return EXPECTED_REPORT_DATA.GRAND_TOTAL;
  }

  /**
   * Get entities with no transactions
   */
  static getZeroTransactionEntities(): string[] {
    const allTransactions = this.getJuneTransactions();
    return allTransactions
      .filter(t => t.count === 0 && t.totalAmount === 0)
      .map(t => t.entity);
  }

  /**
   * Get date range for June 2026
   */
  static getJuneDateRange() {
    return {
      fromDate: '2026-06-01',
      toDate: '2026-06-30',
      month: 'June',
      year: '2026'
    };
  }

  /**
   * Generate expected data for RBAC test (Entity-A only)
   */
  static getEntityARestrictedData(): ReportData[] {
    return [
      {
        revenueEntity: 'Entity-A',
        transactionCount: 50,
        totalAmount: 100000.00
      }
    ];
  }

  /**
   * Calculate sum of all transaction amounts
   */
  static calculateExpectedGrandTotal(): number {
    const transactions = this.getJuneTransactions();
    return transactions.reduce((sum, t) => sum + t.totalAmount, 0);
  }

  /**
   * Calculate sum of all transaction counts
   */
  static calculateExpectedTotalCount(): number {
    const transactions = this.getJuneTransactions();
    return transactions.reduce((sum, t) => sum + t.count, 0);
  }

  /**
   * Verify test data consistency
   */
  static verifyDataConsistency(): boolean {
    const grandTotal = this.getGrandTotal();
    const calculated = this.calculateExpectedGrandTotal();
    
    // Allow small floating point differences
    const tolerance = 0.01;
    const difference = Math.abs(grandTotal.totalAmount - calculated);
    
    return difference <= tolerance;
  }
}
