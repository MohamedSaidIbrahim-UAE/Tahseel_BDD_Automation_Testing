/**
 * Step Definitions - Total Transactions Report by Revenue Entity
 * 
 * Handles all scenario steps for the Total Transactions Report feature.
 * Uses the TotalTransactionsRevenueEntityPage for all page interactions.
 */

import { Given, When, Then, Before } from '@cucumber/cucumber';
import { World } from '../../fixtures/world.fixture';
import { expect } from '@playwright/test';
import { TotalTransactionsRevenueEntityPage } from '../../pages/reports/total-transactions-revenue-entity.page';
import { testContext } from '../test-context';

let reportPage: TotalTransactionsRevenueEntityPage;

Before(function (this: World) {
  if (this.page) {
    reportPage = new TotalTransactionsRevenueEntityPage(this.page);
    testContext.setPage(reportPage);
  }
});

// ────────────────────────────────────────────────────────────────────────────
// Given Steps
// ────────────────────────────────────────────────────────────────────────────

Given('the user is logged in as {string}', async function (this: World, role: string) {
  // User is already authenticated via storageState.<env>.json loaded by fixtures
  // This step confirms the authenticated state
  this.addLog(`User authenticated as: ${role}`);
  
  if (!this.page) {
    throw new Error('Page not initialized. Authentication failed.');
  }
  
  // Verify we're on authenticated portion of app
  await this.page.waitForLoadState('networkidle');
});

Given('revenue entities {string} and {string} exist', async function (this: World, entity1: string, entity2: string) {
  // This step verifies that master data (revenue entities) exists
  // In a real scenario, this would verify via API or database
  // For now, we log the expected entities for the test
  this.addLog(`Revenue entities expected: ${entity1}, ${entity2}`);
  this.targetPageLabel = 'Total Transactions Report by Revenue Entity';
});

Given('the following transactions are posted for the month of June:', async function (this: World, dataTable: any) {
  // This step sets up test data
  // Data is provided as a table with Entity, Count, Total Amount columns
  const data = dataTable.hashes();
  
  // Store transaction data in world context for later verification
  this.transactionData = data.map((row: any) => ({
    entity: row.Entity,
    count: parseInt(row.Count, 10),
    totalAmount: parseFloat(row['Total Amount'])
  }));
  
  this.addLog(`Setting up transactions for June:`);
  if (this.transactionData) {
    this.transactionData.forEach((tx: any) => {
      this.addLog(`  - ${tx.entity}: ${tx.count} transactions, ${tx.totalAmount} AED`);
    });
  }
  
  // In production, this would call an API to create test data
  // For BDD, we assume the test data exists in the test environment
});

Given('the following transactions are posted for the month of {string}:', async function (this: World, month: string, dataTable: any) {
  // This step sets up test data for any month
  // Data is provided as a table with Entity, Count, Total Amount columns
  const data = dataTable.hashes();
  
  // Store transaction data in world context for later verification
  this.transactionData = data.map((row: any) => ({
    entity: row.Entity,
    count: parseInt(row.Count, 10),
    totalAmount: parseFloat(row['Total Amount'])
  }));
  
  this.addLog(`Setting up transactions for ${month}:`);
  if (this.transactionData) {
    this.transactionData.forEach((tx: any) => {
      this.addLog(`  - ${tx.entity}: ${tx.count} transactions, ${tx.totalAmount} AED`);
    });
  }
  
  // In production, this would call an API to create test data
  // For BDD, we assume the test data exists in the test environment
});

When('the user runs the {string} for June {int}', async function (this: World, reportName: string, year: number) {
  if (!reportPage) {
    throw new Error('Report page not initialized');
  }

  this.addLog(`Running report: ${reportName} for June ${year}`);

  // Navigate to the report
  await reportPage.navigateToReport();
  this.addLog(`Navigated to report: ${reportName}`);

  // Set date filters for June of the given year
  const fromDate = `${year}-06-01`;
  const toDate = `${year}-06-30`;

  await reportPage.setFromDate(fromDate);
  this.addLog(`Set from date to: ${fromDate}`);
  
  await reportPage.setToDate(toDate);
  this.addLog(`Set to date to: ${toDate}`);

  // Click Show Report
  await reportPage.showReport();
  this.addLog(`Report generated for June ${year}`);
});

When('the user runs the "Total Transactions report by revenue entity" for June {int}', async function (this: World, year: number) {
  if (!reportPage) {
    throw new Error('Report page not initialized');
  }

  this.addLog(`Running Total Transactions report for June ${year}`);

  // Navigate to the report
  await reportPage.navigateToReport();
  this.addLog(`Navigated to Total Transactions report`);

  // Set date filters for June of the given year
  const fromDate = `${year}-06-01`;
  const toDate = `${year}-06-30`;

  await reportPage.setFromDate(fromDate);
  this.addLog(`Set from date to: ${fromDate}`);
  
  await reportPage.setToDate(toDate);
  this.addLog(`Set to date to: ${toDate}`);

  // Click Show Report
  await reportPage.showReport();
  this.addLog(`Report generated for June ${year}`);
});

Given('{string} exists but has no transactions', async function (this: World, entity: string) {
  this.addLog(`Entity ${entity} exists but has no transactions`);
});

Given('the user is {string}', async function (this: World, userRole: string) {
  // Set up user role context for RBAC testing
  this.addLog(`User role set to: ${userRole}`);
  this.targetPageLabel = 'Total Transactions Report - Role Based View';
});

// ────────────────────────────────────────────────────────────────────────────
// When Steps
// ────────────────────────────────────────────────────────────────────────────

