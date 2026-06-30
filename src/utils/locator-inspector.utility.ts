/**
 * Locator Inspector Utility
 * 
 * Production-grade locator inspection and validation.
 * Identifies DOM elements, validates selectors, and suggests improvements.
 * 
 * @category Utilities
 * @module locator-inspector
 */

import { Page, Locator } from '@playwright/test';

export interface LocatorInspectionResult {
  selector: string;
  found: boolean;
  count: number;
  elementType: string;
  attributes: Record<string, string>;
  ariaLabel?: string;
  dataTestId?: string;
  testId?: string;
  className?: string;
  suggestions: string[];
  html?: string;
}

export interface TableInspectionResult {
  found: boolean;
  locator: string;
  rowCount: number;
  columnCount: number;
  headerText: string[];
  suggestedSelectors: string[];
}

/**
 * Locator Inspector - Identifies and validates element selectors
 */
export class LocatorInspector {
  constructor(private page: Page) {}

  /**
   * Inspect a selector and provide detailed information
   */
  async inspectSelector(selector: string): Promise<LocatorInspectionResult> {
    try {
      const locator = this.page.locator(selector);
      const count = await locator.count();

      if (count === 0) {
        return {
          selector,
          found: false,
          count: 0,
          elementType: 'unknown',
          attributes: {},
          suggestions: await this.suggestAlternativeSelectors(selector),
        };
      }

      const firstElement = locator.first();
      const elementType = await firstElement.evaluate((el) => el.tagName.toLowerCase());
      const ariaLabel = await firstElement.getAttribute('aria-label');
      const dataTestId = await firstElement.getAttribute('data-testid');
      const testId = await firstElement.getAttribute('data-test-id');
      const className = await firstElement.getAttribute('class');
      const html = await firstElement.innerHTML();

      // Get all attributes
      const attributes = await firstElement.evaluate((el) => {
        const attrs: Record<string, string> = {};
        for (let i = 0; i < el.attributes.length; i++) {
          const attr = el.attributes[i];
          attrs[attr.name] = attr.value;
        }
        return attrs;
      });

      return {
        selector,
        found: true,
        count,
        elementType,
        attributes,
        ariaLabel: ariaLabel || undefined,
        dataTestId: dataTestId || undefined,
        testId: testId || undefined,
        className: className || undefined,
        html: html.substring(0, 200),
        suggestions: [],
      };
    } catch (error) {
      return {
        selector,
        found: false,
        count: 0,
        elementType: 'error',
        attributes: {},
        suggestions: [`Error inspecting selector: ${(error as Error).message}`],
      };
    }
  }

  /**
   * Inspect a data grid/table and extract structure
   */
  async inspectTable(): Promise<TableInspectionResult> {
    const tableSelectors = [
      'dx-data-grid',
      '[role="grid"]',
      'table[role="grid"]',
      'table.report-table',
      '.dx-datagrid',
      '[class*="grid"]',
    ];

    for (const selector of tableSelectors) {
      const locator = this.page.locator(selector);
      const count = await locator.count();

      if (count > 0) {
        const firstTable = locator.first();
        const rowCount = await firstTable.locator('[role="row"]').count();
        const headerLocator = firstTable.locator('[role="columnheader"], th');
        const columnCount = await headerLocator.count();
        const headerText = await headerLocator.allTextContents();

        return {
          found: true,
          locator: selector,
          rowCount,
          columnCount,
          headerText,
          suggestedSelectors: tableSelectors.slice(0, tableSelectors.indexOf(selector) + 1),
        };
      }
    }

    return {
      found: false,
      locator: 'no-table-found',
      rowCount: 0,
      columnCount: 0,
      headerText: [],
      suggestedSelectors: tableSelectors,
    };
  }

  /**
   * Find all buttons and their selectors
   */
  async findAllButtons(pattern?: string): Promise<LocatorInspectionResult[]> {
    const buttons = await this.page.locator('button').all();
    const results: LocatorInspectionResult[] = [];

    for (const button of buttons) {
      const text = await button.textContent();
      
      if (pattern && !text?.includes(pattern)) {
        continue;
      }

      const ariaLabel = await button.getAttribute('aria-label');
      const title = await button.getAttribute('title');
      const className = await button.getAttribute('class');

      results.push({
        selector: await button.evaluate((el) => {
          if (el.id) return `#${el.id}`;
          if (el.className) return `.${el.className.split(' ')[0]}`;
          return el.tagName.toLowerCase();
        }),
        found: true,
        count: 1,
        elementType: 'button',
        attributes: {
          text: text || '',
          ariaLabel: ariaLabel || '',
          title: title || '',
          className: className || '',
        },
        ariaLabel: ariaLabel || undefined,
        suggestions: [],
      });
    }

    return results;
  }

  /**
   * Find input fields and their selectors
   */
  async findAllInputs(type?: string): Promise<LocatorInspectionResult[]> {
    const selector = type ? `input[type="${type}"]` : 'input';
    const inputs = await this.page.locator(selector).all();
    const results: LocatorInspectionResult[] = [];

    for (const input of inputs) {
      const ariaLabel = await input.getAttribute('aria-label');
      const placeholder = await input.getAttribute('placeholder');
      const name = await input.getAttribute('name');
      const id = await input.getAttribute('id');
      const className = await input.getAttribute('class');

      results.push({
        selector: await input.evaluate((el) => {
          if (el.id) return `#${el.id}`;
          if (el.name) return `input[name="${el.name}"]`;
          if (el.placeholder) return `input[placeholder="${el.placeholder}"]`;
          return 'input';
        }),
        found: true,
        count: 1,
        elementType: 'input',
        attributes: {
          ariaLabel: ariaLabel || '',
          placeholder: placeholder || '',
          name: name || '',
          id: id || '',
          className: className || '',
        },
        ariaLabel: ariaLabel || undefined,
        suggestions: [],
      });
    }

    return results;
  }

