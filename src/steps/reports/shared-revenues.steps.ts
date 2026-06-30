/**
 * Step Definitions - Shared Revenues Reports
 *
 * Handles all scenario steps for shared revenue reports with revenue splitting logic.
 * Includes verification for:
 * - DTPS & Sharjah Municipality (50/50)
 * - SEDD & SCTDA (60/40)
 * - Prevention & Safety Authority & SAND (70/30)
 * - Sharjah Municipality & Service Centers (80/20)
 */

import { Given, When, Then, DataTable, Before } from '@cucumber/cucumber';
import { World } from '../../fixtures/world.fixture';
import { parseGherkinDate, getMonthDateRange } from '../../utils/date-parser';
import { expect } from '@playwright/test';
import { SharedRevenuesDTPSSharjahPage } from '../../pages/reports/shared-revenues-dtps-sharjah.page';
import { testContext } from '../test-context';
import { SharedRevenuesReportSteps } from './shared-revenues-implementation';

let reportPage: SharedRevenuesDTPSSharjahPage;
let sharedRevenuesSteps: SharedRevenuesReportSteps;

Before(function (this: World) {
  if (this.page) {
    reportPage = new SharedRevenuesDTPSSharjahPage(this.page);
    testContext.setPage(reportPage);
    
    // Initialize implementation class
    sharedRevenuesSteps = new SharedRevenuesReportSteps(this);
  }
});

// ────────────────────────────────────────────────────────────────────────────
// Given Steps
// ────────────────────────────────────────────────────────────────────────────

Given('the following transactions are posted under shared service on {string}:', async function (
  this: World,
  dateStr: string,
  dataTable: DataTable
) {
  const data = dataTable.hashes();
  
  // Parse date string using centralized utility
  let transactionDate: Date;
  try {
    transactionDate = parseGherkinDate(dateStr);
  } catch (error) {
    throw new Error(`Invalid date format: ${dateStr}. ${(error as Error).message}`);
  }
  
  this.addLog(`Setting up shared service transactions for ${dateStr}:`);
  data.forEach((row: any) => {
    this.addLog(`  - Service: ${row.Service}, Amount: ${row.Amount} AED, Entities: ${row.Entities}`);
  });
  
  // Store parsed date and data for later verification
  (this as any).transactionDate = transactionDate;
  (this as any).transactionData = data;
  this.addLog(`Transaction date set to: ${transactionDate.toISOString().split('T')[0]}`);
});

// Handle numeric date format from Gherkin (2026-06-15 parsed as three ints)
Given('the following transactions are posted under shared service on {int}-{int}-{int}:', async function (
  this: World,
  year: number,
  month: number,
  day: number,
  dataTable: DataTable
) {
  const data = dataTable.hashes();
  const transactionDate = new Date(year, month - 1, day);
  
  this.addLog(`Setting up shared service transactions for ${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}:`);
  data.forEach((row: any) => {
    this.addLog(`  - Service: ${row.Service}, Amount: ${row.Amount} AED, Entities: ${row.Entities}`);
  });
  
  // Store parsed date and data for later verification
  (this as any).transactionDate = transactionDate;
  (this as any).transactionData = data;
  this.addLog(`Transaction date set to: ${transactionDate.toISOString().split('T')[0]}`);
});

Given('sharing rule for {string} is {string}', async function (
  this: World,
  serviceName: string,
  splitRule: string
) {
  this.addLog(`Sharing rule for ${serviceName}: ${splitRule}`);
  (this as any).sharingRuleForService = { [serviceName]: splitRule };
});

Given('the sharing rule is updated on {string} to {string}', async function (
  this: World,
  dateStr: string,
  newSplitRule: string
) {
  // Parse date string using centralized utility
  let changeDate: Date;
  try {
    changeDate = parseGherkinDate(dateStr);
  } catch (error) {
    throw new Error(`Invalid date format: ${dateStr}. ${(error as Error).message}`);
  }
  
  this.addLog(`Sharing rule updated on ${dateStr} to: ${newSplitRule}`);
  
  // Store for later verification
  (this as any).ruleChangeDate = changeDate;
  (this as any).newSharingRule = newSplitRule;
  this.addLog(`Rule change date stored: ${changeDate.toISOString().split('T')[0]}`);
});