When('the user runs the {string} for {string}', async function (this: World, reportName: string, dateRange: string) {
  if (!reportPage) {
    throw new Error('Report page not initialized');
  }

  // Navigate to the report
  await reportPage.navigateToReport();
  this.addLog(`Navigated to report: ${reportName}`);

  // Parse date range (e.g., "June 2026")
  const [month, year] = dateRange.split(' ');
  
  // Set date filters based on month/year
  // For June 2026: from 2026-06-01 to 2026-06-30
  const fromDate = `${year}-${getMonthNumber(month)}-01`;
  const toDate = `${year}-${getMonthNumber(month)}-${getDaysInMonth(month, parseInt(year))}`;

  await reportPage.setFromDate(fromDate);
  this.addLog(`Set from date to: ${fromDate}`);
  
  await reportPage.setToDate(toDate);
  this.addLog(`Set to date to: ${toDate}`);

  // Click Show Report
  await reportPage.showReport();
  this.addLog(`Report generated for ${dateRange}`);
});

When('the report is generated', async function (this: World) {
  if (!reportPage) {
    throw new Error('Report page not initialized');
  }

  await reportPage.showReport();
  this.addLog('Report generated');
});

When('the user runs the summary report', async function (this: World) {
  if (!reportPage) {
    throw new Error('Report page not initialized');
  }

  await reportPage.navigateToReport();
  this.addLog('Summary report accessed');
});

// ────────────────────────────────────────────────────────────────────────────
// Then Steps
// ────────────────────────────────────────────────────────────────────────────

Then('the report shows:', async function (this: World, dataTable: any) {
  if (!reportPage) {
    throw new Error('Report page not initialized');
  }

  const expectedData = dataTable.hashes().map((row: any) => ({
    entity: row['Revenue Entity'],
    count: parseInt(row['Transaction Count'], 10),
    amount: parseFloat(row['Total Amount'])
  }));

  // Verify each row in the report matches expected data
  for (const expected of expectedData) {
    const count = await reportPage.getTransactionCount(expected.entity);
    const amount = await reportPage.getTotalAmount(expected.entity);

    expect(count).toBe(expected.count);
    expect(amount).toBe(expected.amount);

    this.addLog(
      `Verified ${expected.entity}: count=${count}, amount=${amount}`
    );
  }
});

Then('the grand total amount is {float} AED', async function (this: World, expectedGrandTotal: number) {
  if (!reportPage) {
    throw new Error('Report page not initialized');
  }

  const actualGrandTotal = await reportPage.getGrandTotalAmount();
  
  // Allow small floating point differences
  const tolerance = 0.01;
  const difference = Math.abs(actualGrandTotal - expectedGrandTotal);

  expect(difference).toBeLessThanOrEqual(tolerance);
  this.addLog(`Verified grand total: ${actualGrandTotal} AED (expected: ${expectedGrandTotal} AED)`);
});

Then('{string} is either omitted or displayed with {int} count and {float} amount', async function (
  this: World,
  entity: string,
  expectedCount: number,
  expectedAmount: number
) {
  if (!reportPage) {
    throw new Error('Report page not initialized');
  }

  const entityExists = await reportPage.verifyEntityInReport(entity);

  if (entityExists) {
    // Entity is displayed, verify it has zero data
    const hasZeroData = await reportPage.verifyEntityHasZeroData(entity);
    expect(hasZeroData).toBe(true);
    this.addLog(`Entity ${entity} displayed with zero data`);
  } else {
    // Entity is omitted (not in report)
    this.addLog(`Entity ${entity} omitted from report`);
  }
});

Then('only Entity-A data appears, even if other entities have transactions', async function (this: World) {
  if (!reportPage) {
    throw new Error('Report page not initialized');
  }

  const entities = await reportPage.getRevenueEntities();

  // For entity-restricted user, only Entity-A should appear
  expect(entities).toContain('Entity-A');
  expect(entities).not.toContain('Entity-B');
  expect(entities).not.toContain('Entity-C');

  this.addLog(`RBAC verified: Only Entity-A visible to restricted user`);
});

Then('the report shows the following data:', async function (this: World, dataTable: any) {
  if (!reportPage) {
    throw new Error('Report page not initialized');
  }

  const expectedData = dataTable.hashes().map((row: any) => ({
    entity: row['Revenue Entity'],
    count: parseInt(row['Transaction Count'], 10),
    amount: parseFloat(row['Total Amount'])
  }));

  await reportPage.verifyReportDataMatches(expectedData);
  this.addLog(`Report data verified against expected values`);
});

Then('the report table is visible', async function (this: World) {
  if (!reportPage) {
    throw new Error('Report page not initialized');
  }

  await reportPage.verifyReportTableVisible();
  this.addLog('Report table verified visible');
});

Then('no data message is displayed', async function (this: World) {
  if (!reportPage) {
    throw new Error('Report page not initialized');
  }

  const isEmpty = await reportPage.isReportEmpty();
  expect(isEmpty).toBe(true);
  this.addLog('No data message verified');
});

// ────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ────────────────────────────────────────────────────────────────────────────

function getMonthNumber(monthName: string): string {
  const months: { [key: string]: string } = {
    'January': '01', 'February': '02', 'March': '03', 'April': '04',
    'May': '05', 'June': '06', 'July': '07', 'August': '08',
    'September': '09', 'October': '10', 'November': '11', 'December': '12'
  };
  return months[monthName] || '06';
}

function getDaysInMonth(monthName: string, year: number): number {
  const monthNum = parseInt(getMonthNumber(monthName), 10);
  const date = new Date(year, monthNum, 0);
  return date.getDate();
}
