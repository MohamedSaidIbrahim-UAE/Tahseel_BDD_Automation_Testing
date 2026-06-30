/**
 * auth-setup.ts
 *
 * Performs the full multi-step login flow and saves the authenticated browser
 * storage state to <project-root>/storageState.<env>.json.
 *
 * Environment is controlled by TEST_ENV (local | stage | production).
 * The matching .env.<TEST_ENV> file is loaded automatically.
 *
 * Usage:
 *   npx cross-env TEST_ENV=local      ts-node scripts/auth-setup.ts
 *   npx cross-env TEST_ENV=stage      ts-node scripts/auth-setup.ts
 *   npx cross-env TEST_ENV=production ts-node scripts/auth-setup.ts
 *
 * Or via npm scripts:
 *   npm run auth:setup:local
 *   npm run auth:setup:stage
 *   npm run auth:setup:production
 *
 * ACTUAL FLOW (captured from the real environment)
 * ─────────────────────────────────────────────────
 * Step 1 — Central Angular shell  (BASE_URL)
 *           User clicks "Continue" → browser redirects to Identity Server
 *
 * Step 2 — Identity Server VerifyUsername page
 *           • Self-signed / internal TLS cert → ignoreHTTPSErrors required
 *           • Form has input#Username only
 *           • Submit → redirects to the Password page
 *
 * Step 3 — Identity Server Password page
 *           • Form has input#Password
 *           • Submit → redirects back to Angular app
 *
 * Step 4 — Angular dashboard
 *           Wait for sidebar sentinel, verify URL and h1.
 *
 * WAITING STRATEGY
 * ─────────────────
 * No waitForLoadState('networkidle') — the Angular app polls continuously.
 * Every wait is anchored to a specific DOM element.
 */

