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

// NOTE: Removed duplicate step definitions
// "the report can be exported to Excel" - defined in shared.steps.ts
// "the report displays {string}" - defined in shared.steps.ts
// Using shared definitions to avoid ambiguous step matches

// ============================================================================
// MISSING STEPS - Added to support feature file scenarios
// ============================================================================

When('the user posts the following transactions on {string}:', async function (dateStr: string, dataTable: DataTable) {
  await steps.postTransactionsOnDate(dateStr, dataTable);
});

When('the user runs the {string} for today', async function (reportName: string) {
  if (!reportName.includes('Detailed Transactions report')) {
    throw new Error(`Unexpected report name: ${reportName}`);
  }
  await steps.runDetailedTransactionsReportForToday();
});

When('the user filters by {string}', async function (entityName: string) {
  await steps.filterByRevenueEntity(entityName);
});

When('the user selects a date range with no transactions', async function () {
  await steps.selectDateRangeWithNoTransactions();
});

When('the user attempts to open the detailed revenue entity report', async function () {
  await steps.attemptToOpenDetailedReport();
});

Then('the report shows all three transactions with correct revenue entity mapping', async function () {
  await steps.verifyAllTransactionsWithCorrectMapping();
});

Then('the total amount for {string} is {float} AED', async function (entityName: string, expectedAmount: number) {
  await steps.verifyEntityTotal(entityName, expectedAmount);
});

Then('only TXN-001 and TXN-002 are displayed', async function () {
  await steps.verifyOnlySpecificTransactionsDisplayed(['TXN-001', 'TXN-002']);
});

Then('the total amount shown is {float} AED', async function (expectedAmount: number) {
  await steps.verifyTotalAmountShown(expectedAmount);
});

Then('an {string} message is shown', async function (messageType: string) {
  await steps.verifyAccessDeniedMessage(messageType);
});
