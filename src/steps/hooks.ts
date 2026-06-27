import { Before, After, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, Browser, BrowserContext, Page, Response } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { AuthManager } from '../utils/auth.manager';
import { BasePage } from '../pages/base.page';

// ── Timeout Configuration ──────────────────────────────────────────────────────
// Stage environment needs generous timeouts due to infrastructure limitations.
// setDefaultTimeout overrides the cucumber.js profile timeout for all step defs.
const STEP_TIMEOUT_MS = process.env.TEST_ENV === 'stage' ? 300_000 : 60_000;
setDefaultTimeout(STEP_TIMEOUT_MS);

let browser: Browser;

Before({ timeout: 60000 }, async function (this: any, scenario) {
  if (!browser) {
    browser = await chromium.launch({ headless: false, args: ['--disable-web-security'] });
  }

  const tags = scenario.pickle.tags.map((t: any) => t.name);
  let context: BrowserContext;

  if (tags.includes('@authenticated')) {
    const statePath = path.join(process.cwd(), `storageState.${process.env.TEST_ENV || 'local'}.json`);
    if (fs.existsSync(statePath)) {
      console.log('[Hooks] Using pre‑baked storageState');
      context = await browser.newContext({ storageState: statePath });
    } else {
      console.log('[Hooks] No storageState found – creating fresh context for login');
      context = await browser.newContext();
    }
  } else {
    context = await browser.newContext();
  }

  const page = await context.newPage();
  this.context = context;
  this.page = page;
  this.authManager = new AuthManager(page, context);

  // Register AuthManager with BasePage so that session-expiry recovery
  // (BasePage._handleLoginInterception) can trigger re-login automatically.
  BasePage.setAuthManager(this.authManager);

  // Add logging support if not already present
  if (!this.addLog) {
    const logs: string[] = [];
    this.addLog = function (message: string) {
      const timestamp = new Date().toISOString();
      logs.push(`[${timestamp}] ${message}`);
    };
    this.getLogs = function () {
      return logs.join('\n');
    };
  }

  // Real‑time session violation recovery (401/403 → re‑login)
  if (tags.includes('@authenticated')) {
    page.on('response', async (response: Response) => {
      if ([401, 403].includes(response.status())) {
        console.warn(`[Hooks] Session violation (${response.status()}). Triggering re‑login...`);
        try {
          await this.authManager.reLoginAndSaveState();
          await page.goto(page.url(), { waitUntil: 'load' });
        } catch (error) {
          console.error('[Hooks] Auto‑recovery failed', error);
        }
      }
    });
  }
});

After(async function (this: any, scenario) {
  if (scenario.result?.status === Status.FAILED) {
    const screenshot = await this.page.screenshot();
    this.attach(screenshot, 'image/png');
  }
  await this.page.close();
  await this.context.close();
});