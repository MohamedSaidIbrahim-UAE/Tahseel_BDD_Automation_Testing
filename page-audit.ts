/**
 * page-audit.ts – Professional Enterprise Audit with Advanced Wait & Element Collection
 *
 * Features:
 *  1. Enhanced waiting: Full DOM + Network idle + Custom readiness checks
 *  2. Smart modal/dialog handling: Auto-detect and close blocking overlays
 *  3. Comprehensive element collection: Interactive elements, table columns, buttons, labels
 *  4. Parse Guides/sidemenue.log → unique (title, url) leaf pages.
 *  5. Launch browser, inject storageState (if exists) to skip login.
 *  6. Ensure English language (Arabic → click #kt-language-selector, choose "English").
 *  7. For each module:
 *     a. Search it in the side menu using li.menu-search input.
 *     b. Intelligently locate and click the correct leaf link.
 *     c. Wait for full page load + handle blocking modals.
 *     d. Collect all interactive elements, table info, buttons, labels.
 *  8. Write results to page-audit-results.json.
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

// ── Types ────────────────────────────────────────────────────────────────────
interface PageAuditResult {
  [pageTitle: string]: {
    url: string;
    labels: string[];
    hasAddNewButton: boolean;
    hasExportButton: boolean;
    hasColumnChooserButton: boolean;
    hasSearchInput: boolean;
    timestamp: string;
    errorMessage?: string;
    interactiveElements?: ElementInfo[];
    tableInfo?: TableInfo;
    actionButtons?: ButtonInfo[];
    formFields?: FormFieldInfo[];
    allButtonTexts?: string[];
  };
}

interface ElementInfo {
  type: string;
  selector: string;
  text: string;
  ariaLabel?: string;
  placeholder?: string;
}

interface TableInfo {
  hasTable: boolean;
  columns: string[];
  actionButtons: string[];
  rowCount: number;
}

interface ButtonInfo {
  text: string;
  ariaLabel?: string | null;
  type?: string | null;
  class?: string | null;
}

interface FormFieldInfo {
  label: string;
  type: string;
  placeholder?: string | null;
  required?: boolean;
}

interface MenuLeaf {
  title: string;
  url: string;
}

// ── Constants (derived from the real sidebar HTML) ──────────────────────────
const SIDEMENU_LOG_PATH = path.join(process.cwd(), 'Guides', 'sidemenue.log');
const OUTPUT_PATH = path.join(process.cwd(), 'page-audit-results.json');

// Sidebar container
const SIDEBAR = '#kt_aside_menu, .kt-aside-menu';
// Search input inside the menu
const MENU_SEARCH_INPUT = 'li.menu-search input[type="search"]';
// All menu items (top-level and nested)
const MENU_ITEM = 'li.kt-menu__item';
// A link that may be a toggle (parent) or a direct page link
const MENU_LINK = 'a.kt-menu__link';
// Only page links that actually navigate – href contains /ManagePortal/
const PAGE_LINK_SELECTOR = 'a.kt-menu__link[href*="/ManagePortal/"]';
// Parent indicator (the arrow icon)
const PARENT_ARROW = 'i.kt-menu__ver-arrow';
// Text container inside a link
const LINK_TEXT_SPAN = 'span.kt-menu__link-text';

// Language
const UAE_FLAG_SELECTOR = 'img[src*="emirates"]';
const LANG_TOGGLE_SELECTOR = 'kt-language-selector, #kt-language-selector, [class*="kt-language-selector"]';
const ENGLISH_OPTION_SELECTOR = 'a:has-text("English"), li:has-text("English")';

// ── Parse sidemenue.log → unique leaf pages ─────────────────────────────────
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
      if (rawUrl && !rawUrl.startsWith('---') && rawUrl.length > 0) {
        if (currentTitle) leaves.push({ title: currentTitle, url: rawUrl });
      }
    }
  }

  // Deduplicate by URL (keep first title)
  const seen = new Set<string>();
  return leaves.filter(leaf => {
    if (seen.has(leaf.url)) return false;
    seen.add(leaf.url);
    return true;
  });
}

// ── Language helper ──────────────────────────────────────────────────────────
async function ensureEnglish(page: Page): Promise<void> {
  const flagCount = await page.locator(UAE_FLAG_SELECTOR).count();
  if (flagCount >= 2) {
    console.log('   🔄 Arabic detected – switching to English');
    const langBtn = page.locator(LANG_TOGGLE_SELECTOR).first();
    await langBtn.click();
    const englishOption = page.locator(ENGLISH_OPTION_SELECTOR).first();
    await englishOption.click();
    await waitForPageReady(page);
  } else {
    console.log('   ✅ Language is already English');
  }
}

// ── Enhanced Page Ready Detection ─────────────────────────────────────────────
/**
 * Wait for full page readiness:
 * - DOM content loaded
 * - Network idle
 * - Angular app settled
 * - No pending overlays
 */
