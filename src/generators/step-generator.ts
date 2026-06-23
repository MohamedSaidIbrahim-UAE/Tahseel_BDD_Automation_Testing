/**
 * Step Definition Generator - Generate step definitions for modules
 * 
 * This script generates TypeScript step definitions for Cucumber scenarios
 * using shared steps and module-specific implementations.
 */

import * as fs from 'fs';
import * as path from 'path';

export interface ModuleAuditData {
  moduleName: string;
  url: string;
  hasTable: boolean;
  hasForm: boolean;
  hasSearch: boolean;
  hasExport: boolean;
  formFields?: Array<{ label: string; type: string }>;
}

/**
 * Step definition generator
 */
export class StepGenerator {
  /**
   * Generate step definitions from module audit data
   */
  static generateStepDefinitions(module: ModuleAuditData): string {
    const className = this.sanitizeClassName(module.moduleName);
    const pomClass = this.sanitizeClassName(module.moduleName);
    const pomFilePath = this.sanitizeModuleName(module.moduleName).toLowerCase().replace(/\s+/g, '-');

    let steps = '';

    // Given steps
    steps += this.generateGivenSteps(module, className, pomClass);

    // When steps
    steps += this.generateWhenSteps(module, className, pomClass);

    // Then steps
    steps += this.generateThenSteps(module, className, pomClass);

    const stepClass = `/**
 * ${className} Step Definitions
 * 
 * Steps for testing the ${module.moduleName} module
 * Auto-generated from page-audit-results.json
 */

import { Given, When, Then } from '@cucumber/cucumber';
import { World } from '../../fixtures/world.fixture';
import { ${pomClass}Page } from '../../pages/${pomFilePath}.page';

let ${className.toLowerCase()}Page: ${pomClass}Page;

export class ${className}Steps {
${steps}
}
`;

    return stepClass;
  }

  /**
   * Generate Given steps
   */
  private static generateGivenSteps(module: ModuleAuditData, className: string, pomClass: string): string {
    const moduleName = module.moduleName;
    const shortName = className.toLowerCase();

    return `
  @Given('the user navigates to the {string} module')
  async navigateToModule(this: World, moduleName: string) {
    ${shortName}Page = new ${pomClass}Page(this.getActivePage().rawPage);
    await ${shortName}Page.navigateToModule();
    this.addLog(\`Navigated to \${moduleName}\`);
  }

  @Given('the {string} page is loaded')
  async pageIsLoaded(this: World, pageName: string) {
    ${shortName}Page = new ${pomClass}Page(this.getActivePage().rawPage);
    await ${shortName}Page.verifyPageLoaded();
    this.addLog(\`Verified \${pageName} page loaded\`);
  }

  @Given('the {string} page displays the header {string}')
  async pageDisplaysHeader(this: World, pageName: string, headerText: string) {
    const header = ${shortName}Page.page.locator(${shortName}Page.selectors.pageTitle).first();
    const text = await header.textContent();
    if (!text?.includes(headerText)) {
      throw new Error(\`Expected header to contain "\${headerText}" but got "\${text}"\`);
    }
    this.addLog(\`Verified header contains: \${headerText}\`);
  }
`;
  }

  /**
   * Generate When steps
   */
  private static generateWhenSteps(module: ModuleAuditData, className: string, pomClass: string): string {
    const shortName = className.toLowerCase();
    let steps = '';

    // Navigation steps
    steps += `
  @When('the user waits for the page to load')
  async waitForPageLoad(this: World) {
    await ${shortName}Page.waitForLoadingComplete();
    this.addLog('Waited for page to load');
  }
`;

    // Table steps
    if (module.hasTable) {
      steps += `
  @When('the user waits for the data table to load')
  async waitForTableLoad(this: World) {
    await ${shortName}Page.waitForTableReady();
    this.addLog('Waited for table to load');
  }

  @When('the user searches the table for {string}')
  async searchTable(this: World, searchTerm: string) {
    await ${shortName}Page.searchTable(searchTerm);
    this.addLog(\`Searched table for: \${searchTerm}\`);
  }

  @When('the user clears the search filter')
  async clearSearch(this: World) {
    await ${shortName}Page.clearSearch();
    this.addLog('Cleared search filter');
  }
`;
    }

    // Form steps
    if (module.hasForm) {
      steps += `
  @When('the user clicks the Add New button')
  async clickAddNew(this: World) {
    await ${shortName}Page.openAddNewForm();
    this.addLog('Clicked Add New button');
  }

  @When('the user fills the form with the following data:')
  async fillFormWithData(this: World, dataTable: any) {
    const data = dataTable.rowsHash();
    await ${shortName}Page.fillForm(data);
    this.addLog('Filled form with data: ' + Object.keys(data).join(', '));
  }

  @When('the user clicks the Save button')
  async clickSave(this: World) {
    await ${shortName}Page.submitForm();
    this.addLog('Clicked Save button');
  }

  @When('the user clicks the Cancel button')
  async clickCancel(this: World) {
    await ${shortName}Page.closeForm();
    this.addLog('Clicked Cancel button');
  }
`;
    }

    // Export steps
    if (module.hasExport) {
      steps += `
  @When('the user clicks the Export button')
  async clickExport(this: World) {
    await ${shortName}Page.clickExport();
    this.addLog('Clicked Export button');
  }
`;
    }

    return steps;
  }