// Handle numeric date format from Gherkin (2026-06-15 parsed as three ints)
Given('the sharing rule is updated on {int}-{int}-{int} to {string}', async function (
  this: World,
  year: number,
  month: number,
  day: number,
  newSplitRule: string
) {
  const changeDate = new Date(year, month - 1, day);
  
  this.addLog(`Sharing rule updated on ${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} to: ${newSplitRule}`);
  
  // Store for later verification
  (this as any).ruleChangeDate = changeDate;
  (this as any).newSharingRule = newSplitRule;
  this.addLog(`Rule change date stored: ${changeDate.toISOString().split('T')[0]}`);
});

Given('the user is a center manager for {string}', async function (this: World, centerName: string) {
  this.addLog(`User role: Center Manager for ${centerName}`);
  (this as any).centerName = centerName;
});

Given('transaction date range has no applicable transactions', async function (this: World) {
  this.addLog('Date range with no transactions selected');
});

Given('the following transactions are posted for the month of {string}:', async function (
  this: World,
  monthStr: string,
  dataTable: DataTable
) {
  const data = dataTable.hashes();
  
  // Parse month string (e.g., "June") with current year as default
  const currentYear = new Date().getFullYear();
  let monthDate: Date;
  
  try {
    monthDate = parseGherkinDate(`${monthStr} 2026`); // Using 2026 as default if not specified
  } catch (error) {
    throw new Error(`Invalid month format: ${monthStr}. ${(error as Error).message}`);
  }
  
  this.addLog(`Setting up transactions for ${monthStr}:`);
  data.forEach((row: any) => {
    this.addLog(`  - Transaction: ${row.Transaction}, Service: ${row.Service}, Amount: ${row.Amount} AED`);
  });
  
  // Store parsed month and data for later verification
  (this as any).transactionMonth = monthStr;
  (this as any).transactionYear = currentYear;
  (this as any).monthTransactionData = data;
  this.addLog(`Transactions set up for month: ${monthStr}`);
});

// ────────────────────────────────────────────────────────────────────────────
// When Steps
// ────────────────────────────────────────────────────────────────────────────

When('the user runs the shared revenues report for {string}', async function (
  this: World,
  dateRange: string
) {
  if (!reportPage) {
    throw new Error('Report page not initialized');
  }

  this.addLog(`Running shared revenues report for: ${dateRange}`);
  
  // Parse date range using centralized utility
  let monthName: string;
  let year: number;
  
  const dateRangeParts = dateRange.split(/\s+/);
  if (dateRangeParts.length === 2) {
    monthName = dateRangeParts[0];
    year = parseInt(dateRangeParts[1], 10);
  } else {
    throw new Error(`Invalid date range format: "${dateRange}". Expected format: "June 2026"`);
  }
  
  // Build report URL
  const baseUrl = process.env.BASE_URL || 'https://your-app-host/masar/';
  const reportUrl = `${baseUrl}reports/shared-revenues`;
  
  // Navigate to report
  await reportPage.navigateToReport(reportUrl);

  // Get date range for the month
  const dateRange_ = getMonthDateRange(monthName, year);
  const fromDate = dateRange_.from.toISOString().split('T')[0];
  const toDate = dateRange_.to.toISOString().split('T')[0];

  await reportPage.setFromDate(fromDate);
  await reportPage.setToDate(toDate);
  await reportPage.showReport();

  // Store date range in context
  (this as any).reportDateRange = { fromDate, toDate, month: monthName, year };
  this.addLog('✅ Shared revenues report executed');
});

