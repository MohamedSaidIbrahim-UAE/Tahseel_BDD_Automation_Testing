import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { config } from '../config/config';

export class LoginPage extends BasePage {
  readonly loginUrl = `${config.baseUrl}/login`;

  // Self‑healing selector arrays (ordered from most stable to least)
  readonly usernameInput: string;
  readonly passwordInput: string;
  readonly submitButton: string;
  readonly errorMessage: string;
  readonly logoutButton: string;

  // Dashboard sentinel
  readonly dashboardSentinel = 'app-sidebar, #kt_app_sidebar, nav[class*="sidebar"]';

  constructor(page: Page) {
    super(page);

    // Self‑healing selectors
    this.usernameInput = [
      'input[name="username"]',
      'input[type="email"]',
      'input[placeholder*="username" i]',
      '#username',
      'input.login-username'
    ].join(', ');

    this.passwordInput = [
      'input[name="password"]',
      'input[type="password"]',
      'input[placeholder*="password" i]',
      '#password',
      'input.login-password'
    ].join(', ');

    this.submitButton = [
      'button[type="submit"]',
      'button:has-text("Sign In")',
      'button:has-text("Login")',
      '#loginBtn',
      '.btn-primary'
    ].join(', ');

    this.errorMessage = [
      '.alert-danger',
      '.error-message',
      '[role="alert"]',
      '.validation-summary-errors',
      'div.toast-message'
    ].join(', ');

    this.logoutButton = [
      'button:has-text("Logout")',
      'a:has-text("Logout")',
      '[aria-label="Logout"]',
      '#logout'
    ].join(', ');
  }

  async navigateToLogin(): Promise<void> {
    await this.page.goto(this.loginUrl, { waitUntil: 'domcontentloaded' });
  }

  /**
   * Waits for the login form to be fully interactive.
   */
  async waitForLoginFormReady(): Promise<void> {
    await Promise.all([
      this.page.locator(this.usernameInput).first().waitFor({ state: 'visible', timeout: 15000 }),
      this.page.locator(this.passwordInput).first().waitFor({ state: 'visible', timeout: 15000 }),
      this.page.locator(this.submitButton).first().waitFor({ state: 'visible', timeout: 15000 })
    ]);
  }

  async enterUsername(username: string): Promise<void> {
    const input = this.page.locator(this.usernameInput).first();
    await input.fill(username);
  }

  async enterPassword(password: string): Promise<void> {
    const input = this.page.locator(this.passwordInput).first();
    await input.fill(password);
  }

  async submitLoginForm(): Promise<void> {
    const btn = this.page.locator(this.submitButton).first();
    await btn.click();
    // Wait for navigation OR error message
    await Promise.race([
      this.page.waitForURL('**/dashboard', { timeout: 15000 }),
      this.page.locator(this.errorMessage).first().waitFor({ state: 'visible', timeout: 15000 })
    ]).catch(() => { });
  }

  /**
   * Full login flow with self‑healing selectors.
   */
  async login(username: string, password: string): Promise<void> {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.submitLoginForm();
  }

  async verifyRedirectedToDashboard(): Promise<void> {
    await this.page.waitForURL('**/dashboard', { timeout: 20000 });
    await this.page.locator(this.dashboardSentinel).first().waitFor({ state: 'visible', timeout: 15000 });
  }

  async verifyOnLoginPage(): Promise<void> {
    await expect(this.page.locator(this.submitButton).first()).toBeVisible();
  }

  async clickLogout(): Promise<void> {
    const btn = this.page.locator(this.logoutButton).first();
    await btn.click();
    await this.page.waitForURL('**/login', { timeout: 10000 });
  }
}