/**
 * Cleanup Fixtures - Teardown and data cleanup for test isolation
 * 
 * Provides cleanup routines to ensure tests don't interfere with each other
 */

import { Page, BrowserContext } from '@playwright/test';

/**
 * Cleanup utilities for test isolation
 */
export class CleanupFixtures {
  /**
   * Full page cleanup - storage, cookies, cache
   */
  static async cleanupPage(page: Page): Promise<void> {
    try {
      // Clear storage
      await page.evaluate(() => {
        window.localStorage.clear();
        window.sessionStorage.clear();
      });

      // Clear cookies via context
      const context = page.context();
      await context.clearCookies();

      console.log('[Cleanup] Page cleaned: localStorage, sessionStorage, cookies cleared');
    } catch (error) {
      console.warn('[Cleanup] Error during page cleanup:', error);
    }
  }

  /**
   * Clear browser context
   */
  static async cleanupContext(context: BrowserContext): Promise<void> {
    try {
      await context.clearCookies({ name: '' });
      await context.close();
      console.log('[Cleanup] Context cleaned');
    } catch (error) {
      console.warn('[Cleanup] Error during context cleanup:', error);
    }
  }

  /**
   * Clear application cache and service workers
   */
  static async clearApplicationCache(page: Page): Promise<void> {
    try {
      await page.evaluate(async () => {
        // Clear service worker cache
        if ('caches' in window) {
          const cacheNames = await (caches as any).keys();
          for (const cacheName of cacheNames) {
            await (caches as any).delete(cacheName);
          }
        }

        // Clear indexedDB
        if ('indexedDB' in window) {
          const dbs = await (indexedDB as any).databases?.() || [];
          for (const db of dbs) {
            if (db && db.name) {
              (indexedDB as any).deleteDatabase(db.name);
            }
          }
        }
      });

      console.log('[Cleanup] Application cache cleared');
    } catch (error) {
      console.warn('[Cleanup] Error clearing application cache:', error);
    }
  }

  /**
   * Reset page to clean state (navigate to blank)
   */
  static async resetPageState(page: Page): Promise<void> {
    try {
      await page.goto('about:blank');
      await CleanupFixtures.cleanupPage(page);
      console.log('[Cleanup] Page state reset');
    } catch (error) {
      console.warn('[Cleanup] Error resetting page state:', error);
    }
  }

  /**
   * Close all popups and modals
   */
  static async closeAllDialogs(page: Page): Promise<void> {
    try {
      // Close any open dialogs
      const dialogs = await page.locator('[role="dialog"]').count();
      if (dialogs > 0) {
        // Try ESC key first
        await page.press('Escape');
        await page.waitForTimeout(100);

        // Try close buttons
        const closeButtons = await page.locator('[aria-label="Close"], button:has-text("Close")').count();
        if (closeButtons > 0) {
          await page.locator('[aria-label="Close"], button:has-text("Close")').first().click();
        }
      }

      console.log('[Cleanup] All dialogs closed');
    } catch (error) {
      console.warn('[Cleanup] Error closing dialogs:', error);
    }
  }

  /**
   * Clear form data and inputs
   */
  static async clearFormData(page: Page): Promise<void> {
    try {
      await page.evaluate(() => {
        // Clear all input fields
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach((input: any) => {
          input.value = '';
          input.textContent = '';
        });

        // Trigger change events
        inputs.forEach((input: any) => {
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });
      });

      console.log('[Cleanup] Form data cleared');
    } catch (error) {
      console.warn('[Cleanup] Error clearing form data:', error);
    }
  }

  /**
   * Cleanup after each test scenario
   */
  static async afterEachTest(page: Page): Promise<void> {
    try {
      console.log('[Cleanup] Starting after-test cleanup...');

      // Close dialogs first
      await CleanupFixtures.closeAllDialogs(page);

      // Clear form data
      await CleanupFixtures.clearFormData(page);

      // Small delay to allow for cleanup
      await page.waitForTimeout(500);

      // Take final screenshot if needed for debugging
      // await page.screenshot({ path: 'test-results/cleanup-state.png' });

      console.log('[Cleanup] After-test cleanup completed');
    } catch (error) {
      console.warn('[Cleanup] Error during after-test cleanup:', error);
    }
  }

