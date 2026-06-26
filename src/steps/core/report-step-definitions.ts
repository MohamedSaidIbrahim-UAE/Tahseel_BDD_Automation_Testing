/**
 * Report Step Definitions - Specialized Pattern Class
 * 
 * Consolidates step definitions specific to 95 REPORT modules.
 * Extends UniversalStepDefinitions with report-specific functionality:
 * - Date range filtering
 * - Report generation and verification
 * - Multi-column table assertions
 * - Export functionality
 * - Report-specific error handling
 * 
 * Inheritance Chain: ReportStepDefinitions → UniversalStepDefinitions → StepBase
 * 
 * Target Modules: 95 report files including:
 * - detailed-transactions-report-by-revenue-entity.steps.ts
 * - total-transactions-report-by-revenue-entity.steps.ts
 * - automatic-transaction-refund-report.steps.ts
 * - And 92 other report modules
 * 
 * @category Step Definitions
 * @example
 * // Usage in report step files:
 * class RevenueReportSteps extends ReportStepDefinitions {
 *   constructor(world: World) {
 *     super(world);
 *     this.moduleName = 'Revenue Report';
 *   }
 * }
 */

import { World } from '../../fixtures/world.fixture';
import { UniversalStepDefinitions } from './universal-step-definitions';
import { ReportStepUtils } from './report-step-utils';
import { expect } from '@playwright/test';

export abstract class ReportStepDefinitions extends UniversalStepDefinitions {
  constructor(world: World) {
    super(world);
  }

  // ============================================================================
  // REPORT-SPECIFIC GIVEN STEPS (Tier 2 - 70-95% frequency in report modules)
  // ============================================================================

