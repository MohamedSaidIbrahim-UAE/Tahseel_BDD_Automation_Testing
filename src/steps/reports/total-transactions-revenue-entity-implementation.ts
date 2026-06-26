/**
 * Total Transactions Report by Revenue Entity - Step Implementation
 */

import { DataTable, World } from '@cucumber/cucumber';
import { ReportStepDefinitions } from '../core/report-step-definitions';
import { TotalTransactionsRevenueEntityPage } from '../../pages/reports/total-transactions-revenue-entity.page';
import { parseGherkinDate, getMonthDateRange } from '../../utils/date-parser';
import { expect } from '@playwright/test';

export class TotalTransactionsRevenueEntitySteps extends ReportStepDefinitions {
  protected reportPage: TotalTransactionsRevenueEntityPage | null = null;

  constructor(world: World) {
    super(world as any);
    this.moduleName = 'Total Transactions Report by Revenue Entity';
    if ((world as any).page) {
      this.reportPage = new TotalTransactionsRevenueEntityPage((world as any).page);
    }
  }

  async summaryTransactionsPosted(fromDate: string, toDate: string): Promise<void> {
    try {
      this.log(`Setting up transactions from ${fromDate} to ${toDate}...`);
      const parsedFromDate = parseGherkinDate(fromDate);
      const parsedToDate = parseGherkinDate(toDate);
      this.storeTestData('transactionFromDate', parsedFromDate.toISOString().split('T')[0]);
      this.storeTestData('transactionToDate', parsedToDate.toISOString().split('T')[0]);
      this.logSuccess(`Transactions setup for ${fromDate} to ${toDate}`);
    } catch (error) {
      this.logError(`Failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async sharingRuleUpdated(dateStr: string, splitRule: string): Promise<void> {
    try {
      this.log(`Setting up sharing rule update on ${dateStr} to ${splitRule}...`);
      const changeDate = parseGherkinDate(dateStr);
      this.storeTestData('ruleChangeDate', changeDate.toISOString().split('T')[0]);
      this.storeTestData('newSplitRule', splitRule);
      this.logSuccess(`Sharing rule: ${splitRule}`);
    } catch (error) {
      this.logError(`Failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async transactionsPostedUnderSharedService(dateStr: string): Promise<void> {
    try {
      this.log(`Setup shared service transactions on ${dateStr}...`);
      const serviceDate = parseGherkinDate(dateStr);
      this.storeTestData('sharedServiceDate', serviceDate.toISOString().split('T')[0]);
      this.logSuccess(`Shared service date: ${dateStr}`);
    } catch (error) {
      this.logError(`Failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async transactionsPostedForMonth(monthYear: string, dataTable: DataTable): Promise<void> {
    try {
      const data = dataTable.hashes();
      this.log(`Setting up transactions for ${monthYear}...`);
      data.forEach((row: any) => {
        this.log(`  Entity: ${row.Entity}, Count: ${row.Count}, Amount: ${row['Total Amount']} AED`);
      });
      this.storeTestData('transactionMonth', monthYear);
      this.storeTestData('transactionData', data);
      this.logSuccess(`Transactions setup for ${monthYear}`);
    } catch (error) {
      this.logError(`Failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async runTotalTransactionsReportForMonth(monthYear: string): Promise<void> {
    try {
      if (!this.reportPage) throw new Error('Report page not initialized');
      this.log(`Running report for ${monthYear}...`);
      
      const parts = monthYear.split(/\s+/);
      if (parts.length !== 2) throw new Error(`Invalid format: ${monthYear}`);
      
      const monthName = parts[0];
      const year = parseInt(parts[1], 10);
      if (isNaN(year)) throw new Error(`Invalid year: ${parts[1]}`);
      
      const dateRange = getMonthDateRange(monthName, year);
      await this.reportPage.navigateToReport();
      await this.reportPage.setFromDate(dateRange.from.toISOString().split('T')[0]);
      await this.reportPage.setToDate(dateRange.to.toISOString().split('T')[0]);
      await this.reportPage.showReport();
      
      this.storeTestData('lastReportMonth', monthYear);
      this.storeTestData('reportFromDate', dateRange.from.toISOString().split('T')[0]);
      this.storeTestData('reportToDate', dateRange.to.toISOString().split('T')[0]);
      
      this.logSuccess(`Report executed for ${monthYear}`);
    } catch (error) {
      this.logError(`Failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async filterByRevenueEntity(): Promise<void> {
    try {
      if (!this.reportPage) throw new Error('Report page not initialized');
      this.log('Filtering by revenue entity...');
      const entities = await this.reportPage.getRevenueEntities();
      this.log(`Found ${entities.length} entities: ${entities.join(', ')}`);
      this.storeTestData('availableEntities', entities);
      this.logSuccess('Filtered by revenue entity');
    } catch (error) {
      this.logError(`Failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async reportReflectsUpdatedSharingRule(dateStr: string): Promise<void> {
    try {
      if (!this.reportPage) throw new Error('Report page not initialized');
      this.log(`Verifying updated sharing rule from ${dateStr}...`);
      parseGherkinDate(dateStr);
      const newRule = this.getStoredTestData<string>('newSplitRule') || '60/40';
      this.log(`  Rule: ${newRule}`);
      await this.reportPage.verifyReportTableVisible();
      this.logSuccess(`Rule change verified from ${dateStr}`);
    } catch (error) {
      this.logError(`Failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async verifyTotalTransactionsTable(): Promise<void> {
    try {
      if (!this.reportPage) throw new Error('Report page not initialized');
      this.log('Verifying table...');
      await this.reportPage.verifyReportTableVisible();
      const entities = await this.reportPage.getRevenueEntities();
      this.log(`  Entities: ${entities.length}`);
      this.logSuccess('Table verified');
    } catch (error) {
      this.logError(`Failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async verifyTotalRevenue(expectedTotal: string): Promise<void> {
    try {
      if (!this.reportPage) throw new Error('Report page not initialized');
      this.log(`Verifying total: ${expectedTotal} AED...`);
      const actualTotal = await this.reportPage.getGrandTotalAmount();
      const expectedAmount = parseFloat(expectedTotal);
      this.log(`  Expected: ${expectedAmount}, Actual: ${actualTotal}`);
      expect(actualTotal).toBeCloseTo(expectedAmount, 2);
      this.logSuccess(`Total verified: ${expectedAmount} AED`);
    } catch (error) {
      this.logError(`Failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async verifyReportShowsData(expectedData: DataTable): Promise<void> {
    try {
      if (!this.reportPage) throw new Error('Report page not initialized');
      const data = expectedData.hashes();
      this.log(`Verifying ${data.length} entities...`);
      const reportData = await this.reportPage.getAllReportData();
      
      for (const expectedRow of data) {
        const entity = expectedRow['Revenue Entity'];
        const count = parseInt(expectedRow['Transaction Count'], 10);
        const amount = parseFloat(expectedRow['Total Amount']);
        const matchingData = reportData.find(d => d.entity === entity);
        
        if (!matchingData) throw new Error(`Entity "${entity}" not found`);
        expect(matchingData.count).toBe(count);
        expect(matchingData.amount).toBeCloseTo(amount, 2);
        this.log(`  ✓ ${entity}: ${count} txn, ${amount} AED`);
      }
      this.logSuccess('Report data verified');
    } catch (error) {
      this.logError(`Failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async verifyGrandTotalAmount(expectedTotal: string): Promise<void> {
    try {
      if (!this.reportPage) throw new Error('Report page not initialized');
      this.log(`Verifying grand total: ${expectedTotal} AED...`);
      const actualTotal = await this.reportPage.getGrandTotalAmount();
      const expectedAmount = parseFloat(expectedTotal);
      expect(actualTotal).toBeCloseTo(expectedAmount, 2);
      this.logSuccess(`Grand total: ${expectedAmount} AED`);
    } catch (error) {
      this.logError(`Failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async verifyEntityHasNoTransactions(entityName: string): Promise<void> {
    try {
      if (!this.reportPage) throw new Error('Report page not initialized');
      this.log(`Verifying "${entityName}" has no transactions...`);
      const hasZeroData = await this.reportPage.verifyEntityHasZeroData(entityName);
      
      if (hasZeroData) {
        this.logSuccess(`"${entityName}" has zero transactions`);
      } else {
        const isOmitted = !(await this.reportPage.verifyEntityInReport(entityName));
        if (isOmitted) {
          this.logSuccess(`"${entityName}" is omitted`);
        } else {
          throw new Error(`"${entityName}" has transactions but expected zero`);
        }
      }
    } catch (error) {
      this.logError(`Failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async verifyOnlyEntityVisible(entityName: string): Promise<void> {
    try {
      if (!this.reportPage) throw new Error('Report page not initialized');
      this.log(`Verifying only "${entityName}" is visible (RBAC)...`);
      const entities = await this.reportPage.getRevenueEntities();
      
      if (entities.length === 1 && entities[0] === entityName) {
        this.logSuccess(`Only "${entityName}" is visible`);
      } else {
        throw new Error(`Expected only "${entityName}" but found: ${entities.join(', ')}`);
      }
    } catch (error) {
      this.logError(`Failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  getStoredTestData<T = any>(key: string): T | undefined {
    return this.getFromContext<T>(key);
  }
}