  /**
   * Suggest alternative selectors based on inspection
   */
  private async suggestAlternativeSelectors(originalSelector: string): Promise<string[]> {
    const suggestions: string[] = [];

    // For button selectors
    if (originalSelector.includes('button')) {
      suggestions.push('button[type="submit"]');
      suggestions.push('button.dx-button');
      suggestions.push('[role="button"]');
    }

    // For date inputs
    if (originalSelector.includes('date')) {
      suggestions.push('input[type="date"]');
      suggestions.push('dx-date-box input');
      suggestions.push('input[placeholder*="Date"]');
    }

    // For tables/grids
    if (originalSelector.includes('grid') || originalSelector.includes('table')) {
      suggestions.push('dx-data-grid');
      suggestions.push('[role="grid"]');
      suggestions.push('table.report-table');
      suggestions.push('[class*="dx-datagrid"]');
    }

    return suggestions;
  }
}

/**
 * Locator Report - Generates a comprehensive locator inspection report
 */
export class LocatorReport {
  private results: Map<string, LocatorInspectionResult> = new Map();
  private timestamp: Date = new Date();

  constructor(
    private pageName: string,
    private reportName: string
  ) {}

  /**
   * Add inspection result
   */
  addResult(locatorId: string, result: LocatorInspectionResult): void {
    this.results.set(locatorId, result);
  }

  /**
   * Get all failed locators
   */
  getFailedLocators(): Map<string, LocatorInspectionResult> {
    const failed = new Map<string, LocatorInspectionResult>();
    for (const [key, result] of this.results) {
      if (!result.found) {
        failed.set(key, result);
      }
    }
    return failed;
  }

  /**
   * Generate HTML report
   */
  generateHtmlReport(): string {
    let html = `
<!DOCTYPE html>
<html>
<head>
  <title>Locator Inspection Report - ${this.reportName}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    .summary { background: #f0f0f0; padding: 10px; margin: 10px 0; border-radius: 5px; }
    .success { color: green; }
    .failed { color: red; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background: #4CAF50; color: white; }
    tr:nth-child(even) { background: #f9f9f9; }
    .locator-id { font-weight: bold; }
    .suggestions { background: #fffbcc; padding: 5px; border-radius: 3px; }
  </style>
</head>
<body>
  <h1>Locator Inspection Report</h1>
  <div class="summary">
    <p><strong>Report:</strong> ${this.reportName}</p>
    <p><strong>Page:</strong> ${this.pageName}</p>
    <p><strong>Timestamp:</strong> ${this.timestamp.toISOString()}</p>
    <p><strong>Total Locators:</strong> ${this.results.size}</p>
    <p><strong>Found:</strong> <span class="success">${this.getFoundCount()}</span></p>
    <p><strong>Failed:</strong> <span class="failed">${this.getFailedLocators().size}</span></p>
  </div>

  <h2>Failed Locators</h2>
  <table>
    <tr>
      <th>Locator ID</th>
      <th>Selector</th>
      <th>Suggestions</th>
    </tr>
`;

    for (const [id, result] of this.getFailedLocators()) {
      html += `
    <tr>
      <td class="locator-id">${id}</td>
      <td><code>${result.selector}</code></td>
      <td class="suggestions">
        ${result.suggestions.map((s) => `<div>• ${s}</div>`).join('')}
      </td>
    </tr>
`;
    }

    html += `
  </table>

  <h2>All Locators</h2>
  <table>
    <tr>
      <th>Locator ID</th>
      <th>Status</th>
      <th>Count</th>
      <th>Element Type</th>
      <th>Selector</th>
    </tr>
`;

    for (const [id, result] of this.results) {
      const status = result.found ? '<span class="success">✓</span>' : '<span class="failed">✗</span>';
      html += `
    <tr>
      <td class="locator-id">${id}</td>
      <td>${status}</td>
      <td>${result.count}</td>
      <td>${result.elementType}</td>
      <td><code>${result.selector}</code></td>
    </tr>
`;
    }

    html += `
  </table>
</body>
</html>
`;

    return html;
  }

  /**
   * Get count of found locators
   */
  private getFoundCount(): number {
    let count = 0;
    for (const result of this.results.values()) {
      if (result.found) count++;
    }
    return count;
  }

  /**
   * Generate console report
   */
  generateConsoleReport(): string {
    let report = `\n📋 LOCATOR INSPECTION REPORT\n`;
    report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    report += `Report: ${this.reportName}\n`;
    report += `Page: ${this.pageName}\n`;
    report += `Total: ${this.results.size} | Found: ${this.getFoundCount()} | Failed: ${this.getFailedLocators().size}\n`;
    report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    if (this.getFailedLocators().size > 0) {
      report += `❌ FAILED LOCATORS:\n`;
      for (const [id, result] of this.getFailedLocators()) {
        report += `\n  ${id}:\n`;
        report += `  Selector: ${result.selector}\n`;
        if (result.suggestions.length > 0) {
          report += `  Suggestions:\n`;
          result.suggestions.forEach((s) => (report += `    • ${s}\n`));
        }
      }
    }

    return report;
  }
}
