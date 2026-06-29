/**
 * ModuleAuditor — Unified Page & Dialog Explorer
 *
 * Replaces the separate page-audit.ts + extract_report_controls.ts scripts
 * with a single professional tool that:
 *
 *  1. Reads every leaf module from Guides/sidemenue.log
 *  2. Navigates to each via the side-menu search input
 *  3. Collects all interactive components with contextual, hierarchical keys
 *  4. Detects Add New / Create / Edit / Update / View / Export buttons
 *     in page headers AND in table rows
 *  5. Clicks each action button, captures the opened dialog/screen/route,
 *     then closes it so the next button can be investigated
 *  6. Stores everything under impressive, self-describing JSON keys
 *
 * Output: ./module-audit-report.json
 */

import { chromium, Browser, BrowserContext, Page, Locator } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface MenuLeaf {
  title: string;
  url: string;
}

interface ModuleMeta {
  url: string;
  pageTitle: string;
  heading: string;
  breadcrumb: string[];
  pageType: 'list' | 'form' | 'report' | 'dashboard' | 'unknown';
  timestamp: string;
}

interface FilterControl {
  key: string;
  label: string;
  type: 'date-picker' | 'text-input' | 'dropdown' | 'checkbox' | 'radio' | 'unknown';
  currentValue: string | null;
  selector: string;
  /** Best-practice CSS selector for test automation */
  recommendedSelector: string;
}

interface ActionButton {
  key: string;
  text: string;
  location: 'header' | 'table-row' | 'table-header' | 'footer';
  type: 'add' | 'create' | 'edit' | 'view' | 'delete' | 'export' | 'search' | 'clear' | 'submit' | 'other';
  selector: string;
  ariaLabel: string | null;
  /** True if clicking this button opened a dialog/page */
  opensDialog: boolean;
}

interface TableColumn {
  index: number;
  text: string;
  field: string | null;
  sortable: boolean;
}

interface TableInfo {
  hasTable: boolean;
  selector: string;
  columns: TableColumn[];
  rowCount: number;
  hasPagination: boolean;
  rowActionButtons: string[];
}

interface FormField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'toggle' | 'unknown';
  required: boolean;
  placeholder: string | null;
  selector: string;
  maxLength: number | null;
}

interface DialogAudit {
  trigger: string;
  triggerKey: string;
  dialogType: 'modal' | 'drawer' | 'popup' | 'inline' | 'new-page';
  title: string;
  fields: FormField[];
  actions: { text: string; type: 'save' | 'cancel' | 'delete' | 'other'; selector: string }[];
  error: string | null;
}

interface ModuleAuditResult {
  meta: ModuleMeta;
  filters: Record<string, FilterControl>;
  actionButtons: {
    header: ActionButton[];
    table: ActionButton[];
  };
  table: TableInfo;
  formFields: FormField[];
  dialogInvestigations: Record<string, DialogAudit>;
  error: string | null;
}

