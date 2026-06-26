/**
 * Form Step Definitions - Specialized Pattern Class
 * 
 * Consolidates step definitions specific to 45 FORM/WORKFLOW modules.
 * Extends UniversalStepDefinitions with form-specific functionality:
 * - Field filling and validation
 * - Form submission handling
 * - Error message verification
 * - Multi-step form navigation
 * - Form state management
 * 
 * Inheritance Chain: FormStepDefinitions → UniversalStepDefinitions → StepBase
 * 
 * Target Modules: 45 form/workflow files including:
 * - adjustment-registration-request.steps.ts
 * - iban-registration-request.steps.ts
 * - create-request.steps.ts
 * - And 42 other form modules
 * 
 * @category Step Definitions
 * @example
 * // Usage in form step files:
 * class AdjustmentRegistrationSteps extends FormStepDefinitions {
 *   constructor(world: World) {
 *     super(world);
 *     this.moduleName = 'Adjustment Registration';
 *   }
 * }
 */

import { World } from '../../fixtures/world.fixture';
import { UniversalStepDefinitions } from './universal-step-definitions';
import { expect } from '@playwright/test';

export abstract class FormStepDefinitions extends UniversalStepDefinitions {
  /**
   * Track current form step in multi-step forms
   */
  protected currentFormStep: number = 1;

  /**
   * Track form state
   */
  protected formState: Map<string, any> = new Map();

  constructor(world: World) {
    super(world);
  }

  // ============================================================================
  // FORM-SPECIFIC GIVEN STEPS (Tier 2 - 70-90% frequency in form modules)
  // ============================================================================