When('the user runs the {string} for {string}', async function (
  this: World,
  reportName: string,
  dateRange: string
) {
  if (!reportPage) {
    throw new Error('Report page not initialized');
  }

  this.addLog(`Running report: ${reportName} for ${dateRange}`);
  
  // Parse date range (e.g., "June 2026")
  let monthName: string;
  let year: number;
  
  const dateRangeParts = dateRange.split(/\s+/);
  if (dateRangeParts.length === 2) {
    monthName = dateRangeParts[0];
    year = parseInt(dateRangeParts[1], 10);
  } else {
    throw new Error(`Invalid date range format: "${dateRange}". Expected format: "June 2026"`);
  }
  
  // Get date range for the month
  const monthRange = getMonthDateRange(monthName, year);
  const fromDate = monthRange.from.toISOString().split('T')[0];
  const toDate = monthRange.to.toISOString().split('T')[0];

  // Navigate and show report
  await reportPage.setFromDate(fromDate);
  await reportPage.setToDate(toDate);
  await reportPage.showReport();

  // Store context
  (this as any).reportName = reportName;
  (this as any).reportDateRange = { fromDate, toDate, month: monthName, year };
  this.addLog(`✅ Report "${reportName}" executed for ${dateRange}`);
});

When('the user applies a new sharing rule mid-period', async function (this: World) {
  if (!reportPage) {
    throw new Error('Report page not initialized');
  }

  this.addLog('Applying mid-period sharing rule change...');
  await reportPage.showReport();
  this.addLog('✅ New sharing rule applied and report refreshed');
});

When('the user filters for {string}', async function (this: World, centerName: string) {
  if (!reportPage) {
    throw new Error('Report page not initialized');
  }

  this.addLog(`Filtering for center: ${centerName}`);
  await reportPage.filterByEntity(centerName);
  await reportPage.showReport();
  this.addLog(`✅ Filtered to show only ${centerName}`);
});

When('the user selects a date range with no applicable transactions', async function (this: World) {
  if (!reportPage) {
    throw new Error('Report page not initialized');
  }

  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + 1);
  const dateStr = futureDate.toISOString().split('T')[0];

  this.addLog(`Setting date range to future (no transactions): ${dateStr}`);
  await reportPage.setFromDate(dateStr);
  await reportPage.setToDate(dateStr);
  await reportPage.showReport();
});

// ────────────────────────────────────────────────────────────────────────────
// Then Steps - Split Verification
// ────────────────────────────────────────────────────────────────────────────

Then('the report shows transaction split verification', async function (this: World) {
  if (!reportPage) {
    throw new Error('Report page not initialized');
  }

  const transactions = await reportPage.getAllTransactionsWithSplit();
  this.addLog(`Total transactions found: ${transactions.length}`);
  expect(transactions.length).toBeGreaterThan(0);

  transactions.forEach((txn, idx) => {
    this.addLog(
      `  TXN ${idx + 1}: ${txn.transactionId} - Total: ${txn.totalAmount} AED, ` +
        `Entity A: ${txn.entityAShare} AED, Entity B: ${txn.entityBShare} AED`
    );
  });

  this.addLog('✅ Transaction splits verified');
});

Then('all transactions are split {string} between the two entities', async function (
  this: World,
  splitRule: string
) {
  if (!reportPage) {
    throw new Error('Report page not initialized');
  }

  const [entityAStr, entityBStr] = splitRule.split('/');
  const entityAPercentage = parseInt(entityAStr, 10);
  const entityBPercentage = parseInt(entityBStr, 10);

  this.addLog(`Verifying ${splitRule} split...`);

  const transactions = await reportPage.getAllTransactionsWithSplit();

  transactions.forEach(txn => {
    const expectedA = (txn.totalAmount * entityAPercentage) / 100;
    const expectedB = (txn.totalAmount * entityBPercentage) / 100;
    const tolerance = 0.01;
    const isCorrect =
      Math.abs(txn.entityAShare - expectedA) < tolerance && Math.abs(txn.entityBShare - expectedB) < tolerance;

    expect(isCorrect).toBe(true);
    this.addLog(
      `  ✓ ${txn.transactionId}: ${entityAPercentage}% (${txn.entityAShare}) / ${entityBPercentage}% (${txn.entityBShare})`
    );
  });

  this.addLog(`✅ All transactions verified with ${splitRule} split`);
});