async function waitForPageReady(page: Page, timeout: number = 15000): Promise<void> {
  const startTime = Date.now();
  
  try {
    // 1. Wait for DOM content loaded
    await page.waitForLoadState('domcontentloaded');
    
    // 2. Wait for network idle (no pending requests)
    await page.waitForLoadState('networkidle').catch(() => {
      // Network idle may timeout on complex apps, that's ok
    });
    
    // 3. Wait for Angular app to settle (if present)
    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        const checkAngular = () => {
          const ng = (window as any).ng;
          if (ng?.probe) {
            try {
              const appRef = ng.probe(document.documentElement).injector.get('ng.probe');
              if (appRef) {
                resolve();
                return;
              }
            } catch { /* ignore */ }
          }
          // Fallback: check if document is interactive
          if (document.readyState === 'complete') {
            resolve();
          } else {
            setTimeout(checkAngular, 100);
          }
        };
        checkAngular();
      });
    }).catch(() => {
      // Angular not present or check failed, continue
    });
    
    // 4. Wait for main content to be visible
    await page.waitForSelector('main, [role="main"], .page-content, .kt-content', {
      timeout: 5000,
      state: 'visible'
    }).catch(() => {
      // Main content may have different selector, continue
    });
    
    // 5. Brief settle time for animations
    await page.waitForTimeout(300);
    
    const elapsed = Date.now() - startTime;
    console.log(`      ⏱️  Page ready in ${elapsed}ms`);
  } catch (error: any) {
    console.warn(`   ⚠ Page ready check timeout: ${error.message}`);
  }
}

// ── Modal/Dialog/Overlay Detection & Closure ──────────────────────────────────
/**
 * Smart modal detection: identifies and closes blocking overlays
 * - Alert dialogs
 * - Confirmation dialogs
 * - Error/Warning toasts
 * - "Return Back" modals
 * - Any overlay blocking page interaction
 */
async function closeBlockingModals(page: Page): Promise<boolean> {
  let closedAny = false;
  
  try {
    // 1. Check for "Return Back" button (common in this app)
    const returnBackBtn = page.locator('button:has-text("Return Back"), button:has-text("رجوع"), a:has-text("Return Back")').first();
    if (await returnBackBtn.isVisible().catch(() => false)) {
      console.log(`      ⚠️  Blocking modal detected – clicking "Return Back"`);
      await returnBackBtn.click();
      await page.waitForTimeout(500);
      closedAny = true;
    }

    // 2. Look for dismissible alerts/toasts
    const alerts = page.locator('[role="alert"], .alert, .toast, .ng-toast, .mat-snack-bar-container, [class*="alert"], [class*="toast"]');
    const alertCount = await alerts.count();
    if (alertCount > 0) {
      console.log(`      ℹ️  Found ${alertCount} alert(s) – checking for close buttons`);
      for (let i = 0; i < Math.min(alertCount, 5); i++) {
        const alert = alerts.nth(i);
        const closeBtn = alert.locator('button, [role="button"], .close, [aria-label*="close"]').first();
        if (await closeBtn.isVisible().catch(() => false)) {
          console.log(`      ✓ Closing alert ${i + 1}`);
          await closeBtn.click();
          await page.waitForTimeout(200);
          closedAny = true;
        }
      }
    }

    // 3. Check for modal dialogs (Material, ng-bootstrap, etc.)
    const modals = page.locator('.mat-dialog-container, .modal, .ngx-modal, [role="dialog"], .modal-backdrop, .overlay');
    const modalCount = await modals.count();
    if (modalCount > 0) {
      console.log(`      ℹ️  Found ${modalCount} modal(s) – looking for close buttons`);
      for (let i = 0; i < Math.min(modalCount, 3); i++) {
        const modal = modals.nth(i);
        // Try common close button patterns
        const closeBtn = modal.locator('button[aria-label*="close"], button.close, .mat-dialog-close, button:has-text("Close"), button:has-text("Cancel")').first();
        if (await closeBtn.isVisible().catch(() => false)) {
          console.log(`      ✓ Closing modal ${i + 1}`);
          await closeBtn.click();
          await page.waitForTimeout(300);
          closedAny = true;
        }
      }
    }

    // 4. Check for overlay/backdrop elements
    const overlays = page.locator('.modal-backdrop, .overlay-backdrop, .cdk-overlay-backdrop, [class*="backdrop"]');
    const overlayCount = await overlays.count();
    if (overlayCount > 0) {
      console.log(`      ℹ️  Found ${overlayCount} overlay backdrop(s)`);
      closedAny = true;
    }

    // 5. Try ESC key as last resort for modal dismissal
    if (closedAny) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
    }

  } catch (error: any) {
    console.warn(`   ⚠ Modal detection error: ${error.message}`);
  }

  return closedAny;
}

