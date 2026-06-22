import * as fs from 'fs';
import * as path from 'path';

export interface Config {
  baseUrl: string;
  identityServerUrl: string;
  browser: 'chromium' | 'firefox' | 'webkit';
  headed: boolean;
  timeout: number;
  retries: number;
  slowMo: number;
  pollingExcludePattern: string;
  environment: string;
}

/**
 * Resolves and loads the correct .env file based on TEST_ENV.
 *
 * Priority:
 *  1. TEST_ENV=local   → .env.local
 *  2. TEST_ENV=stage   → .env.stage
 *  3. TEST_ENV=production → .env.production
 *  4. fallback         → .env
 *
 * Variables already set in the process environment are NOT overwritten,
 * so cross-env values passed on the CLI always win.
 */
function loadEnvFile(): void {
  const env = process.env.TEST_ENV || 'local';
  const candidates = [
    path.join(process.cwd(), `.env.${env}`),
    path.join(process.cwd(), '.env'),
  ];

  for (const envPath of candidates) {
    if (!fs.existsSync(envPath)) continue;

    for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;

      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim();
      // CLI / cross-env values take precedence
      if (!process.env[key]) process.env[key] = value;
    }

    // Only load the first file found
    break;
  }
}

loadEnvFile();

export const config: Config = {
  environment: process.env.TEST_ENV || 'local',
  baseUrl: process.env.BASE_URL || 'https://stgmasar.srta.gov.ae/masar/',
  identityServerUrl: process.env.IDENTITY_SERVER_URL || '',
  browser: (process.env.BROWSER as 'chromium' | 'firefox' | 'webkit') || 'chromium',
  headed: process.env.HEADED === 'true',
  timeout: parseInt(process.env.TIMEOUT || '60000', 10),
  retries: parseInt(process.env.RETRIES || '0', 10),
  slowMo: parseInt(process.env.SLOW_MO || '0', 10),
  pollingExcludePattern: process.env.POLLING_EXCLUDE_PATTERN || '',
};

/**
 * Environment-specific timeout overrides
 * Stage environment requires increased timeouts due to infrastructure limitations
 */
export const environmentTimeouts = {
  navigationTimeout: process.env.TEST_ENV === 'stage' ? 60000 : 30000, // 60s for stage, 30s otherwise
  actionTimeout: process.env.TEST_ENV === 'stage' ? 30000 : 10000,     // 30s for stage, 10s otherwise
  waitForTimeout: process.env.TEST_ENV === 'stage' ? 45000 : 15000,    // 45s for stage, 15s otherwise
};
