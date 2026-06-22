/**
 * Connection health check utility for verifying page/network connectivity
 * Used to diagnose and recover from stage environment connection issues
 */

import { Page } from '@playwright/test';

export interface HealthCheckResult {
  isHealthy: boolean;
  responseTime: number;
  issues: string[];
  timestamp: number;
}

/**
 * Verifies page connectivity and responsiveness
 * @param page - Playwright page object
 * @param timeoutMs - Health check timeout in milliseconds
 * @returns HealthCheckResult with connectivity status
 */
export async function checkPageHealth(
  page: Page,
  timeoutMs: number = 10000
): Promise<HealthCheckResult> {
  const startTime = Date.now();
  const issues: string[] = [];
  let isHealthy = true;

  try {
    // Check 1: Page URL is accessible
    try {
      const currentUrl = page.url();
      if (!currentUrl || currentUrl === 'about:blank') {
        issues.push('Page URL is blank or unavailable');
      }
    } catch (error: any) {
      issues.push(`Failed to get page URL: ${error.message}`);
    }

    // Check 2: Page is responsive (can evaluate JavaScript)
    try {
      await Promise.race([
        page.evaluate(() => {
          if (document.readyState !== 'complete' && document.readyState !== 'interactive') {
            throw new Error(`Page not ready: ${document.readyState}`);
          }
          return true;
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Page evaluation timeout')), timeoutMs / 2)
        ),
      ]);
    } catch (error: any) {
      issues.push(`Page evaluation failed: ${error.message}`);
    }

    // Check 3: DOM is accessible
    try {
      await Promise.race([
        page.evaluate(() => !!document.body),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('DOM check timeout')), timeoutMs / 2)
        ),
      ]);
    } catch (error: any) {
      issues.push(`DOM access failed: ${error.message}`);
    }

    isHealthy = issues.length === 0;
  } catch (error: any) {
    issues.push(`Health check error: ${error.message}`);
    isHealthy = false;
  }

  const responseTime = Date.now() - startTime;

  return {
    isHealthy,
    responseTime,
    issues,
    timestamp: Date.now(),
  };
}

/**
 * Attempts to recover from connection issues
 * @param page - Playwright page object
 * @param maxAttempts - Maximum recovery attempts
 * @returns true if recovery successful, false otherwise
 */
export async function recoverConnection(
  page: Page,
  maxAttempts: number = 3
): Promise<boolean> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      // Attempt 1: Simple reload
      if (attempt === 0) {
        await Promise.race([
          page.reload({ waitUntil: 'domcontentloaded' }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Reload timeout')), 30000)
          ),
        ]);
      }
      // Attempt 2: Go to page and retry
      else if (attempt === 1) {
        const url = page.url();
        if (url && url !== 'about:blank') {
          await Promise.race([
            page.goto(url, { waitUntil: 'domcontentloaded' }),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Navigation timeout')), 30000)
            ),
          ]);
        }
      }
      // Attempt 3: Close and reinitialize (if page.context available)
      else if (attempt === 2) {
        // Just verify page is still accessible
        await page.url();
      }

      // Verify connection is restored
      const health = await checkPageHealth(page, 10000);
      if (health.isHealthy) {
        return true;
      }
    } catch (error: any) {
      // Continue to next attempt
      await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
    }
  }

  return false;
}

/**
 * Ensures connection is healthy before proceeding
 * Attempts recovery if connection is degraded
 * @param page - Playwright page object
 * @throws Error if connection cannot be restored
 */
export async function ensureConnectionHealth(page: Page): Promise<void> {
  const health = await checkPageHealth(page);

  if (!health.isHealthy) {
    const recovered = await recoverConnection(page);

    if (!recovered) {
      throw new Error(
        `Connection health check failed. Issues: ${health.issues.join('; ')}`
      );
    }
  }
}

/**
 * Monitors connection health periodically
 * Returns callback to stop monitoring
 * @param page - Playwright page object
 * @param checkIntervalMs - Interval between health checks
 * @param onUnhealthy - Callback when connection becomes unhealthy
 * @returns Unsubscribe function to stop monitoring
 */
export function monitorConnectionHealth(
  page: Page,
  checkIntervalMs: number = 30000,
  onUnhealthy?: (health: HealthCheckResult) => void
): () => void {
  let isMonitoring = true;

  const monitor = async () => {
    while (isMonitoring) {
      try {
        const health = await checkPageHealth(page, 10000);
        if (!health.isHealthy && onUnhealthy) {
          onUnhealthy(health);
        }
      } catch (error: any) {
        // Silently ignore monitoring errors
      }

      await new Promise(resolve => setTimeout(resolve, checkIntervalMs));
    }
  };

  // Start monitoring in background (don't await)
  monitor().catch(() => undefined);

  // Return unsubscribe function
  return () => {
    isMonitoring = false;
  };
}