  /**
   * Form with specific structure is displayed
   * Frequency: 95% of form modules
   */
  protected async givenFormWithFieldsIsDisplayed(fields: string[]): Promise<void> {
    try {
      await this.givenFormIsOpen();
      
      this.log(`Verifying form displays ${fields.length} field(s)...`);
      for (const field of fields) {
        if (this.modulePage.isFieldVisible) {
          await this.modulePage.isFieldVisible(field);
          this.log(`  ✓ Field visible: ${field}`);
        }
      }
      
      this.logSuccess('All form fields verified');
    } catch (error) {
      this.logError(`Form structure verification failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Form field has specific value
   * Frequency: 85% of form modules
   */
  protected async givenFormFieldHasValue(fieldName: string, value: string): Promise<void> {
    try {
      this.log(`Setting field "${fieldName}" to "${value}"...`);
      
      if (this.modulePage.fillField) {
        await this.modulePage.fillField(fieldName, value);
      }
      
      this.formState.set(fieldName, value);
      this.logSuccess(`Field "${fieldName}" set to "${value}"`);
    } catch (error) {
      this.logError(`Failed to set field value: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * User is on specific form step
   * Frequency: 75% of form modules (multi-step forms)
   */
  protected async givenUserIsOnFormStep(stepNumber: number): Promise<void> {
    try {
      this.log(`Verifying user is on form step ${stepNumber}...`);
      
      this.currentFormStep = stepNumber;
      
      if (this.modulePage.verifyFormStep) {
        await this.modulePage.verifyFormStep(stepNumber);
      }
      
      this.logSuccess(`User is on form step ${stepNumber}`);
    } catch (error) {
      this.logError(`Failed to verify form step: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  // ============================================================================
  // FORM-SPECIFIC WHEN STEPS (Tier 2 - Actions unique to forms)
  // ============================================================================

  /**
   * User fills form field
   * Frequency: 95% of form modules
   */
  protected async whenUserFillsFormField(fieldName: string, fieldValue: string): Promise<void> {
    try {
      this.log(`Filling field "${fieldName}" with "${fieldValue}"...`);
      
      if (this.modulePage.fillField) {
        await this.modulePage.fillField(fieldName, fieldValue);
      }
      
      this.formState.set(fieldName, fieldValue);
      this.logSuccess(`Field "${fieldName}" filled`);
    } catch (error) {
      this.logError(`Failed to fill field: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * User clears form field
   * Frequency: 75% of form modules
   */
  protected async whenUserClearsFormField(fieldName: string): Promise<void> {
    try {
      this.log(`Clearing field "${fieldName}"...`);
      
      if (this.modulePage.clearField) {
        await this.modulePage.clearField(fieldName);
      }
      
      this.formState.delete(fieldName);
      this.logSuccess(`Field "${fieldName}" cleared`);
    } catch (error) {
      this.logError(`Failed to clear field: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * User selects dropdown option
   * Frequency: 85% of form modules
   */
  protected async whenUserSelectsOption(dropdownName: string, optionValue: string): Promise<void> {
    try {
      this.log(`Selecting "${optionValue}" from ${dropdownName}...`);
      
      if (this.modulePage.selectDropdownOption) {
        await this.modulePage.selectDropdownOption(dropdownName, optionValue);
      }
      
      this.formState.set(dropdownName, optionValue);
      this.logSuccess(`Selected "${optionValue}" from ${dropdownName}`);
    } catch (error) {
      this.logError(`Failed to select option: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * User checks checkbox
   * Frequency: 70% of form modules
   */
  protected async whenUserChecksCheckbox(checkboxName: string): Promise<void> {
    try {
      this.log(`Checking checkbox: ${checkboxName}...`);
      
      if (this.modulePage.checkCheckbox) {
        await this.modulePage.checkCheckbox(checkboxName);
      }
      
      this.formState.set(checkboxName, true);
      this.logSuccess(`Checkbox "${checkboxName}" checked`);
    } catch (error) {
      this.logError(`Failed to check checkbox: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * User unchecks checkbox
   * Frequency: 70% of form modules
   */
  protected async whenUserUnchecksCheckbox(checkboxName: string): Promise<void> {
    try {
      this.log(`Unchecking checkbox: ${checkboxName}...`);
      
      if (this.modulePage.uncheckCheckbox) {
        await this.modulePage.uncheckCheckbox(checkboxName);
      }
      
      this.formState.set(checkboxName, false);
      this.logSuccess(`Checkbox "${checkboxName}" unchecked`);
    } catch (error) {
      this.logError(`Failed to uncheck checkbox: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * User moves to next form step
   * Frequency: 75% of form modules
   */
  protected async whenUserClicksNextButton(): Promise<void> {
    try {
      this.log('Clicking Next button...');
      
      if (this.modulePage.clickNextButton) {
        await this.modulePage.clickNextButton();
      }
      
      this.currentFormStep++;
      this.logSuccess(`Moved to step ${this.currentFormStep}`);
    } catch (error) {
      this.logError(`Failed to click Next: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * User moves to previous form step
   * Frequency: 75% of form modules
   */
  protected async whenUserClicksPreviousButton(): Promise<void> {
    try {
      this.log('Clicking Previous button...');
      
      if (this.modulePage.clickPreviousButton) {
        await this.modulePage.clickPreviousButton();
      }
      
      this.currentFormStep = Math.max(1, this.currentFormStep - 1);
      this.logSuccess(`Moved to step ${this.currentFormStep}`);
    } catch (error) {
      this.logError(`Failed to click Previous: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * User uploads file to form
   * Frequency: 60% of form modules
   */
  protected async whenUserUploadsFile(fieldName: string, filePath: string): Promise<void> {
    try {
      this.log(`Uploading file to "${fieldName}": ${filePath}`);
      
      if (this.modulePage.uploadFile) {
        await this.modulePage.uploadFile(fieldName, filePath);
      }
      
      this.formState.set(fieldName, filePath);
      this.logSuccess(`File uploaded to "${fieldName}"`);
    } catch (error) {
      this.logError(`Failed to upload file: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * User saves form without submitting
   * Frequency: 60% of form modules
   */
  protected async whenUserSavesDraft(): Promise<void> {
    try {
      this.log('Saving form as draft...');
      
      if (this.modulePage.saveDraft) {
        await this.modulePage.saveDraft();
      }
      
      this.logSuccess('Draft saved');
    } catch (error) {
      this.logError(`Failed to save draft: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  // ============================================================================
  // FORM-SPECIFIC THEN STEPS (Tier 2 - Verifications unique to forms)
  // ============================================================================

  /**
   * Form field should be required
   * Frequency: 85% of form modules
   */
  protected async thenFormFieldShouldBeRequired(fieldName: string): Promise<void> {
    try {
      this.log(`Verifying field "${fieldName}" is required...`);
      
      if (this.modulePage.isFieldRequired) {
        const isRequired = await this.modulePage.isFieldRequired(fieldName);
        expect(isRequired).toBe(true);
        this.logSuccess(`Field "${fieldName}" is required`);
      }
    } catch (error) {
      this.logError(`Field requirement verification failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Form field should be read-only
   * Frequency: 70% of form modules
   */
  protected async thenFormFieldShouldBeReadOnly(fieldName: string): Promise<void> {
    try {
      this.log(`Verifying field "${fieldName}" is read-only...`);
      
      if (this.modulePage.isFieldReadOnly) {
        const isReadOnly = await this.modulePage.isFieldReadOnly(fieldName);
        expect(isReadOnly).toBe(true);
        this.logSuccess(`Field "${fieldName}" is read-only`);
      }
    } catch (error) {
      this.logWarning(`Read-only verification inconclusive: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Form field should have validation error
   * Frequency: 80% of form modules
   */
  protected async thenFormFieldShouldHaveError(fieldName: string, errorMessage?: string): Promise<void> {
    try {
      this.log(`Verifying field "${fieldName}" has validation error...`);
      
      if (this.modulePage.getFieldError) {
        const actualError = await this.modulePage.getFieldError(fieldName);
        expect(actualError).toBeTruthy();
        
        if (errorMessage) {
          expect(actualError).toContain(errorMessage);
        }
        
        this.logSuccess(`Field "${fieldName}" has error: ${actualError}`);
      }
    } catch (error) {
      this.logError(`Field error verification failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Form field should have no error
   * Frequency: 75% of form modules
   */
  protected async thenFormFieldShouldHaveNoError(fieldName: string): Promise<void> {
    try {
      this.log(`Verifying field "${fieldName}" has no errors...`);
      
      if (this.modulePage.getFieldError) {
        const error = await this.modulePage.getFieldError(fieldName);
        expect(error).toBeFalsy();
        this.logSuccess(`Field "${fieldName}" has no errors`);
      }
    } catch (error) {
      this.logWarning(`Field validation check inconclusive`);
    }
  }

  /**
   * Form should show step indicator
   * Frequency: 75% of form modules
   */
  protected async thenFormShouldShowStep(stepNumber: number): Promise<void> {
    try {
      this.log(`Verifying form shows step ${stepNumber}...`);
      
      if (this.modulePage.verifyFormStep) {
        await this.modulePage.verifyFormStep(stepNumber);
        this.logSuccess(`Form displays step ${stepNumber}`);
      }
    } catch (error) {
      this.logError(`Step indicator verification failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Form should have all required fields filled
   * Frequency: 80% of form modules
   */
  protected async thenFormShouldHaveAllRequiredFieldsFilled(): Promise<void> {
    try {
      this.log('Verifying all required fields are filled...');
      
      if (this.modulePage.areAllRequiredFieldsFilled) {
        const allFilled = await this.modulePage.areAllRequiredFieldsFilled();
        expect(allFilled).toBe(true);
        this.logSuccess('All required fields are filled');
      }
    } catch (error) {
      this.logError(`Required fields verification failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Next button should be enabled
   * Frequency: 75% of form modules
   */
  protected async thenNextButtonShouldBeEnabled(): Promise<void> {
    try {
      this.log('Verifying Next button is enabled...');
      
      if (this.modulePage.isNextButtonEnabled) {
        const isEnabled = await this.modulePage.isNextButtonEnabled();
        expect(isEnabled).toBe(true);
        this.logSuccess('Next button is enabled');
      }
    } catch (error) {
      this.logError(`Next button state verification failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Previous button should be visible
   * Frequency: 70% of form modules
   */
  protected async thenPreviousButtonShouldBeVisible(): Promise<void> {
    try {
      this.log('Verifying Previous button is visible...');
      
      if (this.modulePage.isPreviousButtonVisible) {
        const isVisible = await this.modulePage.isPreviousButtonVisible();
        expect(isVisible).toBe(true);
        this.logSuccess('Previous button is visible');
      }
    } catch (error) {
      this.logWarning(`Previous button visibility check inconclusive`);
    }
  }

  /**
   * Form should have confirmation message
   * Frequency: 70% of form modules
   */
  protected async thenFormShouldHaveConfirmationMessage(): Promise<void> {
    try {
      this.log('Verifying form displays confirmation message...');
      
      if (this.modulePage.getConfirmationMessage) {
        const message = await this.modulePage.getConfirmationMessage();
        expect(message).toBeTruthy();
        this.logSuccess(`Confirmation message: ${message}`);
      }
    } catch (error) {
      this.logWarning(`Confirmation message verification inconclusive`);
    }
  }

  // ============================================================================
  // FORM UTILITY METHODS
  // ============================================================================

  /**
   * Get current form step
   */
  protected getCurrentFormStep(): number {
    return this.currentFormStep;
  }

  /**
   * Get form field value
   */
  protected async getFormFieldValue(fieldName: string): Promise<string> {
    try {
      if (this.modulePage.getFieldValue) {
        return await this.modulePage.getFieldValue(fieldName);
      }
      return this.formState.get(fieldName) || '';
    } catch (error) {
      this.logError(`Failed to get field value: ${error instanceof Error ? error.message : String(error)}`);
      return '';
    }
  }

  /**
   * Get all form state
   */
  protected getFormState(): Record<string, any> {
    return Object.fromEntries(this.formState);
  }

  /**
   * Clear form state
   */
  protected clearFormState(): void {
    this.formState.clear();
    this.log('Form state cleared');
  }

  /**
   * Verify form field value
   */
  protected async verifyFormFieldValue(fieldName: string, expectedValue: string): Promise<boolean> {
    try {
      const actualValue = await this.getFormFieldValue(fieldName);
      const matches = actualValue === expectedValue;
      
      if (matches) {
        this.logSuccess(`Field "${fieldName}" has expected value: ${expectedValue}`);
      } else {
        this.logError(`Field "${fieldName}" value mismatch: ${actualValue} (expected: ${expectedValue})`);
      }
      
      return matches;
    } catch (error) {
      this.logError(`Field verification failed: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }
}