// ── Side‑menu smart navigation ───────────────────────────────────────────────
async function navigateToModule(page: Page, moduleTitle: string): Promise<boolean> {
  let searchInput: any;
  
  try {
    // Clear and type into search – with timeout protection
    searchInput = page.locator(MENU_SEARCH_INPUT).first();
    
    // Wait for search input to be ready with short timeout
    await searchInput.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {
      throw new Error(`Search input not found for module: ${moduleTitle}`);
    });
    
    await searchInput.fill('');
    await searchInput.fill(moduleTitle);
    // Allow the reactive filter to render
    await page.waitForTimeout(300);
  } catch (error: any) {
    console.warn(`   ⚠ Search input timeout for "${moduleTitle}": ${error.message}`);
    return false;
  }

  // 1️⃣ Look for a direct page link whose text matches exactly
  const directLinks = page.locator(PAGE_LINK_SELECTOR).filter({ hasText: moduleTitle });
  const directCount = await directLinks.count();
  if (directCount > 0) {
    // Click the first visible one (usually the leaf)
    for (let i = 0; i < directCount; i++) {
      const link = directLinks.nth(i);
      if (await link.isVisible().catch(() => false)) {
        try {
          await link.click();
          await waitForPageReady(page);
          await closeBlockingModals(page);
          return true;
        } catch (error: any) {
          console.warn(`   ⚠ Failed to click direct link: ${error.message}`);
          continue;
        }
      }
    }
  }

  // 2️⃣ Maybe a parent item has the same text – expand it first, then click the leaf inside
  const parentItems = page.locator(MENU_ITEM).filter({ hasText: moduleTitle }).filter({ has: page.locator(PARENT_ARROW) });
  const parentCount = await parentItems.count();
  for (let i = 0; i < parentCount; i++) {
    const parent = parentItems.nth(i);
    if (await parent.isVisible().catch(() => false)) {
      try {
        // Click the toggle to expand
        const toggle = parent.locator(MENU_LINK).first();
        await toggle.click();
        await page.waitForTimeout(200); // animation
        // Now look for the leaf inside the expanded submenu – usually the last link with that text
        const submenu = parent.locator('.kt-menu__submenu');
        const leafLinks = submenu.locator(PAGE_LINK_SELECTOR).filter({ hasText: moduleTitle });
        const leafCount = await leafLinks.count();
        if (leafCount > 0) {
          // Click the last one (typical leaf)
          const leaf = leafLinks.last();
          if (await leaf.isVisible().catch(() => false)) {
            await leaf.click();
            await waitForPageReady(page);
            await closeBlockingModals(page);
            return true;
          }
        }
      } catch (error: any) {
        console.warn(`   ⚠ Failed to expand parent item: ${error.message}`);
        continue;
      }
    }
  }

  // 3️⃣ The module might be nested deeper – try to expand any visible parent that partially matches
  //    and then search again inside the expanded submenu.
  // This is a heuristic: expand all parents that contain the module title, then re‑search.
  try {
    const allParents = page.locator(MENU_ITEM).filter({ has: page.locator(PARENT_ARROW) });
    const allCount = await allParents.count();
    for (let i = 0; i < allCount; i++) {
      const p = allParents.nth(i);
      if (!(await p.isVisible().catch(() => false))) continue;
      const text = await p.locator(LINK_TEXT_SPAN).textContent();
      if (text && moduleTitle.toLowerCase().includes(text.trim().toLowerCase())) {
        await p.locator(MENU_LINK).first().click();
        await page.waitForTimeout(200);
      }
    }
    // After expanding, re‑search
    await searchInput.fill('');
    await searchInput.fill(moduleTitle);
    await page.waitForTimeout(300);

    // Try again to find a direct leaf link
    const retryLinks = page.locator(PAGE_LINK_SELECTOR).filter({ hasText: moduleTitle });
    if (await retryLinks.count() > 0) {
      const link = retryLinks.first();
      if (await link.isVisible().catch(() => false)) {
        await link.click();
        await waitForPageReady(page);
        await closeBlockingModals(page);
        return true;
      }
    }
  } catch (error: any) {
    console.warn(`   ⚠ Error during nested search: ${error.message}`);
  }

  return false;
}

