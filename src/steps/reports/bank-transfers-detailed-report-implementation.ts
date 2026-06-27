/**
 * Bank Transfers Detailed Report - Implementation
 * 
 * @category Step Definitions
 * @module bank-transfers-detailed-report-implementation
 */

import { World } from '../../fixtures/world.fixture';
import { ReportStepDefinitions } from '../core/report-step-definitions';

export class BankTransfersDetailedReportSteps extends ReportStepDefinitions {
  constructor(world: World) {
    super(world);
    this.moduleName = 'Bank Transfers Detailed Report';
  }

  async navigateToBankTransfersReport(): Promise<void> {
    try {
      this.log('Navigating to bank transfers report...');
      await this.givenUserNavigatesToModule();
      this.logSuccess('Navigated to bank transfers report');
    } catch (error) {
      this.logError(`Navigation failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async generateBankTransfersReport(): Promise<void> {
    try {
      this.log('Generating bank transfers report...');
      await this.whenUserClicksShowReportButton();
      await this.whenUserWaitsForReportToRender(30000);
      this.logSuccess('Bank transfers report generated');
    } catch (error) {
      this.logError(`Report generation failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async verifyBankTransfersReport(): Promise<void> {
    try {
      this.log('Verifying bank transfers report...');
      const columns = ['Bank Name', 'Transfer Amount', 'Date', 'Status'];
      await this.thenReportShouldHaveColumns(columns);
      this.logSuccess('Bank transfers report verified');
    } catch (error) {
      this.logError(`Report verification failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}
