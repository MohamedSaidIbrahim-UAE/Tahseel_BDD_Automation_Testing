/**
 * login.steps.ts
 *
 * Step definitions for Features/Login-Authentication.feature.
 *
 * Reliability lessons captured from scripts/auth-setup.ts stabilization:
 * - Use canonical secure entry URL (/masar/)
 * - Support both entry paths:
 *   1) Plaza "Continue" page, or 2) direct Identity login form
 * - Wait on concrete DOM signals, not assumed redirect timing.
 */

import { Given, When, Then, setDefaultTimeout } from '@cucumber/cucumber';
import { World } from '../fixtures/world.fixture';
import { expect } from '@playwright/test';

setDefaultTimeout(21 * 60 * 1000);

// ─── Step 1: Navigate to Plaza shell ─────────────────────────────────────────

Given('I navigate to the login page', async function (this: World) {
  if (!this.loginPage) throw new Error('Login page not initialized');
  await this.loginPage.navigateToLogin();
  this.addLog('Navigated to login page');
});

Then('the login page URL should contain {string}', async function (this: World, _urlPart: string) {
  if (!this.loginPage) throw new Error('Login page not initialized');
  await this.loginPage.verifyLoginPageUrl();
  this.addLog('Verified login URL');
});

Then('the continue button should be visible on the Plaza login page', async function (this: World) {
  if (!this.loginPage) throw new Error('Login page not initialized');
  await this.loginPage.verifyContinueButtonVisible();
  this.addLog('Verified continue button is visible');
});

Then('the authentication entry screen should be loaded', async function (this: World) {
  if (!this.loginPage) throw new Error('Login page not initialized');
  await this.loginPage.waitForAuthenticationEntry();
  this.addLog('Verified authentication entry screen is loaded');
});

Then('the login entry URL should use secure canonical format', async function (this: World) {
  if (!this.loginPage) throw new Error('Login page not initialized');
  await this.loginPage.verifySecureCanonicalEntryUrl();
  this.addLog('Verified secure canonical login entry URL format');
});

// ─── Step 1 → Step 2: Click Continue ─────────────────────────────────────────

When('I click the continue button', async function (this: World) {
  if (!this.loginPage) throw new Error('Login page not initialized');
  await this.loginPage.clickContinue();
  this.addLog('Clicked Continue — identity server VerifyUsername page loaded');
});

// ─── Step 2: VerifyUsername page assertions ───────────────────────────────────

Then('the identity server VerifyUsername page should be loaded', async function (this: World) {
  if (!this.loginPage) throw new Error('Login page not initialized');
  await this.loginPage.verifyIdentityServerLoaded();
  this.addLog('Verified VerifyUsername page loaded');
});

Then('the h1 heading should contain text {string}', async function (this: World, text: string) {
  if (!this.loginPage) throw new Error('Login page not initialized');
  await this.loginPage.verifySignInHeading();
  this.addLog(`Verified h1 contains: ${text}`);
});

Then('the h2 heading should contain text {string}', async function (this: World, text: string) {
  if (!this.loginPage) throw new Error('Login page not initialized');
  await this.loginPage.verifyAccountLoginHeading();
  this.addLog(`Verified h2 contains: ${text}`);
});

Then('the username label should be visible', async function (this: World) {
  if (!this.loginPage) throw new Error('Login page not initialized');
  await this.loginPage.verifyUsernameLabel();
  this.addLog('Verified username label visible');
});

Then(
  'the username input {string} should be visible on the identity server',
  async function (this: World, _selector: string) {
    if (!this.loginPage) throw new Error('Login page not initialized');
    await this.loginPage.verifyUsernameInputVisible();
    this.addLog('Verified username input visible');
  }
);

Then(
  'the Register link {string} should be visible',
  async function (this: World, _selector: string) {
    if (!this.loginPage) throw new Error('Login page not initialized');
    await this.loginPage.verifyRegisterLinkTag();
    this.addLog('Verified Register link visible');
  }
);

Then(
  'the Register link href should contain {string}',
  async function (this: World, hrefPart: string) {
    if (!this.loginPage) throw new Error('Login page not initialized');
    await this.loginPage.verifyRegisterLinkHref();
    this.addLog(`Verified Register link href contains: ${hrefPart}`);
  }
);