// ── Verify the opened page’s heading ────────────────────────────────────────
async function verifyPageTitle(page: Page, expectedTitle: string): Promise<boolean> {
  const heading = page.locator('h1, .kt-subheader__title, .subheader__title, .page-title').first();
  try {
    await heading.waitFor({ state: 'visible', timeout: 8000 });
    const text = await heading.textContent({ timeout: 5000 });
    if (text && text.toLowerCase().includes(expectedTitle.toLowerCase())) return true;
  } catch { /* ignore */ }
  return false;
}

// ── Comprehensive Element Collection ──────────────────────────────────────────
/**
 * Collect all interactive elements, form fields, table info, and button labels
 */
async function collectPageElements(page: Page): Promise<{
  interactiveElements: ElementInfo[];
  tableInfo: TableInfo;
  actionButtons: ButtonInfo[];
  formFields: FormFieldInfo[];
  allButtonTexts: string[];
}> {
  const results = {
    interactiveElements: [] as ElementInfo[],
    tableInfo: { hasTable: false, columns: [], actionButtons: [], rowCount: 0 } as TableInfo,
    actionButtons: [] as ButtonInfo[],
    formFields: [] as FormFieldInfo[],
    allButtonTexts: [] as string[],
  };

  try {
    // 1. Collect all interactive elements (inputs, dropdowns, checkboxes, radio buttons)
    const inputs = page.locator('input, select, textarea, [contenteditable="true"]');
    const inputCount = await inputs.count();
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      if (await input.isVisible().catch(() => false)) {
        const type = (await input.getAttribute('type')) || 'text';
        const placeholder = await input.getAttribute('placeholder');
        const ariaLabel = await input.getAttribute('aria-label');
        const value = await input.inputValue().catch(() => '');
        
        if (placeholder || ariaLabel || value) {
          results.interactiveElements.push({
            type: `input[${type}]`,
            selector: await input.evaluate(el => {
              if ((el as any).id) return `#${(el as any).id}`;
              if ((el as any).name) return `input[name="${(el as any).name}"]`;
              return (el as any).className;
            }),
            text: placeholder || ariaLabel || value || '',
            placeholder: placeholder || undefined,
            ariaLabel: ariaLabel || undefined,
          });
        }
      }
    }

    // 2. Collect all buttons and their texts
    const buttons = page.locator('button, a[role="button"], input[type="button"], input[type="submit"]');
    const buttonCount = await buttons.count();
    const seenTexts = new Set<string>();
    
    for (let i = 0; i < buttonCount; i++) {
      const btn = buttons.nth(i);
      if (await btn.isVisible().catch(() => false)) {
        const text = (await btn.textContent())?.trim() || '';
        const ariaLabel = await btn.getAttribute('aria-label');
        const type = await btn.getAttribute('type');
        const className = await btn.getAttribute('class');
        
        const displayText = text || ariaLabel || type || 'Button';
        if (displayText && !seenTexts.has(displayText)) {
          results.actionButtons.push({
            text: displayText,
            ariaLabel: ariaLabel || undefined,
            type: type || undefined,
            class: className || undefined,
          });
          results.allButtonTexts.push(displayText);
          seenTexts.add(displayText);
        }
      }
    }

    // 3. Collect form field labels and their associated inputs
    const labels = page.locator('label, .form-label, .label-text, [class*="label"]');
    const labelCount = await labels.count();
    const seenLabels = new Set<string>();
    
    for (let i = 0; i < labelCount; i++) {
      const label = labels.nth(i);
      if (await label.isVisible().catch(() => false)) {
        const text = (await label.textContent())?.trim() || '';
        if (text && !seenLabels.has(text) && text.length < 100) {
          // Try to find associated input
          const forAttr = await label.getAttribute('for');
          let inputType = 'unknown';
          
          if (forAttr) {
            const associated = page.locator(`#${forAttr}`);
            inputType = (await associated.getAttribute('type')) || 'text';
          }
          
          results.formFields.push({
            label: text,
            type: inputType,
            required: text.includes('*') || text.includes('(Required)'),
          });
          seenLabels.add(text);
        }
      }
    }

    // 4. Collect table information
    const tables = page.locator('table, [role="grid"], dx-data-grid, .data-table, [class*="table"]');
    const tableCount = await tables.count();
    
    if (tableCount > 0) {
      results.tableInfo.hasTable = true;
      const mainTable = tables.first();
      
      // Get column headers
      const headers = mainTable.locator('th, [role="columnheader"]');
      const headerCount = await headers.count();
      for (let i = 0; i < headerCount; i++) {
        const header = headers.nth(i);
        const text = (await header.textContent())?.trim() || '';
        if (text && text.length < 50) {
          results.tableInfo.columns.push(text);
        }
      }

      // Get table action buttons
      const tableButtons = mainTable.locator('button, a[role="button"], [role="button"]');
      const tableBtnCount = await tableButtons.count();
      const seenTableActions = new Set<string>();
      
      for (let i = 0; i < tableBtnCount; i++) {
        const btn = tableButtons.nth(i);
        if (await btn.isVisible().catch(() => false)) {
          const text = (await btn.textContent())?.trim() || '';
          const ariaLabel = await btn.getAttribute('aria-label');
          const action = text || ariaLabel || 'Action';
          
          if (action && !seenTableActions.has(action)) {
            results.tableInfo.actionButtons.push(action);
            seenTableActions.add(action);
          }
        }
      }

      // Get row count
      const rows = mainTable.locator('tbody tr, [role="row"]');
      results.tableInfo.rowCount = await rows.count();
    }

  } catch (error: any) {
    console.warn(`   ⚠ Error during element collection: ${error.message}`);
  }

  return results;
}