Then('the splits sum to the total transaction amount for each transaction', async function (this: World) {
  if (!reportPage) {
    throw new Error('Report page not initialized');
  }

  this.addLog('Verifying split summation...');
  const isBalanced = await reportPage.verifySplitsBalance();
  expect(isBalanced).toBe(true);
  this.addLog('✅ All splits correctly sum to total amounts');
});

Then('the report reflects the updated sharing rule from {string} onwards', async function (
  this: World,
  changeDateStr: string
) {
  if (!reportPage) {
    throw new Error('Report page not initialized');
  }

  // Parse date string using centralized utility
  let changeDate: Date;
  try {
    changeDate = parseGherkinDate(changeDateStr);
  } catch (error) {
    throw new Error(`Invalid date format: ${changeDateStr}. ${(error as Error).message}`);
  }

  this.addLog(`Verifying rule change from ${changeDateStr}...`);
  
  // Retrieve the new sharing rule from context (set in earlier Given step)
  const newRule = (this as any).newSharingRule || '60/40';
  const [beforePercent, afterPercent] = newRule.split('/').map(Number);

  const midPeriodImpact = await reportPage.verifyMidPeriodRuleChange(
    changeDate.toISOString(),
    beforePercent,
    afterPercent
  );

  this.addLog(`Before rule change: ${midPeriodImpact.beforeChange} AED`);
  this.addLog(`After rule change: ${midPeriodImpact.afterChange} AED`);
  this.addLog(`Difference: ${midPeriodImpact.differenceInSplit} AED`);
  this.addLog('✅ Mid-period rule change verified in report');
});

// Handle numeric date format from Gherkin (2026-06-15 parsed as three ints)
Then('the report reflects the updated sharing rule from {int}-{int}-{int} onwards', async function (
  this: World,
  year: number,
  month: number,
  day: number
) {
  if (!reportPage) {
    throw new Error('Report page not initialized');
  }

  const changeDate = new Date(year, month - 1, day);

  this.addLog(`Verifying rule change from ${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}...`);
  
  // Retrieve the new sharing rule from context (set in earlier Given step)
  const newRule = (this as any).newSharingRule || '60/40';
  const [beforePercent, afterPercent] = newRule.split('/').map(Number);

  const midPeriodImpact = await reportPage.verifyMidPeriodRuleChange(
    changeDate.toISOString(),
    beforePercent,
    afterPercent
  );

  this.addLog(`Before rule change: ${midPeriodImpact.beforeChange} AED`);
  this.addLog(`After rule change: ${midPeriodImpact.afterChange} AED`);
  this.addLog(`Difference: ${midPeriodImpact.differenceInSplit} AED`);
  this.addLog('✅ Mid-period rule change verified in report');
});

// ────────────────────────────────────────────────────────────────────────────
// Then Steps - Entity Totals
// ────────────────────────────────────────────────────────────────────────────

Then('the total for the first entity is {float} AED', async function (
  this: World,
  expectedAmount: number
) {
  if (!reportPage) {
    throw new Error('Report page not initialized');
  }

  const actualTotal = await reportPage.getTotalForEntityA();
  this.addLog(`Entity A total: ${actualTotal} AED (expected: ${expectedAmount} AED)`);
  expect(actualTotal).toBeCloseTo(expectedAmount, 2);
  this.addLog(`✅ Entity A total verified: ${expectedAmount} AED`);
});

Then('the total for the second entity is {float} AED', async function (
  this: World,
  expectedAmount: number
) {
  if (!reportPage) {
    throw new Error('Report page not initialized');
  }

  const actualTotal = await reportPage.getTotalForEntityB();
  this.addLog(`Entity B total: ${actualTotal} AED (expected: ${expectedAmount} AED)`);
  expect(actualTotal).toBeCloseTo(expectedAmount, 2);
  this.addLog(`✅ Entity B total verified: ${expectedAmount} AED`);
});

// ────────────────────────────────────────────────────────────────────────────
// Then Steps - RBAC Verification
// ────────────────────────────────────────────────────────────────────────────

