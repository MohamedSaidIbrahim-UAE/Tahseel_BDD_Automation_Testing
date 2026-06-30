/**
 * Report Viewer Base Page
 *
 * Shared POM for all SSR (SQL Server Reporting Services) report pages.
 * Handles the common pattern across all Tahseel report pages:
 *   1. Navigate to report URL (via side-menu or direct)
 *   2. Set date range filters (from/to in Arabic format)
 *   3. Select dropdown/radio options
 *   4. Click "Show Report" → new tab opens with SSR viewer
 *   5. Wait for async report loading spinner to disappear
 *   6. Wait for report content to become visible
 *   7. Export to Excel → download file
 *   8. Close report tab → return to filter page
 *
 * Migrated from Python ReportAutomationConsoleSaveToExcel.py
 */

import { Page } from '@playwright/test';
import { BaseListPage } from '../base-list.page';
import { WaitHelper } from '../../utils/wait.helper';
import { ReportFilterUtility } from '../../utils/report-filter.utility';
import { config } from '../../config/config';

/** Configuration for a single report page */
export interface ReportPageConfig {
  /** Report UUID in the Tahseel portal URL */
  reportId: string;
  /** Arabic display name (for side-menu navigation) */
  arabicName: string;
  /** English display name (for logging) */
  englishName: string;
  /** Base path for report pages */
  reportBasePath?: string;
}

/** Date range in Arabic display format (dd/MM/yyyy hh:mm ص/م) */
export interface ArabicDateRange {
  from: string;
  to: string;
}

export abstract class ReportViewerBasePage extends BaseListPage {
  protected readonly config: ReportPageConfig;
  protected readonly filterUtility: ReportFilterUtility;

  // ── SSR Report Viewer selectors (common across all reports) ─────────────────
  protected readonly asyncWaitSelector = '#repViewer_AsyncWait_Wait';
  protected readonly reportContentSelector = '#VisibleReportContentrepViewer_ctl13';
  protected readonly exportButtonSelector = '#repViewer_ctl09_ctl04_ctl00_ButtonLink';
  protected readonly excelOptionSelector = "a[title='Excel']";
  protected readonly pdfOptionSelector = "a[title='PDF']";

  // ── Common filter selectors ─────────────────────────────────────────────────
  protected readonly showReportButtonSelector =
    'button:has-text("Show Report"), button:has-text("Submit"), ' +
    '[aria-label="Submit"], button[type="submit"], [aria-label*="Show"], [aria-label*="Submit"]';

  // ── New-tab tracking ────────────────────────────────────────────────────────
  private _openedInNewTab = false;

  constructor(page: Page, config: ReportPageConfig) {
    super(page);
    this.config = config;
    this.filterUtility = new ReportFilterUtility(page);
  }

  // ── Public accessors ────────────────────────────────────────────────────────

  get openedInNewTab(): boolean { return this._openedInNewTab; }

  getActivePage(): Page { return this.page; }

  getReportUrl(): string {
    const basePath = this.config.reportBasePath || '/ManagePortal/report-show';
    return `${config.baseUrl}/report-show/${this.config.reportId}`;
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // NAVIGATION
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Navigate directly to the report URL.
   * Use this when you don't need side-menu navigation.
   */
  async navigateToReportDirect(): Promise<void> {
    const url = this.getReportUrl();
    console.log(`[ReportViewer] Navigating to: ${this.config.englishName} (${url})`);
    await this.navigateToUrl(url);
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(3000); // Allow Angular to bootstrap
  }

  /**
   * Navigate via side-menu search (mimics real user behavior).
   * First ensures we're on the dashboard, then uses the side-menu search.
   */
  async navigateToReportViaSideMenu(): Promise<void> {
    let attempts = 0;
    const maxAttempts = 3;
    let lastError: Error | null = null;

    while (attempts < maxAttempts) {
      try {
        attempts++;

        // Ensure we are on the dashboard (side-menu only exists there)
        const dashboardUrl = `${config.baseUrl}/dashboard`;
        const currentUrl = this.page.url();
        if (!currentUrl.includes('/dashboard')) {
          console.log(`[ReportViewer] Navigating to dashboard first: ${dashboardUrl}`);
          await this.navigateToUrl(dashboardUrl);
          await this.page.waitForTimeout(2000);
        }

        // Ensure English language before side-menu search
        await this.ensureEnglishLanguage();

        await this.navigateViaSideMenuSearch(this.config.englishName);
        const loaded = await this.isFilterPageLoaded();
        if (loaded) return;
        throw new Error('Report filter page did not load');
      } catch (error) {
        lastError = error as Error;
        if (attempts < maxAttempts) {
          console.warn(`   [SideMenu Nav] Attempt ${attempts} failed: ${lastError.message}`);
          await this.page.waitForTimeout(2000);
          try { await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 15000 }); } catch { /* ok */ }
        }
      }
    }