// ── Audit a single page ──────────────────────────────────────────────────────
async function auditPage(page: Page, module: MenuLeaf): Promise<PageAuditResult[string]> {
  const result: PageAuditResult[string] = {
    url: module.url,
    labels: [],
    hasAddNewButton: false,
    hasExportButton: false,
    hasColumnChooserButton: false,
    hasSearchInput: false,
    timestamp: new Date().toISOString(),
  };

  try {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500); // small settle for Angular

    // Labels
    const labelElements = await page.locator('div[class*="label"]').all();
    const labels: string[] = [];
    for (const el of labelElements) {
      if (await el.isVisible()) {
        const text = await el.textContent();
        if (text && text.trim()) labels.push(text.trim());
      }
    }
    result.labels = [...new Set(labels)];

    // Buttons
    result.hasAddNewButton = (await page.locator('button:has-text("Add New")').count()) > 0;
    result.hasExportButton = (await page.locator('[title="Export"]').count()) > 0;
    result.hasColumnChooserButton = (await page.locator('[title="Column Chooser"]').count()) > 0;
    result.hasSearchInput = (await page.locator('input[aria-label*="Search"]').count()) > 0;

    // Page heading verification (non‑blocking)
    if (!(await verifyPageTitle(page, module.title))) {
      result.labels.unshift(`[WARNING] Page heading mismatch for "${module.title}"`);
    }

    // Collect comprehensive element information
    const elementInfo = await collectPageElements(page);
    result.interactiveElements = elementInfo.interactiveElements;
    result.tableInfo = elementInfo.tableInfo;
    result.actionButtons = elementInfo.actionButtons;
    result.formFields = elementInfo.formFields;
    result.allButtonTexts = elementInfo.allButtonTexts;

  } catch (error: any) {
    result.errorMessage = error.message || 'Unknown error';
  }
  return result;
}

