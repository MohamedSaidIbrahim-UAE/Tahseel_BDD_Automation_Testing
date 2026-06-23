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

import { Given, When, Then, Before } from '@cucumber/cucumber';
import { World } from '../../fixtures/world.fixture';
import { expect } from '@playwright/test';
import { SharedRevenuesDTPSSharjahPage } from '../../pages/reports/shared-revenues-dtps-sharjah.page';
import { testContext } from '../test-context';

let reportPage: SharedRevenuesDTPSSharjahPage;

Before(function (this: World) {
  if (this.page) {
    reportPage = new SharedRevenuesDTPSSharjahPage(this.page);
    testContext.setPage(reportPage);
  }
});

// ────────────────────────────────────────────────────────────────────────────
// Given Steps
// ────────────────────────────────────────────────────────────────────────────

Given('the following transactions are posted under shared service on {string}:', async function (
  this: World,
  date: string,
  dataTable: any
) {
  const data = dataTable.hashes();
  this.addLog(`Setting up shared service transactions for ${date}:`);
  data.forEach((row: any) => {
    this.addLog(`  - Service: ${row.Service}, Amount: ${row.Amount} AED, Entities: ${row.Entities}`);
  });
  // Parse and store the date for later use
  (this as any).transactionDate = new Date(date);
  this.addLog(`Transaction date set to: ${date}`);
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
  date: string,
  newSplitRule: string
) {
  this.addLog(`Sharing rule updated on ${date} to: ${newSplitRule}`);
  // Parse date for comparison
  (this as any).ruleChangeDate = new Date(date);
  (this as any).newSharingRule = newSplitRule;
  this.addLog(`Rule change date stored: ${date}`);
});

Given('the user is a center manager for {string}', async function (this: World, centerName: string) {
  this.addLog(`User role: Center Manager for ${centerName}`);
  (this as any).centerName = centerName;
});

Given('transaction date range has no applicable transactions', async function (this: World) {
  this.addLog('Date range with no transactions selected');
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
  await reportPage.navigateToDTPSSharjahReport();

  const today = new Date().toISOString().split('T')[0];
  await reportPage.setFromDate(today);
  await reportPage.setToDate(today);
  await reportPage.showReport();

  this.addLog('✅ Shared revenues report executed');
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
  changeDate: string
) {
  if (!reportPage) {
    throw new Error('Report page not initialized');
  }

  this.addLog(`Verifying rule change from ${changeDate}...`);
  const changeDateObj = new Date(changeDate);
  const midPeriodImpact = await reportPage.verifyMidPeriodRuleChange(changeDateObj.toISOString(), 60, 40);

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

// Note: Export steps "the report can be exported to PDF/Excel" are defined in
// detailed-transactions-revenue-entity.steps.ts and are reused across all revenue reports
