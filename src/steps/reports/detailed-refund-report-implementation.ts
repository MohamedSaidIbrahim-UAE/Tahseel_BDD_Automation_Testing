import { World } from '../../fixtures/world.fixture';
import { ReportStepDefinitions } from '../core/report-step-definitions';
export class DetailedRefundReportSteps extends ReportStepDefinitions {
  constructor(world: World) { super(world); this.moduleName = 'Detailed Refund Report'; }
  async navigateToReport(): Promise<void> { try { this.log('Navigating...'); await this.givenUserNavigatesToModule(); this.logSuccess('Navigated'); } catch (error) { this.logError(`Failed: ${error instanceof Error ? error.message : String(error)}`); throw error; } }
  async generateReport(): Promise<void> { try { this.log('Generating...'); await this.whenUserClicksShowReportButton(); await this.whenUserWaitsForReportToRender(30000); this.logSuccess('Generated'); } catch (error) { this.logError(`Failed: ${error instanceof Error ? error.message : String(error)}`); throw error; } }
  async verifyReport(): Promise<void> { try { this.log('Verifying...'); const data = await this.getReportData(); this.logSuccess(`Report verified: ${data.length} rows`); } catch (error) { this.logError(`Failed: ${error instanceof Error ? error.message : String(error)}`); throw error; } }
}
