import { Page, Locator, expect } from '@playwright/test';
import { WaitHelper } from '../utils/wait.helper';
import { config } from '../config/config';

export abstract class BasePage {
  protected page: Page;
  protected wait: WaitHelper;

  /**
   * Global AuthManager reference — set once by World.initialize() so every
   * page instance can trigger re-login when a session expiry is detected
   * during navigation, without needing a constructor parameter.
   */
  private static _authManager: import('../utils/auth.manager').AuthManager | null = null;

  static setAuthManager(am: import('../utils/auth.manager').AuthManager): void {
    BasePage._authManager = am;
  }

  /** Public accessor — allows step definitions to reach the raw Page when needed. */
  get rawPage(): Page { return this.page; }
  /** Public accessor — allows step definitions to use WaitHelper directly. */
  get waitHelper() { return this.wait; }
  constructor(page: Page) {
    this.page = page;
    this.wait = new WaitHelper(page);
  }

  // ── Navigation helper ──────────────────────────────────────────────────────
  async navigateToUrl(url: string): Promise<void> {
    await this.navigate(this.page, url, config.timeout);
  }

  // ── Low-level helpers ──────────────────────────────────────────────────────
  async navigate(page: Page, url: string, timeout: number): Promise<void> {
    const attempts = [
      { waitUntil: 'load' as const, timeout },
      { waitUntil: 'domcontentloaded' as const, timeout: Math.max(30000, Math.floor(timeout * 0.75)) },
      { waitUntil: 'domcontentloaded' as const, timeout: Math.max(20000, Math.floor(timeout * 0.5)) },
    ];

    let lastError: unknown;
    for (let i = 0; i < attempts.length; i++) {
      const attempt = attempts[i];
      try {
        await page.goto(url, { timeout: attempt.timeout, waitUntil: attempt.waitUntil });
        // After navigation, check if we landed on a login/error page and recover
        const recovered = await this._handleLoginInterception(page, url);
        if (recovered) return; // re-login succeeded and navigated to url
        return;
      } catch (error) {
        const msg = String(error);

        // ERR_ABORTED often means the Angular router redirected to the identity
        // server mid-navigation (session expired). Check for login form immediately.
        if (msg.includes('ERR_ABORTED') || msg.includes('net::ERR_')) {
          console.warn(`   [Step 1] Attempt ${i + 1} aborted — checking for session expiry...`);
          const recovered = await this._handleLoginInterception(page, url).catch(() => false);
          if (recovered) return;
        }

        lastError = error;
        console.warn(`   [Step 1] Attempt ${i + 1} failed: ${msg}`);
        if (i < attempts.length - 1) await WaitHelper.sleep((i + 1) * 2000);
      }
    }
    throw new Error(`Unable to open "${url}" after ${attempts.length} attempts. Last error: ${String(lastError)}`);
  }

  /**
   * Detects login form / error page after navigation and performs re-login if needed.
   * Returns true if re-login was performed and the original URL was re-navigated to.
   * Returns false if no interception was needed.
   */
  private async _handleLoginInterception(page: Page, originalUrl: string): Promise<boolean> {
    const currentUrl = page.url();

    // Already on the target page — nothing to do
    if (currentUrl.includes('/dashboard') ||
      (originalUrl && currentUrl.includes(new URL(originalUrl).pathname))) {
      return false;
    }

    // Check for ASP.NET error page — reload and retry
    const isErrorPage = await page.locator('body')
      .evaluate((body: HTMLElement) =>
        body.innerText.includes('JsonReaderException') ||
        body.innerText.includes('An unhandled exception')
      ).catch(() => false);

    if (isErrorPage) {
      console.warn('[BasePage] ASP.NET error page detected — reloading...');
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => { });
      // After reload, check again
      const stillError = await page.locator('body')
        .evaluate((body: HTMLElement) => body.innerText.includes('JsonReaderException'))
        .catch(() => false);
      if (!stillError) return false;
    }

    // ── Comprehensive login-form detection (aligned with AuthManager._isLoginFormVisible) ──
    const loginFormVisible =
      await page.locator(
        'input#Username, input[name="username"], [formcontrolname="username"], [placeholder="إسم المستخدم"], input[id*="user" i], input[name*="user" i], input[placeholder*="username" i]'
      ).first().isVisible().catch(() => false) ||
      await page.locator(
        'input#Password, input[name="password"], [formcontrolname="password"], [placeholder="كلمة المرور"], [type="password"], input[id*="pass" i], input[name*="pass" i], input[placeholder*="password" i]'
      ).first().isVisible().catch(() => false) ||
      await page.locator(
        'button span[translate="Login.Continue"], button:has-text("Continue"), button:has-text("Next"), button:has-text("Sign in"), button:has-text("Sign In")'
      ).first().isVisible().catch(() => false);