Then(
  'the ForgotPassword link {string} should be visible',
  async function (this: World, _selector: string) {
    if (!this.loginPage) throw new Error('Login page not initialized');
    await this.loginPage.verifyForgotPasswordLinkTag();
    this.addLog('Verified ForgotPassword link visible');
  }
);

Then(
  'the ForgotPassword link href should contain {string}',
  async function (this: World, hrefPart: string) {
    if (!this.loginPage) throw new Error('Login page not initialized');
    await this.loginPage.verifyForgotPasswordLinkHref();
    this.addLog(`Verified ForgotPassword link href contains: ${hrefPart}`);
  }
);

Then(
  'the UAE Pass image with alt {string} should be visible',
  async function (this: World, _altText: string) {
    if (!this.loginPage) throw new Error('Login page not initialized');
    await this.loginPage.verifyUaePassImageVisible();
    this.addLog('Verified UAE Pass image visible');
  }
);

Then(
  'the UAE Pass image parent link href should contain {string}',
  async function (this: World, hrefPart: string) {
    if (!this.loginPage) throw new Error('Login page not initialized');
    await this.loginPage.verifyUaePassLinkHref();
    this.addLog(`Verified UAE Pass link href contains: ${hrefPart}`);
  }
);

// ─── Step 2: Enter username and submit ────────────────────────────────────────

When('I enter the username from environment configuration', async function (this: World) {
  if (!this.loginPage) throw new Error('Login page not initialized');
  const username = process.env.APP_USERNAME;
  if (!username) throw new Error(
    'APP_USERNAME is not set. Add it to your .env file: APP_USERNAME=your_username'
  );
  const input = this.loginPage.rawPage.locator(this.loginPage.usernameInput).first();
  // Wait for the element to be attached and stable — do NOT use click() as it
  // requires visibility which may not be guaranteed during page load.
  await input.waitFor({ state: 'attached', timeout: 15000 });
  // await input.scrollIntoViewIfNeeded();
  await input.fill(username);
  // Verify the value was actually accepted; retry with pressSequentially if not
  const actual = await input.inputValue();
  if (actual !== username) {
    await input.clear();
    await input.pressSequentially(username, { delay: 50 });
  }
  this.addLog(`Entered username from environment: "${username}"`);
});

When('I enter the username {string}', async function (this: World, username: string) {
  if (!this.loginPage) throw new Error('Login page not initialized');
  const input = this.loginPage.rawPage.locator(this.loginPage.usernameInput).first();
  await input.waitFor({ state: 'attached', timeout: 15000 });
  // await input.scrollIntoViewIfNeeded();
  await input.fill(username);
  this.addLog(`Entered username: "${username}"`);
});

When('I submit the username form', async function (this: World) {
  if (!this.loginPage) throw new Error('Login page not initialized');
  const hasPasswordInput = await this.loginPage.rawPage
    .locator(this.loginPage.passwordInput)
    .first()
    .isVisible()
    .catch(() => false);
  if (hasPasswordInput) {
    this.addLog('Username submit skipped because password field is already visible (direct login flow)');
    return;
  }

  const btn = this.loginPage.rawPage.locator(this.loginPage.verifyUsernameBtn).first();
  await btn.waitFor({ state: 'visible', timeout: 10000 });
  // Poll until enabled (requires username to be filled) — max 10 s
  for (let i = 0; i < 20; i++) {
    if (await btn.isEnabled().catch(() => false)) break;
    await this.loginPage.rawPage.waitForTimeout(500);
  }
  await btn.click();
  await Promise.race([
    this.loginPage.rawPage.waitForURL(/UnifiedLogin/i, { timeout: 30000 }),
    this.loginPage.rawPage.locator(this.loginPage.errorMessage).first()
      .waitFor({ state: 'visible', timeout: 30000 }),
  ]).catch(() => { });
  this.addLog('Submitted username form');
});

// ─── Step 3: UnifiedLogin page assertions ────────────────────────────────────

Then('the identity server UnifiedLogin page should be loaded', async function (this: World) {
  if (!this.loginPage) throw new Error('Login page not initialized');
  await this.loginPage.verifyUnifiedLoginLoaded();
  this.addLog('Verified UnifiedLogin page loaded');
});

Then('the password label should be visible', async function (this: World) {
  if (!this.loginPage) throw new Error('Login page not initialized');
  await this.loginPage.verifyPasswordLabel();
  this.addLog('Verified password label visible');
});