    throw new Error(
      `Failed to navigate to "${this.config.arabicName}" via side-menu after ${maxAttempts} attempts. ` +
      `Last error: ${lastError?.message || 'Unknown'}`
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // LANGUAGE DETECTION & AUTO-SWITCH
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Detect the current portal language and switch to English if Arabic is active.
   *
   * Logic:
   *   - Count img[src*="arab"] elements on the page
   *   - If ≥ 2 → Arabic is active → switch to English:
   *       1. Click first img[src*="arab"]   (opens language dropdown)
   *       2. Wait 800ms
   *       3. Click img[src*="king"]          (select English)
   *       4. Wait 1500ms
   *       5. Assert img[src*="king"].count ≥ 2
   *   - If < 2 → Already English → do nothing
   */
  private async ensureEnglishLanguage(): Promise<void> {
    try {
      const arabImages = this.page.locator('img[src*="arab"]');
      const arabCount = await arabImages.count().catch(() => 0);

      if (arabCount >= 2) {
        console.log('[ReportViewer] Arabic language detected — switching to English...');

        // Step 1: Click the first Arabic flag icon to open the language dropdown
        await arabImages.first().click();
        await this.page.waitForTimeout(800);

        // Step 2: Click the English (king) flag icon to select English
        const kingImg = this.page.locator('img[src*="king"]').first();
        await kingImg.waitFor({ state: 'visible', timeout: 5000 });
        await kingImg.click();
        await this.page.waitForTimeout(1500);

        // Step 3: Verify the switch succeeded
        const kingCount = await this.page.locator('img[src*="king"]').count().catch(() => 0);
        if (kingCount >= 2) {
          console.log('[ReportViewer] Language switched to English ✓');
        } else {
          console.warn('[ReportViewer] Language switch may not have completed — proceeding anyway');
        }
      } else {
        console.log('[ReportViewer] Already in English — no switch needed');
      }
    } catch (error) {
      console.warn('[ReportViewer] Language detection/switch failed:', error);
      // Non-fatal — proceed with original language
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // SIDE-MENU SEARCH (English names — language is auto-switched to English first)
  // ═══════════════════════════════════════════════════════════════════════════════

  private async navigateViaSideMenuSearch(moduleName: string): Promise<void> {
    const searchInput = this.page.locator('#kt_aside_menu input[type="search"]');
    await searchInput.waitFor({ state: 'visible', timeout: 10000 });
    await searchInput.click();
    await searchInput.clear();
    await searchInput.fill(moduleName);
    await this.page.waitForTimeout(1500);
    await this.waitHelper.waitForRequestQuiet(500, undefined, 8000);

    const clicked = await this.clickExactMenuItem(moduleName);
    if (!clicked) {
      throw new Error(`Side-menu item "${moduleName}" not found.`);
    }

    await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 });
    await this.page.waitForTimeout(2000);
  }

  private async clickExactMenuItem(targetText: string): Promise<boolean> {
    const target = targetText.trim();
    const spans = this.page.locator('span.kt-menu__link-text');
    const count = await spans.count();

    const findSpan = async (matchFn: (text: string) => boolean) => {
      for (let i = 0; i < count; i++) {
        const span = spans.nth(i);
        const text = (await span.textContent().catch(() => ''))?.trim() || '';
        if (matchFn(text)) return span;
      }
      return null;
    };

    let matchingSpan = await findSpan(text => text === target);
    if (!matchingSpan) {
      matchingSpan = await findSpan(text => text.includes(target) && text.length > 0);
    }
    if (!matchingSpan) return false;

    // Expand parent submenus
    await this.expandParentSubmenus(matchingSpan);

    // Click the parent anchor
    const link = matchingSpan.locator('xpath=ancestor::a[1]');
    await link.waitFor({ state: 'visible', timeout: 5000 });
    await link.scrollIntoViewIfNeeded().catch(() => { });
    await link.click();
    return true;
  }

  private async expandParentSubmenus(
    span: ReturnType<typeof this.page.locator>
  ): Promise<void> {
    const parentLis = span.locator(
      'xpath=ancestor::li[contains(@class, "kt-menu__item--submenu")]'
    );
    const parentCount = await parentLis.count();
    if (parentCount === 0) return;

    const parents: Array<ReturnType<typeof this.page.locator>> = [];
    for (let i = 0; i < parentCount; i++) {
      parents.push(parentLis.nth(i));
    }
    parents.reverse();

    for (const parentLi of parents) {
      const toggleLink = parentLi.locator('> a.kt-menu__toggle, > a.kt-menu__link');
      if ((await toggleLink.count()) === 0) continue;
      const submenuDiv = parentLi.locator('> div.kt-menu__submenu');
      const isExpanded = await submenuDiv.first().isVisible().catch(() => false);
      if (!isExpanded) {
        await toggleLink.first().click();
        await this.page.waitForTimeout(600);
      }
    }
  }

  private async isFilterPageLoaded(): Promise<boolean> {
    const indicators = [
      'input[type="text"]', 'dx-date-box', 'dx-select-box', 'dx-tag-box',
      'button', 'div[role="radio"]',
    ];
    for (const selector of indicators) {
      try {
        const el = this.page.locator(selector).first();
        if (await el.isVisible({ timeout: 1500 }).catch(() => false)) return true;
      } catch { continue; }
    }
    try {
      const bodyText = await this.page.locator('body').textContent({ timeout: 2000 }).catch(() => '');
      if (bodyText && bodyText.trim().length > 100) return true;
    } catch { /* continue */ }
    return false;
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // FILTER OPERATIONS (delegates to ReportFilterUtility)
  // ═══════════════════════════════════════════════════════════════════════════════

  /** Set the "from" date in a DevExtreme dx-date-box */
  async setFromDate(dateValue: string, selector?: string): Promise<void> {
    const sel = selector || this.getDefaultFromDateSelector();
    await this.filterUtility.setFromDate(sel, dateValue);
  }

  /** Set the "to" date in a DevExtreme dx-date-box */
  async setToDate(dateValue: string, selector?: string): Promise<void> {
    const sel = selector || this.getDefaultToDateSelector();
    await this.filterUtility.setToDate(sel, dateValue);
  }

  /** Set the "from" date using calendar month-navigation (regular scenario approach) */
  async setFromDateByCalendar(targetDateStr: string, selector?: string): Promise<void> {
    const sel = selector || this.getDefaultFromDateSelector();
    await this.filterUtility.setFromDateByCalendarNavigation(sel, targetDateStr);
  }

  /** Set the "to" date by clicking the Today button in the calendar (irregular scenario / quick reset) */
  async setToDateByToday(selector?: string): Promise<void> {
    const sel = selector || this.getDefaultToDateSelector();
    await this.filterUtility.setToDateByTodayButton(sel);
  }

  /** Select second option from a dx-select-box dropdown */
  async selectDropdownOption(
    dropdownButtonSelector: string,
    optionText: string,
    nthIndex?: number
  ): Promise<void> {
    await this.filterUtility.selectSecondOptionFromDropdown(dropdownButtonSelector, optionText, { nthIndex });
  }

  /** Select a DevExtreme radio button by its label text */
  async selectRadioOption(optionText: string): Promise<void> {
    await this.filterUtility.selectRadioButtonOption(optionText);
  }

  /** Select multiple items from a dx-tag-box (multi-select) */
  async selectTagBoxItems(
    tagBoxSelector: string,
    items: string[],
    okButtonSelector?: string
  ): Promise<void> {
    await this.filterUtility.selectFromTagBox(tagBoxSelector, items, okButtonSelector);
  }

  /** Click the OK/Confirm button in a modal */
  async clickConfirmButton(selector: string): Promise<void> {
    await this.filterUtility.clickConfirmButton(selector);
  }

  // ── Subclasses can override these for page-specific selectors ────────────────

  protected getDefaultFromDateSelector(): string {
    return "dx-date-box input[type='text']";
  }

  protected getDefaultToDateSelector(): string {
    return "dx-date-box input[type='text']";
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // SHOW REPORT → NEW TAB → EXPORT
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Click the "Show Report" button. Handles:
   *   1. New-tab detection
   *   2. Switching to the SSR viewer tab
   *   3. Waiting for report to fully render
   */
  async showReport(): Promise<void> {
    this._openedInNewTab = false;

    // Set up new-tab listener BEFORE clicking
    const newPagePromise = this.page.context()
      .waitForEvent('page', { timeout: 60000 })
      .catch(() => null);

    // Click the button with retry
    await this.clickShowReportButton();

    // Brief settle
    await this.waitHelper.waitForRequestQuiet(500, undefined, 20000);

    // Check if report opened in a new tab
    const newPage = await newPagePromise;

    if (newPage) {
      await this.switchToNewReportTab(newPage);
    } else {
      // Report rendered inline — wait for content
      await this.waitForReportToRender();
    }
  }

  private async clickShowReportButton(): Promise<void> {
    const tier1 = [
      'button.btn-primary',
      'button:has-text("View Report")',
      'button:has-text("Show Report")',
      'button:has-text("Report")',
      'button:has-text("Submit")',
      '[aria-label="Submit"]',
      'button[type="submit"]',
    ];
    const tier2 = [
      'dx-button:has-text("Show")',
      '[role="button"]:has-text("Show")',
      'button:has-text("Display")',
      'button:has-text("Search")',
    ];
    const allSelectors = [...tier1, ...tier2];

    for (const selector of allSelectors) {
      try {
        const btn = this.page.locator(selector).first();
        const visible = await btn.isVisible({ timeout: 1000 }).catch(() => false);
        const disabled = await btn.isDisabled().catch(() => false);
        if (visible && !disabled) {
          await btn.scrollIntoViewIfNeeded().catch(() => { });
          await btn.click({ timeout: 3000 });
          console.log("***** Successfully clicked ShowReportButton *****");
          return;
        }
      } catch { continue; }
    }

    throw new Error('Show Report button not found or not clickable');
  }

  /**
   * Switch to the new SSR report viewer tab.
   */
  private async switchToNewReportTab(newPage: Page): Promise<void> {
    console.log('[ReportViewer] Report opened in new tab — switching...');

    await newPage.waitForLoadState('domcontentloaded', { timeout: 30000 });
    await newPage.waitForTimeout(3000);

    // Close old filter tab
    await this.page.close().catch(() => { });

    // Switch internal references
    this.page = newPage;
    this.wait = new WaitHelper(newPage);

    this._openedInNewTab = true;
    console.log('[ReportViewer] Switched to new report tab');

    await this.waitForReportToRender();
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // SSR REPORT RENDERING
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Wait for the SSR report viewer to finish async loading and display content.
   */
  async waitForReportToRender(): Promise<void> {
    // Step 1: Wait for async loading spinner to DISAPPEAR
    try {
      await this.page.waitForSelector(this.asyncWaitSelector, {
        state: 'hidden',
        timeout: 300000, // 5 minutes for large reports
      });
      console.log('[ReportViewer] Async loading spinner disappeared');
    } catch {
      console.warn('[ReportViewer] Async wait element did not appear or already hidden');
    }

    // Step 2: Wait for report content to be VISIBLE
    try {
      await this.page.waitForSelector(this.reportContentSelector, {
        state: 'visible',
        timeout: 60000,
      });
      console.log('[ReportViewer] Report content is visible');
    } catch {
      // Fallback: check if the page has any meaningful content
      const bodyText = await this.page.locator('body').textContent().catch(() => '');
      if (!bodyText || bodyText.trim().length < 50) {
        throw new Error('Report content did not render — page appears empty');
      }
      console.warn('[ReportViewer] Report content selector not found, but page has content');
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // EXPORT TO EXCEL
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Export the currently displayed SSR report to Excel.
   * Uses the ReportExportUtility for download orchestration.
   * Returns the path to the downloaded file.
   *
   * NOTE: This method should be called AFTER showReport() and waitForReportToRender().
   */
  async exportToExcel(downloadFolderPath: string): Promise<string | null> {
    // Ensure we're on the SSR viewer tab
    await this.page.waitForTimeout(1000);

    // Step 1: Click the Export dropdown button
    try {
      const exportBtn = this.page.locator(this.exportButtonSelector);
      await exportBtn.waitFor({ state: 'visible', timeout: 30000 });
      await this.page.evaluate((el) => (el as HTMLElement).click(),
        await exportBtn.elementHandle()
      );
      console.log('[ReportViewer] Clicked Export dropdown');
    } catch (error) {
      console.warn('[ReportViewer] Export button not found:', error);
      return null;
    }

    await this.page.waitForTimeout(500);

    // Step 2: Click the Excel option
    try {
      const excelOption = this.page.locator(this.excelOptionSelector);
      await excelOption.waitFor({ state: 'visible', timeout: 10000 });

      // Track files before clicking
      const fs = await import('fs');
      const path = await import('path');
      const beforeFiles = new Set(
        fs.existsSync(downloadFolderPath)
          ? fs.readdirSync(downloadFolderPath).filter(f => f.endsWith('.xlsx'))
          : []
      );

      await this.page.evaluate((el) => (el as HTMLElement).click(),
        await excelOption.elementHandle()
      );
      console.log('[ReportViewer] Clicked Excel export option');

      // Wait for download
      const downloadedFile = await this.waitForNewFile(
        downloadFolderPath, beforeFiles, '.xlsx', 120000
      );

      return downloadedFile;
    } catch (error) {
      console.warn('[ReportViewer] Excel export failed:', error);
      return null;
    }
  }

  /**
   * Poll for a new file matching the extension to appear in the folder.
   */
  private async waitForNewFile(
    folderPath: string,
    beforeFiles: Set<string>,
    extension: string,
    timeoutMs: number
  ): Promise<string | null> {
    const fs = await import('fs');
    const path = await import('path');
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      if (!fs.existsSync(folderPath)) {
        await new Promise(r => setTimeout(r, 1000));
        continue;
      }

      const currentFiles = fs.readdirSync(folderPath)
        .filter(f => f.endsWith(extension) && !f.endsWith('.crdownload'));

      const partialFiles = fs.readdirSync(folderPath)
        .filter(f => f.endsWith('.crdownload'));

      const newFiles = currentFiles.filter(f => !beforeFiles.has(f));

      if (newFiles.length > 0 && partialFiles.length === 0) {
        const fullPath = path.join(folderPath, newFiles[0]);
        console.log(`[ReportViewer] Download complete: ${fullPath}`);
        return fullPath;
      }

      await new Promise(r => setTimeout(r, 1000));
    }

    console.warn('[ReportViewer] Download timed out');
    return null;
  }

  /**
   * Close the current report tab and switch back to the original filter page.
   */
  async closeReportTab(): Promise<void> {
    await this.page.close().catch(() => { });
    this._openedInNewTab = false;
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // FULL WORKFLOW: Filter → Show → Export → Rename
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Execute the full report automation workflow:
   *   1. Click Show Report
   *   2. Wait for SSR rendering
   *   3. Export to Excel
   *   4. Rename the downloaded file
   *   5. Close report tab
   */
  async runAndExport(
    downloadFolderPath: string,
    customFileName?: string
  ): Promise<string | null> {
    await this.showReport();
    await this.waitForReportToRender();

    const downloadedFile = await this.exportToExcel(downloadFolderPath);

    if (downloadedFile && customFileName) {
      const fs = await import('fs');
      const path = await import('path');
      const newPath = path.join(
        downloadFolderPath,
        customFileName.endsWith('.xlsx') ? customFileName : `${customFileName}.xlsx`
      );
      try {
        fs.renameSync(downloadedFile, newPath);
        console.log(`[ReportViewer] Renamed to: ${newPath}`);
        return newPath;
      } catch (error) {
        console.warn('[ReportViewer] Failed to rename file:', error);
        return downloadedFile;
      }
    }

    return downloadedFile;
  }
}