  /**
   * Cleanup before each test scenario
   */
  static async beforeEachTest(page: Page): Promise<void> {
    try {
      console.log('[Cleanup] Starting before-test cleanup...');

      // Reset to clean state
      await CleanupFixtures.resetPageState(page);

      // Clear any lingering data
      await CleanupFixtures.clearFormData(page);

      console.log('[Cleanup] Before-test cleanup completed');
    } catch (error) {
      console.warn('[Cleanup] Error during before-test cleanup:', error);
    }
  }

  /**
   * Full test suite cleanup
   */
  static async afterAllTests(page: Page, context: BrowserContext): Promise<void> {
    try {
      console.log('[Cleanup] Starting full suite cleanup...');

      await CleanupFixtures.afterEachTest(page);
      await CleanupFixtures.clearApplicationCache(page);
      await CleanupFixtures.cleanupPage(page);
      await page.close();
      await CleanupFixtures.cleanupContext(context);

      console.log('[Cleanup] Full suite cleanup completed');
    } catch (error) {
      console.warn('[Cleanup] Error during full suite cleanup:', error);
    }
  }

  /**
   * Retry cleanup - aggressive cleanup for flaky tests
   */
  static async aggressiveCleanup(page: Page): Promise<void> {
    try {
      console.log('[Cleanup] Starting aggressive cleanup...');

      // Close all dialogs and popups
      await CleanupFixtures.closeAllDialogs(page);

      // Wait for network to settle
      await page.waitForLoadState('networkidle').catch(() => {});

      // Clear all storage
      await CleanupFixtures.cleanupPage(page);

      // Clear application cache
      await CleanupFixtures.clearApplicationCache(page);

      // Reset page
      await CleanupFixtures.resetPageState(page);

      // Wait for stabilization
      await page.waitForTimeout(1000);

      console.log('[Cleanup] Aggressive cleanup completed');
    } catch (error) {
      console.warn('[Cleanup] Error during aggressive cleanup:', error);
    }
  }
}

/**
 * Data cleanup utilities for database/API cleanup
 */
export class DataCleanup {
  /**
   * Register cleanup callback to run after test
   */
  private static cleanupCallbacks: (() => Promise<void>)[] = [];

  /**
   * Add a cleanup callback
   */
  static registerCleanup(callback: () => Promise<void>): void {
    this.cleanupCallbacks.push(callback);
  }

  /**
   * Execute all registered cleanup callbacks
   */
  static async executeCleanups(): Promise<void> {
    for (const callback of this.cleanupCallbacks) {
      try {
        await callback();
      } catch (error) {
        console.warn('[DataCleanup] Error executing cleanup callback:', error);
      }
    }
    this.cleanupCallbacks = [];
  }

  /**
   * Clear cleanup callbacks
   */
  static clearCleanups(): void {
    this.cleanupCallbacks = [];
  }
}

/**
 * Test data record keeper - tracks created data for cleanup
 */
export class TestDataRecorder {
  private static createdRecords: Map<string, any[]> = new Map();

  /**
   * Record created data
   */
  static recordCreated(module: string, recordId: string | number): void {
    if (!this.createdRecords.has(module)) {
      this.createdRecords.set(module, []);
    }
    this.createdRecords.get(module)!.push(recordId);
  }

  /**
   * Get all created records for module
   */
  static getCreatedRecords(module: string): any[] {
    return this.createdRecords.get(module) || [];
  }

  /**
   * Clear recorded data
   */
  static clear(): void {
    this.createdRecords.clear();
  }

  /**
   * Get cleanup summary
   */
  static getSummary(): object {
    const summary: { [key: string]: number } = {};
    for (const [module, records] of this.createdRecords) {
      summary[module] = records.length;
    }
    return summary;
  }
}