import { chromium, Browser, BrowserContext, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import * as dns from 'dns/promises';
import * as net from 'net';
import { execSync } from 'child_process';

// ── Load the correct .env.<TEST_ENV> file ─────────────────────────────────────
function loadEnvFile(): void {
  const env = process.env.TEST_ENV || 'local';
  const candidates = [
    path.join(process.cwd(), `.env.${env}`),
    path.join(process.cwd(), '.env'),
  ];

  for (const envPath of candidates) {
    if (!fs.existsSync(envPath)) continue;
    console.log(`   Env file  : ${envPath}`);

    for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
    break; // only load the first match
  }
}

loadEnvFile();

// ── Config ────────────────────────────────────────────────────────────────────
const TEST_ENV = process.env.TEST_ENV || 'local';
const BASE_URL = (process.env.BASE_URL || 'https://staging.tahseel.gov.ae/ManagePortal').replace(/\/$/, '');
const ENTRY_URL = `${BASE_URL}/`;
const USERNAME = process.env.APP_USERNAME || '';
const PASSWORD = process.env.APP_PASSWORD || '';
const TIMEOUT = parseInt(process.env.TIMEOUT || '90000', 10);
const PROXY_SERVER = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || '';
const PROXY_BYPASS = process.env.NO_PROXY || process.env.no_proxy || '';

/** Per-environment storage state path: storageState.local.json, etc. */
const STATE_PATH = path.join(process.cwd(), `storageState.${TEST_ENV}.json`);

type ChromiumChannel = 'msedge' | 'chrome';

type ResolvedProxy = {
  server?: string;
  bypass?: string;
  pacUrl?: string;
  source: 'env' | 'windows-internet-settings' | 'none';
};

// ── Selectors ─────────────────────────────────────────────────────────────────
const SEL = {
  continueButton: [
    'button span[translate="Login.Continue"]',
    'button:has-text("Continue")',
    'a:has-text("Continue")',
  ].join(', '),

  usernameInput: [
    '[formcontrolname="username"], [formcontrolname="username"], [placeholder="إسم المستخدم"]',
    'input#Username',
    'input[name="username"], [formcontrolname="username"], [placeholder="إسم المستخدم"]',
    'input[placeholder*="username" i]',
  ].join(', '),
  verifyBtn: [
    'button#submitButton',
    'button[type="submit"]',
    'button:has-text("Continue")',
    'button:has-text("Next")',
  ].join(', '),

  passwordInput: [
    '[formcontrolname="password"], [formcontrolname="password"], [placeholder="كلمة المرور"], [type="password"]',
    'input#Password',
    'input[name="password"], [formcontrolname="password"], [placeholder="كلمة المرور"], [type="password"]',
    'input[placeholder*="password" i]',
  ].join(', '),
  loginBtn: [
    'button[id*="login"]',
    'button#submitButton',
    'button[type="submit"]',
    'button:has-text("Sign In")',
    'button:has-text("Login")',
  ].join(', '),

  dashboardSentinel: 'div[id*="side_brand"], app-sidebar, #kt_app_sidebar, nav[class*="sidebar"]',
  dashboardTitle: "[class*='subheader__title']",
  dashboardUrlPattern: /\/dashboard/,

  errorSummary: [
    '[id*="error"]',
    'div.validation-summary-errors',
    'span.field-validation-error',
    'div.alert-danger',
    'p.text-danger',
    '.error-message',
  ].join(', '),
};

// ── Helpers ───────────────────────────────────────────────────────────────────

async function waitForVisible(page: Page, selector: string, timeout = TIMEOUT): Promise<void> {
  await page.locator(selector).first().waitFor({ state: 'visible', timeout });
}

async function checkForAuthError(page: Page): Promise<void> {
  const errorEl = page.locator(SEL.errorSummary).first();
  const visible = await errorEl.isVisible().catch(() => false);
  if (visible) {
    const text = await errorEl.textContent().catch(() => '');
    throw new Error(`Identity server returned an error: "${text?.trim()}"`);
  }
}

async function saveDebugScreenshot(page: Page): Promise<void> {
  try {
    const debugShot = path.join(process.cwd(), `auth-setup-failure-${TEST_ENV}.png`);
    await page.screenshot({ path: debugShot, fullPage: true });
    console.error(`   Screenshot saved → ${debugShot}`);
  } catch {
    // ignore
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resolveProxySettings(): ResolvedProxy {
  if (PROXY_SERVER) {
    return { server: PROXY_SERVER, bypass: PROXY_BYPASS || undefined, source: 'env' };
  }

  if (process.platform !== 'win32') return { source: 'none' };

  try {
    const raw = execSync(
      `powershell -NoProfile -Command "(Get-ItemProperty 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings' | Select-Object ProxyEnable,ProxyServer,AutoConfigURL | ConvertTo-Json -Compress)"`,
      { stdio: ['ignore', 'pipe', 'ignore'] }
    ).toString().trim();

    if (!raw) return { source: 'none' };

    const settings = JSON.parse(raw) as {
      ProxyEnable?: number;
      ProxyServer?: string;
      AutoConfigURL?: string;
    };

    const server = settings.ProxyEnable ? settings.ProxyServer?.trim() : '';
    const pacUrl = settings.AutoConfigURL?.trim() || '';
    if (!server && !pacUrl) return { source: 'none' };

    return { server: server || undefined, pacUrl: pacUrl || undefined, source: 'windows-internet-settings' };
  } catch {
    return { source: 'none' };
  }
}

const EFFECTIVE_PROXY = resolveProxySettings();

async function assertHostReachable(urlString: string): Promise<void> {
  const target = new URL(urlString);
  const port = Number(target.port || (target.protocol === 'https:' ? 443 : 80));

  try {
    await dns.lookup(target.hostname);
  } catch (error) {
    throw new Error(
      `DNS lookup failed for "${target.hostname}". Check VPN/internal DNS access. Cause: ${String(error)}`
    );
  }

  await new Promise<void>((resolve, reject) => {
    const socket = net.connect({ host: target.hostname, port, timeout: 10000 });
    socket.once('connect', () => { socket.end(); resolve(); });
    socket.once('timeout', () => {
      socket.destroy();
      reject(new Error(`TCP connection to ${target.hostname}:${port} timed out. Verify VPN/firewall/proxy access.`));
    });
    socket.once('error', (error) => {
      reject(new Error(`Cannot connect to ${target.hostname}:${port}. Cause: ${String(error)}`));
    });
  });
}

async function gotoWithRetry(page: Page, url: string, timeout: number): Promise<void> {
  const attempts = [
    { waitUntil: 'load' as const, timeout },
    { waitUntil: 'domcontentloaded' as const, timeout: Math.max(30000, Math.floor(timeout * 0.75)) },
    { waitUntil: 'domcontentloaded' as const, timeout: Math.max(20000, Math.floor(timeout * 0.5)) },
  ];

  let lastError: unknown;
  for (let i = 0; i < attempts.length; i++) {
    const attempt = attempts[i];
    try {
      console.log(`   [Step 1] Navigation attempt ${i + 1}/${attempts.length} (waitUntil=${attempt.waitUntil}, timeout=${attempt.timeout}ms)`);
      await page.goto(url, { timeout: attempt.timeout, waitUntil: attempt.waitUntil });
      return;
    } catch (error) {
      lastError = error;
      console.warn(`   [Step 1] Attempt ${i + 1} failed: ${String(error)}`);
      if (i < attempts.length - 1) await sleep((i + 1) * 2000);
    }
  }

  throw new Error(`Unable to open "${url}" after ${attempts.length} attempts. Last error: ${String(lastError)}`);
}

function buildLaunchOptions(channel?: ChromiumChannel) {
  return {
    headless: false,
    channel,
    args: [
      '--ignore-certificate-errors',
      '--disable-blink-features=AutomationControlled',
      ...(EFFECTIVE_PROXY.pacUrl ? [`--proxy-pac-url=${EFFECTIVE_PROXY.pacUrl}`] : []),
    ],
    ...(EFFECTIVE_PROXY.server
      ? { proxy: { server: EFFECTIVE_PROXY.server, bypass: EFFECTIVE_PROXY.bypass } }
      : {}),
  };
}

async function launchBrowser(channel?: ChromiumChannel): Promise<Browser> {
  const label = channel ? `system channel "${channel}"` : 'bundled Chromium';
  console.log(`   Browser   : launching ${label}`);
  return chromium.launch(buildLaunchOptions(channel));
}

// ── Guard ─────────────────────────────────────────────────────────────────────

if (!USERNAME || !PASSWORD) {
  console.error(`❌  APP_USERNAME and APP_PASSWORD must be set in .env.${TEST_ENV} (or .env).`);
  process.exit(1);
}

// ── Main ──────────────────────────────────────────────────────────────────────

(async () => {
  console.log(`🔐  Starting auth setup  [environment: ${TEST_ENV.toUpperCase()}]`);
  console.log(`   Entry URL : ${ENTRY_URL}`);
  console.log(`   Username  : ${USERNAME}`);
  console.log(`   Timeout   : ${TIMEOUT} ms`);
  console.log(`   State out : ${STATE_PATH}`);
  if (EFFECTIVE_PROXY.source !== 'none') {
    console.log(`   ProxySrc  : ${EFFECTIVE_PROXY.source}`);
    if (EFFECTIVE_PROXY.server) console.log(`   Proxy     : ${EFFECTIVE_PROXY.server}`);
    if (EFFECTIVE_PROXY.bypass) console.log(`   No Proxy  : ${EFFECTIVE_PROXY.bypass}`);
    if (EFFECTIVE_PROXY.pacUrl) console.log(`   Proxy PAC : ${EFFECTIVE_PROXY.pacUrl}`);
  }

  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    browser = await launchBrowser();

    let context: BrowserContext = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      ignoreHTTPSErrors: true,
    });

    page = await context.newPage();

    // ── Step 1: Navigate to Angular shell ──────────────────────────────────────
    console.log('\n   [Step 1] Checking network reachability...');
    await assertHostReachable(ENTRY_URL);
    console.log('   [Step 1] Host reachable — navigating...');

    try {
      await gotoWithRetry(page, ENTRY_URL, TIMEOUT);
    } catch (primaryError) {
      const message = String(primaryError);
      if (!message.includes('ERR_CONNECTION_TIMED_OUT')) throw primaryError;

      console.warn('   [Step 1] Bundled Chromium timed out. Trying system browser channels...');
      const fallbackChannels: ChromiumChannel[] =
        process.platform === 'win32' ? ['msedge', 'chrome'] : ['chrome'];

      let connected = false;
      let lastFallbackError: unknown = primaryError;

      for (const channel of fallbackChannels) {
        try {
          await browser.close().catch(() => { });
          browser = await launchBrowser(channel);
          context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, ignoreHTTPSErrors: true });
          page = await context.newPage();
          await gotoWithRetry(page, ENTRY_URL, TIMEOUT);
          connected = true;
          console.log(`   [Step 1] Navigation succeeded with "${channel}" channel.`);
          break;
        } catch (fallbackError) {
          lastFallbackError = fallbackError;
          console.warn(`   [Step 1] Channel "${channel}" failed: ${String(fallbackError)}`);
        }
      }

      if (!connected) {
        throw new Error(
          `Navigation timed out in bundled Chromium and all system browser channels. Last error: ${String(lastFallbackError)}`
        );
      }
    }

    // Check if we landed directly on the identity login page
    const isDirectIdentityLogin = await page
      .locator(SEL.passwordInput).first()
      .isVisible({ timeout: 8000 }).catch(() => false);

    if (!isDirectIdentityLogin) {
      const hasContinueButton = await page
        .locator(SEL.continueButton).first()
        .isVisible({ timeout: 8000 }).catch(() => false);

      if (hasContinueButton) {
        await waitForVisible(page, SEL.continueButton);
        console.log('   [Step 1] Continue button visible — clicking...');
        await page.locator(SEL.continueButton).first().click();
      }
    } else {
      console.log('   [Step 1] Direct identity login page detected.');
    }

    // ── Step 2: Username ────────────────────────────────────────────────────────
    console.log('\n   [Step 2] Waiting for username field...');
    await waitForVisible(page, SEL.usernameInput);
    console.log(`   [Step 2] Identity page at: ${page.url()}`);

    await page.locator(SEL.usernameInput).first().clear();
    await page.locator(SEL.usernameInput).first().fill(USERNAME);
    console.log('   [Step 2] Username entered.');

    const hasPasswordNow = await page
      .locator(SEL.passwordInput).first()
      .isVisible({ timeout: 5000 }).catch(() => false);

    if (!hasPasswordNow) {
      console.log('   [Step 2] Submitting username...');
      await page.locator(SEL.verifyBtn).first().click();
      await checkForAuthError(page);
    }

    // ── Step 3: Password ────────────────────────────────────────────────────────
    console.log('\n   [Step 3] Waiting for password field...');
    await waitForVisible(page, SEL.passwordInput);
    console.log(`   [Step 3] Password page at: ${page.url()}`);

    await page.locator(SEL.passwordInput).clear();
    await page.locator(SEL.passwordInput).fill(PASSWORD);
    console.log('   [Step 3] Password entered — submitting...');

    await Promise.all([
      page.waitForURL(
        (url) => !url.pathname.includes('/masar-sso/'),
        { timeout: TIMEOUT }
      ),
      page.locator(SEL.loginBtn).first().click(),
    ]);

    await checkForAuthError(page);
    console.log(`   [Step 3] Redirected to Angular app: ${page.url()}`);

    // ── Step 4: Verify dashboard ────────────────────────────────────────────────
    console.log('\n   [Step 4] Waiting for Angular dashboard...');
    await page.waitForURL(SEL.dashboardUrlPattern, { timeout: TIMEOUT });
    console.log(`   [Step 4] Dashboard URL verified: ${page.url()}`);

    await waitForVisible(page, SEL.dashboardSentinel);
    console.log('   [Step 4] Angular sidebar sentinel visible.');

    const h1Text = await page.locator(SEL.dashboardTitle).first().textContent();
    console.log(`   [Step 4] Dashboard h1 text: "${h1Text}"`);
    if (h1Text?.includes('home') || h1Text?.includes('Home') || h1Text?.includes('الرئيسية')) {
      console.log('You are in the Dashboard');
    } else {
      throw new Error(`Dashboard h1 does not contain "Dashboard". Found: "${h1Text}"`);
    }

    // ── Save storage state ──────────────────────────────────────────────────────
    await context.storageState({ path: STATE_PATH });
    console.log(`\n   💾  Storage state saved → ${STATE_PATH}`);

    await browser.close();
    console.log(`\n✅  Auth setup complete for [${TEST_ENV.toUpperCase()}]. Run your tests now.`);

  } catch (err) {
    console.error(`\n❌  Auth setup failed [${TEST_ENV.toUpperCase()}]:`, err);
    if (page) await saveDebugScreenshot(page);
    if (browser) await browser.close().catch(() => { });
    process.exit(1);
  }
})();
