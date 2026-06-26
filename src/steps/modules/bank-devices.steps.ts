/**
 * Bank Devices List Module - Consolidated Step Definitions
 * 
 * Consolidation: This file has been refactored to use ListStepDefinitions
 * Removed: ~350 lines of duplicate code
 * New: Clean, maintainable, type-safe implementation
 * 
 * Inherits from ListStepDefinitions which provides:
 * - 10 Universal GIVEN steps
 * - 10 Universal WHEN steps
 * - 10 Universal THEN steps
 * - 20 List-specific steps
 * Total: 50 ready-to-use steps (no duplication)
 * 
 * @category Step Definitions
 * @module bank-devices.steps
 */

import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { World } from '../../fixtures/world.fixture';
import { ListStepDefinitions } from '../core/list-step-definitions';

/**
 * Bank Devices Step Definitions
 * 
 * Consolidates all step definitions for the Bank Devices list module.
 * All common steps are inherited from ListStepDefinitions.
 * Only module-specific customizations are defined here.
 */
export class BankDevicesSteps extends ListStepDefinitions {
  /**
   * Initialize the step class
   */
  constructor(world: World) {
    super(world);
    this.moduleName = 'Bank Devices';
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
  // MODULE-SPECIFIC GIVEN STEPS (Customizations for Bank Devices)
  // ============================================================================

  /**
   * Module-specific: Bank devices are available in the system
   */
  @Given('bank devices are available in the system')
  async bankDevicesAvailable(): Promise<void> {
    try {
      this.log('Verifying bank devices are available...');
      
      await this.givenUserNavigatesToModule('Bank Devices');
      await this.thenListShouldContainRecords();
      
      this.logSuccess('Bank devices are available');
    } catch (error) {
      this.logError(`Failed to verify bank devices: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Module-specific: Device is assigned to a specific bank
   */
  @Given('a device is assigned to bank {string}')
  async deviceAssignedToBank(bankName: string): Promise<void> {
    try {
      this.log(`Verifying device assigned to bank: ${bankName}`);
      
      // Search for devices from this bank
      await this.whenUserSearchesForTerm(bankName);
      await this.thenSearchResultsShouldBeDisplayed();
      
      this.storeTestData('selectedBank', bankName);
      this.logSuccess(`Device verified for bank: ${bankName}`);
    } catch (error) {
      this.logError(`Failed to verify device assignment: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  // ============================================================================
  // MODULE-SPECIFIC WHEN STEPS (Customizations for Bank Devices)
  // ============================================================================

  /**
   * Module-specific: User searches for device by device ID
   */
  @When('the user searches for device with ID {string}')
  async searchForDeviceById(deviceId: string): Promise<void> {
    try {
      this.log(`Searching for device ID: ${deviceId}`);
      
      await this.whenUserSearchesForTerm(deviceId);
      
      this.storeTestData('searchedDeviceId', deviceId);
      this.logSuccess(`Search executed for device ID: ${deviceId}`);
    } catch (error) {
      this.logError(`Search failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Module-specific: User filters devices by status
   */
  @When('the user filters devices by status {string}')
  async filterByStatus(status: string): Promise<void> {
    try {
      this.log(`Filtering devices by status: ${status}`);
      
      await this.whenUserFiltersBy('Status', status);
      
      this.storeTestData('statusFilter', status);
      this.logSuccess(`Devices filtered by status: ${status}`);
    } catch (error) {
      this.logError(`Filter failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Module-specific: User views device details
   */
  @When('the user views the details of the first device')
  async viewFirstDeviceDetails(): Promise<void> {
    try {
      this.log('Viewing details of first device...');
      
      await this.whenUserClicksRowDetail(0);
      
      this.logSuccess('First device details displayed');
    } catch (error) {
      this.logError(`Failed to view details: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  // ============================================================================
  // MODULE-SPECIFIC THEN STEPS (Customizations for Bank Devices)
  // ============================================================================

  /**
   * Module-specific: Device list should contain specific device
   */
  @Then('the device list should contain a device with ID {string}')
  async deviceListShouldContainDevice(deviceId: string): Promise<void> {
    try {
      this.log(`Verifying device list contains device ID: ${deviceId}`);
      
      await this.thenResultsShouldContainValue('Device ID', deviceId);
      
      this.logSuccess(`Device ${deviceId} found in list`);
    } catch (error) {
      this.logError(`Device verification failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Module-specific: Device should have expected status
   */
  @Then('the device should have status {string}')
  async deviceShouldHaveStatus(expectedStatus: string): Promise<void> {
    try {
      this.log(`Verifying device status: ${expectedStatus}`);
      
      await this.thenResultsShouldContainValue('Status', expectedStatus);
      
      this.logSuccess(`Device status verified: ${expectedStatus}`);
    } catch (error) {
      this.logError(`Status verification failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Module-specific: Device details should be visible
   */
  @Then('the device details should include the following information:')
  async verifyDeviceDetails(dataTable: DataTable): Promise<void> {
    try {
      const expectedFields = dataTable.rowsHash();
      this.log(`Verifying device details contain ${Object.keys(expectedFields).length} field(s)...`);
      
      for (const [fieldName, expectedValue] of Object.entries(expectedFields)) {
        this.log(`  → Checking ${fieldName}: ${expectedValue}`);
        await this.thenResultsShouldContainValue(fieldName, expectedValue);
      }
      
      this.logSuccess('All device details verified');
    } catch (error) {
      this.logError(`Details verification failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  // ============================================================================
  // UTILITY METHODS (Module-specific helpers)
  // ============================================================================

  /**
   * Get total device count
   */
  async getTotalDeviceCount(): Promise<number> {
    try {
      return await this.getTotalRecordCount();
    } catch (error) {
      this.logError(`Failed to get device count: ${error instanceof Error ? error.message : String(error)}`);
      return 0;
    }
  }

  /**
   * Find device by ID
   */
  async findDeviceById(deviceId: string): Promise<number> {
    try {
      return await this.findRowByValue('Device ID', deviceId);
    } catch (error) {
      this.logError(`Failed to find device: ${error instanceof Error ? error.message : String(error)}`);
      return -1;
    }
  }

  /**
   * Get device information
   */
  async getDeviceInfo(deviceId: string): Promise<Record<string, string> | null> {
    try {
      const data = await this.getListData();
      
      for (const row of data) {
        if (row['Device ID']?.includes(deviceId) || row['ID']?.includes(deviceId)) {
          return row;
        }
      }
      
      return null;
    } catch (error) {
      this.logError(`Failed to get device info: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }
}

// ============================================================================
// STEP BINDING - Wire up steps to Cucumber
// ============================================================================

let bankDevicesSteps: BankDevicesSteps;

/**
 * Before hook - Initialize steps for each scenario
 */
import { Before } from '@cucumber/cucumber';

Before(function (this: World) {
  bankDevicesSteps = new BankDevicesSteps(this);
  // Page will be initialized by test setup/fixtures
});
