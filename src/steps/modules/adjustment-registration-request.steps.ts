/**
 * Adjustment Registration Request - Consolidated Step Definitions
 * 
 * Step Registration Pattern:
 * - Steps are registered via function calls to avoid decorator limitations on class methods
 * - Implementation logic is in adjustment-registration-request-implementation.ts
 * - Only module-specific customizations are defined here
 * 
 * @category Step Definitions
 * @module adjustment-registration-request.steps
 */

import { Given, When, Then, DataTable, Before } from '@cucumber/cucumber';
import { World } from '../../fixtures/world.fixture';
import { AdjustmentRegistrationRequestStepsImpl } from './adjustment-registration-request-implementation';

// ============================================================================
// STEP BINDING - Register steps as functions (Cucumber-compatible pattern)
// ============================================================================

let steps: AdjustmentRegistrationRequestStepsImpl;

Before(function (this: World) {
  steps = new AdjustmentRegistrationRequestStepsImpl(this);
});

// ============================================================================
// GIVEN STEPS
// ============================================================================

Given('the adjustment registration form is displayed', async function () {
  await steps.adjustmentFormDisplayed();
});

Given('the user has the following adjustment details:', async function (dataTable: DataTable) {
  await steps.userHasAdjustmentDetails(dataTable);
});

// ============================================================================
// WHEN STEPS
// ============================================================================

When('the user enters adjustment request details', async function () {
  await steps.enterAdjustmentDetails();
});

When('the user selects adjustment type {string}', async function (adjustmentType: string) {
  await steps.selectAdjustmentType(adjustmentType);
});

When('the user enters adjustment amount {string}', async function (amount: string) {
  await steps.enterAdjustmentAmount(amount);
});

When('the user adds reason for adjustment {string}', async function (reason: string) {
  await steps.addAdjustmentReason(reason);
});

When('the user uploads supporting document {string}', async function (filePath: string) {
  await steps.uploadSupportingDocument(filePath);
});

When('the user submits the adjustment request', async function () {
  await steps.submitAdjustmentRequest();
});

// ============================================================================
// THEN STEPS
// ============================================================================

Then('the adjustment request should be submitted successfully', async function () {
  await steps.requestSubmittedSuccessfully();
});

Then('a request ID should be generated and displayed', async function () {
  await steps.requestIdGenerated();
});

Then('the following adjustment details should be confirmed:', async function (dataTable: DataTable) {
  await steps.verifyAdjustmentDetails(dataTable);
});

Then('the request status should be marked as {string}', async function (expectedStatus: string) {
  await steps.requestStatusShouldBe(expectedStatus);
});