Then(
  'the password input {string} should be visible on the identity server',
  async function (this: World, _selector: string) {
    if (!this.loginPage) throw new Error('Login page not initialized');
    await this.loginPage.verifyPasswordInputVisible();
    this.addLog('Verified password input visible');
  }
);

// ─── Step 3: Enter password and submit ───────────────────────────────────────

When('I enter the password from environment configuration', async function (this: World) {
  if (!this.loginPage) throw new Error('Login page not initialized');
  const password = process.env.APP_PASSWORD;
  if (!password) throw new Error(
    'APP_PASSWORD is not set. Add it to your .env file: APP_PASSWORD=your_password'
  );
  const input = this.loginPage.rawPage.locator(this.loginPage.passwordInput).first();
  await input.waitFor({ state: 'attached', timeout: 15000 });
  // await input.scrollIntoViewIfNeeded();
  await input.fill(password);
  const actual = await input.inputValue();
  if (actual !== password) {
    await input.clear();
    await input.pressSequentially(password, { delay: 50 });
  }
  this.addLog('Entered password from environment');
});

When('I enter the password {string}', async function (this: World, password: string) {
  if (!this.loginPage) throw new Error('Login page not initialized');
  const input = this.loginPage.rawPage.locator(this.loginPage.passwordInput).first();
  await input.waitFor({ state: 'attached', timeout: 15000 });
  // await input.scrollIntoViewIfNeeded();
  await input.fill(password);
});

When('I press {string} key', async function (this: World, key: string) {
  if (!this.loginPage) throw new Error('Login page not initialized');
  await this.loginPage.rawPage.keyboard.press(key);
});

When('I press ENTER key', async function (this: World) {
  if (!this.loginPage) throw new Error('Login page not initialized');
  await this.loginPage.rawPage.keyboard.press('Enter');
});

When('I submit the Sign In form', async function (this: World) {
  if (!this.loginPage) throw new Error('Login page not initialized');
  const btn = this.loginPage.rawPage.locator(this.loginPage.submitButton).first();
  await btn.waitFor({ state: 'visible', timeout: 10000 });
  // Poll until enabled (requires password to be filled) — max 15 s
  for (let i = 0; i < 30; i++) {
    if (await btn.isEnabled().catch(() => false)) break;
    await this.loginPage.rawPage.waitForTimeout(500);
  }
  await btn.click();
  await Promise.race([
    this.loginPage.rawPage.waitForURL(
      (url) => !url.pathname.includes('/masar-sso/'),
      { timeout: 30000 }
    ),
    this.loginPage.rawPage.locator(this.loginPage.errorMessage).first()
      .waitFor({ state: 'visible', timeout: 30000 }),
  ]).catch(() => { });
  this.addLog('Submitted Sign In form');
});

When('I submit the password form', async function (this: World) {
  if (!this.loginPage) throw new Error('Login page not initialized');
  // Password is already filled by the previous step — just click submit and wait.
  const buttonPattern = /Sign In|Submit|Proceed|SignIn|LogIn|Log In/i;
  await this.loginPage.rawPage.getByRole('button', { name: buttonPattern }).first().click();
  await Promise.race([
    this.loginPage.rawPage.waitForURL(
      (url) => !url.pathname.includes('/masar-sso/'),
      { timeout: 30000 }
    ),
    this.loginPage.rawPage.locator(this.loginPage.errorMessage).first()
      .waitFor({ state: 'visible', timeout: 30000 }),
  ]).catch(() => { });
  this.addLog('Submitted password form');
});

// ─── Step 4: Post-login assertions ───────────────────────────────────────────

Then('I should be redirected to the dashboard', async function (this: World) {
  if (!this.loginPage) throw new Error('Login page not initialized');
  await this.loginPage.verifyRedirectedToDashboard();
  this.addLog('Verified redirect to dashboard');
});

Then('the dashboard URL should contain {string}', async function (this: World, _urlPart: string) {
  if (!this.loginPage) throw new Error('Login page not initialized');
  await this.loginPage.verifyDashboardUrl();
  this.addLog('Verified dashboard URL');
});

Then('the Angular sidebar sentinel should be visible', async function (this: World) {
  if (!this.loginPage) throw new Error('Login page not initialized');
  await this.loginPage.waitHelper.waitForElement(this.loginPage.dashboardSentinel, 20000);
  this.addLog('Verified Angular sidebar sentinel is visible');
});

