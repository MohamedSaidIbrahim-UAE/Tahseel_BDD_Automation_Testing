/**
 * Locator Strategy Configuration
 * 
 * Production-grade locator selection strategy with priority order.
 * Guides developers on how to select robust selectors for reports.
 * 
 * Priority Order (Most to Least Reliable):
 * 1. data-testid attributes (when available)
 * 2. ARIA attributes (aria-label, aria-labelledby, role)
 * 3. Input attributes (name, id, type, placeholder)
 * 4. DOM structure (CSS selectors with positions)
 * 5. Text content (as last resort)
 * 
 * @category Configuration
 * @module locator-strategy
 */

export interface LocatorStrategy {
  name: string;
  priority: number;
  pattern: string;
  reliability: 'high' | 'medium' | 'low';
  notes: string;
}

/**
 * Locator strategies ranked by reliability
 */
export const LOCATOR_STRATEGIES: LocatorStrategy[] = [
  {
    name: 'data-testid',
    priority: 1,
    pattern: '[data-testid="elementId"]',
    reliability: 'high',
    notes: 'Most reliable - explicitly set for testing',
  },
  {
    name: 'ARIA Label',
    priority: 2,
    pattern: '[aria-label="label text"]',
    reliability: 'high',
    notes: 'Good for accessibility - stable across UI changes',
  },
  {
    name: 'ARIA Role',
    priority: 3,
    pattern: '[role="button"]',
    reliability: 'high',
    notes: 'Semantic meaning - good for generic elements',
  },
  {
    name: 'Input Name',
    priority: 4,
    pattern: 'input[name="fieldName"]',
    reliability: 'high',
    notes: 'Reliable for form elements',
  },
  {
    name: 'Input ID',
    priority: 5,
    pattern: 'input#fieldId',
    reliability: 'high',
    notes: 'Reliable when ID is stable',
  },
  {
    name: 'Element Type + Position',
    priority: 6,
    pattern: 'input[type="date"]:first-of-type',
    reliability: 'medium',
    notes: 'Good for when elements lack other attributes',
  },
  {
    name: 'CSS Class Combination',
    priority: 7,
    pattern: 'button.dx-button.submit',
    reliability: 'medium',
    notes: 'Okay but classes may change with framework updates',
  },
  {
    name: 'Text Content',
    priority: 8,
    pattern: 'button:has-text("Submit")',
    reliability: 'low',
    notes: 'Fragile - breaks if text changes or is translated',
  },
];

/**
 * DevExtreme Component Locator Mapping
 * 
 * Common DevExtreme components and their robust selectors
 */
export const DEVEXTREME_LOCATORS = {
  dataGrid: {
    container: 'dx-data-grid',
    row: '[role="row"]',
    cell: '[role="gridcell"]',
    header: '[role="columnheader"]',
    emptyMessage: '.dx-empty-row',
    footer: '.dx-datagrid-group-footer',
  },

  selectBox: {
    container: 'dx-select-box',
    input: 'dx-select-box input',
    dropdown: '.dx-overlay-content',
    option: '[role="option"]',
  },

  dateBox: {
    container: 'dx-date-box',
    input: 'dx-date-box input',
    calendar: '.dx-calendar',
  },

  button: {
    primary: 'dx-button[type="default"]',
    submit: 'dx-button[type="submit"]',
    secondary: 'dx-button[type="secondary"]',
  },

  textBox: {
    container: 'dx-text-box',
    input: 'dx-text-box input',
  },
};

/**
 * Report-specific Locator Patterns
 * 
 * Common patterns for revenue report elements
 */
