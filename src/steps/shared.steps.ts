/**
 * Shared Steps - Common step definitions used across multiple feature files
 * 
 * This file contains step definitions that are shared across different modules
 * to avoid duplication and ensure consistent behavior.
 */

import { Given, When, Then } from '@cucumber/cucumber';
import { World } from '../fixtures/world.fixture';
import { expect } from '@playwright/test';
import { resolveActivePage } from './active-page-resolver';

// ── Shared pagination steps ────────────────────────────────────────────────────

Then('the page navigation element should be visible', async function (this: World) {
  const activePage = resolveActivePage(this, 'verifyPagerVisible');
  await activePage.verifyPagerVisible();
  this.addLog('Verified page navigation element visible');
});

Then('the page size options {string}, {string}, {string} should be available', async function (
  this: World, s1: string, s2: string, s3: string
) {
  const activePage = resolveActivePage(this, 'verifyPageSizeOptions');
  await activePage.verifyPageSizeOptions([s1, s2, s3]);
  this.addLog(`Verified page size options: ${[s1, s2, s3].join(', ')}`);
});

When('I select page size {string}', async function (this: World, size: string) {
  const activePage = resolveActivePage(this, 'selectPageSize');
  await activePage.selectPageSize(size);
  this.addLog(`Selected page size ${size}`);
});

Then('the table should display up to {int} records', async function (this: World, maxCount: number) {
  const activePage = resolveActivePage(this, 'rawPage');
  const rows = activePage.rawPage.locator('table').last().locator('tbody tr:not(.dx-freespace-row)');
  const count = await rows.count();
  expect(count).toBeLessThanOrEqual(maxCount);
  this.addLog(`Verified table displays up to ${maxCount} records (actual: ${count})`);
});

// ── Shared table verification steps ───────────────────────────────────────────

Then('the table should be visible', async function (this: World) {
  const activePage = resolveActivePage(this, 'verifyTableVisible');
  await activePage.verifyTableVisible();
  this.addLog('Verified table visible');
});

Then('the table should contain at least one record', async function (this: World) {
  const activePage = resolveActivePage(this, 'verifyTableHasRecords');
  await activePage.verifyTableHasRecords();
  this.addLog('Verified table has at least one record');
});

Then('the table should contain multiple records', async function (this: World) {
  const activePage = resolveActivePage(this, 'verifyTableHasMultipleRecords');
  await activePage.verifyTableHasMultipleRecords();
  this.addLog('Verified table has multiple records');
});

Then('the table should be empty', async function (this: World) {
  const activePage = resolveActivePage(this, 'verifyTableIsEmpty');
  await activePage.verifyTableIsEmpty();
  this.addLog('Verified table is empty');
});

Then('the table should show an empty or no-data state', async function (this: World) {
  const activePage = resolveActivePage(this, 'verifyEmptyOrNoDataState');
  await activePage.verifyEmptyOrNoDataState();
  this.addLog('Verified empty or no-data state');
});

// ── Shared search steps ──────────────────────────────────────────────────────


When('I clear the search input', async function (this: World) {
  const activePage = resolveActivePage(this, 'clearGridSearch');
  await activePage.clearGridSearch();
  this.addLog('Cleared search input');
});

Then('only records matching the search term should be displayed', async function (this: World) {
  const activePage = resolveActivePage(this, 'verifyTableHasRecords');
  await activePage.verifyTableHasRecords();
  this.addLog('Verified search results');
});

Then('the full list should be restored', async function (this: World) {
  const activePage = resolveActivePage(this, 'verifyTableHasMultipleRecords');
  await activePage.verifyTableHasMultipleRecords();
  this.addLog('Verified full list restored');
});

// ── Shared export steps ──────────────────────────────────────────────────────

When('I click the export button and select {string}', async function (this: World, format: string) {
  const activePage = resolveActivePage(this, 'clickExportAndSelectFormat');
  await activePage.clickExportAndSelectFormat(format);
  this.addLog(`Clicked export and selected "${format}"`);
});

Then('an Excel file should be downloaded containing the data', async function (this: World) {
  const activePage = resolveActivePage(this, 'rawPage');
  const [download] = await Promise.all([activePage.rawPage.waitForEvent('download', { timeout: 15000 })]);
  expect(download.suggestedFilename()).toMatch(/\.(xlsx|xls|csv)$/i);
  this.addLog(`Verified file download: "${download.suggestedFilename()}"`);
});

// ── Shared detail view steps ─────────────────────────────────────────────────

When('I click the detail action button for the last record', async function (this: World) {
  const activePage = resolveActivePage(this, 'clickLastRowDetailButton');
  await activePage.clickLastRowDetailButton();
  this.addLog('Clicked detail action button for last record');
});

Then('the detail screen should be visible', async function (this: World) {
  const activePage = resolveActivePage(this, 'verifyDetailPrimaryButtonVisible');
  await activePage.verifyDetailPrimaryButtonVisible();
  this.addLog('Verified detail screen visible');
});

Then('the detail action button {string} should be visible', async function (this: World, selector: string) {
  const activePage = resolveActivePage(this, 'rawPage');
  await expect(activePage.rawPage.locator(selector).first()).toBeVisible({ timeout: 10000 });
  this.addLog(`Verified detail action button "${selector}" visible`);
});

Then('the options menu {string} should be visible', async function (this: World, selector: string) {
  const activePage = resolveActivePage(this, 'rawPage');
  await expect(activePage.rawPage.locator(selector).first()).toBeVisible({ timeout: 10000 });
  this.addLog(`Verified options menu "${selector}" visible`);
});

// ── Shared form steps ────────────────────────────────────────────────────────

When('I click the Add New button', async function (this: World) {
  const activePage = resolveActivePage(this, 'clickAddNew');
  await activePage.clickAddNew();
  this.addLog('Clicked Add New button');
});

When('I click the Save button', async function (this: World) {
  const activePage = resolveActivePage(this, 'clickSave');
  await activePage.clickSave();
  this.addLog('Clicked Save button');
});

When('I click the Cancel button', async function (this: World) {
  const activePage = resolveActivePage(this, 'clickCancel');
  await activePage.clickCancel();
  this.addLog('Clicked Cancel button');
});

Then('the form should be visible', async function (this: World) {
  const activePage = resolveActivePage(this, 'verifyFormVisible');
  await activePage.verifyFormVisible();
  this.addLog('Verified form visible');
});

Then('the form should be closed', async function (this: World) {
  const activePage = resolveActivePage(this, 'verifyFormClosed');
  await activePage.verifyFormClosed();
  this.addLog('Verified form closed');
});

// ── Shared validation steps ──────────────────────────────────────────────────

Then('a validation error with message {string} should be visible', async function (this: World, message: string) {
  const activePage = resolveActivePage(this, 'verifyValidationError');
  await activePage.verifyValidationError(message);
  this.addLog(`Verified validation error: "${message}"`);
});

Then('the dialog should remain open', async function (this: World) {
  const activePage = resolveActivePage(this, 'verifyFormVisible');
  await activePage.verifyFormVisible();
  this.addLog('Verified dialog remains open');
});