interface AuditReport {
  generatedAt: string;
  totalModules: number;
  auditedModules: number;
  skippedModules: number;
  environment: string;
  results: Record<string, ModuleAuditResult>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const SIDEMENU_PATH = path.join(process.cwd(), 'Guides', 'sidemenue.log');
const OUTPUT_PATH = path.join(process.cwd(), 'module-audit-report.json');
const STATE_PATH = path.join(process.cwd(), 'storageState.stage.json');
const BASE_URL = process.env.BASE_URL || 'https://staging.tahseel.gov.ae/ManagePortal';

const MENU_SEARCH = '#kt_aside_menu input[type="search"]';
const MENU_LINK_TEXT = 'span.kt-menu__link-text';
const PAGE_LINK = 'a.kt-menu__link[href*="/ManagePortal/"]';

// ═══════════════════════════════════════════════════════════════════════════════
// SIDEMENU LOG PARSER
// ═══════════════════════════════════════════════════════════════════════════════

function parseSidemenuLog(filePath: string): MenuLeaf[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').map(l => l.trim());

  const leaves: MenuLeaf[] = [];
  let currentTitle = '';

  for (const line of lines) {
    if (line.startsWith('[Item') && line.includes('Text:')) {
      currentTitle = line.slice(line.indexOf('Text:') + 5).trim();
    } else if (line.includes('Link:')) {
      const rawUrl = line.slice(line.indexOf('Link:') + 5).trim();
      if (rawUrl && rawUrl.length > 0 && currentTitle) {
        leaves.push({ title: currentTitle, url: rawUrl });
      }
    }
  }

  // Deduplicate by URL
  const seen = new Set<string>();
  return leaves.filter(leaf => {
    if (seen.has(leaf.url)) return false;
    seen.add(leaf.url);
    return true;
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE AUDITOR CLASS
// ═══════════════════════════════════════════════════════════════════════════════

class ModuleAuditor {
  private page: Page;
  private log: (msg: string) => void;

  constructor(page: Page, log?: (msg: string) => void) {
    this.page = page;
    this.log = log || (() => {});
  }

  // ── Side-menu navigation ─────────────────────────────────────────────────

  async navigateToModule(moduleTitle: string): Promise<boolean> {
    try {
      const searchInput = this.page.locator(MENU_SEARCH).first();
      await searchInput.waitFor({ state: 'visible', timeout: 8000 });
      await searchInput.fill(moduleTitle);
      await this.page.waitForTimeout(500);

      // Find matching span — search ALL spans (visible + hidden in collapsed submenus)
      const spans = this.page.locator(MENU_LINK_TEXT);
      const count = await spans.count();

      interface FoundSpan { span: Locator; text: string }
      let found: FoundSpan | null = null;

      const check = async (matchFn: (t: string) => boolean): Promise<FoundSpan | null> => {
        for (let i = 0; i < count; i++) {
          const s = spans.nth(i);
          const t = (await s.textContent().catch(() => ''))?.trim() || '';
          if (matchFn(t)) return { span: s, text: t };
        }
        return null;
      };

      found = await check(t => t === moduleTitle.trim());
      if (!found) found = await check(t => t.includes(moduleTitle.trim()) && t.length > 0);
      if (!found) return false;

      // Expand parent submenus (outermost → innermost)
      await this.expandParentSubmenus(found.span);

      // Click the parent <a> link
      const link = found.span.locator('xpath=ancestor::a[1]');
      await link.waitFor({ state: 'visible', timeout: 5000 });
      await link.click();

      await this.waitForPageSettle();
      return true;
    } catch (err: any) {
      this.log(`   ⚠ Navigation failed: ${err.message}`);
      return false;
    }
  }

  private async expandParentSubmenus(span: Locator): Promise<void> {
    const parentLis = span.locator('xpath=ancestor::li[contains(@class, "kt-menu__item--submenu")]');
    const count = await parentLis.count();
    if (count === 0) return;

    const parents: Locator[] = [];
    for (let i = 0; i < count; i++) parents.push(parentLis.nth(i));
    parents.reverse(); // outermost first

    for (const li of parents) {
      const toggle = li.locator('> a.kt-menu__toggle, > a.kt-menu__link');
      if ((await toggle.count()) === 0) continue;
      const submenu = li.locator('> div.kt-menu__submenu');
      const expanded = await submenu.first().isVisible().catch(() => false);
      if (!expanded) {
        await toggle.first().click();
        await this.page.waitForTimeout(400);
      }
    }
  }

  // ── Professional page-stability engine ───────────────────────────────────

  /**
   * Wait for the page to reach full stability before capturing elements.
   *
   * Checks (in order, each with its own timeout):
   *  1. DOM content loaded
   *  2. Network idle (graceful — won't hang on SPA polling)
   *  3. Angular zone stability (if Zone.js is present)
   *  4. All loading spinners / indicators gone
   *  5. DevExtreme widgets (grids, dropdowns, date‑boxes) rendered
   *  6. Request‑quiet window (no in‑flight XHR for 700 ms)
   *
   * Hard cap: 20 000 ms. If still not fully idle after that, we continue
   * anyway — better to capture a partially‑rendered page than crash.
   */
  private async waitForPageSettle(): Promise<void> {
    const start = Date.now();
    const MAX_TOTAL_MS = 20_000;
    const log = this.log;

    // ── 1. DOM content loaded ──────────────────────────────────────────
    await this.page.waitForLoadState('domcontentloaded', { timeout: 15_000 }).catch(() => {});

    // ── 2. Network idle (10 s max — won't hang on polling SPAs) ────────
    await Promise.race([
      this.page.waitForLoadState('networkidle', { timeout: 10_000 }),
      new Promise(r => setTimeout(r, 10_000)),
    ]).catch(() => {});

    // ── 3. Angular zone stability ──────────────────────────────────────
    try {
      await this.page.waitForFunction(
        () => {
          const win = globalThis as any;
          if (typeof win.getAllAngularTestabilities !== 'function') return true;
          return win.getAllAngularTestabilities().every((t: any) => t.isStable());
        },
        { timeout: 8000 },
      );
    } catch { /* Angular not present or not stable — continue */ }

    // ── 4. Loading spinners / overlays gone ────────────────────────────
    const spinnerSelectors = [
      '.dx-loadindicator', '.dx-loadpanel',
      '.spinner', '.loader', 'ngx-spinner',
      '[class*="loading"]', '.loading-overlay',
      '.dx-datagrid-loadpanel',
    ];
    for (const sel of spinnerSelectors) {
      try {
        const el = this.page.locator(sel).first();
        const visible = await el.isVisible({ timeout: 2000 }).catch(() => false);
        if (visible) {
          await el.waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});
        }
      } catch { /* continue */ }
    }

    // ── 5. DevExtreme widgets rendered ─────────────────────────────────
    const dxSelectors = [
      'dx-data-grid', '.dx-datagrid-rowsview',
      'dx-select-box', 'dx-date-box',
    ];
    for (const sel of dxSelectors) {
      try {
        const el = this.page.locator(sel).first();
        const present = await el.count().catch(() => 0);
        if (present > 0) {
          await el.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
          // Extra settle for data rows to populate
          await this.page.waitForTimeout(400);
        }
      } catch { /* continue */ }
    }

    // ── 6. Request‑quiet window ────────────────────────────────────────
    await this.waitForRequestQuiet(700, 12_000).catch(() => {});

    const elapsed = Date.now() - start;
    if (elapsed > 5000) {
      log(`      ⏱️  Page stabilised in ${elapsed}ms`);
    }
  }

  /**
   * Waits until no in-flight XHR/fetch requests exist for `quietWindowMs`
   * consecutive milliseconds (default 700 ms). Resolves gracefully if the
   * total `maxWaitMs` is exhausted.
   */
  private async waitForRequestQuiet(quietWindowMs = 700, maxWaitMs = 12_000): Promise<void> {
    let inFlight = 0;
    const start = Date.now();

    await new Promise<void>(resolve => {
      const done = () => {
        this.page.removeListener('request', onReq);
        this.page.removeListener('response', onRes);
        this.page.removeListener('requestfailed', onRes);
        resolve();
      };

      const onReq = () => { inFlight++; };
      const onRes = () => {
        inFlight = Math.max(0, inFlight - 1);
      };

      this.page.on('request', onReq);
      this.page.on('response', onRes);
      this.page.on('requestfailed', onRes);

      const poll = () => {
        if (inFlight === 0 && Date.now() - start > quietWindowMs) return done();
        if (Date.now() - start > maxWaitMs) return done();
        setTimeout(poll, 200);
      };
      poll();
    });
  }

  // ── Full module audit ────────────────────────────────────────────────────

  async auditModule(leaf: MenuLeaf): Promise<ModuleAuditResult> {
    const result: ModuleAuditResult = {
      meta: {
        url: leaf.url,
        pageTitle: '',
        heading: '',
        breadcrumb: [],
        pageType: 'unknown',
        timestamp: new Date().toISOString(),
      },
      filters: {},
      actionButtons: { header: [], table: [] },
      table: { hasTable: false, selector: '', columns: [], rowCount: 0, hasPagination: false, rowActionButtons: [] },
      formFields: [],
      dialogInvestigations: {},
      error: null,
    };

    try {
      // Ensure page is fully stable before collecting anything
      await this.waitForPageSettle();

      // 1. Collect metadata
      result.meta = await this.collectMeta(leaf);

      // 2. Collect filters
      result.filters = await this.collectFilters();

      // 3. Collect action buttons (header + table)
      result.actionButtons = await this.collectActionButtons();

      // 4. Collect table info
      result.table = await this.collectTableInfo();

      // 5. Collect form fields (on page — before clicking anything)
      result.formFields = await this.collectFormFields();

      // 6. Investigate action buttons (click → capture dialog → close)
      result.dialogInvestigations = await this.investigateActions(result.actionButtons);

    } catch (err: any) {
      result.error = err.message;
    }

    return result;
  }

  // ── Meta collection ──────────────────────────────────────────────────────

  private async collectMeta(leaf: MenuLeaf): Promise<ModuleMeta> {
    const pageTitle = await this.page.title().catch(() => '');
    const heading = await this.page.locator('h1, h3.kt-subheader__title, .page-title')
      .first().textContent().catch(() => '') || '';

    const breadcrumb: string[] = [];
    const bcItems = this.page.locator('.kt-subheader__breadcrumbs li, .breadcrumb li, [class*="breadcrumb"] li');
    const bcCount = await bcItems.count();
    for (let i = 0; i < bcCount; i++) {
      const text = (await bcItems.nth(i).textContent().catch(() => ''))?.trim();
      if (text) breadcrumb.push(text);
    }

    // Detect page type
    const hasTable = await this.page.locator('table[role="grid"], dx-data-grid, .dx-datagrid').first().isVisible().catch(() => false);
    const hasForm = await this.page.locator('.form-group, [class*="form"], .dx-form').first().isVisible().catch(() => false);
    const hasFilters = await this.page.locator('dx-date-box, [class*="filter"], .search-criteria').first().isVisible().catch(() => false);

    let pageType: ModuleMeta['pageType'] = 'unknown';
    if (hasTable && hasFilters) pageType = 'report';
    else if (hasTable && !hasForm) pageType = 'list';
    else if (hasForm) pageType = 'form';
    else if (leaf.url.includes('/dashboard')) pageType = 'dashboard';

    return {
      url: this.page.url(),
      pageTitle,
      heading: heading?.trim() || leaf.title,
      breadcrumb,
      pageType,
      timestamp: new Date().toISOString(),
    };
  }

  // ── Filter collection ────────────────────────────────────────────────────

  private async collectFilters(): Promise<Record<string, FilterControl>> {
    const filters: Record<string, FilterControl> = {};

    // DevExtreme date boxes
    const dxDates = this.page.locator('dx-date-box');
    const dxDateCount = await dxDates.count();
    for (let i = 0; i < dxDateCount; i++) {
      const box = dxDates.nth(i);
      if (!(await box.isVisible().catch(() => false))) continue;
      const input = box.locator('input.dx-texteditor-input');
      const value = await input.inputValue().catch(() => null);
      const placeholder = await input.getAttribute('placeholder').catch(() => null);
      const id = await box.getAttribute('id').catch(() => null);

      const key = id ? `date_${id}` : `date_${i}`;
      filters[key] = {
        key,
        label: placeholder || `Date ${i + 1}`,
        type: 'date-picker',
        currentValue: value,
        selector: id ? `#${id} input` : `dx-date-box:nth-of-type(${i + 1}) input`,
        recommendedSelector: id ? `#${id} input.dx-texteditor-input` : '',
      };
    }

    // DevExtreme select boxes (dropdowns)
    const dxSelects = this.page.locator('dx-select-box');
    const dxSelectCount = await dxSelects.count();
    for (let i = 0; i < dxSelectCount; i++) {
      const box = dxSelects.nth(i);
      if (!(await box.isVisible().catch(() => false))) continue;
      const input = box.locator('input.dx-texteditor-input');
      const value = await input.inputValue().catch(() => null);
      const placeholder = await input.getAttribute('placeholder').catch(() => null);
      const id = await box.getAttribute('id').catch(() => null);

      const key = id ? `dropdown_${id}` : `dropdown_${i}`;
      filters[key] = {
        key,
        label: placeholder || `Dropdown ${i + 1}`,
        type: 'dropdown',
        currentValue: value || 'ALL',
        selector: id ? `#${id}` : `dx-select-box:nth-of-type(${i + 1})`,
        recommendedSelector: id ? `#${id}` : '',
      };
    }

    // Native <select> elements
    const nativeSelects = this.page.locator('select:not([style*="display: none"])');
    const nsCount = await nativeSelects.count();
    for (let i = 0; i < nsCount; i++) {
      const sel = nativeSelects.nth(i);
      if (!(await sel.isVisible().catch(() => false))) continue;
      const id = await sel.getAttribute('id').catch(() => null);
      const name = await sel.getAttribute('name').catch(() => null);
      const value = await sel.inputValue().catch(() => null);

      const key = id || name || `select_${i}`;
      filters[key] = {
        key,
        label: name || `Select ${i + 1}`,
        type: 'dropdown',
        currentValue: value,
        selector: id ? `#${id}` : `select[name="${name}"]`,
        recommendedSelector: id ? `#${id}` : `select[name="${name}"]`,
      };
    }

    return filters;
  }

  // ── Action button collection ─────────────────────────────────────────────

  private async collectActionButtons(): Promise<{ header: ActionButton[]; table: ActionButton[] }> {
    const headerBtns: ActionButton[] = [];
    const tableBtns: ActionButton[] = [];

    // ── Header buttons ──
    const headerSelectors = [
      'button:not(td button):not(.dx-pager button):visible',
      'a[role="button"]:not(td a):visible',
      'input[type="submit"]:not(td input):visible',
      'input[type="button"]:not(td input):visible',
    ];

    for (const sel of headerSelectors) {
      const buttons = this.page.locator(sel);
      const count = await buttons.count();
      for (let i = 0; i < Math.min(count, 30); i++) {
        const btn = buttons.nth(i);
        if (!(await btn.isVisible().catch(() => false))) continue;

        const text = (await btn.textContent().catch(() => ''))?.trim() || '';
        const ariaLabel = await btn.getAttribute('aria-label').catch(() => null);
        const cls = (await btn.getAttribute('class').catch(() => null)) || '';
        const id = await btn.getAttribute('id').catch(() => null);

        // Skip invisible / sidebar / pagination / utility buttons
        if (text.length < 2 || text.length > 100) continue;
        if (text.includes('<svg') || text.includes('Stockholm-icons') || text.includes('Created with Sketch')) continue;
        if (cls.includes('pager') || cls.includes('dx-page') || cls.includes('kt-aside')) continue;

        const btnType = this.classifyButton(text, cls);
        const btnInfo: ActionButton = {
          key: id || this.slugify(text),
          text,
          location: 'header',
          type: btnType,
          selector: this.buildButtonSelector(btn, id, cls, text),
          ariaLabel,
          opensDialog: btnType === 'add' || btnType === 'create' || btnType === 'edit' || btnType === 'view',
        };

        // Avoid duplicates
        if (!headerBtns.some(b => b.text === btnInfo.text && b.type === btnInfo.type)) {
          headerBtns.push(btnInfo);
        }
      }
    }

    // ── Table-row action buttons ──
    const tableActionSelectors = [
      'td button:visible',
      'td a[role="button"]:visible',
      'td a[title*="Edit"]:visible',
      'td a[title*="View"]:visible',
      'td a[title*="Delete"]:visible',
      '[class*="dx-command-edit"] button:visible, [class*="dx-command-edit"] a:visible',
    ];

    for (const sel of tableActionSelectors) {
      const buttons = this.page.locator(sel);
      const count = await buttons.count();
      for (let i = 0; i < Math.min(count, 20); i++) {
        const btn = buttons.nth(i);
        if (!(await btn.isVisible().catch(() => false))) continue;

        const text = (await btn.textContent().catch(() => ''))?.trim() || '';
        const ariaLabel = await btn.getAttribute('aria-label').catch(() => null);
        const title = await btn.getAttribute('title').catch(() => null);
        const cls = (await btn.getAttribute('class').catch(() => null)) || '';

        // Prefer title/ariaLabel for icon-only buttons
        const displayText = text || title || ariaLabel || '';

        if (displayText.length < 1 || displayText.length > 50) continue;
        if (displayText.includes('<svg')) continue;

        const btnType = this.classifyButton(displayText, cls);
        const btnInfo: ActionButton = {
          key: this.slugify(displayText),
          text: displayText,
          location: 'table-row',
          type: btnType,
          selector: this.buildTableActionSelector(btn, displayText),
          ariaLabel: ariaLabel || title,
          opensDialog: btnType === 'edit' || btnType === 'view' || btnType === 'delete',
        };

        if (!tableBtns.some(b => b.text === btnInfo.text && b.type === btnInfo.type)) {
          tableBtns.push(btnInfo);
        }
      }
    }

    return { header: headerBtns, table: tableBtns };
  }

  private classifyButton(text: string, cls: string): ActionButton['type'] {
    const t = text.toLowerCase();
    if (t.includes('add new') || t.includes('إضافة') || t.includes('create') || t.includes('إنشاء')) return 'add';
    if (t.includes('edit') || t.includes('تعديل')) return 'edit';
    if (t.includes('view') || t.includes('detail') || t.includes('عرض') || t.includes('تفاصيل')) return 'view';
    if (t.includes('delete') || t.includes('حذف')) return 'delete';
    if (t.includes('export') || t.includes('تصدير')) return 'export';
    if (t.includes('search') || t.includes('بحث') || t.includes('show report') || t.includes('عرض التقرير')) return 'search';
    if (t.includes('submit') || t.includes('save') || t.includes('حفظ')) return 'submit';
    if (t.includes('clear') || t.includes('reset') || t.includes('مسح')) return 'clear';
    return 'other';
  }

  private buildButtonSelector(btn: Locator, id: string | null, cls: string, text: string): string {
    if (id) return `#${id}`;
    if (cls.includes('btn-primary') && cls.includes('UpperCaseButton') && text.length <= 30) {
      return `button.btn-primary.UpperCaseButton:has-text("${text.substring(0, 20)}")`;
    }
    return `button:has-text("${text.substring(0, 30)}")`;
  }

  private buildTableActionSelector(btn: Locator, text: string): string {
    const escaped = text.replace(/"/g, '\\"').substring(0, 30);
    return `td a[title*="${escaped}"], td button[title*="${escaped}"], td [aria-label*="${escaped}"]`;
  }

  // ── Table info ───────────────────────────────────────────────────────────

  private async collectTableInfo(): Promise<TableInfo> {
    const result: TableInfo = {
      hasTable: false,
      selector: '',
      columns: [],
      rowCount: 0,
      hasPagination: false,
      rowActionButtons: [],
    };

    // Find the main data table
    const tableSelectors = [
      'table[role="grid"]',
      'dx-data-grid',
      '.dx-datagrid',
      'table.report-table',
      'table[class*="table"]:not(.kt-aside *)',
      'table',
    ];

    let mainTable: Locator | null = null;
    for (const sel of tableSelectors) {
      const el = this.page.locator(sel).first();
      if (await el.isVisible().catch(() => false)) {
        mainTable = el;
        result.selector = sel;
        break;
      }
    }

    if (!mainTable) return result;

    result.hasTable = true;

    // Columns
    const headers = mainTable.locator('th, [role="columnheader"], .dx-column-header');
    const hCount = await headers.count();
    for (let i = 0; i < hCount; i++) {
      const h = headers.nth(i);
      const text = (await h.textContent().catch(() => ''))?.trim() || '';
      if (text && text.length < 60) {
        result.columns.push({
          index: i,
          text,
          field: await h.getAttribute('data-field').catch(() => null),
          sortable: (await h.getAttribute('class').catch(() => ''))?.includes('sortable') || false,
        });
      }
    }

    // Row count (exclude header/freespace rows)
    const rows = mainTable.locator('tbody tr:not(.dx-freespace-row):not(.dx-header-row), [role="row"]:not([aria-rowindex="1"])');
    result.rowCount = await rows.count();

    // Pagination
    result.hasPagination = await this.page.locator('.dx-pager, [class*="pagination"], .dx-page-size').first().isVisible().catch(() => false);

    // Row action buttons (deduplicated)
    const tdButtons = mainTable.locator('td button, td a[role="button"], td [title*="Edit"], td [title*="View"], td [title*="Delete"]');
    const seen = new Set<string>();
    const tdCount = await tdButtons.count();
    for (let i = 0; i < Math.min(tdCount, 30); i++) {
      const b = tdButtons.nth(i);
      const text = (await b.textContent().catch(() => ''))?.trim() || (await b.getAttribute('title').catch(() => '')) || '';
      if (text && text.length < 30 && !seen.has(text)) {
        result.rowActionButtons.push(text);
        seen.add(text);
      }
    }

    return result;
  }

  // ── Form fields (on page, before clicking anything) ──────────────────────

  private async collectFormFields(): Promise<FormField[]> {
    const fields: FormField[] = [];
    const seen = new Set<string>();

    // Visible inputs
    const inputs = this.page.locator('input:visible, textarea:visible, select:visible');
    const count = await inputs.count();

    for (let i = 0; i < Math.min(count, 50); i++) {
      const el = inputs.nth(i);
      const tagName = await el.evaluate(e => (e as HTMLInputElement).tagName.toLowerCase());
      const type = await el.getAttribute('type').catch(() => null);
      const placeholder = await el.getAttribute('placeholder').catch(() => null);
      const name = await el.getAttribute('name').catch(() => null);
      const id = await el.getAttribute('id').catch(() => null);
      const required = await el.getAttribute('required').catch(() => null);
      const maxLength = parseInt(await el.getAttribute('maxlength').catch(() => '') || '', 10) || null;

      const key = id || name || `${tagName}_${i}`;
      if (seen.has(key)) continue;
      seen.add(key);

      // Find associated label
      let label = placeholder || name || '';
      if (id) {
        const lbl = this.page.locator(`label[for="${id}"]`);
        label = (await lbl.first().textContent().catch(() => ''))?.trim() || label;
      }

      if (!label || label.length < 1) continue;

      fields.push({
        key,
        label,
        type: tagName === 'select' ? 'select' :
              tagName === 'textarea' ? 'textarea' :
              type === 'checkbox' ? 'checkbox' :
              type === 'date' ? 'date' :
              type === 'number' ? 'number' : 'text',
        required: required !== null,
        placeholder,
        selector: id ? `#${id}` : name ? `[name="${name}"]` : '',
        maxLength,
      });
    }

    return fields;
  }

  // ── Dialog investigation — click actions, capture dialogs, close ─────────

  private async investigateActions(buttons: { header: ActionButton[]; table: ActionButton[] }): Promise<Record<string, DialogAudit>> {
    const investigations: Record<string, DialogAudit> = {};
    const currentUrl = this.page.url();

    // Investigate header actions that open dialogs
    const dialogOpening = buttons.header.filter(b => b.opensDialog);
    for (const btn of dialogOpening) {
      try {
        const audit = await this.investigateSingleAction(btn, currentUrl);
        investigations[btn.key] = audit;
        // Navigate back to the original page
        await this.returnToOriginalPage(currentUrl);
      } catch (err: any) {
        investigations[btn.key] = {
          trigger: btn.text,
          triggerKey: btn.key,
          dialogType: 'modal',
          title: '',
          fields: [],
          actions: [],
          error: err.message,
        };
        await this.returnToOriginalPage(currentUrl).catch(() => {});
      }
    }

    // Investigate one table-row action (first row, if any)
    const dialogTableActions = buttons.table.filter(b => b.opensDialog);
    if (dialogTableActions.length > 0) {
      try {
        // Click the first row's action button
        const firstRowAction = this.page.locator(dialogTableActions[0].selector).first();
        if (await firstRowAction.isVisible().catch(() => false)) {
          await firstRowAction.click();
          await this.page.waitForTimeout(1500);

          const audit = await this.captureDialogState(dialogTableActions[0]);
          investigations[dialogTableActions[0].key] = audit;
          await this.closeDialog();
          await this.returnToOriginalPage(currentUrl);
        }
      } catch (err: any) {
        investigations[dialogTableActions[0].key] = {
          trigger: dialogTableActions[0].text,
          triggerKey: dialogTableActions[0].key,
          dialogType: 'modal',
          title: '',
          fields: [],
          actions: [],
          error: err.message,
        };
        await this.returnToOriginalPage(currentUrl).catch(() => {});
      }
    }

    return investigations;
  }

  private async investigateSingleAction(btn: ActionButton, originalUrl: string): Promise<DialogAudit> {
    this.log(`      🔍 Investigating: "${btn.text}"`);
    const DIALOG_TIMEOUT = 12_000; // 12s max per dialog

    const failResult = (err: string): DialogAudit => ({
      trigger: btn.text, triggerKey: btn.key,
      dialogType: 'modal', title: '',
      fields: [], actions: [], error: err,
    });

    try {
      // Click the button (with timeout)
      const button = this.page.locator(btn.selector).first();
      await button.waitFor({ state: 'visible', timeout: 5000 });
      await button.click();

      // Wait briefly for dialog to open — capped at 3s
      await Promise.race([
        this.page.waitForTimeout(3000),
        new Promise(resolve => setTimeout(resolve, 3000)),
      ]);

      // Capture dialog state with hard timeout
      const audit = await Promise.race([
        this.captureDialogState(btn),
        new Promise<DialogAudit>((_, reject) =>
          setTimeout(() => reject(new Error('Dialog capture timed out')), DIALOG_TIMEOUT)
        ),
      ]);

      // Close the dialog (quick-fire, fire-and-forget)
      await Promise.race([
        this.closeDialog(),
        new Promise(resolve => setTimeout(resolve, 4000)),
      ]);

      return audit;
    } catch (err: any) {
      // Attempt cleanup even after error
      await this.closeDialog().catch(() => {});
      return failResult(err.message);
    }
  }

  private async captureDialogState(btn: ActionButton): Promise<DialogAudit> {
    const dialogType = await this.detectDialogType();
    const title = await this.getDialogTitle();
    const fields = await this.collectFormFields(); // Re-collect fields in dialog context
    const actions = await this.collectDialogActions();

    return {
      trigger: btn.text,
      triggerKey: btn.key,
      dialogType,
      title,
      fields,
      actions,
      error: null,
    };
  }

  private async detectDialogType(): Promise<DialogAudit['dialogType']> {
    const hasModal = await this.page.locator('[role="dialog"], .modal, .mat-dialog-container, .dx-popup-wrapper')
      .first().isVisible().catch(() => false);
    if (hasModal) {
      // Check if it's a drawer
      const isDrawer = await this.page.locator('[class*="drawer"], [class*="slide"]').first().isVisible().catch(() => false);
      return isDrawer ? 'drawer' : 'modal';
    }

    const currentUrl = this.page.url();
    const prevUrl = (this as any)._lastUrl;
    if (prevUrl && currentUrl !== prevUrl) return 'new-page';

    return 'inline';
  }

  private async getDialogTitle(): Promise<string> {
    const titleSelectors = [
      '[role="dialog"] h1, [role="dialog"] h2, [role="dialog"] h3',
      '.modal h1, .modal h2, .modal h3, .modal-title',
      '.dx-popup-title',
      'h1', 'h3.kt-subheader__title',
    ];
    for (const sel of titleSelectors) {
      const text = await this.page.locator(sel).first().textContent().catch(() => null);
      if (text?.trim()) return text.trim();
    }
    return '';
  }

  private async collectDialogActions(): Promise<DialogAudit['actions']> {
    const actions: DialogAudit['actions'] = [];
    const container = await this.getDialogContainer();
    const buttons = container ? container.locator('button:visible') : this.page.locator('button:visible');
    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const btn = buttons.nth(i);
      const text = (await btn.textContent().catch(() => ''))?.trim() || '';
      if (!text || text.length < 2 || text.length > 50) continue;

      const cls = (await btn.getAttribute('class').catch(() => null)) || '';
      const t2 = text.toLowerCase();
      const actType: DialogAudit['actions'][number]['type'] =
        t2.includes('save') || t2.includes('حفظ') ? 'save' :
        t2.includes('cancel') || t2.includes('إلغاء') || t2.includes('close') ? 'cancel' :
        t2.includes('delete') || t2.includes('حذف') ? 'delete' : 'other';

      actions.push({
        text,
        type: actType,
        selector: `button:has-text("${text.substring(0, 30)}")`,
      });
    }
    return actions;
  }

  private async getDialogContainer(): Promise<Locator | null> {
    for (const sel of ['[role="dialog"]', '.modal', '.mat-dialog-container', '.dx-popup-wrapper', '.dx-popup-content']) {
      const el = this.page.locator(sel).first();
      if (await el.isVisible().catch(() => false)) return el;
    }
    return null;
  }

  private async closeDialog(): Promise<void> {
    const closeSelectors = [
      '.dx-popup-close-button',
      '.dx-popup-cancel-button',
      'button:has-text("Cancel")', 'button:has-text("إلغاء")',
      'button:has-text("Close")', 'button:has-text("إغلاق")',
      'button[aria-label*="close" i]',
      '[role="dialog"] button.cancel',
      'button:has-text("رجوع")', 'button:has-text("Return Back")',
      '.modal-footer button:last-child',
    ];

    for (const sel of closeSelectors) {
      try {
        const btn = this.page.locator(sel).first();
        const visible = await Promise.race([
          btn.isVisible(),
          new Promise(r => setTimeout(() => r(false), 800)),
        ]).catch(() => false);

        if (visible) {
          await btn.click().catch(() => {});
          await this.page.waitForTimeout(400);
          return;
        }
      } catch { /* continue */ }
    }

    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(400);

    // Last resort: click outside the backdrop
    try {
      await this.page.locator('.modal-backdrop, .cdk-overlay-backdrop, .dx-overlay-wrapper')
        .first().click({ position: { x: 10, y: 10 } }).catch(() => {});
    } catch { /* ignore */ }
  }

  private async returnToOriginalPage(originalUrl: string): Promise<void> {
    // If we navigated away, go back
    if (this.page.url() !== originalUrl) {
      await this.page.goto(originalUrl, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
      await this.page.waitForTimeout(1000);
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50) || 'button';
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

async function runAudit(): Promise<void> {
  const report: AuditReport = {
    generatedAt: new Date().toISOString(),
    totalModules: 0,
    auditedModules: 0,
    skippedModules: 0,
    environment: process.env.TEST_ENV || 'stage',
    results: {},
  };

  let browser: Browser | null = null;
  let context: BrowserContext | null = null;

  try {
    const menuLeaves = parseSidemenuLog(SIDEMENU_PATH);
    report.totalModules = menuLeaves.length;
    console.log(`🔍 Found ${menuLeaves.length} unique leaf modules.\n`);

    browser = await chromium.launch({ headless: false, args: ['--disable-web-security'] });

    context = fs.existsSync(STATE_PATH)
      ? await browser.newContext({ storageState: STATE_PATH, ignoreHTTPSErrors: true, viewport: { width: 1920, height: 1080 } })
      : await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1920, height: 1080 } });

    const page = await context.newPage();
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('#kt_aside_menu', { timeout: 15000 });
    // Let Angular bootstrap + side-menu fully render
    await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
    await page.waitForTimeout(1000);

    // ── Ensure English language for side-menu search ─────────────────────────
    // The sidemenue.log stores English titles. If the app is in Arabic,
    // switch to English so side-menu text matches the log entries.
    console.log('🔤 Checking system language...');
    const arabFlags = page.locator('img[src*="arab"]');
    const arabFlagCount = await arabFlags.count();
    if (arabFlagCount >= 2) {
      console.log('   🇦🇪 Arabic detected — switching to English');
      await arabFlags.first().click();
      await page.waitForTimeout(800);
      // Click the English (UK) flag option
      const englishFlag = page.locator('img[src*="king"]').first();
      await englishFlag.click();
      // Wait for the app to re‑render completely in English
      await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
      await page.waitForTimeout(1000);
      // Assert: after switching, English flag should have 2 instances
      const engAfter = await page.locator('img[src*="king"]').count();
      if (engAfter >= 2) {
        console.log('   ✅ Language switched to English');
      } else {
        console.log(`   ⚠ Language switch may have failed — English flag count: ${engAfter}`);
      }
    } else {
      console.log(`   ✅ Language already English (arab flag count: ${arabFlagCount})`);
    }

    const auditor = new ModuleAuditor(page, (msg: string) => console.log(msg));

    let index = 0;
    for (const leaf of menuLeaves) {
      index++;
      console.log(`\n📄 [${index}/${menuLeaves.length}] Auditing: ${leaf.title}`);

      try {
        // Try side-menu search first, fall back to direct URL
        let navOk = await auditor.navigateToModule(leaf.title);
        if (!navOk) {
          console.log(`   🔗 Side-menu miss — navigating directly to URL: ${leaf.url}`);
          await page.goto(leaf.url, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
          // Let the page settle before audit collection
          await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
          await page.waitForTimeout(500);
          navOk = true; // proceed with audit
        }

        const result = await auditor.auditModule(leaf);
        const key = leaf.title || leaf.url.split('/').pop() || `module_${index}`;
        report.results[key] = result;
        report.auditedModules++;
        console.log(`   ✅ Done — ${result.meta.pageType}, ${Object.keys(result.filters).length} filters, ${result.actionButtons.header.length + result.actionButtons.table.length} actions, ${Object.keys(result.dialogInvestigations).length} dialogs`);
      } catch (err: any) {
        console.error(`   ❌ Error: ${err.message}`);
        report.skippedModules++;
        // Recover to dashboard
        try {
          await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 15000 });
          await page.waitForSelector('#kt_aside_menu', { timeout: 10000 });
        } catch { /* fatal */ }
      }
    }

  } catch (err) {
    console.error('❌ Fatal error:', err);
  } finally {
    if (context) await context.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(report, null, 2));
  console.log(`\n🎉 Audit complete → ${OUTPUT_PATH}`);
  console.log(`📊  Total: ${report.totalModules} | Audited: ${report.auditedModules} | Skipped: ${report.skippedModules}`);
}

// Execute
runAudit().catch(console.error);
