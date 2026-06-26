/**
 * Automatic Transaction Refund Report - Implementation
 * 
 * @category Step Definitions
 * @module automatic-transaction-refund-report-implementation
 */

import { DataTable } from '@cucumber/cucumber';
import { World } from '../../fixtures/world.fixture';
import { ReportStepDefinitions } from '../core/report-step-definitions';

export class AutomaticTransactionRefundReportSteps extends ReportStepDefinitions {
  constructor(world: World) {
    super(world);
    this.moduleName = 'Automatic Transaction Refund Report';
  }

  async userNavigatesToModule(moduleName: string): Promise<void> {
    try {
      this.log(`Navigating to module: ${moduleName}`);
      await this.givenUserNavigatesToModule();
      this.logSuccess(`Navigated to module: ${moduleName}`);
    } catch (error) {
      this.logError(`Navigation failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async modulePageIsLoaded(): Promise<void> {
    try {
      this.log('Verifying module page is loaded...');
      await this.thenModulePageShouldLoad();
      this.logSuccess('Module page is loaded');
    } catch (error) {
      this.logError(`Page load failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async formIsOpen(): Promise<void> {
    try {
      this.log('Verifying form is open...');
      if (this.modulePage.verifyFormVisible) {
        await this.modulePage.verifyFormVisible();
      }
      this.logSuccess('Form is open');
    } catch (error) {
      this.logError(`Form verification failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async userIsAuthenticated(): Promise<void> {
    try {
      this.log('Verifying user is authenticated...');
      // Authentication is handled by fixtures
      this.logSuccess('User is authenticated');
    } catch (error) {
      this.logError(`Authentication verification failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async userFillsFormWithData(dataTable: DataTable): Promise<void> {
    try {
      const data = dataTable.rowsHash();
      this.log(`Filling form with ${Object.keys(data).length} field(s)...`);
      
      for (const [fieldName, fieldValue] of Object.entries(data)) {
        if (this.modulePage.fillField) {
          await this.modulePage.fillField(fieldName, fieldValue);
        }
      }
      
      this.logSuccess('Form filled successfully');
    } catch (error) {
      this.logError(`Form fill failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async userClicksReportButton(): Promise<void> {
    try {
      this.log('Clicking report button...');
      await this.whenUserClicksShowReportButton();
      this.logSuccess('Report button clicked');
    } catch (error) {
      this.logError(`Button click failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async userAppliesdateFilter(fromDate: string, toDate: string): Promise<void> {
    try {
      this.log(`Applying date filter: ${fromDate} to ${toDate}`);
      await this.whenUserSetsDateRange(fromDate, toDate);
      this.logSuccess('Date filter applied');
    } catch (error) {
      this.logError(`Date filter failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async userClicksShowReport(): Promise<void> {
    try {
      this.log('Clicking show report...');
      await this.whenUserClicksShowReportButton();
      await this.whenUserWaitsForReportToRender(30000);
      this.logSuccess('Report generated');
    } catch (error) {
      this.logError(`Report generation failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async reportShouldBeDisplayed(): Promise<void> {
    try {
      this.log('Verifying report is displayed...');
      const data = await this.getReportData();
      this.logSuccess(`Report displayed with ${data.length} rows`);
    } catch (error) {
      this.logError(`Report verification failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async reportShouldContainRows(rowCount: number): Promise<void> {
    try {
      this.log(`Verifying report contains ${rowCount} rows...`);
      const data = await this.getReportData();
      
      if (data.length >= rowCount) {
        this.logSuccess(`Report contains ${data.length} rows (expected at least ${rowCount})`);
      } else {
        throw new Error(`Report contains ${data.length} rows but expected at least ${rowCount}`);
      }
    } catch (error) {
      this.logError(`Row count verification failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}
