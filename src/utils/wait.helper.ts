/**
 * wait.helper.ts
 *
 * Reliable waiting utilities for Angular SPAs that continuously poll APIs.
 *
 * WHY NOT networkidle / domcontentloaded?
 * ─────────────────────────────────────────
 * Angular apps with WebSocket feeds, SSE, or polling timers never reach
 * Playwright's "networkidle" threshold (< 2 in-flight requests for 500 ms).
 * Using networkidle causes either:
 *   • Indefinite hangs  — the app never goes quiet
 *   • False positives   — the check passes before Angular has rendered
 *
 * STRATEGY USED HERE
 * ─────────────────────────────────────────
 * 1. waitForAngularStable  — waits for a specific element to be visible,
 *    which proves Angular has finished rendering the relevant component.
 *
 * 2. waitForApiResponse    — intercepts a known API route and waits for
 *    its response before asserting table/card content.
 *
 * 3. waitForRequestQuiet   — counts in-flight XHR/fetch requests; waits
 *    until the count stays at zero for a configurable window (default 300 ms).
 *    Ignores polling requests that match an optional exclude pattern.
 *
 * 4. waitForUrlAndElement  — combines waitForURL + element visibility,
 *    replacing the old waitForURL + networkidle pattern.
 *
 * 5. waitForTableRows      — waits until tbody has at least N rows,
 *    replacing networkidle after filter/submit actions.
 */

import { Page, Locator, Response } from '@playwright/test';

export class WaitHelper {

  static async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  constructor(private readonly page: Page) { }

  // ─── 1. URL + element visibility ─────────────────────────────────────────

  /**
   * Replaces: waitForURL + waitForLoadState('networkidle')
   *
   * Navigates to a URL pattern and waits until a sentinel element is visible,
   * proving the Angular component has mounted and rendered.
   */
  async waitForUrlAndElement(
    urlPattern: string | RegExp,
    sentinelSelector: string,
    timeout = 20000
  ): Promise<void> {
    await this.page.waitForURL(urlPattern, { timeout });
    await this.page.locator(sentinelSelector).first().waitFor({
      state: 'visible',
      timeout,
    });
  }

  // ─── 2. Element visible (replaces networkidle after navigation) ───────────

  /**
   * Replaces: waitForLoadState('networkidle') after a click/action.
   *
   * Waits until the given selector is visible — Angular has rendered the result.
   */
  async waitForElement(selector: string, timeout = 15000): Promise<void> {
    await this.page.locator(selector).first().waitFor({ state: 'visible', timeout });
  }

  // ─── 3. API response interception ────────────────────────────────────────

  /**
   * Waits for a specific API route to respond before continuing.
   * Use after clicking Filter/Submit to wait for the data response.
   *
   * @param urlPattern  Substring or regex matching the API endpoint URL
   * @param action      The async action that triggers the request
   * @param timeout     Max wait in ms
   */
  async waitForApiResponse(
    urlPattern: string | RegExp,
    action: () => Promise<void>,
    timeout = 15000
  ): Promise<Response> {
    const [response] = await Promise.all([
      this.page.waitForResponse(
        (res) => {
          const url = res.url();
          return typeof urlPattern === 'string'
            ? url.includes(urlPattern)
            : urlPattern.test(url);
        },
        { timeout }
      ),
      action(),
    ]);
    return response;
  }

  // ─── 4. Request-quiet window ──────────────────────────────────────────────

