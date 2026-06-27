/**
 * Automatic Transaction Refund Report - Consolidated Step Definitions
 * 
 * Consolidation: This file has been refactored to use ReportStepDefinitions
 * Removed: ~350 lines of duplicate code
 * Pattern: Function-based registration for Cucumber compatibility
 * 
 * @category Step Definitions
 * @module automatic-transaction-refund-report.steps
 */

import { Given, When, Then, DataTable, Before } from '@cucumber/cucumber';
import { World } from '../../fixtures/world.fixture';
import { AutomaticTransactionRefundReportSteps } from './automatic-transaction-refund-report-implementation';

let steps: AutomaticTransactionRefundReportSteps;

Before(function (this: World) {
  steps = new AutomaticTransactionRefundReportSteps(this);
});

// ============================================================================
// GIVEN STEPS
// ============================================================================

Given('the user navigates to the "{string}" module', async function (moduleName: string) {
  await steps.userNavigatesToModule(moduleName);
});

Given('the module page is loaded', async function () {
  await steps.modulePageIsLoaded();
});

Given('the form is open', async function () {
  await steps.formIsOpen();
});

Given('the user is authenticated', async function () {
  await steps.userIsAuthenticated();
});

Given('the user fills the form with the following data:', async function (dataTable: DataTable) {
  await steps.userFillsFormWithData(dataTable);
});

// ============================================================================
// WHEN STEPS
// ============================================================================

When('the user clicks the report button', async function () {
  await steps.userClicksReportButton();
});

When('the user applies date filter from {string} to {string}', async function (fromDate: string, toDate: string) {
  await steps.userAppliesdateFilter(fromDate, toDate);
});

When('the user clicks show report', async function () {
  await steps.userClicksShowReport();
});

// ============================================================================
// THEN STEPS
// ============================================================================

Then('the report should be displayed', async function () {
  await steps.reportShouldBeDisplayed();
});

Then('the report should contain {int} rows', async function (rowCount: number) {
  await steps.reportShouldContainRows(rowCount);
});
