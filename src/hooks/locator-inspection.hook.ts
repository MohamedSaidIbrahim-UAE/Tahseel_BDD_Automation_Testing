/**
 * Locator Inspection Hook
 * 
 * Production-grade locator inspection that runs before/after report tests.
 * Automatically inspects failing selectors and generates recommendations.
 * 
 * Triggers:
 * - Before: @locator-inspect tag on scenarios
 * - After: @locator-inspect tag on scenarios
 * 
 * @category Hooks
 * @module locator-inspection-hook
 */

import { Before, After, World, BeforeAll, AfterAll } from '@cucumber/cucumber';
import * as fs from 'fs';
import * as path from 'path';
import { LocatorInspector, LocatorReport } from '../utils/locator-inspector.utility';

// Global report storage
const reports: Map<string, LocatorReport> = new Map();

/**
 * Before hook - Initialize locator inspection
 */
Before('@locator-inspect', async function (this: World, { pickle }) {
  const world = this as any;
  if (!world.page) {
    console.log('⚠️ No page available for locator inspection');
    return;
  }

  world.locatorInspector = new LocatorInspector(world.page);
  world.currentScenario = pickle.name;
  world.locatorReport = new LocatorReport(
    world.page.url?.() || 'unknown',
    pickle.name
  );

  console.log(`\n🔍 Starting locator inspection for: ${pickle.name}`);
});

/**
 * After hook - Generate locator inspection report
 */
After('@locator-inspect', async function (this: World, { pickle, result }) {
  const world = this as any;
  if (!world.locatorInspector || !world.locatorReport) {
    return;
  }

  console.log(`\n📊 Generating locator inspection report for: ${pickle.name}`);

  try {
    // Inspect common report selectors
    const reportSelectors: Record<string, string> = {
      'Report Table': 'dx-data-grid, [role="grid"], table.report-table',
      'Show Report Button':
        'button[type="submit"], button:has-text("Show Report"), button:has-text("View Report"), button:has-text("Search")',
      'From Date Input':
        'input[type="date"]:first-of-type, input[aria-label*="From"], dx-date-box input',
      'To Date Input':
        'input[type="date"]:last-of-type, input[aria-label*="To"], dx-date-box input',
      'Entity Filter':
        'dx-select-box[aria-label*="Entity"], select[aria-label*="Entity"], [role="combobox"]',
      'No Data Message':
        '.dx-empty-row, span:has-text("No data"), .empty-state, [class*="no-data"]',
      'Export Button': 'button:has-text("Export"), button:has-text("Download")',
      'PDF Export': 'button:has-text("PDF"), span:has-text("PDF")',
      'Excel Export': 'button:has-text("Excel"), span:has-text("Excel")',
    };

    // Inspect each selector
    for (const [name, selector] of Object.entries(reportSelectors)) {
      const result = await world.locatorInspector.inspectSelector(selector);
      world.locatorReport.addResult(name, result);

      if (!result.found) {
        console.log(`  ❌ ${name}: NOT FOUND`);
        if (result.suggestions.length > 0) {
          console.log(`     Suggestions: ${result.suggestions.join(', ')}`);
        }
      } else {
        console.log(
          `  ✓ ${name}: FOUND (${result.count} element(s), type: ${result.elementType})`
        );
      }
    }

    // Inspect table structure
    const tableInspection = await world.locatorInspector.inspectTable();
    console.log(`\n📋 Table Inspection:`);
    if (tableInspection.found) {
      console.log(`  ✓ Found table at: ${tableInspection.locator}`);
      console.log(`  Rows: ${tableInspection.rowCount}, Columns: ${tableInspection.columnCount}`);
      console.log(`  Headers: ${tableInspection.headerText.join(', ')}`);
    } else {
      console.log(`  ❌ No table found`);
      console.log(`  Tried: ${tableInspection.suggestedSelectors.join(', ')}`);
    }

    // Find all buttons on page
    const buttons = await world.locatorInspector.findAllButtons();
    console.log(`\n🔘 Available Buttons: ${buttons.length}`);
    buttons.slice(0, 5).forEach((btn) => {
      console.log(
        `  • ${btn.attributes.text || btn.ariaLabel || 'Untitled'} - ${btn.selector}`
      );
    });

    // Generate reports
    const reportsDir = path.join(process.cwd(), 'locator-inspection-reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Save HTML report
    const sanitizedScenarioName = pickle.name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const htmlReportPath = path.join(reportsDir, `${sanitizedScenarioName}.html`);
    const htmlReport = world.locatorReport.generateHtmlReport();
    fs.writeFileSync(htmlReportPath, htmlReport);
    console.log(`\n📄 HTML Report saved: ${htmlReportPath}`);

    // Save console report
    const consoleReport = world.locatorReport.generateConsoleReport();
    console.log(consoleReport);

    // Store report for after-all cleanup
    reports.set(sanitizedScenarioName, world.locatorReport);
  } catch (error) {
    console.error(`⚠️ Error during locator inspection: ${(error as Error).message}`);
  }
});

/**
 * AfterAll hook - Generate combined report
 */
AfterAll(async function () {
  if (reports.size === 0) {
    return;
  }

  console.log(`\n📊 Generating combined locator inspection summary...`);

  const reportsDir = path.join(process.cwd(), 'locator-inspection-reports');
  const summaryPath = path.join(reportsDir, 'LOCATOR_SUMMARY.md');

  let summary = `# Locator Inspection Summary\n\n`;
  summary += `Generated: ${new Date().toISOString()}\n`;
  summary += `Total Scenarios Inspected: ${reports.size}\n\n`;

  const allFailedLocators: Map<string, number> = new Map();

  for (const [scenarioName, report] of reports) {
    const failed = report['getFailedLocators']?.() || new Map();
    for (const [locatorId, _] of failed) {
      const count = allFailedLocators.get(locatorId) || 0;
      allFailedLocators.set(locatorId, count + 1);
    }
  }

  if (allFailedLocators.size > 0) {
    summary += `## Most Common Failed Locators\n\n`;
    const sortedFailed = Array.from(allFailedLocators.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    for (const [locator, count] of sortedFailed) {
      summary += `- **${locator}**: Failed in ${count} scenario(s)\n`;
    }
  }

  summary += `\n## Recommendations\n\n`;
  summary += `1. **Use \`dx-data-grid\` selector** - DevExtreme data grids are standard\n`;
  summary += `2. **Use ARIA attributes** - More reliable than text matching\n`;
  summary += `3. **Use data-testid attributes** - When available for automation\n`;
  summary += `4. **Add retry logic** - Network/rendering delays are common\n`;
  summary += `5. **Increase timeouts** - Reports may take 10+ seconds to render\n`;

  fs.writeFileSync(summaryPath, summary);
  console.log(`\n📋 Summary saved: ${summaryPath}`);
});
