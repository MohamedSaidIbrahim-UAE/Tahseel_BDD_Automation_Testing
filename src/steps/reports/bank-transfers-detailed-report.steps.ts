/**
 * Bank Transfers Detailed Report - Consolidated Step Definitions
 * 
 * @category Step Definitions
 * @module bank-transfers-detailed-report.steps
 */

import { Given, When, Then, DataTable, Before } from '@cucumber/cucumber';
import { World } from '../../fixtures/world.fixture';
import { BankTransfersDetailedReportSteps } from './bank-transfers-detailed-report-implementation';

let steps: BankTransfersDetailedReportSteps;

Before(function (this: World) {
  steps = new BankTransfersDetailedReportSteps(this);
});

Given('the user navigates to bank transfers report', async function () {
  await steps.navigateToBankTransfersReport();
});

When('the user generates the bank transfers report', async function () {
  await steps.generateBankTransfersReport();
});

Then('the bank transfers report should display bank details', async function () {
  await steps.verifyBankTransfersReport();
});
