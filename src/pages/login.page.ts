/**
 * LoginPage — models the full 4-step Plaza Manager authentication flow.
 *
 * REAL FLOW (confirmed from auth-setup.ts execution log):
 *
 *  Step 1 — Plaza Angular shell  (https://staging.tahseel.gov.ae/ManagePortal)
 *            Button: button span[translate="Login.Continue"]
 *            → redirects to Identity Server VerifyUsername page
 * https://stgmasar.srta.gov.ae/masar-sso/Users/VerifyUsername?ReturnUrl=
 *  Step 2 — Identity Server VerifyUsername page
 *            (https://stgmasar.srta.gov.ae/masar-sso//Users/VerifyUsername?...)
 *            Form: input#Username  +  button#submitButton
 *            → redirects to UnifiedLogin page
 *
 *  Step 3 — Identity Server UnifiedLogin page
 *            (https://stgmasar.srta.gov.ae/masar-sso//Users/UnifiedLogin)
 *            Form: input#Password  +  button#submitButton
 *            → redirects to https://staging.tahseel.gov.ae/ManagePortal-result?code=...
 *
 *  Step 4 — Angular app processes the code and redirects to /dashboard
 *
 * IMPORTANT:
 *  • The identity server uses a self-signed TLS cert — ignoreHTTPSErrors must
 *    be set on the browser context (done in BrowserFixture).
 *  • Never use waitForLoadState('networkidle') — the Angular app polls
 *    continuously and never reaches idle.
 *  • All waits are anchored to specific DOM elements.
 */

import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { config } from '../config/config';

export class LoginPage extends BasePage {

  // ── Step 1: Plaza Angular shell ────────────────────────────────────────────
  readonly loginUrl = `${config.baseUrl.replace(/\/$/, '')}/`;

  /**
   * Derives the direct identity entry URL.
   * Prefers IDENTITY_SERVER_URL from config (e.g. http://192.168.5.110/etc-identity).
   * Falls back to same-origin /masar-sso for the staging environment.
   */
  get directIdentityUrl(): string {
    const base = config.identityServerUrl
      ? config.identityServerUrl.replace(/\/$/, '')
      : `${new URL(this.loginUrl).origin}/masar-sso`;
    return `${base}/Users/VerifyUsername`;
  }

  /** Regex that matches any identity server VerifyUsername or UnifiedLogin path. */
  get identityPathPattern(): RegExp {
    if (config.identityServerUrl) {
      // e.g. /etc-identity/Users/VerifyUsername or /etc-identity/Users/UnifiedLogin
      const pathSegment = new URL(config.identityServerUrl).pathname.replace(/\/$/, '');
      return new RegExp(`${pathSegment}/Users/(VerifyUsername|UnifiedLogin)`, 'i');
    }
    return /\/masar-sso\/Users\/(VerifyUsername|UnifiedLogin)/i;
  }

  // The Angular template renders a span with translate="Login.Continue" inside
  // the submit button.  This is the ONLY reliable selector for the Continue btn.
  readonly continueButton = [
    'button span[translate="Login.Continue"]',
    'button:has-text("Continue")',
    'a:has-text("Continue")',
  ].join(', ');
  // ── Step 2: Identity Server — VerifyUsername page ──────────────────────────
  // URL pattern: /masar-sso/Users/VerifyUsername
  readonly signInH1 = 'h1';
  readonly accountLoginH2 = 'h2';
  readonly usernameInput = [
    'input#Username',
    'input[name="Username"]',
    'input[placeholder*="username" i]',
  ].join(', ');
  readonly usernameLabel = 'label[for="Username"]';
  readonly registerLink = 'a.btn.btn-outline-secondary';
  readonly forgotPasswordLink = 'a.btn.btn-link';
  readonly uaePassImage = 'img[alt="UAE Pass Login"]';
  // Submit on VerifyUsername page
  readonly verifyUsernameBtn = [
    'button#submitButton',
    'button[type="submit"]',
    'button:has-text("Continue")',
    'button:has-text("Next")',
  ].join(', ');

