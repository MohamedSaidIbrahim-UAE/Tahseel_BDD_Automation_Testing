/**
 * Detailed Transactions Report by Revenue Entity - Consolidated Step Definitions
 * 
 * Consolidation: This file has been refactored to use function-based registration pattern
 * Removed: All @Given, @When, @Then decorators
 * New: Clean, maintainable, function-based step binding
 * 
 * Step Registration Pattern:
 * - Steps are registered via function calls to avoid decorator limitations on class methods
 * - Implementation logic is in DetailedTransactionsRevenueEntitySteps class
 * - Only bindings and function calls are defined here
 * 
 * @category Step Definitions
 * @module detailed-transactions-revenue-entity.steps
 */

import { Given, When, Then, DataTable, Before } from '@cucumber/cucumber';
import { World } from '../../fixtures/world.fixture';
import { DetailedTransactionsRevenueEntitySteps } from './detailed-transactions-revenue-entity-implementation';

// ============================================================================
// STEP BINDING - Register steps as functions (Cucumber-compatible pattern)
// ============================================================================

let steps: DetailedTransactionsRevenueEntitySteps;

Before(function (this: World) {
  steps = new DetailedTransactionsRevenueEntitySteps(this as any);
});

// ============================================================================
// GIVEN STEPS
// ============================================================================

Given('detailed transactions are available for {string} to {string}', async function (fromDate: string, toDate: string) {
  await steps.detailedTransactionsAvailable(fromDate, toDate);
});

// ============================================================================
// WHEN STEPS
// ============================================================================

When('the user generates the detailed transactions report', async function () {
  await steps.generateDetailedReport();
});

When('the user filters by revenue entity {string}', async function (entityName: string) {
  await steps.filterByRevenueEntity(entityName);
});

// ============================================================================
// THEN STEPS
// ============================================================================

Then('the detailed transactions table should display the following columns:', async function (dataTable: DataTable) {
  await steps.verifyDetailedTransactionColumns(dataTable);
});

Then('the total transaction amount should be {string}', async function (expectedAmount: string) {
  await steps.verifyTotalAmount(expectedAmount);
});

Then('the report can be exported to Excel', async function () {
  await steps.reportCanBeExportedToExcel();
});

Then('the report displays {string}', async function (expectedContent: string) {
  await steps.reportDisplays(expectedContent);
});
