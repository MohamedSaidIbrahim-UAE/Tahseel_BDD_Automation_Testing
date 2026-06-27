/**
 * POM (Page Object Model) Generator - Generate page object classes
 * 
 * This script generates TypeScript page object model classes for each module
 * with selectors extracted from audit data and inherit from BasePage.
 */

import * as fs from 'fs';
import * as path from 'path';
import { LocatorBuilder } from '../pages/strategies/locator-builder';

export interface ModuleAuditData {
  moduleName: string;
  url: string;
  interactiveElements: Array<{
    type: string;
    selector?: string;
    text?: string;
    placeholder?: string;
    ariaLabel?: string;
  }>;
  tableInfo?: {
    hasTable: boolean;
    columns: string[];
    actionButtons: string[];
  };
  actionButtons?: Array<{ text: string; class?: string }>;
  formFields?: Array<{ label: string; type: string; required: boolean }>;
}

/**
 * POM (Page Object Model) generator
 */
export class POMGenerator {
  /**
   * Generate POM class from module audit data
   */
  static generatePOMClass(module: ModuleAuditData): string {
    const className = this.sanitizeClassName(module.moduleName);
    const modulePath = this.sanitizeModuleName(module.moduleName).toLowerCase().replace(/\s+/g, '-');

    const selectors = this.generateSelectors(module);
    const methods = this.generateMethods(module, className);

    const pomClass = `/**
 * ${className}Page - Page Object Model for ${module.moduleName}
 * 
 * Auto-generated from page-audit-results.json
 * Last updated: ${new Date().toISOString()}
 */

import { Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { WaitHelper } from '../../utils/wait-and-retry';
import { expect } from '@playwright/test';

export class ${className}Page extends BasePage {
  /**
   * Page URL for navigation
   */
  readonly pageUrl = '${module.url}';

  /**
   * Module name
   */
  readonly moduleName = '${module.moduleName}';

  /**
   * Selectors for all interactive elements
   * Generated from page-audit-results.json
   */
  readonly selectors = {
${selectors}
  };

  /**
   * Constructor
   */
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to this module
   */
  async navigateToModule(): Promise<void> {
    await this.navigateToUrl(this.pageUrl);
    await this.verifyPageLoaded();
  }

  /**
   * Verify page has loaded successfully
   */
  async verifyPageLoaded(): Promise<void> {
    const mainContent = this.page.locator('[role="main"], main, .page-content').first();
    await mainContent.waitFor({ state: 'visible', timeout: 30000 });
  }

${methods}
}
`;

    return pomClass;
  }

  /**
   * Generate selector definitions
   */
  private static generateSelectors(module: ModuleAuditData): string {
    let selectors = '';

    // Page header/title
    selectors += `    // Page header and title
    pageTitle: 'h1, [role="heading"][aria-level="1"], .page-title',\n`;

    // Main content container
    selectors += `    mainContent: '[role="main"], main, .page-content',\n`;

    // Search/filter elements
    selectors += `    searchInput: 'input[placeholder*="Search"], [aria-label*="Search"], [role="searchbox"]',\n`;

    // Table elements
    if (module.tableInfo?.hasTable) {
      selectors += `\n    // Table elements
    dataTable: '[role="grid"], table[role="grid"], .dx-data-grid, table.report-table, table',\n`;
      selectors += `    tableRows: '[role="row"], tbody tr',\n`;
      selectors += `    tableHeaders: '[role="columnheader"], th',\n`;
      selectors += `    tableCell: '[role="gridcell"], td',\n`;
    }

    // Form elements
    if (module.formFields && module.formFields.length > 0) {
      selectors += `\n    // Form fields
    formDialog: '[role="dialog"], .modal, .dialog',\n`;
      module.formFields.forEach((field) => {
        const fieldName = field.label.toLowerCase().replace(/\s+/g, '_');
        selectors += `    ${fieldName}Field: 'label:has-text("${field.label}") ~ ${field.type}, input[aria-label="${field.label}"], input[placeholder="${field.label}"]',\n`;
      });
    }

    // Action buttons
    if (module.actionButtons && module.actionButtons.length > 0) {
      selectors += `\n    // Action buttons
`;
      module.actionButtons.forEach((button, index) => {
        const buttonName = button.text
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '_')
          .replace(/_+/g, '_')
          .substring(0, 30);
        selectors += `    ${buttonName}Button: 'button:has-text("${button.text}"), [aria-label="${button.text}"], [title="${button.text}"]',\n`;
      });
    }