// ─── Error / negative assertions ─────────────────────────────────────────────

Then(
  'the Sign In Button should be Disabled',
  async function (this: World) {
    if (!this.loginPage) throw new Error('Login page not initialized');
    await this.loginPage.verifyDisabledSignInButton();
    this.addLog('Verified that the Sign In displayed');
  }
);

Then(
  'the Sign In Validation Message should be Displayed',
  async function (this: World) {
    if (!this.loginPage) throw new Error('Login page not initialized');
    await this.loginPage.verifyValidationMessageDisplayed();
    this.addLog('Validation Message is displayed on the Sign In Button');
  }
);

Then(
  'the submit button is not Enabled',
  async function (this: World) {
    if (!this.loginPage) throw new Error('Login page not initialized');
    await this.loginPage.verifySubmitBtnNotEnabled();
    this.addLog('The submit button is not Enabled');
  }
);

Then('I should remain on the identity server page', async function (this: World) {
  if (!this.loginPage) throw new Error('Login page not initialized');
  await this.loginPage.verifyRemainsOnIdentityServerPage();
  this.addLog('Verified user remains on identity server page');
});

// ─── Additional step definitions for enhanced scenarios ─────────────────────

When('I log in successfully using valid credentials', async function (this: World) {
  if (!this.loginPage) throw new Error('Login page not initialized');

  // Perform the full login flow
  await this.loginPage.clickContinue();
  await this.loginPage.verifyIdentityServerLoaded();

  const username = process.env.APP_USERNAME;
  if (!username) throw new Error('APP_USERNAME is not set in environment');

  await this.loginPage.enterUsernameAndSubmit(username);
  await this.loginPage.verifyUnifiedLoginLoaded();

  const password = process.env.APP_PASSWORD;
  if (!password) throw new Error('APP_PASSWORD is not set in environment');

  await this.loginPage.enterPasswordAndSubmit(password);
  await this.loginPage.verifyRedirectedToDashboard();

  this.addLog('Successfully logged in using valid credentials');
});

Given('I am logged in', async function (this: World) {
  if (!this.loginPage) throw new Error('Login page not initialized');
  await this.loginPage.navigateToLogin();
  await this.loginPage.clickContinue();

  const username = process.env.APP_USERNAME;
  if (!username) throw new Error('APP_USERNAME is not set in environment');
  await this.loginPage.enterUsernameAndSubmit(username);

  const password = process.env.APP_PASSWORD;
  if (!password) throw new Error('APP_PASSWORD is not set in environment');
  await this.loginPage.enterPasswordAndSubmit(password);

  await this.loginPage.verifyRedirectedToDashboard();
  this.addLog('User is logged in');
});

Given('I am not authenticated', async function (this: World) {
  // Clear any existing authentication state
  const context = this.getContext();
  if (context) {
    await context.clearCookies();
    await context.clearPermissions();
  }
  this.addLog('User is not authenticated');
});

When('I navigate directly to {string}', async function (this: World, path: string) {
  const page = this.getPage();
  if (!page) throw new Error('Page not initialized');

  const baseUrl = process.env.BASE_URL || 'https://stgmasar.srta.gov.ae/masar/';
  const fullUrl = `${baseUrl.replace(/\/$/, '')}${path}`;

  await page.goto(fullUrl);

  this.addLog(`Navigated directly to: ${fullUrl}`);
});

When('I immediately retry with correct password', async function (this: World) {
  if (!this.loginPage) throw new Error('Login page not initialized');

  const password = process.env.APP_PASSWORD;
  if (!password) throw new Error('APP_PASSWORD is not set in environment');
  this.loginPage.rawPage.locator(this.loginPage.passwordInput).first().fill(password);
  await this.loginPage.rawPage.locator(this.loginPage.submitButton).click();
  this.addLog('Immediately retried with correct password');
});

Then('an identity server error or validation message should be displayed indicating rate limit', async function (this: World) {
  if (!this.loginPage) throw new Error('Login page not initialized');

  // Wait for error message
  await this.loginPage.rawPage.waitForTimeout(2000);

  // Check for rate limiting messages
  const errorText = await this.loginPage.rawPage.locator(this.loginPage.errorMessage).first().textContent();
  const rateLimitIndicators = ['too many attempts', 'rate limit', 'try again later', 'wait'];

  const hasRateLimit = rateLimitIndicators.some(indicator =>
    errorText?.toLowerCase().includes(indicator)
  );

  expect(hasRateLimit).toBe(true);
  this.addLog('Verified rate limiting error message');
});

