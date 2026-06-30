import { Before, After, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, Browser, BrowserContext, Page, Response } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { AuthManager } from '../utils/auth.manager';
import { BasePage } from '../pages/base.page';

// ── Timeout Configuration ──────────────────────────────────────────────────────
const STEP_TIMEOUT_MS = process.env.TEST_ENV === 'stage' ? 300_000 : 60_000;
setDefaultTimeout(STEP_TIMEOUT_MS);

let browser: Browser;

interface ScenarioContext {
  page: Page;
  context: BrowserContext;
  authManager: AuthManager;
  isRecovering?: boolean;
  addLog: (msg: string) => void;
  getLogs: () => string;
}

Before({ timeout: 60000 }, async function (this: any, scenario) {
  if (!browser) {
    browser = await chromium.launch({ headless: false, args: ['--disable-web-security'] });
  }

  const tags = scenario.pickle.tags.map((t: any) => t.name);
  let context: BrowserContext;
  const traceEnabled = tags.includes('@authenticated') || process.env.TRACE === 'on';

  if (tags.includes('@authenticated')) {
    const statePath = path.join(process.cwd(), `storageState.${process.env.TEST_ENV || 'local'}.json`);
    if (fs.existsSync(statePath)) {
      console.log('[Hooks] Using pre-baked storageState');
      context = await browser.newContext({ 
        storageState: statePath,
        recordVideo: undefined, // Explicitly disable video
      });
    } else {
      console.log('[Hooks] No storageState found – creating fresh context for login');
      context = await browser.newContext();
    }
  } else {
    context = await browser.newContext();
  }

  // Enable tracing for authenticated tests
  if (traceEnabled) {
    const traceDir = path.join(process.cwd(), 'traces');
    if (!fs.existsSync(traceDir)) {
      fs.mkdirSync(traceDir, { recursive: true });
    }
    const tracePath = path.join(traceDir, `${scenario.pickle.name.replace(/\s+/g, '_')}_${Date.now()}.trace.zip`);
    await context.tracing.start({ screenshots: true, snapshots: true });
  }

  const page = await context.newPage();
  this.context = context;
  this.page = page;
  this.authManager = new AuthManager(page, context);
  this.isRecovering = false;
  this.scenarioName = scenario.pickle.name;
  this.traceEnabled = traceEnabled;

  BasePage.setAuthManager(this.authManager);

  // Add logging support
  const logs: string[] = [];
  this.addLog = function (message: string) {
    const timestamp = new Date().toISOString();
    logs.push(`[${timestamp}] ${message}`);
    console.log(message);
  };
  this.getLogs = function () {
    return logs.join('\n');
  };

  // Session violation recovery (401/403)
  if (tags.includes('@authenticated')) {
    page.on('response', async (response: Response) => {
      if (![401, 403].includes(response.status())) {
        return;
      }

      const ctx = this as ScenarioContext;
      
      // Prevent concurrent recovery attempts
      if (ctx.isRecovering) {
        console.warn('[Hooks] Recovery already in progress, skipping duplicate trigger');
        return;
      }

      // Check if context/browser is still valid
      if (context.browser()?.isConnected() === false) {
        console.error('[Hooks] Browser disconnected, cannot recover');
        return;
      }

      ctx.isRecovering = true;
      const recoveryStartTime = Date.now();

      try {
        console.warn(`[Hooks] Session violation (${response.status()}). Triggering re-login...`);
        await this.authManager.reLoginAndSaveState();
        
        // Re-navigate to the original URL after recovery
        try {
          const currentUrl = page.url();
          console.log(`[Hooks] Re-navigating to ${currentUrl} after recovery`);
          await page.goto(currentUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        } catch (navError) {
          console.warn('[Hooks] Re-navigation failed after recovery:', navError);
        }
        
        const recoveryTime = Date.now() - recoveryStartTime;
        console.log(`✅ [Hooks] Auto-recovery successful in ${recoveryTime}ms`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error('[Hooks] Auto-recovery failed:', errorMsg);
        
        // If recovery fails, try to close and re-establish
        try {
          if (!context.browser()?.isConnected()) {
            console.log('[Hooks] Context lost, attempting browser reconnect');
            // Browser will be recreated on next Before hook
          }
        } catch (e) {
          console.error('[Hooks] Error checking context state:', e);
        }
      } finally {
        ctx.isRecovering = false;
      }
    });
  }
});

After(async function (this: any, scenario) {
  const traceDir = path.join(process.cwd(), 'traces');
  const screenshotDir = path.join(process.cwd(), 'test-results', 'screenshots');
  
  try {
    // Capture screenshot on failure
    if (scenario.result?.status === Status.FAILED) {
      try {
        // Create screenshot directory
        if (!fs.existsSync(screenshotDir)) {
          fs.mkdirSync(screenshotDir, { recursive: true });
        }

        // Generate safe filename
        const safeName = this.scenarioName
          .replace(/[<>:"/\\|?*\x00-\x1F]/g, '-')
          .replace(/\s+/g, '_')
          .substring(0, 100);
        const timestamp = Date.now();
        const screenshotPath = path.join(screenshotDir, `${safeName}_${timestamp}.png`);

        // Take screenshot to file
        await this.page.screenshot({ path: screenshotPath, timeout: 10000 });
        
        // Attach to Cucumber report (for HTML reporter)
        const screenshotBuffer = fs.readFileSync(screenshotPath);
        this.attach(screenshotBuffer, 'image/png');
        
        console.log(`[After Hook] Screenshot saved → ${screenshotPath}`);
        console.log('[After Hook] Screenshot attached to Cucumber report');
      } catch (screenshotError) {
        console.warn('[After Hook] Failed to capture screenshot:', screenshotError);
      }

      // Capture trace on failure (context-level)
      if (this.traceEnabled) {
        try {
          if (!fs.existsSync(traceDir)) {
            fs.mkdirSync(traceDir, { recursive: true });
          }
          const tracePath = path.join(
            traceDir,
            `${this.scenarioName.replace(/\s+/g, '_')}_FAILED_${Date.now()}.trace.zip`
          );
          await this.context.tracing.stop({ path: tracePath });
          
          // Also attach trace reference to report
          const traceRelativePath = path.relative(process.cwd(), tracePath);
          this.attach(`Trace file: ${traceRelativePath}`, 'text/plain');
          
          console.log(`[After Hook] Trace saved → ${tracePath}`);
          console.log(`[After Hook] Trace reference attached to report`);
        } catch (traceError) {
          console.warn('[After Hook] Failed to save trace:', traceError);
        }
      }

      // Attach logs to report
      try {
        const logs = this.getLogs();
        if (logs && logs.length > 0) {
          this.attach(logs, 'text/plain');
          console.log('[After Hook] Scenario logs attached to report');
        }
      } catch (logError) {
        console.warn('[After Hook] Failed to attach logs:', logError);
      }
    } else if (this.traceEnabled) {
      // Stop tracing without saving for passing tests (save disk space)
      try {
        await this.context.tracing.stop();
      } catch (traceStopError) {
        console.warn('[After Hook] Error stopping trace:', traceStopError);
      }
    }
  } catch (attachmentError) {
    console.warn('[After Hook] Error during attachment:', attachmentError);
  }

  // Clean up
  try {
    if (this.page && !this.page.isClosed()) {
      await this.page.close();
    }
  } catch (closePageError) {
    console.warn('[After Hook] Error closing page:', closePageError);
  }

  try {
    if (this.context && this.context.browser()?.isConnected()) {
      await this.context.close();
    }
  } catch (closeContextError) {
    console.warn('[After Hook] Error closing context:', closeContextError);
  }
});