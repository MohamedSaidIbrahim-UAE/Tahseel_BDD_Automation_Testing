/**
 * Cheques Management - Implementation
 * @category Step Definitions
 * @module cheques-management-implementation
 */

import { World } from '../../fixtures/world.fixture';
import { ListStepDefinitions } from '../core/list-step-definitions';

export class ChequesManagementSteps extends ListStepDefinitions {
  constructor(world: World) {
    super(world);
    this.moduleName = 'Cheques Management';
  }

  async chequesAvailable(): Promise<void> {
    try {
      this.log('Verifying cheques are available...');
      await this.givenUserNavigatesToModule();
      await this.thenListShouldContainRecords();
      this.logSuccess('Cheques are available');
    } catch (error) {
      this.logError(`Failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async viewChequesList(): Promise<void> {
    try {
      this.log('Viewing cheques list...');
      await this.givenUserNavigatesToModule();
      this.logSuccess('Cheques list displayed');
    } catch (error) {
      this.logError(`Failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async verifyChequesList(): Promise<void> {
    try {
      this.log('Verifying cheques list details...');
      const columns = ['Cheque Number', 'Amount', 'Date', 'Status'];
      await this.thenListShouldHaveColumns(columns);
      this.logSuccess('Cheques list verified');
    } catch (error) {
      this.logError(`Failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}
