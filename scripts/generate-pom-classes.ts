/**
 * Page Object Model (POM) Generator
 * Generates TypeScript POM classes for all 209 modules
 * Each POM extends BasePage and includes module-specific selectors
 */

import * as fs from 'fs';
import * as path from 'path';

interface ModuleAudit {
  url: string;
  labels: string[];
  hasAddNewButton?: boolean;
  hasExportButton?: boolean;
  hasColumnChooserButton?: boolean;
  hasSearchInput?: boolean;
  tableInfo?: {
    hasTable: boolean;
    columns: string[];
    rowCount: number;
  };
  formFields?: Array<{
    label: string;
    type: string;
    required: boolean;
  }>;
  interactiveElements?: Array<{
    type: string;
    selector: string;
    text?: string;
    placeholder?: string;
    ariaLabel?: string;
  }>;
}

interface GeneratorConfig {
  moduleName: string;
  moduleData: ModuleAudit;
  className: string;
  outputPath: string;
}

/**
 * Convert module name to class name (PascalCase)
 */
function moduleNameToClassName(name: string): string {
  return name
    .split(/[-_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
    .replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Convert module name to filename
 */
function moduleNameToFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Generate selector definitions from audit data
 */
function generateSelectors(moduleData: ModuleAudit): string {
  let selectors = '  readonly selectors = {\n';

  // Add main container selector
  selectors += `    mainContainer: '[data-module], main, [role="main"]',\n`;

  // Add form fields if present
  if (moduleData.formFields && moduleData.formFields.length > 0) {
    selectors += `    // Form fields\n`;
    moduleData.formFields.forEach((field, index) => {
      const fieldName = field.label
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
      selectors += `    ${fieldName}Field: '[aria-label="${field.label}"], label:has-text("${field.label}") ~ input',\n`;
    });
  }

  // Add table selectors if present
  if (moduleData.tableInfo?.hasTable) {
    selectors += `    // Table selectors\n`;
    selectors += `    dataTable: '[role="table"], table, [role="grid"]',\n`;
    selectors += `    tableRows: '[role="table"] [role="row"], table tbody tr',\n`;
    selectors += `    tableCells: '[role="cell"], td, th',\n`;
  }

  // Add action buttons
  selectors += `    // Action buttons\n`;
  if (moduleData.hasAddNewButton) {
    selectors += `    addNewButton: 'button:has-text("Add"), [aria-label*="Add"]',\n`;
  }
  if (moduleData.hasExportButton) {
    selectors += `    exportButton: 'button:has-text("Export"), [aria-label*="Export"]',\n`;
  }
  if (moduleData.hasColumnChooserButton) {
    selectors += `    columnChooserButton: 'button:has-text("Columns"), [aria-label*="Column"]',\n`;
  }
  if (moduleData.hasSearchInput) {
    selectors += `    searchInput: 'input[placeholder*="Search"], [aria-label*="Search"]',\n`;
  }

  // Add common buttons
  selectors += `    saveButton: 'button:has-text("Save"), [aria-label*="Save"]',\n`;
  selectors += `    cancelButton: 'button:has-text("Cancel"), [aria-label*="Cancel"]',\n`;
  selectors += `    submitButton: 'button:has-text("Submit"), [aria-label*="Submit"]',\n`;
  selectors += `    successMessage: '[role="status"]:has-text("Success"), [class*="success"]',\n`;
  selectors += `    errorMessage: '[role="alert"], [class*="error"]',\n`;
  selectors += `  };\n`;

  return selectors;
}

/**
 * Generate helper methods for the POM
 */
function generateMethods(moduleData: ModuleAudit, className: string): string {
  let methods = '';

  // Add navigate method
  methods += `
  /**
   * Navigate to this module
   */
  async navigateToModule(): Promise<void> {
    // URL will be set from audit data during generation
    await this.navigateToUrl('${moduleData.url}');
  }

  /**
   * Verify module page is loaded
   */
  async verifyPageLoaded(): Promise<void> {
    await this.expectElementVisible(this.selectors.mainContainer);
  }
`;

  // Add form methods if applicable
  if (moduleData.formFields && moduleData.formFields.length > 0) {
    methods += `
  /**
   * Fill form field
   */
  async fillField(fieldName: string, value: string): Promise<void> {
    const selector = this.selectors[\`\${fieldName}Field\`] as string;
    if (selector) {
      await this.fill(selector, value);
    }
  }

  /**
   * Submit form
   */
  async submitForm(): Promise<void> {
    await this.clickSave();
  }

  /**
   * Verify form validation error
   */
  async verifyValidationError(fieldName: string): Promise<void> {
    await this.expectElementVisible(this.selectors.errorMessage);
  }
`;
  }

  // Add table methods if applicable
  if (moduleData.tableInfo?.hasTable) {
    methods += `
  /**
   * Get table row count
   */
  async getTableRowCount(): Promise<number> {
    return await this.getLocatorCount(this.selectors.tableRows);
  }

  /**
   * Verify table contains data
   */
  async verifyTableHasData(): Promise<void> {
    const count = await this.getTableRowCount();
    if (count === 0) {
      throw new Error('Table has no data rows');
    }
  }

  /**
   * Search in table
   */
  async searchTable(term: string): Promise<void> {
    if (this.selectors.searchInput) {
      await this.fill(this.selectors.searchInput as string, term);
      await this.page.waitForTimeout(500);
    }
  }
`;
  }

  // Add export method if applicable
  if (moduleData.hasExportButton) {
    methods += `
  /**
   * Export data
   */
  async exportData(format: string = 'Excel'): Promise<void> {
    await this.clickExport();
    // Select export format (implementation depends on UI)
  }
`;
  }

  // Add common actions
  methods += `
  /**
   * Add new record
   */
  async addNew(): Promise<void> {
    await this.clickAddNew();
  }

  /**
   * Verify success message
   */
  async verifySuccessMessage(): Promise<void> {
    await this.expectElementVisible(this.selectors.successMessage);
  }
`;

  return methods;
}

/**
 * Generate complete POM class content
 */
function generatePOMContent(config: GeneratorConfig): string {
  const { moduleName, moduleData, className } = config; // outputPath not used here

  const content = `/**
 * ${className} Page Object Model
 * 
 * Module: ${moduleName}
 * URL: ${moduleData.url}
 * 
 * This POM class encapsulates all interactions with the ${moduleName} module.
 * Extends BasePage to inherit common functionality and utilities.
 * 
 * @category Page Objects
 * @module ${className}
 */

import { Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { ElementInteractions } from '../../utils/element-interactions';
import { AssertionHelpers } from '../../utils/assertion-helpers';
import { WaitAndRetry } from '../../utils/wait-and-retry';
import { SelectorHelpers } from '../../utils/selector-helpers';

/**
 * ${className}
 * 
 * Provides page object methods for ${moduleName} module.
 * 
 * Usage:
 * \`\`\`typescript
 * const page = new ${className}(playwrightPage);
 * await page.navigateToModule();
 * await page.verifyPageLoaded();
 * \`\`\`
 */
export class ${className} extends BasePage {
  /**
   * Module name for identification
   */
  readonly moduleName = '${moduleName}';

  /**
   * Module URL from audit data
   */
  readonly moduleUrl = '${moduleData.url}';

${generateSelectors(moduleData)}
  /**
   * Constructor
   * 
   * @param page Playwright Page instance
   */
  constructor(page: Page) {
    super(page);
  }
${generateMethods(moduleData, className)}
}
`;

  return content;
}

/**
 * Generate POM class file
 */
function generatePOMFile(config: GeneratorConfig): void {
  const filename = `${moduleNameToFilename(config.moduleName)}.page.ts`;
  const filepath = path.join(config.outputPath, filename);

  const content = generatePOMContent(config);

  // Ensure directory exists
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filepath, content, 'utf-8');
  console.log(`✅ Generated: ${filepath}`);
}

/**
 * Generate all POM classes from audit data
 */
async function generateAllPOMs(auditPath: string, outputPath: string): Promise<void> {
  try {
    const auditData = JSON.parse(fs.readFileSync(auditPath, 'utf-8')) as Record<string, ModuleAudit>;

    let count = 0;
    let errors = 0;

    for (const [moduleName, moduleData] of Object.entries(auditData)) {
      try {
        const className = moduleNameToClassName(moduleName);
        generatePOMFile({
          moduleName,
          moduleData,
          className,
          outputPath
        });
        count++;
      } catch (error) {
        console.error(`❌ Failed to generate ${moduleName}:`, error);
        errors++;
      }
    }

    console.log(`\n📊 POM Generation Complete:`);
    console.log(`   ✅ Successfully generated: ${count} POM classes`);
    console.log(`   ❌ Failed: ${errors}`);
    console.log(`   📁 Output directory: ${outputPath}`);
  } catch (error) {
    console.error('Error loading audit data:', error);
    process.exit(1);
  }
}

// Export for use as module
export { generatePOMFile, generateAllPOMs, moduleNameToClassName };

// Run if executed directly (CommonJS check)
if (require.main === module) {
  const auditPath = process.argv[2] || './page-audit-results.json';
  const outputPath = process.argv[3] || './src/pages/generated';

  console.log(`🚀 Starting POM Class Generation`);
  console.log(`   📊 Audit data: ${auditPath}`);
  console.log(`   📁 Output path: ${outputPath}\n`);

  generateAllPOMs(auditPath, outputPath);
}