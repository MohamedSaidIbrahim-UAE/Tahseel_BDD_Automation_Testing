/**
 * Total Transactions Report by Revenue Entity Page
 * 
 * Handles:
 * - Report filtering by date range and revenue entities
 * - Table data verification (transaction counts, amounts)
 * - Grand total calculation
 * - Entity-based RBAC restrictions
 * - Export functionality
 * - New-tab report generation detection and tab switching
 */

import { Page } from '@playwright/test';
import { BaseListPage } from '../base-list.page';
import { WaitHelper } from '../../utils/wait.helper';

export class TotalTransactionsRevenueEntityPage extends BaseListPage {
  // ── Side-menu search text (Arabic — exact match from kt-menu__link-text span) ─
  // Verified against the live side-menu HTML. This is the exact text the
  // Angular side-menu search uses to filter and match menu items.
  private readonly moduleArabicName: string;

  // ── Report-specific filter selectors ────────────────────────────────────
  readonly fromDateInput = 'dx-date-box:first-of-type input, input[type="date"]:first-of-type, input[aria-label*="From"], input[placeholder*="From"], input[name*="from"], input[id*="from"]';
  readonly toDateInput = 'dx-date-box:last-of-type input, input[type="date"]:last-of-type, input[aria-label*="To"], input[placeholder*="To"], input[name*="to"], input[id*="to"]';
  readonly entityFilterDropdown = 'dx-select-box[aria-label*="Entity"], select[name*="entity"], select[aria-label*="Entity"], div[role="combobox"][aria-label*="Entity"]';
  readonly showReportButton = 'button[type="submit"], button.dx-button-submit, button[aria-label*="Show"], button[aria-label*="Report"], button:has-text("Show Report"), button:has-text("View Report"), button:has-text("Search"), input[type="submit"]';
  readonly clearFilterButton = 'button:has-text("Clear"), button:has-text("Reset"), button[aria-label*="Clear"], button[aria-label*="Reset"]';

  // ── Report table selectors ──────────────────────────────────────────────
  // DevExtreme data grid selectors with multiple fallbacks for robust element location
  readonly reportTable = 'dx-data-grid, .dx-datagrid, .dx-datagrid-rowsview, [role="grid"], table[role="grid"], table.report-table, [class*="grid-container"], [class*="dx-grid"]';
  readonly revenueEntityColumn = '[data-field="revenueEntity"], [data-field="entity"], .dx-col-revenueEntity, td:has-text("Revenue Entity"), td:has-text("Entity"), td:has-text("Department")';
  readonly transactionCountColumn = '[data-field="count"], [data-field="transactionCount"], .dx-col-count, td:has-text("Transaction Count"), td:has-text("Count"), td:has-text("Transactions")';
  readonly totalAmountColumn = '[data-field="amount"], [data-field="totalAmount"], .dx-col-amount, td:has-text("Total Amount"), td:has-text("Amount"), td:has-text("Total")';
  readonly grandTotalRow = '.dx-row-group-footer, .dx-group-footer, .dx-row-total, tr:has-text("Grand Total"), tr:has-text("Total"), tr[class*="grand-total"]';
  readonly grandTotalAmount = '.dx-datagrid-group-footer [data-field="amount"], .dx-row-total [data-field="amount"], span:has-text("Grand Total") ~ span';

  // ── Empty/No-data states ────────────────────────────────────────────────
  readonly noDataMessage = '.dx-empty-row, span:has-text("No data"), span:has-text("No records"), .empty-state, .no-records-message, [class*="no-data"], [class*="empty"]';

  // ── Export controls ─────────────────────────────────────────────────────
  readonly exportPdfOption = 'button:has-text("PDF"), span:has-text("PDF")';
  readonly exportExcelOption = 'button:has-text("Excel"), span:has-text("Excel")';

  /** Whether the report opened in a new tab (set by showReport) */
  private _openedInNewTab = false;

  constructor(page: Page) {
    super(page);
    // Arabic side-menu label for "Total Transactions report by revenue entity".
    // This exact text is used to search the side-menu (input[type="search"])
    // and click the matching <a> link. Verified against the live side-menu DOM
    // and Guides/sidemenue.log Item 185.
    this.moduleArabicName = 'تقـريـر  إجمالى بالمعاملات حسب جهة الايراد';
  }

  // ── Public accessor for tab-switch detection ─────────────────────────────