export const REPORT_LOCATORS = {
  // Filter controls
  filters: {
    fromDate: [
      'input[type="date"]:first-of-type',
      'dx-date-box:first-of-type input',
      'input[aria-label*="From"]',
      'input[name*="from"]',
    ],
    toDate: [
      'input[type="date"]:last-of-type',
      'dx-date-box:last-of-type input',
      'input[aria-label*="To"]',
      'input[name*="to"]',
    ],
    entity: [
      'dx-select-box[aria-label*="Entity"]',
      'select[aria-label*="Entity"]',
      '[role="combobox"][aria-label*="Entity"]',
    ],
    service: [
      'dx-select-box[aria-label*="Service"]',
      'select[aria-label*="Service"]',
    ],
  },

  // Action buttons
  buttons: {
    showReport: [
      'button[type="submit"]',
      'button[aria-label*="Show"]',
      'button:has-text("Show Report")',
      'button:has-text("View Report")',
      'button:has-text("Generate")',
    ],
    clear: [
      'button:has-text("Clear")',
      'button[aria-label*="Clear"]',
      'button:has-text("Reset")',
    ],
    export: [
      'button:has-text("Export")',
      'button[aria-label*="Export"]',
      'button:has-text("Download")',
    ],
  },

  // Table elements
  table: {
    grid: [
      'dx-data-grid',
      '[role="grid"]',
      'table[role="grid"]',
      'table.report-table',
      '.dx-datagrid',
    ],
    row: '[role="row"]',
    cell: '[role="gridcell"]',
    header: '[role="columnheader"]',
  },

  // Status messages
  messages: {
    noData: [
      '.dx-empty-row',
      'span:has-text("No data")',
      '.empty-state',
      '[class*="no-data"]',
    ],
    loading: [
      '.dx-overlay-content',
      '[class*="loading"]',
      '[class*="spinner"]',
    ],
  },
};

/**
 * Best Practices for Locator Selection
 */
export const LOCATOR_BEST_PRACTICES = {
  doList: [
    '✓ Use data-testid when available',
    '✓ Use ARIA attributes (aria-label, role)',
    '✓ Combine multiple strategies (fallback chain)',
    '✓ Use specific selectors over generic ones',
    '✓ Test selectors in Playwright inspector',
    '✓ Add timeouts for slow-loading elements',
    '✓ Use retry logic for flaky elements',
    '✓ Document selector rationale in code',
  ],

  dontList: [
    '✗ Avoid XPath selectors (slow, brittle)',
    '✗ Avoid hardcoded text matching (breaks on translation)',
    '✗ Avoid deep DOM nesting (too specific)',
    '✗ Avoid changing selectors during test',
    '✗ Avoid single-attempt clicks (add retry)',
    '✗ Avoid short timeouts (<5s for reports)',
    '✗ Avoid inline wait loops (use Playwright waits)',
    '✗ Avoid clicking without scrolling first',
  ],

  reportSpecific: [
    '📊 Reports often load slowly - use generous timeouts',
    '📊 DevExtreme grids use role="grid" - reliable selector',
    '📊 Date inputs may be wrapped in dx-date-box - check both',
    '📊 Buttons may have type="submit" - good fallback',
    '📊 Tables may have summary rows - account for them',
    '📊 Export may open new window - handle gracefully',
    '📊 Filters may disable dynamically - check isDisabled()',
  ],
};

/**
 * Locator Migration Guide
 * 
 * Steps to migrate from fragile to robust selectors
 */
export const MIGRATION_GUIDE = `
# Locator Migration Guide

## Phase 1: Inventory Current Selectors
1. List all selectors in page object
2. Categorize by reliability (good/medium/bad)
3. Identify failing tests
4. Prioritize high-impact migrations

## Phase 2: Add Fallback Chains
Before:
\`\`\`
readonly showButton = 'button:has-text("Show Report")';
\`\`\`

After:
\`\`\`
readonly showButton = {
  primary: 'button[type="submit"]',
  fallbacks: [
    'button[aria-label*="Show"]',
    'button:has-text("Show Report")',
    'button:has-text("View Report")',
  ],
  timeout: 15000,
  retry: 3,
};
\`\`\`

## Phase 3: Use LocatorHelper
Before:
\`\`\`
await page.click('button:has-text("Show Report")');
\`\`\`

After:
\`\`\`
await this.locatorHelper.safeClick(this.showButton);
\`\`\`

## Phase 4: Add Retry Logic
Before:
\`\`\`
async showReport() {
  await this.page.click(this.showButton);
}
\`\`\`

After:
\`\`\`
async showReport() {
  await this.locatorHelper.executeWithRetry(
    () => this.locatorHelper.safeClick(this.showButton),
    { maxAttempts: 3, description: 'Click show report button' }
  );
}
\`\`\`

## Phase 5: Test & Validate
1. Run tests against target environment
2. Generate locator inspection reports
3. Validate all selectors work
4. Add to CI/CD pipeline
`;

export default {
  LOCATOR_STRATEGIES,
  DEVEXTREME_LOCATORS,
  REPORT_LOCATORS,
  LOCATOR_BEST_PRACTICES,
  MIGRATION_GUIDE,
};
