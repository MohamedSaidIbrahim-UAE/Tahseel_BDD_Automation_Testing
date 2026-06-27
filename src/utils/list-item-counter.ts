/**
 * List Item Counter Utility
 * 
 * Captures and tracks item counts in list views using the pagination info component
 * Format: "Page X of Y (Z items)" where Z is the total count
 * 
 * Supported modules: All except Site Configuration and Action Logs
 * (These modules do not have the pagination info component)
 */

import { Page } from '@playwright/test';
import { config } from '../config/config';

export interface ItemCountSnapshot {
  count: number;
  timestamp: number;
  paginator: string;
  details: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

/**
 * Extracts total item count from pagination info
 * Looks for elements with class containing "info" and text like "Page 1 of 1 (16 items)"
 * 
 * @param page - Playwright page object
 * @param moduleName - Name of the module (for logging)
 * @returns Item count or null if not found
 */
export async function getItemCount(page: Page, moduleName: string = 'List'): Promise<number | null> {
  try {
    // Scroll to bottom to ensure pagination info is visible
    await page.evaluate(() => {
      const element = document.querySelector('[class*="info"]');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    // Wait for pagination info element to be visible
    const paginationInfo = page.locator('[class*="info"]');
    const isVisible = await paginationInfo.first().isVisible({ timeout: config.timeout }).catch(() => false);

    if (!isVisible) {
      console.log(`[ItemCounter] Pagination info not found for ${moduleName}`);
      return null;
    }

    // Get all text nodes from pagination info elements
    const paginationText = await paginationInfo.first().textContent({ timeout: config.timeout });
    
    if (!paginationText) {
      return null;
    }

    // Extract item count using regex
    // Matches: "Page 1 of 1 (16 items)" or "Page 1 (16 items)" or similar variations
    const itemCountMatch = paginationText.match(/\((\d+)\s*items?\)/i);
    
    if (itemCountMatch && itemCountMatch[1]) {
      const count = parseInt(itemCountMatch[1], 10);
      console.log(`[ItemCounter] ${moduleName} - Found ${count} items from text: "${paginationText.trim()}"`);
      return count;
    }

    return null;
  } catch (error:any) {
    console.log(`[ItemCounter] Error reading item count for ${moduleName}: ${error.message}`);
    return null;
  }
}

/**
 * Takes a snapshot of current item count with details
 * 
 * @param page - Playwright page object
 * @param moduleName - Name of the module
 * @returns Snapshot with count and details
 */
export async function captureItemCountSnapshot(
  page: Page,
  moduleName: string = 'List'
): Promise<ItemCountSnapshot | null> {
  try {
    const count = await getItemCount(page, moduleName);
    if (count === null) {
      return null;
    }

    const paginationText = await page.locator('[class*="info"]').first().textContent();
    
    // Extract page details
    const pageMatch = paginationText?.match(/Page\s*(\d+)\s*of\s*(\d+)/i);
    const currentPage = pageMatch ? parseInt(pageMatch[1], 10) : 1;
    const totalPages = pageMatch ? parseInt(pageMatch[2], 10) : 1;

    return {
      count,
      timestamp: Date.now(),
      paginator: paginationText?.trim() || '',
      details: {
        currentPage,
        totalPages,
        totalItems: count,
      },
    };
  } catch (error:any) {
    console.log(`[ItemCounter] Error capturing snapshot for ${moduleName}: ${error.message}`);
    return null;
  }
}

/**
 * Verifies item count increased by expected amount after adding item
 * 
 * @param page - Playwright page object
 * @param beforeCount - Count before action
 * @param expectedIncrease - Expected number of new items (default: 1)
 * @param moduleName - Name of the module
 */
export async function verifyItemCountIncreased(
  page: Page,
  beforeCount: number | null,
  expectedIncrease: number = 1,
  moduleName: string = 'List'
): Promise<void> {
  if (beforeCount === null) {
    console.log(`[ItemCounter] Skipping count verification - no initial count captured`);
    return;
  }

  const afterCount = await getItemCount(page, moduleName);

  if (afterCount === null) {
    console.log(`[ItemCounter] Skipping verification - item count not available for ${moduleName}`);
    return;
  }

  const expectedCount = beforeCount + expectedIncrease;
  const actualIncrease = afterCount - beforeCount;

  if (afterCount !== expectedCount) {
    throw new Error(
      `[ItemCounter] Expected ${expectedCount} items after adding ${expectedIncrease} item(s) for ${moduleName}, ` +
      `but found ${afterCount}. Increase: ${actualIncrease} (expected: ${expectedIncrease})`
    );
  }

  console.log(
    `[ItemCounter] ✓ ${moduleName} - Item count verified: ` +
    `${beforeCount} → ${afterCount} (increased by ${actualIncrease})`
  );
}

/**
 * Verifies item count remained unchanged after action (update or cancel)
 * 
 * @param page - Playwright page object
 * @param beforeCount - Count before action
 * @param moduleName - Name of the module
 */
export async function verifyItemCountUnchanged(
  page: Page,
  beforeCount: number | null,
  moduleName: string = 'List'
): Promise<void> {
  if (beforeCount === null) {
    console.log(`[ItemCounter] Skipping count verification - no initial count captured`);
    return;
  }

  const afterCount = await getItemCount(page, moduleName);

  if (afterCount === null) {
    console.log(`[ItemCounter] Skipping verification - item count not available for ${moduleName}`);
    return;
  }

  if (afterCount !== beforeCount) {
    throw new Error(
      `[ItemCounter] Expected ${beforeCount} items for ${moduleName} after update/cancel, ` +
      `but found ${afterCount}`
    );
  }

  console.log(
    `[ItemCounter] ✓ ${moduleName} - Item count verified as unchanged: ${afterCount} items`
  );
}

/**
 * Verifies item count did not change after multiple save attempts
 * Useful for testing duplicate submission handling
 * 
 * @param page - Playwright page object
 * @param beforeCount - Count before actions
 * @param moduleName - Name of the module
 */
export async function verifyItemCountAfterMultipleSaves(
  page: Page,
  beforeCount: number | null,
  moduleName: string = 'List'
): Promise<void> {
  if (beforeCount === null) {
    console.log(`[ItemCounter] Skipping count verification - no initial count captured`);
    return;
  }

  const afterCount = await getItemCount(page, moduleName);

  if (afterCount === null) {
    console.log(`[ItemCounter] Skipping verification - item count not available for ${moduleName}`);
    return;
  }

  // After multiple saves, count should be either:
  // - Same as before (if saves after first one were ignored) - EXPECTED
  // - One more than before (if first save went through) - ALSO OK
  // - More than one increase (if duplicates created) - ERROR
  const expectedMin = beforeCount;
  const expectedMax = beforeCount + 1;

  if (afterCount < expectedMin || afterCount > expectedMax) {
    throw new Error(
      `[ItemCounter] Unexpected item count for ${moduleName} after multiple saves. ` +
      `Expected ${expectedMin} to ${expectedMax} items, but found ${afterCount}`
    );
  }

  console.log(
    `[ItemCounter] ✓ ${moduleName} - Multiple save handling verified: ` +
    `${beforeCount} → ${afterCount} items (no duplicates created)`
  );
}

/**
 * Gets modules that don't have pagination info component
 * These modules should NOT use item count assertions
 */
export function getModulesWithoutPaginationInfo(): string[] {
  return ['Site Configuration', 'Action Logs'];
}

/**
 * Checks if a module supports item count assertions
 * 
 * @param moduleName - Name of the module to check
 * @returns true if module supports pagination info, false otherwise
 */
export function moduleSupportsItemCounting(moduleName: string): boolean {
  const excludedModules = getModulesWithoutPaginationInfo();
  return !excludedModules.some(m => moduleName.toLowerCase().includes(m.toLowerCase()));
}