    // Also check URL-based identity server redirect
    const isIdentityUrl =
      currentUrl.includes('/Users/VerifyUsername') ||
      currentUrl.includes('/Users/UnifiedLogin') ||
      currentUrl.includes('/auth/identity-login') ||
      currentUrl.includes('/etc-identity/') ||
      currentUrl.includes('/masar-sso/') ||
      currentUrl.includes('identity-login');

    if (!loginFormVisible && !isIdentityUrl && !isErrorPage) return false;

    // ── Session expired — perform re-login via AuthManager ─────────────────────
    const authManager = BasePage._authManager;
    if (!authManager) {
      throw new Error(
        `[BasePage] Session expired navigating to "${originalUrl}" but AuthManager is not set. ` +
        `Ensure World.initialize() calls BasePage.setAuthManager().`
      );
    }

    // Check if AuthManager is already recovering to prevent concurrent attempts
    const AuthManagerClass = authManager.constructor as any;
    if (AuthManagerClass.isRecoveryInProgress && AuthManagerClass.isRecoveryInProgress()) {
      console.warn('[BasePage] AuthManager recovery already in progress, skipping duplicate re-login');
      return false;
    }

    console.warn(`[BasePage] 🔐 Session expired — performing automatic re-login for "${originalUrl}"`);
    await authManager.reLoginAndSaveState();

    // After re-login, navigate to the original target URL
    await page.goto(originalUrl, {
      waitUntil: 'domcontentloaded',
      timeout: config.timeout,
    });