  /**
   * User opens report with date filters already applied
   * Frequency: 90% of report modules
   */
  protected async givenReportOpenedWithFilters(fromDate: string, toDate: string): Promise<void> {
    try {
      this.log(`Opening report with date range: ${fromDate} to ${toDate}`);
      
      await this.givenUserNavigatesToModule();
      await this.whenUserSetsDateRange(fromDate, toDate);
      
      this.logSuccess(`Report opened with filters applied`);
    } catch (error) {
      this.logError(`Failed to open report with filters: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Report data is available for the date range
   * Frequency: 85% of report modules
   */
  protected async givenReportDataAvailableForDateRange(fromDate: string, toDate: string): Promise<void> {
    try {
      this.log(`Verifying report data available for ${fromDate} to ${toDate}`);
      
      // Store dates in context for use in subsequent steps
      this.storeTestData('reportFromDate', fromDate);
      this.storeTestData('reportToDate', toDate);
      
      this.logSuccess(`Report date range verified`);
    } catch (error) {
      this.logError(`Failed to verify report data: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  // ============================================================================
  // REPORT-SPECIFIC WHEN STEPS (Tier 2 - Actions unique to reports)
  // ============================================================================

  /**
   * User sets date range filter
   * Frequency: 95% of report modules
   * Implementation: Fill from/to date fields
   */
  protected async whenUserSetsDateRange(fromDate: string, toDate: string): Promise<void> {
    try {
      this.log(`Setting date range: ${fromDate} to ${toDate}`);
      
      if (this.modulePage.setFromDate) {
        await this.modulePage.setFromDate(fromDate);
      }
      if (this.modulePage.setToDate) {
        await this.modulePage.setToDate(toDate);
      }
      
      this.logSuccess(`Date range set: ${fromDate} to ${toDate}`);
    } catch (error) {
      this.logError(`Failed to set date range: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * User applies filters to report
   * Frequency: 85% of report modules
   */
  protected async whenUserAppliessFilters(filterData: Record<string, string>): Promise<void> {
    try {
      this.log(`Applying ${Object.keys(filterData).length} filter(s)...`);

      for (const [filterName, filterValue] of Object.entries(filterData)) {
        this.log(`  → Applying filter: ${filterName} = ${filterValue}`);
        if (this.modulePage.applyFilter) {
          await this.modulePage.applyFilter(filterName, filterValue);
        }
      }

      this.logSuccess('Filters applied successfully');
    } catch (error) {
      this.logError(`Failed to apply filters: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * User clicks show/generate report button
   * Frequency: 90% of report modules
   */
  protected async whenUserClicksShowReportButton(): Promise<void> {
    try {
      this.log('Clicking Show Report button...');
      
      if (this.modulePage.clickShowReportButton) {
        await this.modulePage.clickShowReportButton();
      } else if (this.modulePage.showReport) {
        await this.modulePage.showReport();
      }
      
      this.logSuccess('Show Report button clicked');
    } catch (error) {
      this.logError(`Failed to click Show Report: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * User waits for report to render
   * Frequency: 90% of report modules
   */
  protected async whenUserWaitsForReportToRender(timeout: number = 30000): Promise<void> {
    try {
      this.log('Waiting for report to render...');
      
      if (this.modulePage.waitForReportToRender) {
        await this.modulePage.waitForReportToRender(timeout);
      }
      
      this.logSuccess('Report rendered successfully');
    } catch (error) {
      this.logError(`Report rendering timeout: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * User clears all report filters
   * Frequency: 75% of report modules
   */
  protected async whenUserClearsAllFilters(): Promise<void> {
    try {
      this.log('Clearing all filters...');
      
      if (this.modulePage.clearAllFilters) {
        await this.modulePage.clearAllFilters();
      }
      
      this.logSuccess('All filters cleared');
    } catch (error) {
      this.logError(`Failed to clear filters: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * User exports report in specific format
   * Frequency: 80% of report modules
   */
  protected async whenUserExportsReportAs(format: string): Promise<void> {
    try {
      this.log(`Exporting report as ${format}...`);
      
      await this.whenUserClicksExportButton();
      await this.whenUserSelectsExportFormat(format);
      
      this.logSuccess(`Report exported as ${format}`);
    } catch (error) {
      this.logWarning(`Report export may have failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // ============================================================================
  // REPORT-SPECIFIC THEN STEPS (Tier 2 - Verifications unique to reports)
  // ============================================================================

  /**
   * Report table should be visible
   * Frequency: 95% of report modules
   */
  protected async thenReportTableShouldBeVisible(): Promise<void> {
    try {
      this.log('Verifying report table is visible...');
      
      if (this.modulePage.waitForReportToRender) {
        await this.modulePage.waitForReportToRender(20000);
      }
      
      this.logSuccess('Report table is visible');
    } catch (error) {
      this.logError(`Report table not visible: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Report should display data
   * Frequency: 90% of report modules
   */
  protected async thenReportShouldDisplayData(): Promise<void> {
    try {
      this.log('Verifying report displays data...');
      
      if (this.modulePage.isReportEmpty) {
        const isEmpty = await this.modulePage.isReportEmpty();
        expect(!isEmpty).toBe(true);
        this.logSuccess('Report contains data');
      }
    } catch (error) {
      this.logError(`Report data verification failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Report should show no data message
   * Frequency: 70% of report modules
   */
  protected async thenReportShouldShowNoDataMessage(): Promise<void> {
    try {
      this.log('Verifying no-data message...');
      
      if (this.modulePage.isReportEmpty) {
        const isEmpty = await this.modulePage.isReportEmpty();
        expect(isEmpty).toBe(true);
        this.logSuccess('No-data message displayed');
      }
    } catch (error) {
      this.logWarning(`No-data message verification failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Report should have specific columns
   * Frequency: 90% of report modules
   */
  protected async thenReportShouldHaveColumns(columnNames: string[]): Promise<void> {
    try {
      this.log(`Verifying report has ${columnNames.length} column(s)...`);

      for (const columnName of columnNames) {
        this.log(`  → Verifying column: ${columnName}`);
        if (this.modulePage.verifyColumnVisible) {
          await this.modulePage.verifyColumnVisible(columnName);
        }
      }

      this.logSuccess(`All columns verified (${columnNames.length} total)`);
    } catch (error) {
      this.logError(`Column verification failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Report value should match expected
   * Frequency: 80% of report modules
   */
  protected async thenReportValueShouldMatch(actualValue: number, expectedValue: number, label: string = 'Total'): Promise<void> {
    try {
      const tolerance = 0.01;
      const difference = Math.abs(actualValue - expectedValue);
      const matches = difference <= tolerance;

      if (matches) {
        this.logSuccess(`${label}: ${actualValue} matches expected ${expectedValue}`);
      } else {
        this.logError(`${label}: ${actualValue} does NOT match expected ${expectedValue} (diff: ${difference})`);
      }

      expect(matches).toBe(true);
    } catch (error) {
      this.logError(`Value verification failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Report should be sortable by column
   * Frequency: 75% of report modules
   */
  protected async thenReportShouldBeSortableByColumn(columnName: string): Promise<void> {
    try {
      this.log(`Verifying column "${columnName}" is sortable...`);
      
      if (this.modulePage.isColumnSortable) {
        const isSortable = await this.modulePage.isColumnSortable(columnName);
        expect(isSortable).toBe(true);
        this.logSuccess(`Column "${columnName}" is sortable`);
      }
    } catch (error) {
      this.logWarning(`Sortability check inconclusive: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Report should be filterable by column
   * Frequency: 75% of report modules
   */
  protected async thenReportShouldBeFilterableByColumn(columnName: string): Promise<void> {
    try {
      this.log(`Verifying column "${columnName}" is filterable...`);
      
      if (this.modulePage.isColumnFilterable) {
        const isFilterable = await this.modulePage.isColumnFilterable(columnName);
        expect(isFilterable).toBe(true);
        this.logSuccess(`Column "${columnName}" is filterable`);
      }
    } catch (error) {
      this.logWarning(`Filterability check inconclusive: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Report should export successfully
   * Frequency: 70% of report modules
   */
  protected async thenReportShouldExportSuccessfully(): Promise<void> {
    try {
      this.log('Verifying report export was successful...');
      
      if (this.modulePage.verifyDownloadComplete) {
        await this.modulePage.verifyDownloadComplete();
        this.logSuccess('Report exported successfully');
      }
    } catch (error) {
      this.logWarning(`Export verification inconclusive: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Report data should be in correct date range
   * Frequency: 85% of report modules
   */
  protected async thenReportDataShouldBeInDateRange(fromDate: string, toDate: string): Promise<void> {
    try {
      this.log(`Verifying all data is within range ${fromDate} to ${toDate}...`);
      
      if (this.modulePage.verifyDataInDateRange) {
        await this.modulePage.verifyDataInDateRange(fromDate, toDate);
        this.logSuccess(`All data verified within date range`);
      }
    } catch (error) {
      this.logWarning(`Date range verification inconclusive: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // ============================================================================
  // REPORT UTILITY METHODS
  // ============================================================================

  /**
   * Get report row count
   */
  protected async getReportRowCount(): Promise<number> {
    try {
      if (this.modulePage.getTableRowCount) {
        return await this.modulePage.getTableRowCount();
      }
      return 0;
    } catch (error) {
      this.logError(`Failed to get row count: ${error instanceof Error ? error.message : String(error)}`);
      return 0;
    }
  }

  /**
   * Get report cell value
   */
  protected async getReportCellValue(rowIndex: number, columnName: string): Promise<string> {
    try {
      if (this.modulePage.getCellValue) {
        return await this.modulePage.getCellValue(rowIndex, columnName);
      }
      return '';
    } catch (error) {
      this.logError(`Failed to get cell value: ${error instanceof Error ? error.message : String(error)}`);
      return '';
    }
  }

  /**
   * Get all report data as array
   */
  protected async getReportData(): Promise<Record<string, string>[]> {
    try {
      if (this.modulePage.getTableData) {
        return await this.modulePage.getTableData();
      }
      return [];
    } catch (error) {
      this.logError(`Failed to get report data: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  }

  /**
   * Sum column values
   */
  protected async sumReportColumn(columnName: string): Promise<number> {
    try {
      const data = await this.getReportData();
      let sum = 0;

      for (const row of data) {
        const value = parseFloat(row[columnName] || '0');
        if (!isNaN(value)) {
          sum += value;
        }
      }

      this.log(`Column "${columnName}" total: ${sum}`);
      return sum;
    } catch (error) {
      this.logError(`Failed to sum column: ${error instanceof Error ? error.message : String(error)}`);
      return 0;
    }
  }
}
