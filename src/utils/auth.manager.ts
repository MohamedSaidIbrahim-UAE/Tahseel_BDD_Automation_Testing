/**
 * AuthManager — centralised authentication token and session management.
 *
 * Responsibilities:
 *  1. Read the `authToken` from the correct storageState JSON file for the
 *     current environment (origins → localStorage → name: "authToken").
 *  2. Provide the token as a Bearer header for API requests / interception.
 *  3. Detect when the app has redirected to the login screen (session expired).
 *  4. Perform a full re-login using credentials from the environment, then
 *     persist the refreshed storageState back to disk so future test runs
 *     reuse the new session without logging in again.
 */

import { Page, BrowserContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { config } from '../config/config';
import { retryWithBackoff } from './retry-helper';
import { ensureConnectionHealth } from './connection-health-check';

// ── Types ──────────────────────────────────────────────────────────────────────

interface StorageStateLocalStorageEntry {
  name: string;
  value: string;
}

interface StorageStateOrigin {
  origin: string;
  localStorage: StorageStateLocalStorageEntry[];
}

interface StorageStateFile {
  cookies: unknown[];
  origins: StorageStateOrigin[];
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Returns the absolute path to the storageState file for the current environment.
 * e.g. storageState.local.json | storageState.stage.json | storageState.production.json
 */
export function getStorageStatePath(): string {
  return path.join(process.cwd(), `storageState.${config.environment}.json`);
}

/**
 * Reads and parses the storageState JSON file.
 * Returns null if the file does not exist.
 */
function readStorageState(): StorageStateFile | null {
  const filePath = getStorageStatePath();
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as StorageStateFile;
  } catch {
    return null;
  }
}

/**
 * Extracts the value of a named localStorage entry from the storageState file.
 * Searches all origins and returns the first match.
 */
function getLocalStorageValue(state: StorageStateFile, name: string): string | null {
  for (const origin of state.origins) {
    const entry = origin.localStorage.find((e) => e.name === name);
    if (entry) return entry.value;
  }
  return null;
}

// ── AuthManager ────────────────────────────────────────────────────────────────

export class AuthManager {
  private readonly page: Page;
  private readonly context: BrowserContext;

  constructor(page: Page, context: BrowserContext) {
    this.page = page;
    this.context = context;
  }

  // ── Token resolution ─────────────────────────────────────────────────────────

  /**
   * Returns the `authToken` from the storageState file for the current environment.
   * This is the JWE/JWT token the Angular app stores in localStorage under "authToken".
   *
   * Falls back to reading it live from the browser's localStorage if the file
   * value is stale or missing.
   */
  async getAuthToken(): Promise<string> {
    // 1. Try the storageState file first (fast, no browser round-trip)
    const state = readStorageState();
    if (state) {
      const token = getLocalStorageValue(state, 'authToken');
      if (token) return token;
    }

    // 2. Fall back to reading from the live browser context
    const liveToken = await this.page.evaluate(() =>
      window.localStorage.getItem('authToken')
    ).catch(() => null);

    if (liveToken) return liveToken;

    throw new Error(
      `authToken not found in storageState.${config.environment}.json or browser localStorage. ` +
      `Run the auth setup script first: npm run auth:setup:${config.environment}`
    );
  }

  /**
   * Returns the standard Authorization header object for API requests.
   */
  async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getAuthToken();
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json, text/javascript, */*; q=0.01',
      'X-Requested-With': 'XMLHttpRequest',
    };
  }

  // ── Session detection ─────────────────────────────────────────────────────────

  /**
   * Returns true if the current page URL indicates the app has redirected to
   * the login / identity server screen (session expired).
   */
  isOnLoginScreen(): boolean {
    const url = this.page.url();
    return (
      url.includes('/auth/identity-login') ||
      url.includes('/auth/login') ||
      url.includes('/Users/VerifyUsername') ||
      url.includes('/Users/UnifiedLogin') ||
      url.includes('identity-login')
    );
  }

  /**
   * Checks whether the session is still valid by looking for the dashboard
   * sentinel element. Returns false if the login screen is shown instead.
   */
  async isSessionValid(): Promise<boolean> {
    if (this.isOnLoginScreen()) return false;

    // Check for the sidebar — present on every authenticated page.
    // The Tahseel Angular app uses kt_aside / kt_aside_menu (not app-sidebar).
    const sidebar = await this.page
      .locator('#kt_aside_menu, #kt_aside, app-sidebar, #kt_app_sidebar, nav[class*="sidebar"]')
      .first()
      .isVisible()
      .catch(() => false);

    return sidebar;
  }

  // ── Re-login and storageState refresh ─────────────────────────────────────────

  /**
   * Performs a full login using credentials from the environment variables,
   * then saves the refreshed storageState to disk.
   *
   * Called automatically by `ensureAuthenticated()` when the session has expired.
   */
  private getNavigationTimeout(): number {
    return config.environment === 'stage' ? 120000 : config.timeout;
  }

  private getUsernameLocator() {
    return this.page.locator(
      'input#Username, input[name="Username"], input[id*="user" i], input[name*="user" i], input[placeholder*="username" i]'
    ).first();
  }

  private getPasswordLocator() {
    return this.page.locator(
      'input#Password, input[name="Password"], input[id*="pass" i], input[name*="pass" i], input[placeholder*="password" i]'
    ).first();
  }

  async reLoginAndSaveState(): Promise<void> {
    const username = process.env.APP_USERNAME;
    const password = process.env.APP_PASSWORD;
    const baseUrl = config.baseUrl.replace(/\/$/, '');

    if (!username || !password) {
      throw new Error(
        'APP_USERNAME and APP_PASSWORD must be set in the environment to perform re-login.'
      );
    }

    console.log(`\n🔐 Session expired — performing re-login for environment: ${config.environment}`);

    // ── Step 0: If the ASP.NET error page is showing, reload to clear it ──────
    const isErrorPage = await this.page
      .locator('body')
      .evaluate((body: HTMLElement) =>
        body.innerText.includes('JsonReaderException') ||
        body.innerText.includes('An unhandled exception')
      )
      .catch(() => false);

    if (isErrorPage) {
      console.log('   ⚠️  ASP.NET error page detected — reloading...');
      await this.page.reload({ waitUntil: 'domcontentloaded', timeout: config.timeout }).catch(() => {});
    }

    // ── Step 1: Navigate to the app shell with retry logic ────────────────────
    const navigationTimeout = this.getNavigationTimeout();
    await retryWithBackoff(
      async () => {
        await ensureConnectionHealth(this.page).catch(() => {});
        return this.page.goto(`${baseUrl}/`, {
          waitUntil: config.environment === 'stage' ? 'networkidle' : 'domcontentloaded',
          timeout: navigationTimeout,
        });
      },
      {
        maxRetries: config.environment === 'stage' ? 5 : 3,
        initialDelay: 2000,
        onRetry: (attempt, error) => {
          this.addLog(`Re-login navigation retry ${attempt}: ${error.message}`);
        },
      }
    );

    // ── Step 2: Click Continue if the Angular shell is shown ───────────────────
    const continueBtn = this.page.locator(
      'button span[translate="Login.Continue"], button:has-text("Continue"), a:has-text("Continue")'
    ).first();

    const hasContinue = await continueBtn.isVisible({ timeout: 8000 }).catch(() => false);
    if (hasContinue) {
      await continueBtn.click();
    }

    // ── Step 3: Wait for the identity server username input ────────────────────
    const usernameInput = this.getUsernameLocator();
    await usernameInput.waitFor({ state: 'visible', timeout: navigationTimeout });
    await usernameInput.clear();
    await usernameInput.fill(username);

    // ── Step 4: Submit username (VerifyUsername page) ──────────────────────────
    const hasPasswordAlready = await this.page
      .locator('input#Password, input[name="Password"]')
      .first()
      .isVisible()
      .catch(() => false);

    if (!hasPasswordAlready) {
      await this.page.locator(
        'button#submitButton, button[type="submit"], button:has-text("Continue"), button:has-text("Next")'
      ).first().click();

      // Wait for UnifiedLogin page
      await Promise.race([
        this.page.waitForURL(/UnifiedLogin/i, { timeout: config.timeout }),
        this.page.locator('input#Password, input[name="Password"]').first()
          .waitFor({ state: 'visible', timeout: config.timeout }),
      ]).catch(() => {});
    }

    // ── Step 5: Fill password and submit ──────────────────────────────────────
    const passwordInput = this.getPasswordLocator();

    await passwordInput.waitFor({ state: 'visible', timeout: navigationTimeout });
    await passwordInput.clear();
    await passwordInput.fill(password);

    await this.page.locator(
      'button#submitButton, button[type="submit"], button:has-text("Sign In"), button:has-text("Login")'
    ).first().click();

    // ── Step 6: Wait for redirect back to the Angular app ─────────────────────
    // Wait until the URL leaves the identity server — works for both
    // /etc-identity/ (local) and /masar-sso/ (stage/prod) paths
    await this.page.waitForURL(
      (url) => {
        const p = url.pathname;
        return !p.includes('/etc-identity/') &&
               !p.includes('/masar-sso/') &&
               !p.includes('/Users/VerifyUsername') &&
               !p.includes('/Users/UnifiedLogin') &&
               !p.includes('/auth/identity-login');
      },
      { timeout: config.timeout }
    );
    // ── Step 6 (continued): Wait for the Angular dashboard ────────────────────
    await this.page.waitForURL('**/dashboard', { timeout: config.timeout });
    await this.page.waitForSelector(
      '#kt_aside_menu, #kt_aside, app-sidebar, #kt_app_sidebar, nav[class*="sidebar"]',
      { timeout: 20000 }
    );

    // ── Step 7: Persist the refreshed storageState ────────────────────────────
    await this.saveStorageState();

    console.log(`✅ Re-login successful. storageState.${config.environment}.json updated.\n`);
  }

  /**
   * Saves the current browser context's storageState to the environment-specific
   * JSON file, overwriting any previous state.
   */
  async saveStorageState(): Promise<void> {
    const filePath = getStorageStatePath();
    await this.context.storageState({ path: filePath });
    console.log(`💾 storageState saved → ${filePath}`);
  }

  // ── Main guard ────────────────────────────────────────────────────────────────

  /**
   * Ensures the browser is authenticated before proceeding.
   *
   * Flow:
   *  1. Navigate to the app base URL.
   *  2. If the session is valid (dashboard visible) → done.
   *  3. If the login form is shown (username/password inputs visible) → perform full re-login.
   *  4. If the identity server OAuth redirect is detected → perform full re-login.
   *
   * This is the single method called from the `Given I am logged in` step.
   */
  async ensureAuthenticated(): Promise<void> {
    const baseUrl = config.baseUrl.replace(/\/$/, '');

    // Navigate to the app entry point with retry logic for stage environment
    const navigationTimeout = this.getNavigationTimeout();
    await retryWithBackoff(
      async () => {
        await ensureConnectionHealth(this.page).catch(() => {});
        return this.page.goto(`${baseUrl}/`, {
          waitUntil: config.environment === 'stage' ? 'networkidle' : 'domcontentloaded',
          timeout: navigationTimeout,
        });
      },
      {
        maxRetries: config.environment === 'stage' ? 5 : 3,
        initialDelay: 2000,
        onRetry: (attempt, error) => {
          this.addLog(`Navigation retry ${attempt}: ${error.message}`);
        },
      }
    );

    // Wait for the app to settle — either land on dashboard or get redirected to login
    // Use a generous timeout since the local Angular app can be slow to bootstrap
    const onDashboard = await this.page
      .waitForURL('**/dashboard', { timeout: 20000 })
      .then(() => true)
      .catch(() => false);

    if (onDashboard) {
      // Confirm the sidebar is actually rendered (not just URL match)
      const sidebarVisible = await this.page
        .locator('#kt_aside_menu, #kt_aside, app-sidebar, #kt_app_sidebar, nav[class*="sidebar"]')
        .first()
        .isVisible({ timeout: 10000 })
        .catch(() => false);
      if (sidebarVisible) {
        this.addLog('Session valid — already on dashboard');
        return;
      }
    }

    // Detect login form by checking for actual form elements (most reliable)
    const loginFormVisible = await this._isLoginFormVisible();
    if (loginFormVisible) {
      this.addLog('Login form detected — performing re-login');
      await this.reLoginAndSaveState();
      return;
    }

    // Check URL-based identity server redirect
    if (this.isOnLoginScreen()) {
      this.addLog('Identity server URL detected — performing re-login');
      await this.reLoginAndSaveState();
      return;
    }

    // Final check: sidebar presence
    const sessionValid = await this.isSessionValid();
    if (!sessionValid) {
      this.addLog('Session invalid (no sidebar) — performing re-login');
      await this.reLoginAndSaveState();
    } else {
      this.addLog('Session valid — sidebar confirmed');
    }
  }

  /**
   * Detects whether the current page is showing a login form by checking for
   * the presence of username input, password input, or submit button.
   * Works for both the Angular shell Continue page and the identity server form.
   */
  async _isLoginFormVisible(): Promise<boolean> {
    const usernameVisible = await this.page
      .locator('input#Username, input[name="Username"], input[id*="user" i], input[name*="user" i], input[placeholder*="username" i]')
      .first()
      .isVisible()
      .catch(() => false);

    const passwordVisible = await this.page
      .locator('input#Password, input[name="Password"], input[id*="pass" i], input[name*="pass" i], input[placeholder*="password" i]')
      .first()
      .isVisible()
      .catch(() => false);

    const continueVisible = await this.page
      .locator('button span[translate="Login.Continue"], button:has-text("Continue"), button:has-text("Next"), button:has-text("Sign in"), button:has-text("Sign In")')
      .first()
      .isVisible()
      .catch(() => false);

    // Also detect the ASP.NET error page (JsonReaderException) that blocks testing
    const errorPageVisible = await this.page
      .locator('body')
      .evaluate((body: HTMLElement) =>
        body.innerText.includes('JsonReaderException') ||
        body.innerText.includes('An unhandled exception')
      )
      .catch(() => false);

    return usernameVisible || passwordVisible || continueVisible || errorPageVisible;
  }

  private addLog(message: string): void {
    // Lightweight console log — World.addLog is not available here
    console.log(`[AuthManager] ${message}`);
  }
}