  // ── Step 3: Identity Server — UnifiedLogin page ────────────────────────────
  // URL pattern: /masar-sso/Users/UnifiedLogin
  readonly passwordInput = [
    'input#Password',
    'input[name="Password"]',
    'input[placeholder*="password" i]',
  ].join(', ');
  readonly passwordLabel = 'label[for="Password"]';
  // Submit on UnifiedLogin page (same id as VerifyUsername)
  readonly submitButton = [
    'button#submitButton',
    'button[type="submit"]',
    'button:has-text("Sign In")',
    'button:has-text("Login")',
  ].join(', ');
  readonly submitTxt = 'span#submitText';
  readonly dashboardTitle = "[class*='subheader__title']";

  // ── Error indicators (any identity server page) ────────────────────────────
  readonly errorMessage =
    'div.toast-message, div.validation-summary-errors, span.field-validation-error, ' +
    'div.alert-danger, p.text-danger, ul.list-unstyled li, ' +
    '.error-message, div[class*="error"], span[class*="error"], ' +
    '.invalid-feedback, div.alert';

  // ── Post-login sentinel ────────────────────────────────────────────────────
  readonly dashboardSentinel = 'app-sidebar, #kt_app_sidebar, nav[class*="sidebar"]';

  constructor(page: Page) {
    super(page);
  }

  // ─── Step 1: Navigate & Continue ──────────────────────────────────────────

  async navigateToLogin(): Promise<void> {
    await this.gotoWithRetry(this.loginUrl, config.timeout);

    // Detect and clear the ASP.NET JsonReaderException error page before
    // attempting any further interaction — this is the primary blocker
    await this._clearErrorPageIfPresent();

    // Wait for either the Angular shell Continue button OR the identity form
    await Promise.race([
      this.page.locator(this.continueButton).first()
        .waitFor({ state: 'visible', timeout: 20000 })
        .catch(() => { }),
      this.page.locator(this.usernameInput).first()
        .waitFor({ state: 'visible', timeout: 20000 })
        .catch(() => { }),
    ]);
  }

  /**
   * Detects the ASP.NET JsonReaderException error page and recovers from it.
   * The error occurs when the identity server receives a malformed/stale request.
   * Recovery: navigate directly to the identity server VerifyUsername page.
   *
   * Retries up to 3 times with increasing delays.
   */
  private async _clearErrorPageIfPresent(maxRetries = 3): Promise<void> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const isErrorPage = await this.page.locator('body')
        .evaluate((body: HTMLElement) =>
          body.innerText.includes('JsonReaderException') ||
          body.innerText.includes('An unhandled exception') ||
          body.innerText.includes('StackNewtonsoft') ||
          body.innerText.includes('UsersController')
        )
        .catch(() => false);

      if (!isErrorPage) return; // page is clean

      console.warn(
        `[LoginPage] ASP.NET error page detected (attempt ${attempt + 1}/${maxRetries}) — ` +
        `navigating directly to identity server...`
      );

      // Wait briefly before retrying to let the server recover
      if (attempt > 0) await this.page.waitForTimeout(attempt * 1500);

      // Navigate directly to the identity server entry URL, bypassing the
      // Angular shell that triggered the bad request
      const success = await this.gotoWithRetry(
        this.directIdentityUrl,
        Math.max(config.timeout, 60000)
      );

      if (!success) {
        console.warn(`[LoginPage] Direct navigation to identity server failed on attempt ${attempt + 1}`);
        continue;
      }

      // Check if the error page is gone
      const stillError = await this.page.locator('body')
        .evaluate((body: HTMLElement) =>
          body.innerText.includes('JsonReaderException') ||
          body.innerText.includes('An unhandled exception')
        )
        .catch(() => false);

