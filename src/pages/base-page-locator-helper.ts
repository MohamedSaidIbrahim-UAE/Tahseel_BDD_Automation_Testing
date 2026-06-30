/**
 * Base Page Locator Helper
 * 
 * Production-grade locator handling with robust retry logic and intelligent waits.
 * Provides resilient element finding with fallback selectors and detailed logging.
 * 
 * @category Page Objects
 * @module base-page-locator-helper
 */

import { Page, Locator } from '@playwright/test';

export interface LocatorConfig {
  primary: string;
  fallbacks?: string[];
  timeout?: number;
  waitForVisible?: boolean;
  retry?: number;
}

/**
 * Locator Helper - Provides resilient element location with retry logic
 */
export class LocatorHelper {
  constructor(private page: Page) {}

  /**
   * Find element with primary and fallback selectors
   */
  async findElement(config: LocatorConfig): Promise<Locator> {
    const selectors = [config.primary, ...(config.fallbacks || [])];
    const timeout = config.timeout || 30000;
    const retries = config.retry || 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      for (const selector of selectors) {
        try {
          const locator = this.page.locator(selector);

          // Check if element exists
          if (await locator.count()) {
            if (config.waitForVisible) {
              await locator.first().waitFor({ state: 'visible', timeout });
            }
            return locator;
          }
        } catch (error) {
          lastError = error as Error;
        }
      }

      if (attempt < retries) {
        await this.page.waitForTimeout(500 * attempt);
      }
    }

    throw new Error(
      `Failed to find element after ${retries} attempts. ` +
      `Tried: ${selectors.join(', ')}. ` +
      `Last error: ${lastError?.message}`
    );
  }

  /**
   * Safe click with intelligent retry
   */
  async safeClick(config: LocatorConfig): Promise<void> {
    const locator = await this.findElement(config);
    const maxAttempts = config.retry || 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const firstElement = locator.first();

        // Scroll into view
        await firstElement.scrollIntoViewIfNeeded();

        // Small delay for rendering
        await this.page.waitForTimeout(200);

        // Ensure element is enabled
        const isDisabled = await firstElement.isDisabled();
        if (isDisabled) {
          throw new Error('Element is disabled');
        }

        // Try to click
        await firstElement.click({ force: false, timeout: 5000 });
        return;
      } catch (error) {
        if (attempt === maxAttempts) {
          throw error;
        }
        await this.page.waitForTimeout(500 * attempt);
      }
    }
  }

  /**
   * Safe fill with intelligent retry
   */
  async safeFill(config: LocatorConfig, value: string): Promise<void> {
    const locator = await this.findElement(config);
    const maxAttempts = config.retry || 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const firstElement = locator.first();

        // Scroll into view
        await firstElement.scrollIntoViewIfNeeded();

        // Clear existing value
        await firstElement.clear({ force: true });

        // Small delay
        await this.page.waitForTimeout(100);

        // Fill new value
        await firstElement.fill(value);

        // Verify value was set
        const filledValue = await firstElement.inputValue();
        if (filledValue === value) {
          return;
        }

        throw new Error(`Value mismatch: expected "${value}", got "${filledValue}"`);
      } catch (error) {
        if (attempt === maxAttempts) {
          throw error;
        }
        await this.page.waitForTimeout(500 * attempt);
      }
    }
  }

  /**
   * Safe get text with fallback handling
   */
  async safeGetText(config: LocatorConfig): Promise<string> {
    const locator = await this.findElement(config);
    return locator.first().textContent({ timeout: 10000 }).then((text) => text?.trim() || '');
  }

  /**
   * Wait for element with multiple strategies
   */
  async waitForElement(config: LocatorConfig): Promise<Locator> {
    const startTime = Date.now();
    const timeout = config.timeout || 30000;

    while (Date.now() - startTime < timeout) {
      try {
        const locator = await this.findElement({ ...config, retry: 1 });
        return locator;
      } catch {
        await this.page.waitForTimeout(500);
      }
    }

    throw new Error(
      `Timeout waiting for element: ${config.primary} (${timeout}ms)`
    );
  }

  /**
   * Wait for any of multiple selectors to appear
   */
  async waitForAny(
    configs: LocatorConfig[],
    timeout: number = 30000
  ): Promise<Locator> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      for (const config of configs) {
        try {
          const locator = await this.findElement({ ...config, retry: 1 });
          if (await locator.count()) {
            return locator;
          }
        } catch {
          // Continue to next config
        }
      }
      await this.page.waitForTimeout(500);
    }

    throw new Error(
      `Timeout waiting for any element. Tried: ${configs.map((c) => c.primary).join(', ')}`
    );
  }

  /**
   * Wait for all of multiple selectors to appear
   */
  async waitForAll(
    configs: LocatorConfig[],
    timeout: number = 30000
  ): Promise<Locator[]> {
    const startTime = Date.now();
    const found: Locator[] = [];

    while (found.length < configs.length && Date.now() - startTime < timeout) {
      found.length = 0;

      for (const config of configs) {
        try {
          const locator = await this.findElement({ ...config, retry: 1 });
          if (await locator.count()) {
            found.push(locator);
          }
        } catch {
          // Element not found yet
        }
      }

      if (found.length < configs.length) {
        await this.page.waitForTimeout(500);
      }
    }

    if (found.length < configs.length) {
      throw new Error(
        `Timeout waiting for all elements. Found ${found.length}/${configs.length}`
      );
    }

    return found;
  }

  /**
   * Execute with intelligent retry and error handling
   */
  async executeWithRetry<T>(
    action: () => Promise<T>,
    options: {
      maxAttempts?: number;
      delayMs?: number;
      backoffMultiplier?: number;
      description?: string;
    } = {}
  ): Promise<T> {
    const maxAttempts = options.maxAttempts || 3;
    const delayMs = options.delayMs || 500;
    const backoffMultiplier = options.backoffMultiplier || 1.5;
    const description = options.description || 'Action';

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await action();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxAttempts) {
          break;
        }

        const delay = Math.round(delayMs * Math.pow(backoffMultiplier, attempt - 1));
        await this.page.waitForTimeout(delay);
      }
    }

    throw new Error(
      `${description} failed after ${maxAttempts} attempts: ${lastError?.message}`
    );
  }
}
