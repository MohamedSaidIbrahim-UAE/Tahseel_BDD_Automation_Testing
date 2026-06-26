/**
 * Cheques Management - Consolidated Step Definitions
 * @category Step Definitions
 * @module cheques-management.steps
 */

import { Given, When, Then, DataTable, Before, World } from '@cucumber/cucumber';
import { ChequesManagementSteps } from './cheques-management-implementation';

let steps: ChequesManagementSteps;

Before(function (this: World) {
  steps = new ChequesManagementSteps(this);
});

Given('cheques are available in the system', async function () {
  await steps.chequesAvailable();
});

When('the user views the cheques list', async function () {
  await steps.viewChequesList();
});

Then('the cheques list should display cheque details', async function () {
  await steps.verifyChequesList();
});