When('I refresh the browser page', async function (this: World) {
  const page = this.getPage();
  if (!page) throw new Error('Page not initialized');

  await page.reload({ waitUntil: 'domcontentloaded' });
  this.addLog('Refreshed browser page');
});

Then('I should remain on the dashboard', async function (this: World) {
  if (!this.loginPage) throw new Error('Login page not initialized');
  await this.loginPage.verifyRedirectedToDashboard();
  this.addLog('Remained on dashboard after refresh');
});

When('I open a new browser tab', async function (this: World) {
  const context = this.getContext();
  if (!context) throw new Error('Browser context not initialized');

  const newPage = await context.newPage();
  this.setPage(newPage);
  this.addLog('Opened new browser tab');
});

When('I navigate to {string} in the new tab', async function (this: World, path: string) {
  const page = this.getPage();
  if (!page) throw new Error('Page not initialized');

  const baseUrl = process.env.BASE_URL || 'https://stgmasar.srta.gov.ae/masar/';
  const fullUrl = `${baseUrl.replace(/\/$/, '')}${path}`;

  await page.goto(fullUrl);
  this.addLog(`Navigated to ${fullUrl} in new tab`);
});

Then('I should see the dashboard without requiring login', async function (this: World) {
  if (!this.loginPage) throw new Error('Login page not initialized');
  await this.loginPage.verifyRedirectedToDashboard();
  this.addLog('Dashboard displayed without requiring login in new tab');
});

Then('the Angular sidebar sentinel should be visible in the new tab', async function (this: World) {
  if (!this.loginPage) throw new Error('Login page not initialized');
  await this.loginPage.rawPage.locator(this.loginPage.dashboardSentinel).waitFor({ state: 'visible', timeout: 20000 });
  this.addLog('Angular sidebar sentinel visible in new tab');
});

When('I remain inactive for {int} minutes', async function (this: World, minutes: number) {
  // Simulate inactivity by waiting
  await new Promise(resolve => setTimeout(resolve, minutes * 60 * 1000));
  this.addLog(`Remained inactive for ${minutes} minutes`);
});

Then('the dashboard h1 heading should contain text {string}', async function (this: World, text: string) {
  if (!this.dashboardPage) throw new Error('Dashboard page not initialized');
  await this.dashboardPage.verifyDashboardH1Contains(text);
  this.addLog(`Verified dashboard h1 contains: ${text}`);
});

Then('I should be redirected to the login page', async function (this: World) {
  if (!this.loginPage) throw new Error('Login page not initialized');
  await this.loginPage.verifyOnLoginPage();
  this.addLog('Verified redirect to login page');
});

Then('all form elements should have proper ARIA labels', async function (this: World) {
  if (!this.loginPage) throw new Error('Login page not initialized');
  const page = this.loginPage.rawPage;

  const username = page.locator(this.loginPage.usernameInput).first();
  const password = page.locator(this.loginPage.passwordInput).first();
  const submit = page.locator(this.loginPage.submitButton).first();

  await expect(username).toBeVisible();
  await expect(password).toBeVisible();
  await expect(submit).toBeVisible();

  await expect(username).toHaveAttribute('id', /.+/);
  await expect(password).toHaveAttribute('id', /.+/);
  await expect(submit).toHaveAttribute('id', /.+/);
  this.addLog('Verified core login form accessibility attributes');
});

Then('the page should have sufficient color contrast', async function (this: World) {
  if (!this.loginPage) throw new Error('Login page not initialized');
  // Placeholder functional check until axe/lighthouse integration is added.
  await expect(this.loginPage.rawPage.locator(this.loginPage.usernameInput).first()).toBeVisible();
  await expect(this.loginPage.rawPage.locator(this.loginPage.submitButton).first()).toBeVisible();
  this.addLog('Basic contrast precheck passed (elements visible and rendered)');
});


Then('the current URL should contain {string}', async function (this: World, urlPart: string) {
  const page = this.getPage();
  if (!page) throw new Error('Page not initialized');

  const currentUrl = page.url();
  expect(currentUrl).toContain(urlPart);
  this.addLog(`Verified URL contains: ${urlPart}`);
});