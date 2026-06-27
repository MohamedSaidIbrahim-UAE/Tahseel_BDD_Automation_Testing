/**
 * Wait and Retry Utilities
 * Provides resilient waiting and retry logic for flaky operations
 * Used across all 209 modules for reliable test execution
 */

import { Page } from '@playwright/test';
import { config } from '../config/config';

export class WaitAndRetry {
  private static readonly DEFAULT_TIMEOUT = config.timeout || 30000;
  private static readonly DEFAULT_RETRIES = 3;
  private static readonly DEFAULT_RETRY_DELAY = 1000;

  /**
   * Wait for a function to return truthy value with retries
   */
  static async waitForCondition(
    condition: () => Promise<boolean>,
    timeout = this.DEFAULT_TIMEOUT,
    retries = this.DEFAULT_RETRIES
  ): Promise<void> {
    const startTime = Date.now();
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const result = await condition();
        if (result) {
          return;
        }
      } catch (error) {
        lastError = error as Error;
      }

      const elapsed = Date.now() - startTime;
      if (elapsed >= timeout) {
        throw new Error(
          `Condition not met within ${timeout}ms after ${attempt + 1} attempts. Last error: ${lastError?.message}`
        );
      }

      await this.sleep(this.DEFAULT_RETRY_DELAY);
    }

    throw new Error(
      `Condition not met after ${retries} retries. Last error: ${lastError?.message}`
    );
  }

  /**
   * Retry a function until it succeeds or max retries reached
   */
  static async retry<T>(
    fn: () => Promise<T>,
    retries = this.DEFAULT_RETRIES,
    delayMs = this.DEFAULT_RETRY_DELAY,
    backoffMultiplier = 1
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (attempt < retries - 1) {
          const delay = delayMs * Math.pow(backoffMultiplier, attempt);
          await this.sleep(delay);
        }
      }
    }

    throw new Error(
      `Operation failed after ${retries} retries. Last error: ${lastError?.message}`
    );
  }

  /**
   * Wait for element to appear with retries
   */
  static async waitForElement(
    page: Page,
    selector: string,
    timeout = this.DEFAULT_TIMEOUT
  ): Promise<void> {
    await page.locator(selector).first().waitFor({
      state: 'visible',
      timeout
    });
  }

  /**
   * Wait for element to disappear with retries
   */
  static async waitForElementHidden(
    page: Page,
    selector: string,
    timeout = this.DEFAULT_TIMEOUT
  ): Promise<void> {
    await page.locator(selector).first().waitFor({
      state: 'hidden',
      timeout
    });
  }

  /**
   * Wait for navigation with timeout
   */
  static async waitForNavigation(
    page: Page,
    fn: () => Promise<void>,
    timeout = this.DEFAULT_TIMEOUT
  ): Promise<void> {
    await Promise.all([
      page.waitForNavigation({ timeout }),
      fn()
    ]);
  }

  /**
   * Wait for network to be idle
   */
  static async waitForNetworkIdle(
    page: Page,
    timeout = this.DEFAULT_TIMEOUT
  ): Promise<void> {
    await page.waitForLoadState('networkidle', { timeout });
  }

  /**
   * Wait for DOM to be loaded
   */
  static async waitForDOMLoaded(
    page: Page,
    timeout = this.DEFAULT_TIMEOUT
  ): Promise<void> {
    await page.waitForLoadState('domcontentloaded', { timeout });
  }

  /**
   * Wait for page to fully load
   */
  static async waitForPageLoad(
    page: Page,
    timeout = this.DEFAULT_TIMEOUT
  ): Promise<void> {
    await page.waitForLoadState('load', { timeout });
  }

  /**
   * Wait for function to return true with polling
   */
  static async poll(
    fn: () => Promise<boolean>,
    interval = 500,
    timeout = this.DEFAULT_TIMEOUT
  ): Promise<void> {
    const startTime = Date.now();

    while (true) {
      try {
        const result = await fn();
        if (result) {
          return;
        }
      } catch (error) {
        // Continue polling on error
      }

      if (Date.now() - startTime > timeout) {
        throw new Error(`Poll timeout exceeded after ${timeout}ms`);
      }

      await this.sleep(interval);
    }
  }

  /**
   * Wait for text to appear in element
   */
  static async waitForElementText(
    page: Page,
    selector: string,
    text: string,
    timeout = this.DEFAULT_TIMEOUT
  ): Promise<void> {
    await page.locator(selector).first().waitFor({
      state: 'visible',
      timeout
    });

    const locator = page.locator(`${selector}:has-text("${text}")`).first();
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Wait for value to change in input
   */
  static async waitForInputValue(
    page: Page,
    selector: string,
    expectedValue: string,
    timeout = this.DEFAULT_TIMEOUT
  ): Promise<void> {
    const locator = page.locator(selector).first();
    let actualValue = '';

    const startTime = Date.now();
    while (true) {
      actualValue = await locator.inputValue() || '';
      if (actualValue === expectedValue) {
        return;
      }

      if (Date.now() - startTime > timeout) {
        throw new Error(
          `Input value did not change to "${expectedValue}" within ${timeout}ms. Current: "${actualValue}"`
        );
      }

      await this.sleep(100);
    }
  }

  /**
   * Wait for response from API endpoint
   */
  static async waitForResponse(
    page: Page,
    urlPattern: string | RegExp,
    timeout = this.DEFAULT_TIMEOUT
  ): Promise<any> {
    const response = await page.waitForResponse(
      (resp) => {
        if (typeof urlPattern === 'string') {
          return resp.url().includes(urlPattern);
        }
        return urlPattern.test(resp.url());
      },
      { timeout }
    );

    return await response.json().catch(() => response.text());
  }

  /**
   * Wait for response with specific status
   */
  static async waitForResponseStatus(
    page: Page,
    urlPattern: string | RegExp,
    expectedStatus: number,
    timeout = this.DEFAULT_TIMEOUT
  ): Promise<any> {
    const response = await page.waitForResponse(
      (resp) => {
        const urlMatch = typeof urlPattern === 'string'
          ? resp.url().includes(urlPattern)
          : urlPattern.test(resp.url());
        
        return urlMatch && resp.status() === expectedStatus;
      },
      { timeout }
    );

    return await response.json().catch(() => response.text());
  }

  /**
   * Sleep for specified duration
   */
  static async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Exponential backoff retry
   */
  static async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries = 5,
    initialDelayMs = 100
  ): Promise<T> {
    return this.retry(fn, maxRetries, initialDelayMs, 2);
  }

  /**
   * Wait for multiple conditions with AND logic
   */
  static async waitForAllConditions(
    conditions: Array<() => Promise<boolean>>,
    timeout = this.DEFAULT_TIMEOUT
  ): Promise<void> {
    const startTime = Date.now();

    while (true) {
      const results = await Promise.all(
        conditions.map(cond => cond().catch(() => false))
      );

      if (results.every(result => result === true)) {
        return;
      }

      if (Date.now() - startTime > timeout) {
        throw new Error(`Not all conditions met within ${timeout}ms`);
      }

      await this.sleep(500);
    }
  }

  /**
   * Wait for any condition with OR logic
   */
  static async waitForAnyCondition(
    conditions: Array<() => Promise<boolean>>,
    timeout = this.DEFAULT_TIMEOUT
  ): Promise<void> {
    const startTime = Date.now();

    while (true) {
      const results = await Promise.all(
        conditions.map(cond => cond().catch(() => false))
      );

      if (results.some(result => result === true)) {
        return;
      }

      if (Date.now() - startTime > timeout) {
        throw new Error(`None of the conditions met within ${timeout}ms`);
      }

      await this.sleep(500);
    }
  }

  /**
   * Timeout wrapper - throw if function doesn't complete
   */
  static async withTimeout<T>(
    fn: () => Promise<T>,
    timeout = this.DEFAULT_TIMEOUT,
    timeoutMessage?: string
  ): Promise<T> {
    const timeoutPromise = new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(timeoutMessage || `Operation timeout after ${timeout}ms`)),
        timeout
      )
    );

    return Promise.race([fn(), timeoutPromise]);
  }
}