      if (!stillError) return; // recovered successfully
    }

    // All retries exhausted — throw a clear error
    throw new Error(
      `[LoginPage] ASP.NET error page persisted after ${maxRetries} recovery attempts. ` +
      `URL: ${this.page.url()}. ` +
      `The identity server at "${this.directIdentityUrl}" may be down or misconfigured.`
    );
  }

  async verifyLoginPageUrl(): Promise<void> {
    await expect(this.page).toHaveURL(/\/auth\/login/);
  }

  async verifySecureCanonicalEntryUrl(): Promise<void> {
    const current = new URL(this.page.url());
    // Local dev environments use http — only enforce https on non-local environments
    const isLocalEnv = current.hostname === 'localhost' ||
      /^192\.168\.|^10\.|^172\.(1[6-9]|2\d|3[01])\./.test(current.hostname);
    if (!isLocalEnv) {
      expect(current.protocol).toBe('https:');
    }
    const isCanonicalMasar = current.pathname.startsWith('/masar');
    const isIdentityEntry = this.identityPathPattern.test(current.pathname);
    const isAuthPath = current.pathname.includes('/auth/') || current.pathname.includes('/identity');
    expect(isCanonicalMasar || isIdentityEntry || isAuthPath).toBe(true);
  }

  async verifyContinueButtonVisible(): Promise<void> {
    const hasContinue = await this.page.locator(this.continueButton).first().isVisible().catch(() => false);
    const hasIdentityForm = await this.page.locator(this.usernameInput).first().isVisible().catch(() => false);
    expect(hasContinue || hasIdentityForm).toBe(true);
  }

  /**
   * Clicks the Continue button and waits until the identity server form is
   * FULLY ready — all three elements visible and stable:
   *   • input#Username
   *   • input#Password
   *   • button#submitButton (enabled)
   *
   * This guards against performance degradation where the page loads partially
   * and credential fill() calls land on elements that aren't interactive yet.
   */
  async clickContinue(): Promise<void> {
    const continueButton = this.page.locator(this.continueButton).first();
    const continueVisible = await continueButton.isVisible().catch(() => false);
    if (continueVisible) {
      await expect(continueButton).toBeEnabled();
      await continueButton.click();
    }
    await this.waitForAuthenticationEntry();
  }

  // ─── Step 2: VerifyUsername page ──────────────────────────────────────────

  async verifyIdentityServerLoaded(): Promise<void> {
    await this.waitForAuthenticationEntry();
    await expect(this.page).toHaveURL(this.identityPathPattern);
  }

  async verifySignInHeading(): Promise<void> {
    await expect(this.page.locator(this.signInH1).first()).toContainText('Sign In');
  }

  async verifyAccountLoginHeading(): Promise<void> {
    await expect(this.page.locator(this.accountLoginH2).first()).toContainText('Account Login');
  }

  async verifyUsernameLabel(): Promise<void> {
    await expect(this.page.locator(this.usernameLabel)).toBeVisible();
  }

  async verifyUsernameInputVisible(): Promise<void> {
    await expect(this.page.locator(this.usernameInput)).toBeVisible();
  }

  async verifyRegisterLinkTag(): Promise<void> {
    await expect(
      this.page.locator(this.registerLink).filter({ hasText: 'Register' })
    ).toBeVisible();
  }

  async verifyRegisterLinkHref(): Promise<void> {
    const href = await this.page
      .locator(this.registerLink)
      .filter({ hasText: 'Register' })
      .getAttribute('href');
    expect(href).toContain('/masar-sso/Users/Register?');
  }

  async verifyForgotPasswordLinkTag(): Promise<void> {
    await expect(
      this.page.locator(this.forgotPasswordLink).filter({ hasText: 'ForgotPassword' })
    ).toBeVisible();
  }

  async verifyForgotPasswordLinkHref(): Promise<void> {
    const href = await this.page
      .locator(this.forgotPasswordLink)
      .filter({ hasText: 'ForgotPassword' })
      .getAttribute('href');
    expect(href).toContain('/masar-sso/Users/ForgotPassword?');
  }

  async verifyUaePassImageVisible(): Promise<void> {
    await expect(this.page.locator(this.uaePassImage)).toBeVisible();
  }

  async verifyUaePassLinkHref(): Promise<void> {
    const href = await this.page
      .locator(this.uaePassImage)
      .locator('xpath=ancestor::a')
      .getAttribute('href');
    expect(href).toContain('/masar-sso/Users/UAEPassLogin?');
  }

  /**
   * Fills the username field and clicks submit on the VerifyUsername page.
   * Waits for either the UnifiedLogin page (success) or an error (failure).
   */
  async enterUsernameAndSubmit(username: string): Promise<void> {
    const usernameInput = this.page.locator(this.usernameInput).first();
    await usernameInput.waitFor({ state: 'visible', timeout: config.timeout });
    await usernameInput.clear();
    await usernameInput.fill(username);

    const hasPasswordInput = await this.page.locator(this.passwordInput).first().isVisible().catch(() => false);
    if (hasPasswordInput) return;

    await this.page.locator(this.verifyUsernameBtn).first().click();
    // Wait for either the UnifiedLogin page or an error on the same page
    await Promise.race([
      this.page.waitForURL(/UnifiedLogin/i, { timeout: config.timeout }),
      this.page.locator(this.errorMessage).first().waitFor({ state: 'visible', timeout: config.timeout }),
    ]).catch(() => { });
  }

  // ─── Step 3: UnifiedLogin page ────────────────────────────────────────────

  async verifyUnifiedLoginLoaded(): Promise<void> {
    await expect(this.page.locator(this.passwordInput).first()).toBeVisible({ timeout: 20000 });
  }

  async verifyPasswordLabel(): Promise<void> {
    await expect(this.page.locator(this.passwordLabel)).toBeVisible();
  }

  async verifyPasswordInputVisible(): Promise<void> {
    await expect(this.page.locator(this.passwordInput).first()).toBeVisible();
  }

  /**
   * Fills the password field and clicks submit on the UnifiedLogin page.
   * Waits for either the redirect back to the Angular app (success) or
   * an error message on the same page (failure).
   */
  async enterPasswordAndSubmit(password: string): Promise<void> {
    const passwordInput = this.page.locator(this.passwordInput).first();
    await passwordInput.waitFor({ state: 'visible', timeout: config.timeout });
    await passwordInput.clear();
    await passwordInput.fill(password);
    await this.page.locator(this.submitButton).first().click();
    await Promise.race([
      // Success: URL leaves the identity server
      this.page.waitForURL(
        (url) => !this.identityPathPattern.test(url.pathname),
        { timeout: config.timeout }
      ),
      // Failure: error message appears on the same page
      this.page.locator(this.errorMessage).first().waitFor({ state: 'visible', timeout: config.timeout }),
    ]).catch(() => { });
  }

  // ─── Post-login assertions ─────────────────────────────────────────────────

  async verifyRedirectedToDashboard(): Promise<void> {
    await this.page.waitForURL('**/dashboard', { timeout: config.timeout });
    await this.page.waitForSelector(this.dashboardSentinel, { timeout: 20000 });
  }

  async verifyDashboardUrl(): Promise<void> {
    await expect(this.page).toHaveURL(/\/dashboard/);
  }

  async verifyOnLoginPage(): Promise<void> {
    // After an unauthenticated redirect the app lands on /auth/login.
    // Angular needs a moment to bootstrap and render the Continue button.
    // We wait up to 15 s for either the Plaza shell Continue button OR
    // the identity server username input — whichever appears first.
    const found = await Promise.race([
      this.page.locator(this.continueButton).first()
        .waitFor({ state: 'visible', timeout: 15000 })
        .then(() => true)
        .catch(() => false),
      this.page.locator(this.usernameInput).first()
        .waitFor({ state: 'visible', timeout: 15000 })
        .then(() => true)
        .catch(() => false),
    ]);
    expect(found).toBe(true);
  }

  async verifyRemainsOnIdentityServerPage(): Promise<void> {
    // After a failed submit the user stays on the identity server —
    // either the VerifyUsername or UnifiedLogin page is still visible.
    const onVerify = await this.page.locator(this.usernameInput).first().isVisible().catch(() => false);
    const onUnified = await this.page.locator(this.passwordInput).first().isVisible().catch(() => false);
    expect(onVerify || onUnified).toBe(true);
  }

  async verifyDisabledSignInButton(): Promise<void> {
    // Give the page time to render the error after form submission
    await this.page.waitForTimeout(1000);
    await expect(this.page.locator(this.submitButton).first()).toBeDisabled({ timeout: 20000 });
  }

  async verifyValidationMessageDisplayed(): Promise<void> {
    // Give the page time to render the error after form submission
    await this.page.waitForTimeout(1000);
    await expect(this.page.locator(this.errorMessage).first()).toBeVisible({ timeout: 20000 });
  }

  async verifySubmitBtnNotEnabled(): Promise<void> {
    // The identity server disables the submit button when required fields are empty.
    // We check that the button is either disabled or not present as enabled.
    const btn = this.page.locator(this.submitButton).first();
    await btn.waitFor({ state: 'visible', timeout: 10000 });
    await expect(btn).toBeDisabled();
  }

  async waitForAuthenticationEntry(): Promise<void> {
    // First: clear any ASP.NET error page that may be blocking the identity form
    await this._clearErrorPageIfPresent();

    // Use a reasonable per-attempt timeout — the local identity server can be slow
    const perAttemptTimeout = Math.min(Math.max(config.timeout, 30000), 60000);

    const detectEntry = async (): Promise<boolean> => {
      const usernameFound = await this.page
        .locator(this.usernameInput)
        .first()
        .waitFor({ state: 'visible', timeout: perAttemptTimeout })
        .then(() => true)
        .catch(() => false);

      if (usernameFound) return true;

      const passwordFound = await this.page
        .locator(this.passwordInput)
        .first()
        .waitFor({ state: 'visible', timeout: perAttemptTimeout })
        .then(() => true)
        .catch(() => false);

      return passwordFound;
    };

    // Attempt 1: wait on the current page (may already be on identity server)
    let found = await detectEntry();
    if (found) return;

    // Check for error page between attempts
    await this._clearErrorPageIfPresent();

    // Attempt 2: click Continue if the Angular shell is still showing it
    const continueBtn = this.page.locator(this.continueButton).first();
    const continueVisible = await continueBtn.isVisible({ timeout: 5000 }).catch(() => false);
    if (continueVisible) {
      await continueBtn.click().catch(() => { });
      await this._clearErrorPageIfPresent();
      found = await detectEntry();
      if (found) return;
    }

    // Attempt 3: navigate directly to the identity server entry URL
    await this.gotoWithRetry(this.directIdentityUrl, perAttemptTimeout);
    await this._clearErrorPageIfPresent();
    found = await detectEntry();
    if (found) return;

    throw new Error(
      `Authentication entry screen not detected at URL: ${this.page.url()}\n` +
      `Tried: current page, Continue button click, direct navigation to ${this.directIdentityUrl}\n` +
      `Identity server URL configured: ${config.identityServerUrl || '(none — using fallback)'}`
    );
  }

  private async gotoWithRetry(url: string, timeout: number): Promise<boolean> {
    const attempts = [
      { waitUntil: 'load' as const, timeout },
      { waitUntil: 'domcontentloaded' as const, timeout: Math.max(30000, Math.floor(timeout * 0.75)) },
      { waitUntil: 'domcontentloaded' as const, timeout: Math.max(20000, Math.floor(timeout * 0.5)) },
    ];

    for (let i = 0; i < attempts.length; i++) {
      const attempt = attempts[i];
      try {
        await this.page.goto(url, { waitUntil: attempt.waitUntil, timeout: attempt.timeout });
        return true;
      } catch (err) {
        console.warn(`[LoginPage] gotoWithRetry attempt ${i + 1}/${attempts.length} failed for "${url}": ${String(err)}`);
        if (i < attempts.length - 1) await this.page.waitForTimeout((i + 1) * 1000);
      }
    }
    return false;
  }

  /**
 * Verify dashboard Main Title contains specific text
 */
  async verifyDashboardTitleContains(text: string): Promise<void> {
    const h1Text = await this.page.locator(this.dashboardTitle).textContent();
    expect(h1Text).toContain(text);
  }
}
