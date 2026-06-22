export type BrowserType = 'chromium' | 'firefox' | 'webkit';

export interface BrowserConfig {
  name: BrowserType;
  displayName: string;
  parallelWorkers: number;
  timeout: number;
  args: string[];
}

export const BROWSER_CONFIGS: Record<BrowserType, BrowserConfig> = {
  chromium: {
    name: 'chromium',
    displayName: 'Chromium',
    parallelWorkers: 4,
    timeout: 30000,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage',
      '--no-first-run',
      '--no-default-browser-check'
    ]
  },
  firefox: {
    name: 'firefox',
    displayName: 'Firefox',
    parallelWorkers: 3,
    timeout: 35000,
    args: ['-no-remote', '-new-instance']
  },
  webkit: {
    name: 'webkit',
    displayName: 'WebKit',
    parallelWorkers: 2,
    timeout: 40000,
    args: []
  }
};