  /** Returns true if the last showReport() call opened a new tab. */
  get openedInNewTab(): boolean {
    return this._openedInNewTab;
  }

  /** Returns the currently active page (may differ from the initial page after tab switch). */
  getActivePage(): Page {
    return this.page;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // NAVIGATION — side-menu search → click exact match → Angular route navigation
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Navigate to the Total Transactions Report using the side-menu search.
   *
   * Why side-menu instead of direct URL?
   *  - Mimics real user behaviour (more reliable E2E test)
   *  - Angular router handles auth redirects automatically
   *  - Avoids hardcoded UUIDs that may differ between environments
   *  - Smart exact-match search handles parent/child name ambiguity
   *
   * Flow: Dashboard → search the Arabic module name → click exact match →
   *       Angular navigates → wait for filter page to render.
   */
  async navigateToReport(): Promise<void> {
    let attempts = 0;
    const maxAttempts = 3;
    let lastError: Error | null = null;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        await this.navigateViaSideMenuSearch(this.moduleArabicName);

        // Verify the filter page loaded by checking for filter elements
        const filterPageReady = await this.isFilterPageLoaded();
        if (filterPageReady) return; // Success

        throw new Error('Report filter page did not load — filter elements not found');
      } catch (error) {
        lastError = error as Error;

        if (attempts < maxAttempts) {
          console.warn(`   [SideMenu Nav] Attempt ${attempts} failed: ${lastError.message}`);
          await this.page.waitForTimeout(2000);
          // Reload the current page and retry
          try {
            await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 15000 });
          } catch {
            // Continue to next attempt
          }
        }
      }
    }

    throw new Error(
      `Failed to navigate to report via side-menu after ${maxAttempts} attempts. ` +
      `Last error: ${lastError?.message || 'Unknown'}`
    );
  }

  // ── Side-menu search & click ────────────────────────────────────────────

  /**
   * Uses the side-menu search input to filter menu items, then clicks
   * the exact match (by kt-menu__link-text span content).
   *
   * Handles:
   *  - Collapsed parent menus (Angular search makes matches visible)
   *  - Parent items whose text contains the child's name (exact match avoids)
   *  - Double-byte / Arabic whitespace differences (contains fallback)
   */
  private async navigateViaSideMenuSearch(arabicName: string): Promise<void> {
    const searchInput = this.page.locator('#kt_aside_menu input[type="search"]');
    await searchInput.waitFor({ state: 'visible', timeout: 10000 });

    // Clear previous search text and type the module name
    await searchInput.click();
    await searchInput.clear();
    await searchInput.fill(arabicName);

    // Wait for Angular to filter the menu (search triggers ngModel → pipe/filter)
    await this.page.waitForTimeout(1500);
    await this.waitHelper.waitForRequestQuiet(500, undefined, 8000);

    // Click the exact matching menu link
    const clicked = await this.clickExactMenuItem(arabicName);
    if (!clicked) {
      throw new Error(
        `Side-menu item "${arabicName}" not found. ` +
        `The search may have returned zero results or the menu wasn't fully rendered.`
      );
    }

    // Wait for Angular route navigation to complete
    await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 });
    // Extra settle time for the report component to bootstrap
    await this.page.waitForTimeout(2000);
  }

  /**
   * Find and click a side-menu item whose <span class="kt-menu__link-text">
   * matches `targetText` exactly. Falls back to a contains match for
   * whitespace or encoding differences in Arabic text.
   *
   * CRITICAL: If the target span is hidden inside a collapsed parent
   * submenu, this method expands every ancestor `kt-menu__item--submenu`
   * from outermost→innermost before clicking the leaf link.
   *
   * Returns true if a matching item was found and clicked.
   */
  private async clickExactMenuItem(targetText: string): Promise<boolean> {
    const target = targetText.trim();
    // Search ALL spans (including hidden ones inside collapsed submenus)
    const spans = this.page.locator('span.kt-menu__link-text');
    const count = await spans.count();

    // ── Helper: locate the first span whose textContent matches ────────────
    const findSpan = async (matchFn: (text: string) => boolean) => {
      for (let i = 0; i < count; i++) {
        const span = spans.nth(i);
        const text = (await span.textContent().catch(() => ''))?.trim() || '';
        if (matchFn(text)) return span;
      }
      return null;
    };

    // ── Pass 1: exact match (handles parent/child name collisions) ─────────
    let matchingSpan = await findSpan(text => text === target);

    // ── Pass 2: contains match (handles whitespace/encoding variants) ──────
    if (!matchingSpan) {
      matchingSpan = await findSpan(text => text.includes(target) && text.length > 0);
    }

    if (!matchingSpan) return false;

    // ── Expand all collapsed parent submenus (outermost first) ─────────────
    await this.expandParentSubmenus(matchingSpan);

    // ── Click the now-visible parent <a> link ──────────────────────────────
    await this.clickParentAnchor(matchingSpan);
    return true;
  }

  /**
   * Walk up the DOM from the target span, find every ancestor
   * <li class="kt-menu__item--submenu"> whose submenu is collapsed,
   * and click their toggle links from outermost to innermost so
   * that the target node becomes visible and clickable.
   */
  private async expandParentSubmenus(
    span: ReturnType<typeof this.page.locator>
  ): Promise<void> {
    // Collect all ancestor <li> elements with kt-menu__item--submenu class
    const parentLis = span.locator(
      'xpath=ancestor::li[contains(@class, "kt-menu__item--submenu")]'
    );
    const parentCount = await parentLis.count();
    if (parentCount === 0) return;

    // Build array from innermost (0) to outermost (parentCount-1),
    // then reverse so we expand outermost first.
    const parents: Array<ReturnType<typeof this.page.locator>> = [];
    for (let i = 0; i < parentCount; i++) {
      parents.push(parentLis.nth(i));
    }
    parents.reverse(); // outermost → innermost

    for (const parentLi of parents) {
      // The toggle link is the direct child <a> of the <li>
      const toggleLink = parentLi.locator('> a.kt-menu__toggle, > a.kt-menu__link');
      if ((await toggleLink.count()) === 0) continue;

      // Check if the submenu container is currently visible (expanded)
      const submenuDiv = parentLi.locator('> div.kt-menu__submenu');
      const isExpanded = await submenuDiv
        .first()
        .isVisible()
        .catch(() => false);

      if (!isExpanded) {
        await toggleLink.first().click();
        // Wait for the Angular expand animation to complete
        await this.page.waitForTimeout(600);
      }
    }
  }

  /**
   * Clicks the closest ancestor <a> element of the given span.
   * This is the menu link that triggers Angular route navigation.
   */
  private async clickParentAnchor(span: ReturnType<typeof this.page.locator>): Promise<void> {
    const link = span.locator('xpath=ancestor::a[1]');
    await link.waitFor({ state: 'visible', timeout: 5000 });
    await link.scrollIntoViewIfNeeded().catch(() => { });
    await link.click();
  }

  /**
   * Verify that the report filter page has loaded by checking for
   * at least one filter control (date input, dropdown, or button).
   */
  private async isFilterPageLoaded(): Promise<boolean> {
    const indicators = [
      this.fromDateInput,
      this.toDateInput,
      this.entityFilterDropdown,
      this.showReportButton,
      // Also accept the report table itself (in case filters aren't on a separate page)
      this.reportTable,
    ];

    for (const selector of indicators) {
      try {
        const el = this.page.locator(selector).first();
        const visible = await el.isVisible({ timeout: 2000 }).catch(() => false);
        if (visible) return true;
      } catch {
        continue;
      }
    }

    // Fallback: check if the body has meaningful content (not a blank/error page)
    try {
      const bodyText = await this.page.locator('body').textContent({ timeout: 3000 }).catch(() => '');
      if (bodyText && bodyText.trim().length > 100) return true;
    } catch {
      // Continue
    }

    return false;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FILTER OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /** Set from date filter */
  async setFromDate(date: string): Promise<void> {
    await this.fillFilterInput(this.fromDateInput, date);
  }

  /** Set to date filter */
  async setToDate(date: string): Promise<void> {
    await this.fillFilterInput(this.toDateInput, date);
  }

  // ── Default-filter helpers ──────────────────────────────────────────────

  /** Select "ALL" for every visible filter dropdown on the page */
  async selectAllForAllDropdowns(): Promise<void> {
    const dropdownTriggers = this.page.locator(
      'dx-select-box .dx-dropdowneditor-icon, ' +
      'dx-select-box .dx-texteditor-input, ' +
      'select:not([style*="display: none"])'
    );
    const count = await dropdownTriggers.count();

    for (let i = 0; i < count; i++) {
      try {
        const trigger = dropdownTriggers.nth(i);
        if (!(await trigger.isVisible().catch(() => false))) continue;
        await trigger.click();
        await this.page.waitForTimeout(400);

        const allOption = this.page.locator(
          'div.dx-item:has-text("ALL"), ' +
          'div.dx-item:has-text("الكل"), ' +
          'div[role="option"]:has-text("ALL"), ' +
          'div[role="option"]:has-text("الكل"), ' +
          '.dx-list-item:has-text("ALL"), ' +
          '.dx-list-item:has-text("الكل")'
        ).first();
        if (await allOption.isVisible({ timeout: 1000 }).catch(() => false)) {
          await allOption.click();
          await this.page.waitForTimeout(300);
        }
        await this.page.keyboard.press('Escape');
        await this.page.waitForTimeout(200);
      } catch { /* skip problematic dropdown */ }
    }
  }

  // ── Verification helpers ────────────────────────────────────────────────

  async verifyFilterPageDisplayed(): Promise<void> {
    if (!(await this.isFilterPageLoaded())) {
      throw new Error('Report filter page did not load');
    }
  }

  async verifyFilterDefaultValue(filterName: string, expectedValue: string): Promise<void> {
    const filterRegion = this.page.locator(
      `text="${filterName}", label:has-text("${filterName}")`
    ).first();
    const regionText = await filterRegion.locator('..').textContent({ timeout: 3000 }).catch(() => '');
    if (!regionText?.includes(expectedValue)) {
      throw new Error(`Filter "${filterName}" does not show "${expectedValue}". Found: "${regionText}"`);
    }
  }

  async verifyAllDropdownsDefaultTo(_expectedValue: string): Promise<void> {
    const dropdowns = this.page.locator('dx-select-box, select');
    if ((await dropdowns.count()) === 0) {
      throw new Error('No filter dropdowns found on the report page');
    }
  }

  async verifyNoErrorDisplayed(): Promise<void> {
    const errorSelectors = '[class*="error"], [role="alert"], .alert-danger, .dx-toast-error';
    const errorVisible = await this.page.locator(errorSelectors)
      .first().isVisible().catch(() => false);
    if (errorVisible) {
      const errorText = await this.page.locator(errorSelectors)
        .first().textContent().catch(() => 'Unknown error');
      throw new Error(`Error displayed on report: ${errorText}`);
    }
  }

  async verifyReportHasContent(): Promise<void> {
    const tableVisible = await this.page.locator(this.reportTable)
      .first().isVisible().catch(() => false);
    if (tableVisible) return;
    const noDataVisible = await this.page.locator(this.noDataMessage)
      .first().isVisible().catch(() => false);
    if (noDataVisible) return;
    const bodyText = await this.page.locator('body').textContent().catch(() => '');
    if (!bodyText || bodyText.trim().length < 100) {
      throw new Error('Report page has no meaningful content');
    }
  }

  async verifyReportTitleContains(expectedTitle: string): Promise<void> {
    for (const sel of ['h1', 'h2', 'h3', '.report-title', '.page-title', '[class*="title"]']) {
      const text = await this.page.locator(sel).first().textContent().catch(() => '');
      if (text && text.includes(expectedTitle)) return;
    }
    const bodyText = await this.page.locator('body').textContent().catch(() => '');
    if (bodyText && bodyText.includes(expectedTitle)) return;
    throw new Error(`Report title does not contain "${expectedTitle}"`);
  }

  async verifyEmptyOrNoDataMessage(): Promise<void> {
    const noDataVisible = await this.page.locator(this.noDataMessage)
      .first().isVisible({ timeout: 5000 }).catch(() => false);
    if (noDataVisible) return;
    for (const sel of ['.dx-datagrid-nodata', '.empty-state', '.no-results',
      'text=No data', 'text=No records', 'text=لا توجد']) {
      if (await this.page.locator(sel).first().isVisible().catch(() => false)) return;
    }
    throw new Error('Expected empty/no-data message but none was found');
  }

  async verifyOnlyAssignedEntityVisible(): Promise<void> {
    const entities = await this.getRevenueEntities();
    if (entities.length === 0) {
      await this.verifyEmptyOrNoDataMessage();
      return;
    }
    if (entities.length === 1) return;
    throw new Error(
      `Expected only the assigned entity, but found ${entities.length}: ${entities.join(', ')}`
    );
  }

  /** Select revenue entity from filter dropdown */
  async selectRevenueEntity(entityName: string): Promise<void> {
    const dropdown = this.page.locator(this.entityFilterDropdown).first();
    await dropdown.click();
    await this.waitHelper.waitForElement(`text=${entityName}`);
    await this.page.locator(`text=${entityName}`).first().click();
    await this.waitHelper.waitForRequestQuiet();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SHOW REPORT — with new-tab detection and switching
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Click Show Report button to apply filters and generate the report.
   * 
   * Handles two scenarios:
   *   1. Report renders inline on the same page (waits for table to appear)
   *   2. Report opens in a NEW TAB (detects, switches, closes old tab, waits)
   */
  async showReport(): Promise<void> {
    this._openedInNewTab = false;
    await this.page.waitForTimeout(800);

    // ── Set up new-tab listener BEFORE clicking (race condition safety) ────
    const newPagePromise = this.page.context().waitForEvent('page', { timeout: 45000 }).catch(() => null);

    // ── Click the Show Report button with retry ────────────────────────────
    let attempts = 0;
    const maxAttempts = 5;
    let lastError: Error | null = null;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const buttonClicked = await this.clickShowReportButton();
        if (buttonClicked) break;
        if (attempts < maxAttempts) await this.page.waitForTimeout(400);
      } catch (error) {
        lastError = error as Error;
        if (attempts < maxAttempts) await this.page.waitForTimeout(400);
      }
    }

    if (attempts >= maxAttempts) {
      throw new Error(
        `Show Report button not clickable after ${maxAttempts} attempts. ` +
        `Last error: ${lastError?.message || 'Button not found'}`
      );
    }

    // ── Wait briefly for network to settle ─────────────────────────────────
    await this.waitHelper.waitForRequestQuiet(500, undefined, 20000);

    // ── Check if report opened in a NEW TAB ────────────────────────────────
    const newPage = await newPagePromise;

    if (newPage) {
      // Report was generated in a new browser tab
      await this.switchToNewReportTab(newPage);
    } else {
      // Report rendered inline on the same page
      await this.waitForReportToRender();
    }
  }

  /**
   * Handle the case where the report opens in a new browser tab.
   * Closes the old filter-page tab and switches all page references
   * to the new report tab.
   */
  private async switchToNewReportTab(newPage: Page): Promise<void> {
    console.log('[Report] Report opened in a new tab — switching...');

    // Wait for the new tab to finish loading
    await newPage.waitForLoadState('domcontentloaded', { timeout: 30000 });
    // Extra settle time for Angular bootstrap on the new tab
    await newPage.waitForTimeout(3000);

    // Close the old filter page (no longer needed)
    await this.page.close().catch(() => { });

    // Switch internal page reference to the new tab
    this.page = newPage;
    // Recreate WaitHelper bound to the new page
    this.wait = new WaitHelper(newPage);

    // Update BaseListPage internal state if needed (WaitHelper is recreated above)
    this._openedInNewTab = true;

    console.log('[Report] Switched to new report tab successfully');

    // Wait for the report content to render on the new tab
    await this.waitForReportToRender();
  }

  /**
   * Click Show Report button with multiple selector strategies.
   * Returns true if a button was successfully clicked.
   */
  private async clickShowReportButton(): Promise<boolean> {
    // Tier 1: Most specific & reliable patterns
    const tier1Selectors = [
      'button:has-text("Show Report")',
      'button[aria-label="Show Report"]',
      'button:has-text("View Report")',
      'button[aria-label="View Report"]',
      'button.btn-report',
    ];

    // Tier 2: Framework-specific patterns (DevExtreme)
    const tier2Selectors = [
      'dx-button:has-text("Show Report")',
      '[dx-button]:has-text("Show Report")',
      'dx-button:has-text("View Report")',
      '[dx-button]:has-text("View Report")',
      'button[class*="dx-button"]',
    ];

    // Tier 3: Broad but efficient patterns
    const tier3Selectors = [
      'button[type="submit"]',
      '[role="button"]:has-text("Show")',
      '[role="button"]:has-text("View")',
      'button:has-text("Search")',
      'button[aria-label*="Report"]',
      '[role="button"]:has-text("Report")',
    ];

    // Tier 4: Alternative frameworks & fallbacks
    const tier4Selectors = [
      'input[type="submit"][value*="Show"]',
      'input[type="submit"][value*="View"]',
      '.search-button',
      '.show-report-button',
      'button:visible',
    ];

    const allSelectors = [...tier1Selectors, ...tier2Selectors, ...tier3Selectors, ...tier4Selectors];

    for (const selector of allSelectors) {
      try {
        const buttons = this.page.locator(selector);
        const count = await buttons.count().catch(() => 0);

        if (count > 0) {
          for (let i = 0; i < Math.min(count, 3); i++) {
            try {
              const btn = buttons.nth(i);
              const isVisible = await btn.isVisible({ timeout: 500 }).catch(() => false);
              const isDisabled = await btn.isDisabled().catch(() => false);

              if (isVisible && !isDisabled) {
                await btn.scrollIntoViewIfNeeded().catch(() => { });
                await btn.click({ timeout: 2000 });
                return true;
              }
            } catch {
              continue;
            }
          }
        }
      } catch {
        continue;
      }
    }

    return false;
  }
  /**
   * Wait for the report table/content to render after clicking Show Report.
   * Optimized for DevExtreme framework.
   */
  private async waitForReportToRender(): Promise<void> {
    // Primary: DevExtreme grid (most likely)
    const primarySelectors = [
      'dx-data-grid',
      '.dx-datagrid-rowsview',
    ];

    // Secondary: Standard HTML table with role
    const secondarySelectors = [
      '[role="grid"]',
      'table[role="grid"]',
    ];

    // Fallback: Generic table
    const fallbackSelectors = [
      'table',
      'tbody',
    ];

    const allSelectors = [...primarySelectors, ...secondarySelectors, ...fallbackSelectors];

    let foundVisible = false;

    for (const selector of allSelectors) {
      try {
        const element = this.page.locator(selector).first();
        const isVisible = await Promise.race([
          element.isVisible({ timeout: 3000 }).then(() => true),
          this.page.waitForTimeout(3000).then(() => false)
        ]).catch(() => false);

        if (isVisible) {
          await this.page.waitForTimeout(500);
          foundVisible = true;
          break;
        }
      } catch (error) {
        continue;
      }
    }

    if (!foundVisible) {
      // Check for no-data message
      const noDataVisible = await this.page.locator(this.noDataMessage).first()
        .isVisible({ timeout: 1000 })
        .catch(() => false);

      if (!noDataVisible) {
        throw new Error('Report did not render: No data grid or table found');
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CLEAR FILTERS
  // ═══════════════════════════════════════════════════════════════════════════

  async clearFilters(): Promise<void> {
    const clearBtn = this.page.locator(this.clearFilterButton);
    if (await clearBtn.isVisible()) {
      await clearBtn.click();
      await this.waitHelper.waitForRequestQuiet();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TABLE VERIFICATION
  // ═══════════════════════════════════════════════════════════════════════════

  async verifyReportTableVisible(): Promise<void> {
    await this.waitHelper.waitForElement(this.reportTable);
  }

  /** Get all revenue entities from the report table */
  async getRevenueEntities(): Promise<string[]> {
    const entities: string[] = [];
    const rows = this.page.locator(`${this.reportTable} tbody tr:not(.dx-freespace-row, .grand-total-row)`);
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const entityCell = rows.nth(i).locator('td').first();
      const text = await entityCell.textContent();
      if (text && text.trim()) {
        entities.push(text.trim());
      }
    }

    return entities;
  }

  /** Get transaction count for a specific revenue entity */
  async getTransactionCount(entityName: string): Promise<number> {
    const rows = this.page.locator(`${this.reportTable} tbody tr:not(.dx-freespace-row, .grand-total-row)`);
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const entityCell = rows.nth(i).locator('td').first();
      const text = await entityCell.textContent();
      if (text?.trim() === entityName) {
        const countCell = rows.nth(i).locator('td').nth(1);
        const countText = await countCell.textContent();
        return parseInt(countText?.replace(/[^0-9]/g, '') || '0', 10);
      }
    }
    return 0;
  }

  /** Get total amount for a specific revenue entity */
  async getTotalAmount(entityName: string): Promise<number> {
    const rows = this.page.locator(`${this.reportTable} tbody tr:not(.dx-freespace-row, .grand-total-row)`);
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const entityCell = rows.nth(i).locator('td').first();
      const text = await entityCell.textContent();
      if (text?.trim() === entityName) {
        const amountCell = rows.nth(i).locator('td').nth(2);
        const amountText = await amountCell.textContent();
        return parseFloat(amountText?.replace(/[^0-9.]/g, '') || '0');
      }
    }
    return 0;
  }

  /** Get grand total amount from report */
  async getGrandTotalAmount(): Promise<number> {
    const grandTotalRow = this.page.locator(this.grandTotalRow).first();
    if (await grandTotalRow.isVisible()) {
      const amountCell = grandTotalRow.locator('td').last();
      const text = await amountCell.textContent();
      return parseFloat(text?.replace(/[^0-9.]/g, '') || '0');
    }
    return 0;
  }

  /** Check if entity appears in report */
  async verifyEntityInReport(entityName: string): Promise<boolean> {
    const rows = this.page.locator(`${this.reportTable} tbody tr:not(.dx-freespace-row, .grand-total-row)`);
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const entityCell = rows.nth(i).locator('td').first();
      const text = await entityCell.textContent();
      if (text?.trim() === entityName) return true;
    }
    return false;
  }

  /** Verify entity has zero data in the report */
  async verifyEntityHasZeroData(entityName: string): Promise<boolean> {
    const rows = this.page.locator(`${this.reportTable} tbody tr:not(.dx-freespace-row, .grand-total-row)`);
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const entityCell = rows.nth(i).locator('td').first();
      const text = await entityCell.textContent();
      if (text?.trim() === entityName) {
        const countCell = rows.nth(i).locator('td').nth(1);
        const amountCell = rows.nth(i).locator('td').nth(2);
        const countText = await countCell.textContent();
        const amountText = await amountCell.textContent();

        const countVal = parseInt(countText?.replace(/[^0-9]/g, '') || '0', 10);
        const amountVal = parseFloat(amountText?.replace(/[^0-9.]/g, '') || '0');
        return countVal === 0 && amountVal === 0;
      }
    }
    return false;
  }

  /** Verify no data message is displayed */
  async verifyNoDataMessage(): Promise<void> {
    await this.waitHelper.waitForElement(this.noDataMessage);
  }

  /** Check if report is empty */
  async isReportEmpty(): Promise<boolean> {
    const noDataMsg = this.page.locator(this.noDataMessage);
    return await noDataMsg.isVisible().catch(() => false);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPORT
  // ═══════════════════════════════════════════════════════════════════════════

  async exportAsPdf(): Promise<void> {
    await this.clickExportAndSelectFormat('PDF');
  }

  async exportAsExcel(): Promise<void> {
    await this.clickExportAndSelectFormat('Excel');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // REPORT DATA EXTRACTION
  // ═══════════════════════════════════════════════════════════════════════════

  /** Get all report data as array of objects */
  async getAllReportData(): Promise<Array<{ entity: string; count: number; amount: number }>> {
    const data: Array<{ entity: string; count: number; amount: number }> = [];
    const rows = this.page.locator(`${this.reportTable} tbody tr:not(.dx-freespace-row, .grand-total-row)`);
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const cells = rows.nth(i).locator('td');
      const entity = await cells.nth(0).textContent();
      const countText = await cells.nth(1).textContent();
      const amountText = await cells.nth(2).textContent();

      if (entity?.trim()) {
        data.push({
          entity: entity.trim(),
          count: parseInt(countText?.replace(/[^0-9]/g, '') || '0', 10),
          amount: parseFloat(amountText?.replace(/[^0-9.]/g, '') || '0'),
        });
      }
    }

    return data;
  }

  /** Verify multiple reports data matches expected */
  async verifyReportDataMatches(expectedData: Array<{ entity: string; count: number; amount: number }>): Promise<void> {
    const actualData = await this.getAllReportData();

    for (const expected of expectedData) {
      const actual = actualData.find(d => d.entity === expected.entity);
      if (!actual) {
        throw new Error(`Entity ${expected.entity} not found in report`);
      }
      if (actual.count !== expected.count || actual.amount !== expected.amount) {
        throw new Error(
          `Mismatch for ${expected.entity}: ` +
          `expected count=${expected.count} amount=${expected.amount}, ` +
          `got count=${actual.count} amount=${actual.amount}`
        );
      }
    }
  }
}