  /**
   * Generate Then steps
   */
  private static generateThenSteps(module: ModuleAuditData, className: string, pomClass: string): string {
    const shortName = className.toLowerCase();
    let steps = '';

    // General verification
    steps += `
  @Then('the page header should display {string}')
  async verifyHeader(this: World, expectedText: string) {
    const header = ${shortName}Page.page.locator(${shortName}Page.selectors.pageTitle).first();
    await header.waitFor({ state: 'visible', timeout: 10000 });
    const text = await header.textContent();
    if (!text?.includes(expectedText)) {
      throw new Error(\`Expected "\${expectedText}" but got "\${text}"\`);
    }
    this.addLog(\`Verified header: \${expectedText}\`);
  }
`;

    // Table verification
    if (module.hasTable) {
      steps += `
  @Then('the table should be visible')
  async verifyTableVisible(this: World) {
    const table = ${shortName}Page.page.locator(${shortName}Page.selectors.dataTable).first();
    await table.waitFor({ state: 'visible', timeout: 30000 });
    this.addLog('Verified table is visible');
  }

  @Then('the table should contain at least one record')
  async verifyTableHasRecords(this: World) {
    await ${shortName}Page.verifyTableHasRecords();
    this.addLog('Verified table has records');
  }

  @Then('the table should be empty')
  async verifyTableEmpty(this: World) {
    await ${shortName}Page.verifyTableEmpty();
    this.addLog('Verified table is empty');
  }

  @Then('the search results should be filtered')
  async verifySearchResults(this: World) {
    const rowCount = await ${shortName}Page.getRowCount();
    if (rowCount === 0) {
      throw new Error('Expected search results but table is empty');
    }
    this.addLog(\`Verified \${rowCount} search results\`);
  }
`;
    }

    // Form verification
    if (module.hasForm) {
      steps += `
  @Then('the form should be displayed')
  async verifyFormVisible(this: World) {
    await ${shortName}Page.verifyFormVisible();
    this.addLog('Verified form is visible');
  }

  @Then('the form should be closed')
  async verifyFormClosed(this: World) {
    await ${shortName}Page.verifyFormClosed();
    this.addLog('Verified form is closed');
  }

  @Then('a success message should be displayed')
  async verifySuccessMessage(this: World) {
    await ${shortName}Page.verifySuccessMessage();
    this.addLog('Verified success message');
  }

  @Then('a validation error should be displayed')
  async verifyValidationError(this: World) {
    await ${shortName}Page.verifyErrorMessage();
    this.addLog('Verified validation error');
  }
`;
    }

    return steps;
  }

  /**
   * Sanitize class name
   */
  private static sanitizeClassName(name: string): string {
    const cleaned = name.replace(/[^a-zA-Z0-9_\s]/g, '').replace(/\s+/g, '_');
    return cleaned
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('') + 'Steps';
  }

  /**
   * Sanitize module name for file naming
   */
  private static sanitizeModuleName(name: string): string {
    return name.replace(/[^a-zA-Z0-9_\s]/g, '').replace(/\s+/g, '-').toLowerCase();
  }

  /**
   * Get step file path
   */
  static getStepFilePath(module: ModuleAuditData, baseDir: string): string {
    const fileName = this.sanitizeModuleName(module.moduleName);
    return path.join(baseDir, `${fileName}.steps.ts`);
  }

  /**
   * Write step file to disk
   */
  static writeStepFile(filePath: string, content: string): void {
    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✓ Generated steps: ${filePath}`);
  }

  /**
   * Generate all step definitions
   */
  static generateAllStepDefinitions(auditData: { [key: string]: ModuleAuditData }, baseDir: string): void {
    let count = 0;

    for (const [moduleName, moduleData] of Object.entries(auditData)) {
      const content = this.generateStepDefinitions(moduleData);
      const filePath = this.getStepFilePath(moduleData, baseDir);
      this.writeStepFile(filePath, content);
      count++;
    }

    console.log(`\n✓ Generated ${count} step definition files in ${baseDir}`);
  }
}

/**
 * Batch step generator
 */
export class StepBatchGenerator {
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
   * Generate all steps from audit file
   */
  static generateFromAuditFile(auditFilePath: string, outputDir: string): number {
    console.log(`Loading audit data from: ${auditFilePath}`);
    const auditData = this.loadAuditData(auditFilePath);

    console.log(`Found ${Object.keys(auditData).length} modules`);
    console.log(`Generating step definitions to: ${outputDir}`);

    StepGenerator.generateAllStepDefinitions(auditData, outputDir);

    return Object.keys(auditData).length;
  }
}

/**
 * Export for use in scripts
 */
if (require.main === module) {
  const auditFilePath = process.argv[2] || 'page-audit-results.json';
  const outputDir = process.argv[3] || 'src/steps/generated';

  StepBatchGenerator.generateFromAuditFile(auditFilePath, outputDir);
}