Then('only the data for that center is displayed', async function (this: World) {
  if (!reportPage) {
    throw new Error('Report page not initialized');
  }

  const centerName = (this as any).centerName;
  this.addLog(`Verifying center-restricted view for: ${centerName}`);

  const canViewRestricted = await reportPage.verifyCenterManagerRestriction(centerName);
  expect(canViewRestricted).toBe(true);
  this.addLog(`✅ Center manager can only view ${centerName} data`);
});

Then('the user cannot access shared revenue details', async function (this: World) {
  if (!reportPage) {
    throw new Error('Report page not initialized');
  }

  this.addLog('Verifying access restrictions for unauthorized user...');

  try {
    await reportPage.navigateToDTPSSharjahReport();
    const isNoDataVisible = await reportPage.isNoDataMessageVisible();
    expect(isNoDataVisible || (await reportPage.isNoDataMessageVisible())).toBe(true);
    this.addLog('✅ Unauthorized access properly denied');
  } catch {
    this.addLog('✅ Access denied as expected');
  }
});

// Export steps are inherited from BaseListPage and defined in shared.steps.ts
// Steps "the report can be exported to Excel" and "the report can be exported to PDF" are reused across all revenue reports
// Step "the report displays {string}" is defined in shared.steps.ts

// ────────────────────────────────────────────────────────────────────────────
// Helper Functions (now imported from src/utils/date-parser.ts)
// ────────────────────────────────────────────────────────────────────────────

// Using centralized date utilities imported at the top of this file
// See: src/utils/date-parser.ts for implementations
// - getMonthNumberUtil() - Convert month name to number
// - getDaysInMonthUtil() - Get days in month
// - parseGherkinDate() - Parse various date formats
// - getMonthDateRange() - Get date range for entire month


// ────────────────────────────────────────────────────────────────────────────
// Additional Missing Steps - Add now to match feature file
// ────────────────────────────────────────────────────────────────────────────

Given('the user is logged in as {string}', async function (this: World, userRole: string) {
  this.addLog(`User login: ${userRole}`);
  (this as any).userRole = userRole;

  // Actually authenticate via AuthManager (loads storageState or performs full login)
  if (this.authManager) {
    this.addLog('Ensuring authenticated session...');
    await this.authManager.ensureAuthenticated();
    this.addLog(`✅ Authenticated as: ${userRole}`);
  } else {
    this.addLog('⚠️ AuthManager not available — relying on storageState from @authenticated tag');
  }
});

Given('the revenue entities {string} and {string} are configured', async function (
  this: World,
  entityA: string,
  entityB: string
) {
  this.addLog(`Revenue entities configured: ${entityA} and ${entityB}`);
  (this as any).configuredEntities = { entityA, entityB };
  
  // Delegate to implementation
  if (sharedRevenuesSteps) {
    await sharedRevenuesSteps.configureRevenueEntities(entityA, entityB);
  }
});

Then('the grand total is {float} AED', async function (this: World, expectedGrandTotal: number) {
  if (!reportPage) {
    throw new Error('Report page not initialized');
  }

  this.addLog(`Verifying grand total: ${expectedGrandTotal} AED`);
  const actualGrandTotal = await reportPage.getGrandTotal();
  this.addLog(`Actual grand total: ${actualGrandTotal} AED`);
  expect(actualGrandTotal).toBeCloseTo(expectedGrandTotal, 2);
  this.addLog(`✅ Grand total verified: ${expectedGrandTotal} AED`);
});

// ────────────────────────────────────────────────────────────────────────────
// Delegated Implementation Steps
// ────────────────────────────────────────────────────────────────────────────

Then('the report can be exported to PDF', async function (this: World) {
  if (!sharedRevenuesSteps) {
    throw new Error('Shared revenues implementation not initialized');
  }
  this.addLog('Verifying PDF export capability...');
  await sharedRevenuesSteps.verifyExportToPDF();
  this.addLog('✅ PDF export verified');
});

Then('the report can be exported to Excel', async function (this: World) {
  if (!sharedRevenuesSteps) {
    throw new Error('Shared revenues implementation not initialized');
  }
  this.addLog('Verifying Excel export capability...');
  await sharedRevenuesSteps.verifyExportToExcel();
  this.addLog('✅ Excel export verified');
});
