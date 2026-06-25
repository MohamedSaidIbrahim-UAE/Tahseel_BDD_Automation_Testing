/**
 * Report Step Base Class
 * 
 * Specialized step class for report-related scenarios with:
 * - Report navigation and filtering
 * - Data verification helpers
 * - Export functionality
 * - Consistent report testing patterns
 */

import { World } from '../../fixtures/world.fixture';
import { StepBase } from './step-base';
import { expect } from '@playwright/test';

export abstract class ReportSteps extends StepBase {
  constructor(world: World) {
    super(world);
  }

  /**
   * Navigate to report with error handling
   */
  protected async navigateToReport(page: any, reportUrl: string): Promise<void> {
    try {
      this.log(`Navigating to report: ${reportUrl}`);
      await this.safeExecute(
        () => page.navigateToReport ? page.navigateToReport() : page.navigateToUrl(reportUrl),
        'Failed to navigate to report'
      );
      this.logSuccess('Report navigation completed');
    } catch (error) {
      this.logError(`Navigation failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Set date range filter
   */
  protected async setDateRange(page: any, fromDate: string, toDate: string): Promise<void> {
    try {
      this.log(`Setting date range: ${fromDate} to ${toDate}`);
      
      if (page.setFromDate) await page.setFromDate(fromDate);
      if (page.setToDate) await page.setToDate(toDate);
      
      this.logSuccess(`Date range set: ${fromDate} to ${toDate}`);
    } catch (error) {
      this.logError(`Failed to set date range: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Generate/show report
   */
  protected async showReport(page: any): Promise<void> {
    try {
      this.log('Showing report...');
      await this.safeExecute(
        () => page.showReport(),
        'Failed to show report'
      );
      this.logSuccess('Report displayed successfully');
    } catch (error) {
      this.logError(`Failed to show report: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Verify no data message is displayed
   */
  protected async verifyNoDataMessage(page: any, expectedMessage: string): Promise<boolean> {
    try {
      this.log(`Verifying no-data message: "${expectedMessage}"`);
      const isVisible = await page.isNoDataMessageVisible?.();
      
      if (isVisible) {
        this.logSuccess(`No-data message verified: "${expectedMessage}"`);
        return true;
      }
      
      this.logWarning(`Expected no-data message not found`);
      return false;
    } catch (error) {
      this.logError(`Failed to verify no-data message: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * Export report as PDF
   */
  protected async exportAsPdf(page: any): Promise<void> {
    try {
      this.log('Exporting report as PDF...');
      await this.safeExecute(
        () => page.exportAsPdf(),
        'PDF export failed'
      );
      this.logSuccess('Report exported to PDF successfully');
    } catch (error) {
      this.logWarning(`PDF export encountered issue: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Export report as Excel
   */
  protected async exportAsExcel(page: any): Promise<void> {
    try {
      this.log('Exporting report as Excel...');
      await this.safeExecute(
        () => page.exportAsExcel(),
        'Excel export failed'
      );
      this.logSuccess('Report exported to Excel successfully');
    } catch (error) {
      this.logWarning(`Excel export encountered issue: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Verify table is visible
   */
  protected async verifyTableVisible(page: any): Promise<boolean> {
    try {
      this.log('Verifying report table is visible...');
      const isVisible = await page.verifyReportTableVisible?.();
      this.logSuccess('Report table is visible');
      return true;
    } catch (error) {
      this.logError(`Report table not visible: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * Verify table has data
   */
  protected async verifyTableHasData(page: any): Promise<boolean> {
    try {
      this.log('Verifying report table has data...');
      const isEmpty = await page.isReportEmpty?.();
      
      if (!isEmpty) {
        this.logSuccess('Report table contains data');
        return true;
      }
      
      this.logWarning('Report table is empty');
      return false;
    } catch (error) {
      this.logError(`Failed to verify table data: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * Verify report value matches expected
   */
  protected async verifyValue(actual: number, expected: number, label: string = 'Value'): Promise<boolean> {
    try {
      const tolerance = 0.01;
      const difference = Math.abs(actual - expected);
      const matches = difference < tolerance;

      if (matches) {
        this.logSuccess(`${label} verified: ${actual} AED (expected: ${expected} AED)`);
      } else {
        this.logError(`${label} mismatch: ${actual} AED (expected: ${expected} AED)`);
      }

      expect(matches).toBe(true);
      return matches;
    } catch (error) {
      this.logError(`Verification failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Parse month/year string to ISO date range
   */
  protected parseMonthYearRange(monthName: string, year: number): { fromDate: string; toDate: string } {
    const monthNum = this.getMonthNumber(monthName);
    const daysInMonth = this.getDaysInMonth(monthName, year);
    
    const fromDate = `${year}-${monthNum}-01`;
    const toDate = `${year}-${monthNum}-${daysInMonth}`;
    
    this.log(`Parsed date range for ${monthName} ${year}: ${fromDate} to ${toDate}`);
    
    return { fromDate, toDate };
  }

  /**
   * Get month number from month name
   */
  private getMonthNumber(monthName: string): string {
    const months: { [key: string]: string } = {
      'January': '01', 'February': '02', 'March': '03', 'April': '04',
      'May': '05', 'June': '06', 'July': '07', 'August': '08',
      'September': '09', 'October': '10', 'November': '11', 'December': '12'
    };
    
    const monthNum = months[monthName];
    if (!monthNum) {
      throw new Error(`Unknown month name: "${monthName}"`);
    }
    
    return monthNum;
  }

  /**
   * Get number of days in month
   */
  private getDaysInMonth(monthName: string, year: number): number {
    const monthNum = parseInt(this.getMonthNumber(monthName), 10);
    const date = new Date(year, monthNum, 0);
    return date.getDate();
  }
}
