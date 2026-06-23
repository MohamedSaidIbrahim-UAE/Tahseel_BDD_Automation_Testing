import { Given, When, Then, setDefaultTimeout } from '@cucumber/cucumber';
import { World } from '../fixtures/world.fixture';
import { expect } from '@playwright/test';

setDefaultTimeout(30_000);

// ─── Navigation ─────────────────────────────────────────────────────────────
Given('I navigate to the login page', async function (this: World) {
  if (!this.loginPage) throw new Error('LoginPage not initialised');
  await this.loginPage.navigateToLogin();
  this.addLog('Navigated to login page');
});

Then('the login page is fully loaded', async function (this: World) {
  if (!this.loginPage) throw new Error('LoginPage not initialised');
  await this.loginPage.waitForLoginFormReady();
  this.addLog('Login page loaded');
});

// ─── Positive login ─────────────────────────────────────────────────────────
When('I login with valid credentials', async function (this: World) {
  if (!this.loginPage) throw new Error('LoginPage not initialised');
  const username = process.env.APP_USERNAME;
  const password = process.env.APP_PASSWORD;
  if (!username || !password) throw new Error('APP_USERNAME/APP_PASSWORD not set');
  await this.loginPage.login(username, password);
  this.addLog('Logged in with valid credentials');
});

Then('I should be redirected to the dashboard', async function (this: World) {
  if (!this.loginPage) throw new Error('LoginPage not initialised');
  await this.loginPage.verifyRedirectedToDashboard();
});

Then('the dashboard URL should contain {string}', async function (this: World, text: string) {
  if (!this.loginPage) throw new Error('LoginPage not initialised');
  expect(this.loginPage.rawPage.url()).toContain(text);
});

Then('the main heading should display {string}', async function (this: World, text: string) {
  if (!this.loginPage) throw new Error('LoginPage not initialised');
  await expect(this.loginPage.rawPage.locator('h1')).toContainText(text);
});

// ─── Logout ─────────────────────────────────────────────────────────────────
Given('I am logged in', async function (this: World) {
  if (!this.authManager) throw new Error('LoginPage not initialised');
  await this.authManager.ensureAuthenticated();
  this.addLog('User is authenticated');
});

When('I click the Logout button', async function (this: World) {
  if (!this.loginPage) throw new Error('LoginPage not initialised');
  await this.loginPage.clickLogout();
});

Then('I should be redirected to the login page', async function (this: World) {
  if (!this.loginPage) throw new Error('LoginPage not initialised');
  await this.loginPage.verifyOnLoginPage();
});

// ─── Empty / invalid credentials ────────────────────────────────────────────
When('I leave the username empty and submit', async function (this: World) {
  if (!this.loginPage) throw new Error('LoginPage not initialised');
  await this.loginPage.enterUsername('');
  await this.loginPage.submitLoginForm();
});

When('I enter a valid username but leave the password empty', async function (this: World) {
  if (!this.loginPage) throw new Error('LoginPage not initialised');
  const username = process.env.APP_USERNAME;
  if (!username) throw new Error('APP_USERNAME not set');
  await this.loginPage.enterUsername(username);
  await this.loginPage.enterPassword('');
});

When('I submit the login form', async function (this: World) {
  if (!this.loginPage) throw new Error('LoginPage not initialised');
  await this.loginPage.submitLoginForm();
});

// Then('the submit button should be disabled', async function (this: World) {
//     if (!this.loginPage) throw new Error('LoginPage not initialised');
//   await expect(this.loginPage.submitButton).tobeE();
// });

Then('I should remain on the login page', async function (this: World) {
  if (!this.loginPage) throw new Error('LoginPage not initialised');
  await this.loginPage.verifyOnLoginPage();
});

When('I attempt to login with invalid credentials', async function (this: World) {
  if (!this.loginPage) throw new Error('LoginPage not initialised');
  await this.loginPage.login('invalidUser', 'invalidPass');
});

Then('an error message should be displayed', async function (this: World) {
  if (!this.loginPage) throw new Error('LoginPage not initialised');

  await expect(this.loginPage.errorMessage).toBe('visible');
});

// ─── Unauthenticated access ─────────────────────────────────────────────────
Given('I am not authenticated', async function (this: World) {
  const context = this.getContext();
  if (context) {
    await context.clearCookies();
    await context.clearPermissions();
  }
  this.addLog('Cleared authentication state');
});

When('I navigate directly to {string}', async function (this: World, path: string) {
  if (!this.loginPage) throw new Error('LoginPage not initialised');
  const baseUrl = process.env.BASE_URL || 'https://app.enterprise.com';
  await this.loginPage.rawPage.goto(`${baseUrl}${path}`);
});

// ─── Session management ─────────────────────────────────────────────────────
When('I refresh the browser page', async function (this: World) {
  if (!this.loginPage) throw new Error('LoginPage not initialised');
  await this.loginPage.rawPage.reload();
});

Then('I should remain on the dashboard', async function (this: World) {
  if (!this.loginPage) throw new Error('LoginPage not initialised');
  await this.loginPage.verifyRedirectedToDashboard();
});

When('I open a new browser tab', async function (this: World) {
  const newPage = await this.getContext()!.newPage();
  this.setPage(newPage);
});

Then('I should see the dashboard without logging in again', async function (this: World) {
  if (!this.loginPage) throw new Error('LoginPage not initialised');
  await this.loginPage.verifyRedirectedToDashboard();
});

Given('I have an expired authentication token', async function (this: World) {
  if (!this.loginPage) throw new Error('LoginPage not initialised');
  // Simulate an expired token by clearing localStorage but keeping cookies
  await this.loginPage.rawPage.evaluate(() => localStorage.removeItem('authToken'));
});

When('I attempt to access the dashboard', async function (this: World) {
  await this.loginPage?.rawPage.goto(`${process.env.BASE_URL}/dashboard`);
});

// ─── Security attempts ──────────────────────────────────────────────────────
When('I enter the username {string}', async function (this: World, username: string) {
  if (!this.loginPage) throw new Error('LoginPage not initialised');
  await this.loginPage.enterUsername(username);
});

When('I enter a valid password', async function (this: World) {
  if (!this.loginPage) throw new Error('LoginPage not initialised');
  const password = process.env.APP_PASSWORD;
  if (!password) throw new Error('APP_PASSWORD not set');
  await this.loginPage.enterPassword(password);
});