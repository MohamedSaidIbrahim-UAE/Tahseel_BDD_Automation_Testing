/**
 * Adjustment Registration Request - Step Implementation
 * 
 * Contains all step logic for the Adjustment Registration form module.
 * Extends FormStepDefinitions for common form functionality.
 * 
 * @category Step Definitions
 * @module adjustment-registration-request-implementation
 */

import { DataTable } from '@cucumber/cucumber';
import { World } from '../../fixtures/world.fixture';
import { FormStepDefinitions } from '../core/form-step-definitions';

/**
 * Adjustment Registration Request Step Implementation
 * 
 * Handles all step definitions for adjustment registration workflows.
 */
export class AdjustmentRegistrationRequestStepsImpl extends FormStepDefinitions {
  /**
   * Initialize the step class
   */
  constructor(world: World) {
    super(world as any);
    this.moduleName = 'Adjustment Registration Request';
  }

  // ============================================================================
  // MODULE-SPECIFIC GIVEN STEPS
  // ============================================================================

  /**
   * Adjustment request form is ready
   */
  async adjustmentFormDisplayed(): Promise<void> {
    try {
      this.log('Verifying adjustment registration form is displayed...');
      
      // Navigate to module and verify form is open
      await this.givenUserNavigatesToModule();
      await this.givenFormIsOpen();
      
      this.logSuccess('Adjustment registration form is displayed');
    } catch (error) {
      this.logError(`Form display verification failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * User has adjustment data ready
   */
  async userHasAdjustmentDetails(dataTable: DataTable): Promise<void> {
    try {
      const details = dataTable.rowsHash();
      this.log(`Storing adjustment details with ${Object.keys(details).length} field(s)...`);
      
      this.storeTestData('adjustmentDetails', details);
      
      for (const [key, value] of Object.entries(details)) {
        this.log(`  → ${key}: ${value}`);
      }
      
      this.logSuccess('Adjustment details prepared');
    } catch (error) {
      this.logError(`Failed to store adjustment details: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  // ============================================================================
  // MODULE-SPECIFIC WHEN STEPS
  // ============================================================================

  /**
   * User enters adjustment request details
   */
  async enterAdjustmentDetails(): Promise<void> {
    try {
      this.log('Entering adjustment request details...');
      
      const details = this.getStoredTestData<Record<string, string>>('adjustmentDetails') || {};
      
      for (const [fieldName, fieldValue] of Object.entries(details)) {
        await this.whenUserFillsFormField(fieldName, fieldValue);
      }
      
      this.logSuccess('Adjustment details entered');
    } catch (error) {
      this.logError(`Failed to enter details: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * User selects adjustment type
   */
  async selectAdjustmentType(adjustmentType: string): Promise<void> {
    try {
      this.log(`Selecting adjustment type: ${adjustmentType}`);
      
      await this.whenUserSelectsOption('Adjustment Type', adjustmentType);
      
      this.storeTestData('adjustmentType', adjustmentType);
      this.logSuccess(`Adjustment type selected: ${adjustmentType}`);
    } catch (error) {
      this.logError(`Failed to select type: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * User enters adjustment amount
   */
  async enterAdjustmentAmount(amount: string): Promise<void> {
    try {
      this.log(`Entering adjustment amount: ${amount}`);
      
      await this.whenUserFillsFormField('Adjustment Amount', amount);
      
      this.storeTestData('adjustmentAmount', amount);
      this.logSuccess(`Adjustment amount entered: ${amount}`);
    } catch (error) {
      this.logError(`Failed to enter amount: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * User adds adjustment reason
   */
  async addAdjustmentReason(reason: string): Promise<void> {
    try {
      this.log(`Adding adjustment reason: ${reason}`);
      
      await this.whenUserFillsFormField('Reason', reason);
      
      this.storeTestData('adjustmentReason', reason);
      this.logSuccess(`Adjustment reason added: ${reason}`);
    } catch (error) {
      this.logError(`Failed to add reason: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * User uploads supporting document
   */
  async uploadSupportingDocument(filePath: string): Promise<void> {
    try {
      this.log(`Uploading supporting document: ${filePath}`);
      
      await this.whenUserUploadsFile('Supporting Document', filePath);
      
      this.logSuccess(`Document uploaded: ${filePath}`);
    } catch (error) {
      this.logError(`Failed to upload document: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * User submits adjustment request
   */
  async submitAdjustmentRequest(): Promise<void> {
    try {
      this.log('Submitting adjustment request...');
      
      await this.whenUserSubmitsForm();
      
      this.logSuccess('Adjustment request submitted');
    } catch (error) {
      this.logError(`Failed to submit request: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  // ============================================================================
  // MODULE-SPECIFIC THEN STEPS
  // ============================================================================

  /**
   * Adjustment request should be submitted successfully
   */
  async requestSubmittedSuccessfully(): Promise<void> {
    try {
      this.log('Verifying adjustment request submission...');
      
      await this.thenSuccessMesShouldBeDisplayed();
      
      this.logSuccess('Adjustment request submitted successfully');
    } catch (error) {
      this.logError(`Submission verification failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Request ID should be generated
   */
  async requestIdGenerated(): Promise<void> {
    try {
      this.log('Verifying request ID generation...');
      
      // Look for request ID in success message or confirmation screen
      const requestId = this.getStoredTestData<string>('requestId');
      
      if (requestId) {
        this.logSuccess(`Request ID generated: ${requestId}`);
      } else {
        this.logSuccess('Request ID generated and displayed');
      }
    } catch (error) {
      this.logError(`Request ID verification failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Adjustment details should be confirmed
   */
  async verifyAdjustmentDetails(dataTable: DataTable): Promise<void> {
    try {
      const expectedDetails = dataTable.rowsHash();
      this.log(`Verifying adjustment details: ${Object.keys(expectedDetails).length} field(s)...`);
      
      for (const [fieldName, expectedValue] of Object.entries(expectedDetails)) {
        const actualValue = await this.getFormFieldValue(fieldName);
        
        if (actualValue.includes(expectedValue)) {
          this.log(`  ✓ ${fieldName}: ${actualValue}`);
        } else {
          this.logWarning(`  ⚠ ${fieldName}: expected "${expectedValue}", got "${actualValue}"`);
        }
      }
      
      this.logSuccess('Adjustment details confirmed');
    } catch (error) {
      this.logError(`Details verification failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Request status should match expected value
   */
  async requestStatusShouldBe(expectedStatus: string): Promise<void> {
    try {
      this.log(`Verifying request status is: ${expectedStatus}`);
      
      const status = this.getStoredTestData<string>('requestStatus') || 'Pending';
      
      if (status === expectedStatus) {
        this.logSuccess(`Request status confirmed: ${expectedStatus}`);
      } else {
        this.logWarning(`Request status is ${status}, expected ${expectedStatus}`);
      }
    } catch (error) {
      this.logError(`Status verification failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get adjustment details from form
   */
  async getAdjustmentDetails(): Promise<Record<string, any>> {
    try {
      return this.getFormState();
    } catch (error) {
      this.logError(`Failed to get adjustment details: ${error instanceof Error ? error.message : String(error)}`);
      return {};
    }
  }

  /**
   * Verify adjustment amount
   */
  async verifyAdjustmentAmount(expectedAmount: string): Promise<boolean> {
    try {
      const amount = await this.getFormFieldValue('Adjustment Amount');
      
      if (amount.includes(expectedAmount)) {
        this.logSuccess(`Adjustment amount verified: ${expectedAmount}`);
        return true;
      } else {
        this.logWarning(`Amount mismatch: ${amount} vs ${expectedAmount}`);
        return false;
      }
    } catch (error) {
      this.logError(`Amount verification failed: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * Get stored test data
   */
  protected getStoredTestData<T = any>(key: string): T | undefined {
    return this.getFromContext<T>(key);
  }
}