// ── Main audit entry ─────────────────────────────────────────────────────────
async function auditAllPages(): Promise<void> {
  const results: PageAuditResult = {};
  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  let page;
  const baseUrl = process.env.BASE_URL || 'https://staging.tahseel.gov.ae/ManagePortal';
  
  try {
    const menuLeaves = parseSidemenuLog(SIDEMENU_LOG_PATH);
    console.log(`🔍 Found ${menuLeaves.length} unique leaf pages to audit.\n`);

    browser = await chromium.launch({ headless: false });

    // Use pre‑saved storageState if available (prevents manual login)
    const statePath = path.join(process.cwd(), 'storageState.stage.json');
    if (fs.existsSync(statePath)) {
      context = await browser.newContext({ storageState: statePath });
    } else {
      context = await browser.newContext();
      console.warn('⚠ No storageState found – you may need to login manually.');
    }

    page = await context.newPage();
    await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector(SIDEBAR, { timeout: 15000 });

    // 1. Ensure English
    await ensureEnglish(page);

    // 2. Audit each module
    for (const module of menuLeaves) {
      console.log(`\n📄 Auditing: ${module.title}`);

      try {
        const navSuccess = await navigateToModule(page, module.title);
        if (!navSuccess) {
          console.warn(`   ⚠ Module "${module.title}" not reachable via side menu – skipping`);
          results[module.title] = {
            url: module.url,
            labels: [],
            hasAddNewButton: false,
            hasExportButton: false,
            hasColumnChooserButton: false,
            hasSearchInput: false,
            timestamp: new Date().toISOString(),
            errorMessage: 'Module not found in side menu',
          };
          continue;
        }

        // Allow Angular to render
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(300);

        const currentUrl = page.url();
        // Relaxed URL match: compare the last segment
        const expectedSegment = module.url.split('/').pop()?.split('?')[0] || '';
        if (expectedSegment && !currentUrl.includes(expectedSegment)) {
          console.warn(`   ⚠ URL mismatch – expected: ${module.url}, got: ${currentUrl}`);
        }

        const auditResult = await auditPage(page, module);
        results[module.title] = auditResult;
        console.log(`   ✅ Completed: ${module.title}`);
      } catch (error: any) {
        console.error(`   ❌ Error auditing "${module.title}":`, error.message);
        results[module.title] = {
          url: module.url,
          labels: [],
          hasAddNewButton: false,
          hasExportButton: false,
          hasColumnChooserButton: false,
          hasSearchInput: false,
          timestamp: new Date().toISOString(),
          errorMessage: `Error during audit: ${error.message}`,
        };
        // Attempt to recover by navigating back to dashboard
        try {
          await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'domcontentloaded' });
          await page.waitForSelector(SIDEBAR, { timeout: 10000 });
        } catch (recoveryError: any) {
          console.warn(`   ⚠ Failed to recover navigation: ${recoveryError.message}`);
        }
        continue;
      }
    }

  } catch (error) {
    console.error('❌ Fatal error during audit:', error);
  } finally {
    if (page) await page.close();
    if (context) await context.close();
    if (browser) await browser.close();
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2));
  console.log(`\n🎉 Audit complete! Results saved to ${OUTPUT_PATH}`);
  console.log(`📊 Summary: ${Object.keys(results).length} modules audited`);
}

// ── Execute ──────────────────────────────────────────────────────────────────
auditAllPages().catch(console.error);