  /**
   * Waits until no non-polling XHR/fetch requests are in-flight for
   * `quietWindowMs` milliseconds.
   *
   * @param quietWindowMs   How long the network must stay quiet (default 300 ms)
   * @param excludePattern  URL pattern to ignore (e.g. polling endpoints)
   * @param timeout         Max total wait time in ms
   */
  async waitForRequestQuiet(
    quietWindowMs = 300,
    excludePattern?: RegExp,
    timeout = 15000
  ): Promise<void> {
    let inFlight = 0;
    let quietTimer: ReturnType<typeof setTimeout> | null = null;

    return new Promise<void>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        cleanup();
        resolve(); // resolve on timeout — don't fail, just continue
      }, timeout);

      const onRequest = (req: { url: () => string }) => {
        if (excludePattern && excludePattern.test(req.url())) return;
        inFlight++;
        if (quietTimer) { clearTimeout(quietTimer); quietTimer = null; }
      };

      const onResponse = (res: { url: () => string }) => {
        if (excludePattern && excludePattern.test(res.url())) return;
        inFlight = Math.max(0, inFlight - 1);
        if (inFlight === 0) {
          quietTimer = setTimeout(() => {
            cleanup();
            resolve();
          }, quietWindowMs);
        }
      };

      const cleanup = () => {
        clearTimeout(timeoutId);
        if (quietTimer) clearTimeout(quietTimer);
        this.page.off('request', onRequest);
        this.page.off('response', onResponse);
        this.page.off('requestfailed', onResponse);
      };

      this.page.on('request', onRequest);
      this.page.on('response', onResponse);
      this.page.on('requestfailed', onResponse);

      // If already quiet, resolve after the window
      if (inFlight === 0) {
        quietTimer = setTimeout(() => { cleanup(); resolve(); }, quietWindowMs);
      }
    });
  }

  // ─── 5. Table rows ────────────────────────────────────────────────────────

  /**
   * Replaces: waitForLoadState('networkidle') after filter/submit.
   *
   * Waits until tbody has at least `minRows` rows, or a "no records" cell
   * is visible — whichever comes first.
   */
  async waitForTableRows(
    tbodySelector = 'table > tbody',
    minRows = 1,
    timeout = 15000
  ): Promise<void> {
    await this.page.waitForFunction(
      (args: { sel: string; min: number }) => {
        const el = (globalThis as unknown as { document: { querySelector: (s: string) => { querySelectorAll: (s: string) => ArrayLike<{ textContent: string | null }> } | null } }).document.querySelector(args.sel);
        if (!el) return false;
        const rows = el.querySelectorAll('tr');
        if (rows.length === 0) return false;
        const firstText = rows[0]?.textContent?.toLowerCase() ?? '';
        if (/no (records|data|results)/.test(firstText)) return true;
        return rows.length >= args.min;
      },
      { sel: tbodySelector, min: minRows },
      { timeout }
    );
  }

  // ─── 6. Spinner / loader gone ─────────────────────────────────────────────

  /**
   * Waits until a loading spinner/overlay disappears.
   * Common Angular loading selectors are tried in order.
   */
  async waitForSpinnerGone(timeout = 10000): Promise<void> {
    const spinnerSelectors = [
      '.loading-overlay',
      '.spinner',
      'app-loading',
      '[class*="loading"]',
      'ngx-spinner',
      '.loader',
    ];
    for (const sel of spinnerSelectors) {
      const count = await this.page.locator(sel).count();
      if (count > 0) {
        await this.page.locator(sel).first().waitFor({ state: 'hidden', timeout });
        return;
      }
    }
    // No spinner found — nothing to wait for
  }

  // ─── 7. Angular stability (zone.js) ──────────────────────────────────────

  /**
   * Polls until Angular's zone is stable (no pending micro/macro tasks).
   * Works with both Zone.js and Zoneless Angular.
   * Falls back gracefully if window.getAllAngularTestabilities is not present.
   */
  async waitForAngularStable(timeout = 10000): Promise<void> {
    try {
      await this.page.waitForFunction(
        () => {
          const win = (globalThis as unknown as { getAllAngularTestabilities?: () => Array<{ isStable(): boolean }> });
          if (typeof win.getAllAngularTestabilities !== 'function') return true;
          return win.getAllAngularTestabilities().every(t => t.isStable());
        },
        { timeout }
      );
    } catch {
      // Angular testabilities not available — skip silently
    }
  }


}