    // Standard buttons
    selectors += `\n    // Standard buttons
    addNewButton: 'button.btn-primary, [aria-label="Add New"], button:has-text("Add New")',\n`;
    selectors += `    saveButton: 'button:has-text("Save"), [aria-label="Save"], [class*="save"]',\n`;
    selectors += `    cancelButton: 'button:has-text("Cancel"), [aria-label="Cancel"]',\n`;
    selectors += `    deleteButton: 'button:has-text("Delete"), [aria-label="Delete"]',\n`;
    selectors += `    exportButton: '[title="Export"], [aria-label*="Export"], button:has-text("Export")',\n`;
    selectors += `    columnChooserButton: '[aria-label="Column Chooser"], [title="Column Chooser"]',\n`;

    // Messages and validation
    selectors += `\n    // Messages and validation
    successMessage: '[role="status"]:has-text("Success"), [class*="success"], .alert-success',\n`;
    selectors += `    errorMessage: '[role="alert"], [class*="error"], .alert-danger',\n`;
    selectors += `    validationError: '[role="alert"], .validation-error, .field-error',\n`;
    selectors += `    loadingIndicator: '[role="progressbar"], .loading, [class*="spinner"]',\n`;

    return selectors.slice(0, -2); // Remove trailing comma and newline
  }

  /**
   * Generate methods for common operations
   */
  private static generateMethods(module: ModuleAuditData, className: string): string {
    let methods = '';

    // Table methods
    if (module.tableInfo?.hasTable) {
      methods += `
  /**
   * Wait for table to load and be visible
   */
  async waitForTableReady(): Promise<void> {
    const table = this.page.locator(this.selectors.dataTable).first();
    await table.waitFor({ state: 'visible', timeout: 30000 });
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /**
   * Get table row count
   */
  async getRowCount(): Promise<number> {
    const rows = this.page.locator(this.selectors.tableRows);
    return await rows.count();
  }

  /**
   * Get table data as array of objects
   */
  async getTableData(): Promise<any[]> {
    const headers = await this.page.locator(this.selectors.tableHeaders).allTextContents();
    const rows = await this.page.locator(this.selectors.tableRows).all();
    const data: any[] = [];

    for (const row of rows) {
      const cells = await row.locator(this.selectors.tableCell).allTextContents();
      const rowData: any = {};
      headers.forEach((header, index) => {
        rowData[header] = cells[index] || '';
      });
      data.push(rowData);
    }

    return data;
  }

  /**
   * Search for a record in the table
   */
  async searchTable(term: string): Promise<void> {
    const searchInput = this.page.locator(this.selectors.searchInput).first();
    await searchInput.fill(term);
    await this.page.waitForTimeout(800);
    await this.waitForTableReady();
  }

  /**
   * Clear table search
   */
  async clearSearch(): Promise<void> {
    const searchInput = this.page.locator(this.selectors.searchInput).first();
    await searchInput.clear();
    await this.page.waitForTimeout(500);
  }

  /**
   * Verify table is empty
   */
  async verifyTableEmpty(): Promise<void> {
    const rows = this.page.locator(this.selectors.tableRows);
    const count = await rows.count();
    expect(count).toBe(0);
  }

  /**
   * Verify table has records
   */
  async verifyTableHasRecords(): Promise<void> {
    const rows = this.page.locator(this.selectors.tableRows);
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  }
`;
    }

    // Form methods
    if (module.formFields && module.formFields.length > 0) {
      methods += `
  /**
   * Open the Add New form
   */
  async openAddNewForm(): Promise<void> {
    await this.page.locator(this.selectors.addNewButton).click();
    const dialog = this.page.locator(this.selectors.formDialog).first();
    await dialog.waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Fill form fields with data
   */
  async fillForm(data: { [key: string]: string | number }): Promise<void> {
    for (const [fieldName, fieldValue] of Object.entries(data)) {
      const selector = (this.selectors as any)[fieldName + 'Field'] || (this.selectors as any)[fieldName];
      if (selector) {
        await this.page.locator(selector).fill(String(fieldValue));
      }
    }
  }

  /**
   * Submit the form
   */
  async submitForm(): Promise<void> {
    await this.page.locator(this.selectors.saveButton).click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Close the form
   */
  async closeForm(): Promise<void> {
    await this.page.locator(this.selectors.cancelButton).click();
    const dialog = this.page.locator(this.selectors.formDialog).first();
    await dialog.waitFor({ state: 'hidden', timeout: 5000 });
  }

  /**
   * Verify form is visible
   */
  async verifyFormVisible(): Promise<void> {
    const dialog = this.page.locator(this.selectors.formDialog).first();
    await expect(dialog).toBeVisible();
  }

  /**
   * Verify form is closed
   */
  async verifyFormClosed(): Promise<void> {
    const dialog = this.page.locator(this.selectors.formDialog).first();
    await expect(dialog).toBeHidden();
  }
`;
    }

    // General methods
    methods += `
  /**
   * Wait for loading to complete
   */
  async waitForLoadingComplete(): Promise<void> {
    const loading = this.page.locator(this.selectors.loadingIndicator).first();
    await loading.waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});
  }

  /**
   * Verify success message
   */
  async verifySuccessMessage(): Promise<void> {
    const message = this.page.locator(this.selectors.successMessage).first();
    await expect(message).toBeVisible({ timeout: 10000 });
  }

  /**
   * Verify error message
   */
  async verifyErrorMessage(): Promise<void> {
    const message = this.page.locator(this.selectors.errorMessage).first();
    await expect(message).toBeVisible({ timeout: 10000 });
  }

  /**
   * Get current page URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }
`;

    return methods;
  }

  /**
   * Sanitize class name from module name
   */
  private static sanitizeClassName(name: string): string {
    const cleaned = name.replace(/[^a-zA-Z0-9_\s]/g, '').replace(/\s+/g, '_');
    return cleaned
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('') + 'Page';
  }

  /**
   * Sanitize module name for file naming
   */
  private static sanitizeModuleName(name: string): string {
    return name.replace(/[^a-zA-Z0-9_\s]/g, '').replace(/\s+/g, '-').toLowerCase();
  }

  /**
   * Get POM file path from module name
   */
  static getPOMFilePath(module: ModuleAuditData, baseDir: string): string {
    const fileName = this.sanitizeModuleName(module.moduleName);
    return path.join(baseDir, `${fileName}.page.ts`);
  }

  /**
   * Write POM file to disk
   */
  static writePOMFile(filePath: string, content: string): void {
    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✓ Generated POM: ${filePath}`);
  }

  /**
   * Generate all POM classes from audit data
   */
  static generateAllPOMClasses(auditData: { [key: string]: ModuleAuditData }, baseDir: string): void {
    let count = 0;

    for (const [moduleName, moduleData] of Object.entries(auditData)) {
      const content = this.generatePOMClass(moduleData);
      const filePath = this.getPOMFilePath(moduleData, baseDir);
      this.writePOMFile(filePath, content);
      count++;
    }

    console.log(`\n✓ Generated ${count} POM classes in ${baseDir}`);
  }
}

/**
 * Batch POM generator
 */
export class POMLBatchGenerator {
  /**
   * Load audit data
   */
  static loadAuditData(auditFilePath: string): { [key: string]: ModuleAuditData } {
    try {
      const content = fs.readFileSync(auditFilePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error(`Error loading audit data:`, error);
      return {};
    }
  }

  /**
   * Generate all POMs from audit file
   */
  static generateFromAuditFile(auditFilePath: string, outputDir: string): number {
    console.log(`Loading audit data from: ${auditFilePath}`);
    const auditData = this.loadAuditData(auditFilePath);

    console.log(`Found ${Object.keys(auditData).length} modules`);
    console.log(`Generating POMs to: ${outputDir}`);

    POMGenerator.generateAllPOMClasses(auditData, outputDir);

    return Object.keys(auditData).length;
  }
}

/**
 * Export for use in scripts
 */
if (require.main === module) {
  const auditFilePath = process.argv[2] || 'page-audit-results.json';
  const outputDir = process.argv[3] || 'src/pages/generated';

  POMLBatchGenerator.generateFromAuditFile(auditFilePath, outputDir);
}
