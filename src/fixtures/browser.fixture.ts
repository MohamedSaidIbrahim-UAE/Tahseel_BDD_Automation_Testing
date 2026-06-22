import { Browser, BrowserContext, Page, chromium, firefox, webkit } from '@playwright/test';
import { config } from '../config/config';
import { BROWSER_CONFIGS } from '../config/browser.config';
import * as path from 'path';
import * as fs from 'fs';

export class BrowserFixture {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private tracePath: string = '';

  async initialize(): Promise<Page> {
    const browserConfig = BROWSER_CONFIGS[config.browser];

    const browserType =
      config.browser === 'chromium' ? chromium :
      config.browser === 'firefox'  ? firefox  : webkit;

    this.browser = await browserType.launch({
      headless: !config.headed,
      slowMo: config.slowMo,
      args: browserConfig.args,
    });

    const videoDir = path.join(process.cwd(), 'test-results', 'videos');

    // Resolve the per-environment storage state file.
    // Produced by: npm run auth:setup:<env>
    // e.g. storageState.local.json | storageState.stage.json | storageState.production.json
    const storageStatePath = path.join(process.cwd(), `storageState.${config.environment}.json`);
    const storageStateExists = fs.existsSync(storageStatePath);

    if (!storageStateExists) {
      console.warn(
        `\n⚠️  No storage state found for environment "${config.environment}".` +
        `\n   Run: npm run auth:setup:${config.environment}` +
        `\n   Tests that require authentication will perform a full login.\n`
      );
    }

    // ignoreHTTPSErrors is required for environments whose identity server
    // uses a self-signed certificate (e.g. etcstgappsrv01.srta.local).
    this.context = await this.browser.newContext({
      recordVideo: { dir: videoDir },
      viewport: { width: 1920, height: 1080 },
      ignoreHTTPSErrors: true,
      ...(storageStateExists ? { storageState: storageStatePath } : {}),
    });

    this.tracePath = path.join(
      process.cwd(),
      'test-results',
      'traces',
      `trace-${Date.now()}.zip`,
    );
    await this.context.tracing.start({ screenshots: true, snapshots: true });

    this.page = await this.context.newPage();
    return this.page;
  }

  async cleanup(): Promise<void> {
    try {
      if (this.context) {
        await this.context.tracing.stop({ path: this.tracePath });
      }
      if (this.page)    await this.page.close();
      if (this.context) await this.context.close();
      if (this.browser) await this.browser.close();
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  getPage(): Page | null              { return this.page; }
  getContext(): BrowserContext | null { return this.context; }
  getTracePath(): string              { return this.tracePath; }
}