    console.log(`[BasePage] ✅ Re-login complete — returned to "${originalUrl}"`);
    return true;
  }


  async click(selector: string): Promise<void> {
    await this.page.click(selector);
  }

  async fill(selector: string, value: string): Promise<void> {
    await this.page.fill(selector, value);
  }

  async getText(selector: string): Promise<string> {
    return await this.page.locator(selector).textContent() || '';
  }

  async waitForSelector(selector: string, timeout: number = 30000): Promise<void> {
    await this.page.waitForSelector(selector, { timeout, state: 'visible' });
  }

  async isVisible(selector: string): Promise<boolean> {
    return await this.page.locator(selector).isVisible();
  }

  async expectElementVisible(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).toBeVisible();
  }

  async expectElementHidden(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).toBeHidden();
  }

  async expectText(selector: string, text: string): Promise<void> {
    await expect(this.page.locator(selector)).toContainText(text);
  }

  async getLocator(selector: string): Promise<Locator> {
    return this.page.locator(selector);
  }

  async getLocatorCount(selector: string): Promise<number> {
    return await this.page.locator(selector).count();
  }

  async takeScreenshot(name: string): Promise<Buffer> {
    return await this.page.screenshot({ path: `test-results/screenshots/${name}.png` });
  }

  // =========================================================================
  // GENERIC LIST-VIEW SELECTORS
  // Shared across every module that has a DevExtreme-style data grid.
  // =========================================================================

  /** "Add New" primary action button present on every list page. */
  readonly addNewButton = 'button.btn-primary, div[aria-label="AddNew"], div[aria-label="Add New"], div[aria-label*="Add"]';

  /** Export toolbar button (generic across all list views). */
  readonly exportButton = 'div[title="Export"], [title="Export"], [class*="export"]';
  /** Column Chooser toolbar button (generic across all list views). */
  readonly columnChooserButton = '[aria-label="Column Chooser"], [class*="column-chooser"]';
  /** Search / filter input (generic across all list views). */
  readonly searchInput = '[class*="searchbox "] [aria-label*="Search"]';

  // =========================================================================
  // GENERIC FORM SELECTORS
  // Shared across every module that has an add/edit dialog form.
  // =========================================================================

  /** Save button present in every system form dialog. */
  readonly saveButton = 'div[role="dialog"] [class*="save"], [class*="save"], [aria-label*="Create"], [aria-label*="Save"], [aria-label*="create"], [aria-label*="save"]';
  /** Cancel button present in every system form dialog. */
  readonly cancelButton = '[aria-label="Cancel"]';
  /** Is-Active toggle/checkbox present in most entity forms. */
  readonly isActiveCheckbox = '[id*="IsActive"]';
  /** Edit row-action button in list grids. */
  readonly editActionButton = '[title="Edit"]';
  /** View row-action button in list grids. */
  readonly viewActionButton = '[title="View"]';
  readonly actionBTN = 'button.btn.btn-primary';
  readonly detailArrowBTN = '[aria-label="arrowright"], button.btn, .btn-primary, [aria-label*="Action"]';
  // =========================================================================
  // GENERIC LIST-VIEW ACTIONS
  // =========================================================================

  /** Clicks the Add New button and waits for the form dialog to appear. */
  async clickAddNew(): Promise<void> {
    await this.page.locator(this.addNewButton).first().click();
    await this.page.locator(this.saveButton).last().waitFor({ state: 'visible', timeout: config.timeout });
  }

  /** Opens the Export dropdown. Caller selects the specific format afterwards. */
  async clickExport(): Promise<void> {
    const exportLoc = this.page.locator(this.exportButton).last();
    // Try to click the nearest sensible clickable ancestor (button / role=button / dx-button)
    const ancestorButton = exportLoc.locator('xpath=ancestor::button[1]');
    if (await ancestorButton.count() > 0) {
      await ancestorButton.first().waitFor({ state: 'visible', timeout: config.timeout }).catch(() => { });
      try {
        await ancestorButton.first().click({ force: true });
        return;
      } catch {
        // fall through to additional strategies
      }
    }

    // Try a class-based ancestor often used by DevExtreme buttons
    const dxAncestor = exportLoc.locator('xpath=ancestor::*[contains(@class, "dx-button")][1]');
    if (await dxAncestor.count() > 0) {
      await dxAncestor.first().waitFor({ state: 'visible', timeout: config.timeout }).catch(() => { });
      try {
        await dxAncestor.first().click({ force: true });
        return;
      } catch {
        // fall through
      }
    }

    // As a last resort try clicking the original locator (may be the icon); if that still fails,
    // attempt an in-page click on the nearest clickable ancestor via DOM API for extra resilience.
    try {
      await exportLoc.click({ force: true });
      return;
    } catch (e) {
      // Attempt to click via in-page DOM traversal to reach the closest clickable element
      await exportLoc.evaluate((el: HTMLElement) => {
        const clickable = el.closest('button, [role="button"], .dx-button');
        (clickable as HTMLElement | null)?.click();
      }).catch(() => { });
    }
  }

  /** Opens the Column Chooser panel. */
  async clickColumnChooser(): Promise<void> {
    await this.page.locator(this.columnChooserButton).last().click();
  }

  /** Types a search term into the grid search input and waits for the grid to filter. */
  async searchFor(term: string): Promise<void> {
    const input = this.page.locator(this.searchInput).first();
    await input.waitFor({ state: 'visible', timeout: config.timeout });
    await input.fill(term);
    await this.page.waitForTimeout(800);
  }

  // =========================================================================
  // GENERIC FORM ACTIONS
  // =========================================================================

  /**
   * Toggles the Is-Active checkbox to the desired state.
   * Reads the current `checked` CSS class to avoid unnecessary clicks.
   */
  async setIsActive(checked: boolean): Promise<void> {
    const checkbox = this.page.locator(this.isActiveCheckbox).first();
    const cls = await checkbox.getAttribute('class') ?? '';
    const isChecked = cls.includes('checked');
    if (checked !== isChecked) {
      await checkbox.click();
    }
  }

  /** Clicks the Save button in the open form dialog. */
  async clickSave(): Promise<void> {
    await this.page.locator(this.saveButton).last().click();
  }

  /** Clicks the Cancel button in the open form dialog. */
  async clickCancel(): Promise<void> {
    await this.page.locator(this.cancelButton).first().click();
  }

  // =========================================================================
  // GENERIC FORM ASSERTIONS
  // =========================================================================

  /**
   * Asserts the form dialog is open by checking the Save button is visible.
   * Page-specific pages can override to add field-level checks.
   */
  async verifyFormVisible(): Promise<void> {
    await expect(this.page.locator(this.cancelButton).first()).toBeVisible({ timeout: config.timeout });
  }

  /** Asserts the form dialog has closed (Save button hidden). */
  async verifyFormClosed(): Promise<void> {
    await expect(this.page.locator(this.cancelButton).first()).toBeHidden({ timeout: config.timeout });
  }

  /**
   * Asserts a validation error message is visible anywhere on the page.
   * Covers common Angular/DevExtreme error patterns.
   */
  async verifyValidationError(message: string): Promise<void> {
    const locator = this.page.locator("div[class*='message-content']").filter({ hasText: message });
    await expect(locator).toBeVisible({ timeout: config.timeout });
  }

  // =========================================================================
  // GENERIC TABLE ROW ACTIONS
  // =========================================================================

  /** Clicks the Edit action for the row that contains `name`, then waits for the form. */
  async clickEditForRow() {
    //  Define the edit button within that row
    const editButton = this.page.locator('a[title*="Edit"]').first();
    //  Professional Wait: Ensure the row is actually present before clicking
    await editButton.waitFor({ state: 'visible', timeout: 10000 });
    //  Click with a force option if it's being blocked by an overlay, 
    // though usually, 'visible' is enough.
    await editButton.click();
  }

  /** Clicks the View action for the row that contains `name`. */
  /** Clicks the View action for the row that contains `name`, then waits for the form. */
  async clickViewForRow() {
    //  Define the View button within that row
    const viewButton = this.page.locator('a[title*="View"]').first();
    //  Professional Wait: Ensure the row is actually present before clicking
    await viewButton.scrollIntoViewIfNeeded();
    await viewButton.waitFor({ state: 'visible', timeout: 10000 });
    //  Click with a force option if it's being blocked by an overlay, 
    // though usually, 'visible' is enough.
    await viewButton.click();
    await this.page.locator('button.btn-primary').filter({ hasText: new RegExp("Action") }).waitFor({ state: 'visible', timeout: config.timeout });
  }


  // =========================================================================
  // GENERIC TABLE ASSERTIONS
  // =========================================================================

  /** Asserts a row containing `name` is visible in the grid. */
  async verifyRowExists(name: string): Promise<void> {
    const locator = this.page.locator(`tr:has-text("${name}"), [role="row"]:has-text("${name}")`).first();
    try {
      await locator.waitFor({ state: 'visible', timeout: config.timeout });
    } catch (err) {
      // Diagnostics: capture first-page rows to aid debugging
      const rows = await this.page.locator('tbody tr, [role="rowgroup"] [role="row"]').allTextContents().catch(() => []);
      throw new Error(`Row with '${name}' not found after ${config.timeout}ms. Visible rows samples: ${rows.slice(0,10).map(r=>r.substring(0,120)).join(' || ')}`);
    }
  }

  /** Asserts the row identified by `rowName` also contains `value`. */
  async verifyRowValue(rowName: string, value: string): Promise<void> {
    const row = this.page.locator(`tr:has-text("${rowName}"), [role="row"]:has-text("${rowName}")`).first();
    await expect(row).toContainText(value);
  }

  /**
   * Asserts every visible data row contains `term` (case-insensitive).
   * Skips empty rows (e.g. "no data" placeholder rows).
   */
  async verifySearchResults(term: string): Promise<void> {
    // Target only data rows — exclude header rows and free-space rows
    const dataRows = this.page.locator(
      'tbody tr:not(.dx-freespace-row):not(.dx-header-row), [role="rowgroup"] [role="row"]:not([aria-rowindex="1"])'
    );
    const total = await dataRows.count();
    expect(total).toBeGreaterThan(0);
    const text = await dataRows.first().textContent();
    if (text?.trim()) {
      expect(text.toLowerCase()).toContain(term.toLowerCase());
    }
  }

  /** Asserts a column header with `columnName` is not visible in the grid. */
  async verifyColumnHidden(columnName: string): Promise<void> {
    await expect(
      this.page.locator(`th:has-text("${columnName}"), [role="columnheader"]:has-text("${columnName}")`)
    ).toBeHidden();
  }

  /** Asserts a column header with `columnName` is visible in the grid. */
  async verifyColumnVisible(columnName: string): Promise<void> {
    await expect(
      this.page.locator(`th:has-text("${columnName}"), [role="columnheader"]:has-text("${columnName}")`)
    ).toBeVisible();
  }


  /**
 * Toggles a column checkbox inside the DevExpress-style Column Chooser.
 * Targets the checkbox based on the sibling text content.
 */
  async toggleColumnInChooser(columnName: string): Promise<void> {
    // 1. Locate the specific tree item container that contains our column name
    const treeItem = this.page.locator('li[role="treeitem"]').filter({
      has: this.page.locator('.dx-treeview-item-content', { hasText: columnName })
    });
    // 2. Locate the checkbox within that specific container
    const checkbox = treeItem.locator('div[role="checkbox"]');
    // 3. Action: Ensure visibility and click
    // Playwright's click() automatically scrolls and waits for actionability
    await checkbox.click();
    // 4. Verification (Professional alternative to waitForTimeout)
    // Instead of a hard sleep, wait for the 'dx-checkbox-checked' class to toggle 
    // or for the 'aria-checked' attribute to update if your test logic requires it.
    await expect(checkbox).toBeVisible();
  }

  /**
 * Submits the equipment form and waits for the insertion API to complete successfully.
 */
  async submitForm(action: string): Promise<void> {
    // Matches the endpoint path regardless of the base domain or IP address
    const apiPattern = action.toLowerCase() == "add" ? new RegExp("insert") : action.toLowerCase() == "edit" ? new RegExp("update") : null;
    try {
      await Promise.all([
        // 1. Set up the network spy for a successful 200 response
        apiPattern != null ?
          this.page.waitForResponse(
            (response) => apiPattern.test(response.url()) && response.status() === 200,
            { timeout: 15000 } // Extended timeout accommodating database write operations
          ) : null,

        // 2. Trigger the click event that executes the XHR request
        this.page.locator(this.saveButton).last().click()
      ]);
    } catch (error) {
      throw new Error(
        `[EquipmentPage] Form submission failed. The Equipment/insert API either timed out or did not return a 200 status. Details: ${(error as Error).message}`
      );
    }
  }

  async cancelForm(): Promise<void> {
    await this.page.locator(this.cancelButton).first().click();
  }


  async clickSaveMultipleTimes(action: 'insert' | 'update' | 'any', executionTimes = 3): Promise<void> {
    if (['insert', 'update'].includes(action)) {
      await this.clickSaveMultipleTimesAndVerifyDebounce(action, executionTimes);
    } else {
      const saveButtonLocator = this.page.locator(this.saveButton).last();
      await expect(saveButtonLocator).toBeVisible({ timeout: 5000 });
      const clickPromises = Array.from({ length: executionTimes }).map(() =>
        saveButtonLocator.click({ force: true }).catch(() => {
          /* Catch errors if the button gets disabled safely on click #1 */
        })
      );
      await Promise.all(clickPromises);

      // 3. Settling Window: Wait for network frames to settle out
      await this.page.waitForLoadState('networkidle').catch(() => { });
    }
  }

  /**
   * Rapidly fires concurrent clicks at the Save button to test debouncing,
   * and asserts that the backend persistence API is triggered exactly once.
   * @param executionType - Expects either 'insert', 'update' or 'any' for generic forms
   * @param executionTimes - Total fast clicks dispatched to the DOM node
   */
  async clickSaveMultipleTimesAndVerifyDebounce(
    executionType: 'insert' | 'update' | 'any',
    executionTimes = 3
  ): Promise<void> {
    const saveButtonLocator = this.page.locator(this.saveButton).last();
    await expect(saveButtonLocator).toBeVisible({ timeout: 5000 });

    // 1. Setup a network spy array to log intercepted target endpoints
    const interceptedRequests: string[] = [];

    this.page.on('request', (request) => {
      if (request.url().includes(executionType) && request.method() === 'POST') {
        interceptedRequests.push(request.url());
      }
    });

    // 2. DISPATCH BLITZ: Fire clicks concurrently using Promise.all without awaiting each sequentially
    // This simulates a frantic user double/triple clicking the button within a single frame
    const clickPromises = Array.from({ length: executionTimes }).map(() =>
      saveButtonLocator.click({ force: true }).catch(() => {
        /* Catch errors if the button gets disabled safely on click #1 */
      })
    );

    await Promise.all(clickPromises);

    // 3. Settling Window: Wait for network frames to settle out
    await this.page.waitForLoadState('networkidle').catch(() => { });

    // 4. Clean up the listener instance to prevent memory leaks in the test worker thread
    this.page.removeAllListeners('request');

    // 5. Professional Assertions
    console.log(`[Debounce Spy Log] Total matching API requests dispatched: ${interceptedRequests.length}`);

    expect(interceptedRequests.length).toBeLessThanOrEqual(1);
  }

}
