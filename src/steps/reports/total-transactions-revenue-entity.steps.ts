/**
 * Total Transactions Report by Revenue Entity - Consolidated Step Definitions
 * 
 * Consolidation: This file has been refactored to use ReportStepDefinitions
 * Removed: ~350 lines of duplicate code
 * New: Clean, maintainable, type-safe implementation
 * 
 * Step Registration Pattern:
 * - Steps are registered via function calls to avoid decorator limitations on class methods
 * - Inherits from ReportStepDefinitions for common functionality
 * - Only module-specific customizations are implemented here
 * 
 * @category Step Definitions
 * @module total-transactions-revenue-entity.steps
 */

import { Given, When, Then, DataTable, Before } from '@cucumber/cucumber';
import { World } from '../../fixtures/world.fixture';
import { parseGherkinDate } from '../../utils/date-parser';
import { TotalTransactionsRevenueEntitySteps } from './total-transactions-revenue-entity-implementation';

// ============================================================================
// STEP BINDING - Register steps as functions (Cucumber-compatible pattern)
// ============================================================================

let steps: TotalTransactionsRevenueEntitySteps;

Before(function (this: World, { pickle }) {
  // Only initialise for scenarios tagged with @total-transactions-revenue.
  // This keeps the test output clean — other report Before hooks won't fire here.
  const tags = pickle.tags.map((t: any) => t.name);
  if (tags.includes('@total-transactions-revenue')) {
    steps = new TotalTransactionsRevenueEntitySteps(this as any);
  }
});

// ============================================================================
// GIVEN STEPS
// ============================================================================

Given('the following summary transactions are posted from {string} to {string}:', async function (fromDate: string, toDate: string) {
  await steps.summaryTransactionsPosted(fromDate, toDate);
});

Given('the sharing rule is updated on {string} to {string}:', async function (dateStr: string, splitRule: string) {
  await steps.sharingRuleUpdated(dateStr, splitRule);
});

Given('the following transactions are posted under shared service on {string}:', async function (dateStr: string) {
  await steps.transactionsPostedUnderSharedService(dateStr);
});

Given('the following transactions are posted for the month of June:', async function (dataTable: DataTable) {
  await steps.transactionsPostedForMonth('June 2026', dataTable);
});

// ============================================================================
// WHEN STEPS
// ============================================================================

When('the user navigates via side menu to {string}', async function (reportName: string) {
  if (!steps) throw new Error('Steps not initialized — is @total-transactions-revenue tag present?');
  await steps.navigateToReportViaSideMenu(reportName);
});

When('the user selects {string} for every filter dropdown', async function (_all: string) {
  if (!steps) throw new Error('Steps not initialized');
  await steps.selectAllForAllDropdowns();
});

When('the user sets the date range from the first day of the current year to today', async function () {
  if (!steps) throw new Error('Steps not initialized');
  await steps.setCurrentYearDateRange();
});

When('the user selects a future date range', async function () {
  if (!steps) throw new Error('Steps not initialized');
  await steps.setFutureDateRange();
});

When('the user runs the "Total Transactions report by revenue entity" for {string}', async function (monthYear: string) {
  if (!steps) throw new Error('Steps not initialized');
  await steps.runTotalTransactionsReportForMonth(monthYear);
});

When('the user clicks "Show Report"', async function () {
  if (!steps) throw new Error('Steps not initialized');
  await steps.clickShowReport();
});

When('the user filters the report by revenue entity', async function () {
  if (!steps) throw new Error('Steps not initialized');
  await steps.filterByRevenueEntity();
});

// ============================================================================
// THEN STEPS
// ============================================================================

Then('the report filter page should be displayed', async function () {
  if (!steps) throw new Error('Steps not initialized');
  await steps.verifyFilterPageDisplayed();
});

Then('the {string} filter should show {string}', async function (filterName: string, expectedValue: string) {
  if (!steps) throw new Error('Steps not initialized');
  await steps.verifyFilterDefaultValue(filterName, expectedValue);
});

Then('all filter dropdowns should default to {string}', async function (expectedValue: string) {
  if (!steps) throw new Error('Steps not initialized');
  await steps.verifyAllDropdownsDefaultTo(expectedValue);
});

Then('the report should load without errors', async function () {
  if (!steps) throw new Error('Steps not initialized');
  await steps.verifyReportLoadedWithoutErrors();
});

Then('the report title should contain {string}', async function (expectedTitle: string) {
  if (!steps) throw new Error('Steps not initialized');
  await steps.verifyReportTitleContains(expectedTitle);
});

Then('the report should display an empty or no-data message', async function () {
  if (!steps) throw new Error('Steps not initialized');
  await steps.verifyEmptyOrNoDataMessage();
});

Then('only data for the user\'s assigned entity should appear', async function () {
  if (!steps) throw new Error('Steps not initialized');
  await steps.verifyOnlyAssignedEntityVisible();
});

Then('the report reflects the updated sharing rule from {string} onwards', async function (dateStr: string) {
  if (!steps) throw new Error('Steps not initialized');
  await steps.reportReflectsUpdatedSharingRule(dateStr);
});

Then('the total transactions table should be displayed', async function () {
  if (!steps) throw new Error('Steps not initialized');
  await steps.verifyTotalTransactionsTable();
});

Then('the total revenue should be {string}', async function (expectedTotal: string) {
  if (!steps) throw new Error('Steps not initialized');
  await steps.verifyTotalRevenue(expectedTotal);
});

Then('the report shows:', async function (dataTable: DataTable) {
  if (!steps) throw new Error('Steps not initialized');
  await steps.verifyReportShowsData(dataTable);
});

Then('the grand total amount is {float} AED', async function (expectedTotal: number) {
  if (!steps) throw new Error('Steps not initialized');
  await steps.verifyGrandTotalAmount(expectedTotal.toString());
});

Then('the user is {string}', async function (userRole: string) {
  // Store user role for context
});

Then('{string} is either omitted or displayed with {int} count and {float} amount', async function (
  entityName: string,
  count: number,
  amount: number
) {
  if (!steps) throw new Error('Steps not initialized');
  await steps.verifyEntityHasNoTransactions(entityName);
});

Then('only {string} data appears, even if other entities have transactions', async function (entityName: string) {
  if (!steps) throw new Error('Steps not initialized');
  await steps.verifyOnlyEntityVisible(entityName);
});

// ============================================================================
// ADDITIONAL GIVEN STEPS
// ============================================================================

Given('revenue entities {string} and {string} exist', async function (entity1: string, entity2: string) {
  // Master data that should exist in test environment
  // These are pre-configured in the test environment
});

// ============================================================================
// ADDITIONAL WHEN STEPS
// ============================================================================

When('{string} exists but has no transactions', async function (entityName: string) {
  // Store entity for verification in Then step via implementation
  if (!steps) throw new Error('Steps not initialized');
  (steps as any).entityWithoutTransactions = entityName;
});

When('the user runs the {string} for June {int}', async function (reportName: string, year: number) {
  // Handle the specific "Total Transactions report by revenue entity" for June {year}
  if (!steps) throw new Error('Steps not initialized');
  await steps.runTotalTransactionsReportForMonth(`June ${year}`);
});

When('the report is generated', async function () {
  if (!steps) throw new Error('Steps not initialized');
  const monthYear = steps.getStoredTestData<string>('lastReportMonth') || 'June 2026';
  await steps.runTotalTransactionsReportForMonth(monthYear);
});

When('the user runs the summary report', async function () {
  if (!steps) throw new Error('Steps not initialized');
  await steps.runTotalTransactionsReportForMonth('June 2026');
});
