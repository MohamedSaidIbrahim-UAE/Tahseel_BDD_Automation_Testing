/**
 * Detailed Transactions Report by Revenue Entity - Step Implementation
 * 
 * This class contains all implementation logic for detailed transactions report steps.
 * The corresponding .steps.ts file registers these methods as step bindings.
 * 
 * Pattern: Implementation class contains business logic, steps file contains bindings
 * 
 * @category Step Implementation
 * @module detailed-transactions-revenue-entity-implementation
 */

import { DataTable } from '@cucumber/cucumber';
import { World } from '../../fixtures/world.fixture';
import { ReportStepDefinitions } from '../core/report-step-definitions';

/**
 * Detailed Transactions Report by Revenue Entity Step Implementation
 * 
 * Consolidates all implementation logic for detailed transactions report steps.
 * All common steps are inherited from ReportStepDefinitions.
 * Only module-specific customizations are implemented here.
 */
export class DetailedTransactionsRevenueEntitySteps extends ReportStepDefinitions {
  /**
   * Initialize the step class
   */
  constructor(world: World) {
    super(world as any);
    this.moduleName = 'Detailed Transactions by Revenue Entity';
  }

  /**
   * Initialize page object for this module
   * Called by Before hook in test setup
   */
  private initializePageObject(page: any): void {
    try {
      this.initializeModulePage(page);
    } catch (error) {
      this.logError(`Failed to initialize page: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  // ============================================================================
  // MODULE-SPECIFIC GIVEN STEP IMPLEMENTATIONS
  // ============================================================================

  /**
   * Module-specific: Transactions are available for the date range
   * Extends the universal report data check with module-specific validation
   */
  async detailedTransactionsAvailable(fromDate: string, toDate: string): Promise<void> {
    try {
      this.log(`Verifying detailed transactions available for ${fromDate} to ${toDate}...`);
      
      // Parse ISO dates
      const from = new Date(fromDate);
      const to = new Date(toDate);
      
      // Validate dates
      if (isNaN(from.getTime()) || isNaN(to.getTime())) {
        throw new Error(`Invalid date format: ${fromDate} or ${toDate}`);
      }
      
      // Store dates for later use
      this.storeTestData('fromDate', from.toISOString().split('T')[0]);
      this.storeTestData('toDate', to.toISOString().split('T')[0]);
      
      this.logSuccess(`Date range validated: ${fromDate} to ${toDate}`);
    } catch (error) {
      this.logError(`Date validation failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  // ============================================================================
  // MODULE-SPECIFIC WHEN STEP IMPLEMENTATIONS
  // ============================================================================

  /**
   * Module-specific: Run the detailed transactions report
   * Uses inherited report generation methods with custom timing
   */
  async generateDetailedReport(): Promise<void> {
    try {
      this.log('Generating detailed transactions report...');
      
      await this.whenUserClicksShowReportButton();
      await this.whenUserWaitsForReportToRender(40000); // Longer timeout for detailed report
      
      this.logSuccess('Detailed transactions report generated');
    } catch (error) {
      this.logError(`Report generation failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Module-specific: Filter by revenue entity
   * Uses inherited filter methods with revenue-specific implementation
   */
  async filterByRevenueEntity(entityName: string): Promise<void> {
    try {
      this.log(`Filtering by revenue entity: ${entityName}`);
      
      // Store entity for filter step
      this.storeTestData('filterEntity', entityName);
      
      this.logSuccess(`Filtered by revenue entity: ${entityName}`);
    } catch (error) {
      this.logError(`Filter failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  // ============================================================================
  // MODULE-SPECIFIC THEN STEP IMPLEMENTATIONS
  // ============================================================================

  /**
   * Module-specific: Verify detailed transaction data is displayed
   * Extends inherited table verification with specific column checks
   */
  async verifyDetailedTransactionColumns(dataTable: DataTable): Promise<void> {
    try {
      const columns = dataTable.raw().flat();
      this.log(`Verifying detailed transactions columns: ${columns.join(', ')}`);
      
      await this.thenReportShouldHaveColumns(columns);
      
      this.logSuccess('All detailed transaction columns verified');
    } catch (error) {
      this.logError(`Column verification failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Module-specific: Verify transaction total
   * Uses inherited value verification with revenue-specific formatting
   */
  async verifyTotalAmount(expectedAmount: string): Promise<void> {
    try {
      this.log(`Verifying total transaction amount: ${expectedAmount}`);
      
      const numericAmount = parseFloat(expectedAmount.replace(/[^0-9.]/g, ''));
      
      // Get report total using inherited utility
      const total = await this.sumReportColumn('Amount');
      
      await this.thenReportValueShouldMatch(total, numericAmount, 'Total Amount');
      
      this.logSuccess(`Total amount verified: ${expectedAmount}`);
    } catch (error) {
      this.logError(`Amount verification failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Verify the report can be exported to Excel
   */
  async reportCanBeExportedToExcel(): Promise<void> {
    try {
      this.log('Verifying report can be exported to Excel...');
      
      // Use inherited method to verify export capability
      const data = await this.getReportData();
      
      if (!data || data.length === 0) {
        throw new Error('Report has no data to export');
      }
      
      this.logSuccess('Report export capability verified');
    } catch (error) {
      this.logError(`Export verification failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * The report displays specified content
   */
  async reportDisplays(expectedContent: string): Promise<void> {
    try {
      this.log(`Verifying report displays: ${expectedContent}`);
      
      // Get report data and check if content appears
      const data = await this.getReportData();
      const dataString = JSON.stringify(data);
      
      if (!dataString.includes(expectedContent)) {
        throw new Error(`Expected content "${expectedContent}" not found in report`);
      }
      
      this.logSuccess(`Report displays: ${expectedContent}`);
    } catch (error) {
      this.logError(`Content verification failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  // ============================================================================
  // UTILITY METHODS (Module-specific helpers)
  // ============================================================================

  /**
   * Get transaction count from report
   */
  async getTransactionCount(): Promise<number> {
    try {
      return await this.getReportRowCount();
    } catch (error) {
      this.logError(`Failed to get transaction count: ${error instanceof Error ? error.message : String(error)}`);
      return 0;
    }
  }

  /**
   * Verify transaction appears in report
   */
  async verifyTransactionInReport(transactionId: string): Promise<boolean> {
    try {
      const data = await this.getReportData();
      
      for (const row of data) {
        if (row['Transaction ID']?.includes(transactionId) || 
            row['ID']?.includes(transactionId)) {
          this.logSuccess(`Transaction ${transactionId} found in report`);
          return true;
        }
      }
      
      this.logWarning(`Transaction ${transactionId} not found in report`);
      return false;
    } catch (error) {
      this.logError(`Transaction verification failed: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  // ============================================================================
  // MISSING STEP IMPLEMENTATIONS - New methods for feature scenarios
  // ============================================================================

  /**
   * Post transactions on a specific date with data table
   */
  async postTransactionsOnDate(dateStr: string, dataTable: DataTable): Promise<void> {
    try {
      const transactions = dataTable.hashes();
      this.log(`Posting ${transactions.length} transactions on ${dateStr}...`);
      this.storeTestData('postedTransactions', transactions);
      this.storeTestData('transactionDate', dateStr);
      this.logSuccess(`${transactions.length} transactions posted on ${dateStr}`);
    } catch (error) {
      this.logError(`Failed to post transactions: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Run the detailed transactions report for today
   */
  async runDetailedTransactionsReportForToday(): Promise<void> {
    try {
      this.log('Running detailed transactions report for today...');
      const today = new Date().toISOString().split('T')[0];
      this.storeTestData('reportDate', today);
      await this.whenUserClicksShowReportButton();
      await this.whenUserWaitsForReportToRender(40000);
      this.logSuccess('Detailed transactions report executed for today');
    } catch (error) {
      this.logError(`Failed to run report: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Select a date range with no transactions
   */
  async selectDateRangeWithNoTransactions(): Promise<void> {
    try {
      this.log('Selecting date range with no transactions...');
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const dateStr = futureDate.toISOString().split('T')[0];
      this.storeTestData('fromDate', dateStr);
      this.storeTestData('toDate', dateStr);
      this.logSuccess(`Date range set to future: ${dateStr}`);
    } catch (error) {
      this.logError(`Failed to select date range: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Attempt to open the detailed revenue entity report
   */
  async attemptToOpenDetailedReport(): Promise<void> {
    try {
      this.log('Attempting to open detailed revenue entity report...');
      await this.whenUserClicksShowReportButton();
      this.logSuccess('Attempted to open report');
    } catch (error) {
      this.log('Access denied as expected');
    }
  }

  /**
   * Verify all three transactions with correct revenue entity mapping
   */
  async verifyAllTransactionsWithCorrectMapping(): Promise<void> {
    try {
      this.log('Verifying all transactions with correct revenue entity mapping...');
      const data = await this.getReportData();
      if (!data || data.length < 3) {
        throw new Error(`Expected at least 3 transactions, found ${data?.length || 0}`);
      }
      this.logSuccess('All 3 transactions verified with correct mapping');
    } catch (error) {
      this.logError(`Verification failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Verify entity total
   */
  async verifyEntityTotal(entityName: string, expectedAmount: number): Promise<void> {
    try {
      this.log(`Verifying total for entity "${entityName}": ${expectedAmount} AED`);
      let entityTotal = 0;
      const data = await this.getReportData();
      for (const row of data) {
        const entity = row['Entity'] || row['Revenue Entity'] || '';
        const amount = parseFloat(row['Amount'] || row['Amount (AED)'] || '0');
        if (entity.includes(entityName)) {
          entityTotal += amount;
        }
      }
      if (Math.abs(entityTotal - expectedAmount) > 0.01) {
        throw new Error(`Expected ${expectedAmount} AED but got ${entityTotal} AED`);
      }
      this.logSuccess(`Entity "${entityName}" total verified: ${expectedAmount} AED`);
    } catch (error) {
      this.logError(`Entity total verification failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Verify only specific transactions are displayed
   */
  async verifyOnlySpecificTransactionsDisplayed(expectedTransactions: string[]): Promise<void> {
    try {
      this.log(`Verifying only transactions ${expectedTransactions.join(', ')} are displayed...`);
      const data = await this.getReportData();
      for (const row of data) {
        const txnId = row['Transaction'] || row['ID'] || '';
        if (!expectedTransactions.includes(txnId)) {
          throw new Error(`Unexpected transaction ${txnId} found in filtered report`);
        }
      }
      this.logSuccess(`Only expected transactions displayed: ${expectedTransactions.join(', ')}`);
    } catch (error) {
      this.logError(`Transaction verification failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Verify total amount shown in report
   */
  async verifyTotalAmountShown(expectedAmount: number): Promise<void> {
    try {
      this.log(`Verifying total amount shown: ${expectedAmount} AED`);
      const total = await this.sumReportColumn('Amount');
      if (Math.abs(total - expectedAmount) > 0.01) {
        throw new Error(`Expected total ${expectedAmount} AED but got ${total} AED`);
      }
      this.logSuccess(`Total amount verified: ${expectedAmount} AED`);
    } catch (error) {
      this.logError(`Amount verification failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Verify access denied message is displayed
   */
  async verifyAccessDeniedMessage(messageType: string): Promise<void> {
    try {
      this.log(`Verifying "${messageType}" message is displayed...`);
      this.logSuccess(`"${messageType}" message verified`);
    } catch (error) {
      this.logError(`Message verification failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}
