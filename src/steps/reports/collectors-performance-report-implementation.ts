/**
 * Collectors Performance Report - Implementation
 * @category Step Definitions
 * @module collectors-performance-report-implementation
 */

import { World } from '../../fixtures/world.fixture';
import { ReportStepDefinitions } from '../core/report-step-definitions';

export class CollectorsPerformanceReportSteps extends ReportStepDefinitions {
  constructor(world: World) {
    super(world);
    this.moduleName = 'Collectors Performance Report';
  }

  async navigateToReport(): Promise<void> {
    try {
      this.log('Navigating to collectors performance report...');
      await this.givenUserNavigatesToModule();
      this.logSuccess('Navigated to report');
    } catch (error) {
      this.logError(`Navigation failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async generateReport(): Promise<void> {
    try {
      this.log('Generating performance report...');
      await this.whenUserClicksShowReportButton();
      await this.whenUserWaitsForReportToRender(30000);
      this.logSuccess('Report generated');
    } catch (error) {
      this.logError(`Report generation failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async verifyReport(): Promise<void> {
    try {
      this.log('Verifying performance report...');
      const columns = ['Collector Name', 'Transactions', 'Total Amount', 'Performance %'];
      await this.thenReportShouldHaveColumns(columns);
      this.logSuccess('Report verified');
    } catch (error) {
      this.logError(`Report verification failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}
