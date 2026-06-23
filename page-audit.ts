/**
 * page-audit.ts – Upgraded with real sidebar DOM selectors from Metronic theme.
 *
 * Flow:
 *  1. Parse Guides/sidemenue.log → unique (title, url) leaf pages.
 *  2. Launch browser, inject storageState (if exists) to skip login.
 *  3. Ensure English language (Arabic → click #kt-language-selector, choose "English").
 *  4. For each module:
 *     a. Search it in the side menu using li.menu-search input.
 *     b. Intelligently locate and click the correct leaf link, handling:
 *        - Direct leaf with href.
 *        - Parent with same name (expand then click leaf).
 *        - Deeply nested parent (expand intermediate).
 *        - Not found → report error.
 *     c. Verify page heading matches module title (or contains it).
 *     d. Audit page elements: labels, Add New, Export, Column Chooser, Search input.
 *  5. Write results to page-audit-results.json.
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
  };
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
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector(SIDEBAR, { timeout: 10000 });
  } else {
    console.log('   ✅ Language is already English');
  }
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
          await page.waitForLoadState('domcontentloaded');
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
            await page.waitForLoadState('domcontentloaded');
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
        await page.waitForLoadState('domcontentloaded');
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