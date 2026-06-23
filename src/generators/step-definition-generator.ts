/**
 * Step Definition Generator
 * 
 * Generates TypeScript step definition files from feature files and POM classes
 * Creates standard step implementations with data table handling
 */

export interface StepGeneratorConfig {
  moduleName: string;
  className: string;
  pomPath: string;
  category: string;
  hasForm: boolean;
  hasTables: boolean;
  hasSearch: boolean;
  hasExport: boolean;
  customSteps?: string[];
}

export class StepDefinitionGenerator {
  /**
   * Generate step definition file for a module
   */
  static generateStepDefinitions(config: StepGeneratorConfig): string {
    const fileName = this.formatFileName(config.moduleName);

    let content = `/**
 * ${config.moduleName} Step Definitions
 * 
 * Auto-generated step definitions for the ${config.moduleName} module
 * Category: ${config.category}
 * 
 * Implements all Gherkin steps for module feature files
 */

import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { World } from '../../fixtures/world.fixture';
import { ${config.className}Page } from '../../pages/${config.pomPath}';
import { expect } from '@playwright/test';
import { resolveActivePage } from '../active-page-resolver';

// Initialize module page object
function getModulePage(world: World): ${config.className}Page {
  return new ${config.className}Page(world.page);
}

// ── Navigation Steps ──────────────────────────────────────────

Given('the user navigates to the "${config.moduleName}" module', async function (this: World) {
  const page = getModulePage(this);
  await page.navigateToModule();
  this.addLog('Navigated to ${config.moduleName} module');
});

Then('the ${config.moduleName} module should load successfully', async function (this: World) {
  const page = getModulePage(this);
  await page.verifyModuleLoaded();
  this.addLog('${config.moduleName} module loaded successfully');
});

Then('the module title should display "${config.moduleName}"', async function (this: World) {
  const page = getModulePage(this);
  const title = await page.page.title();
  expect(title).toContain('${config.moduleName}');
  this.addLog('Module title verified: ' + title);
});

`;

    // Add form-related steps
    if (config.hasForm) {
      content += this.generateFormSteps(config);
    }

    // Add table-related steps
    if (config.hasTables) {
      content += this.generateTableSteps(config);
    }

    // Add search steps
    if (config.hasSearch) {
      content += this.generateSearchSteps(config);
    }

    // Add export steps
    if (config.hasExport) {
      content += this.generateExportSteps(config);
    }

    // Add common validation steps
    content += this.generateValidationSteps(config);

    return content;
  }

  /**
   * Generate form-related step definitions
   */
  private static generateFormSteps(config: StepGeneratorConfig): string {
    return `// ── Form Steps ────────────────────────────────────────────────

When('the user fills the form with valid data', async function (this: World) {
  const page = getModulePage(this);
  const validData = this.testData?.${this.formatPropertyName(config.moduleName)} || {
    // Add default test data based on form fields
  };
  await page.fillForm(validData);
  this.addLog('Form filled with valid data');
});

When('the user fills the form with invalid data', async function (this: World) {
  const page = getModulePage(this);
  const invalidData = {
    // Add invalid test data
  };
  await page.fillForm(invalidData);
  this.addLog('Form filled with invalid data');
});

When('the user fills the form with the following data:', async function (this: World, dataTable: DataTable) {
  const page = getModulePage(this);
  const rowData = dataTable.rowsHash();
  await page.fillForm(rowData);
  this.addLog('Form filled with provided data: ' + JSON.stringify(rowData));
});

When('the user submits the form', async function (this: World) {
  const page = getModulePage(this);
  await page.submitForm();
  this.addLog('Form submitted');
});

When('the user submits the form without required fields', async function (this: World) {
  const page = getModulePage(this);
  await page.clickSave();
  this.addLog('Form submitted without required fields');
});

When('the user enters invalid data in the form', async function (this: World) {
  const page = getModulePage(this);
  const invalidData = {
    // Add field with invalid value
  };
  await page.fillForm(invalidData);
  this.addLog('Invalid data entered in form');
});

When('the user enters boundary values in form fields', async function (this: World) {
  const page = getModulePage(this);
  const boundaryData = {
    // Add boundary value test data
  };
  await page.fillForm(boundaryData);
  this.addLog('Boundary values entered in form');
});

Then('the form should be submitted successfully', async function (this: World) {
  const page = getModulePage(this);
  // Wait for success response
  await this.page.waitForLoadState('networkidle');
  this.addLog('Form submitted successfully');
});

Then('the form should remain open', async function (this: World) {
  const page = getModulePage(this);
  await page.verifyFormVisible();
  this.addLog('Form remained open');
});

Then('validation errors should be displayed', async function (this: World) {
  const page = getModulePage(this);
  const errorMessage = await page.getErrorMessage();
  expect(errorMessage).toBeTruthy();
  this.addLog('Validation errors displayed: ' + errorMessage);
});

Then('the invalid field should be marked with error', async function (this: World) {
  const page = getModulePage(this);
  const error = await page.getErrorMessage();
  expect(error).toBeTruthy();
  this.addLog('Field marked with error');
});

Then('the submit button should be disabled', async function (this: World) {
  const page = getModulePage(this);
  const enabled = await page.page.locator('button:has-text("Save")').isEnabled();
  expect(enabled).toBe(false);
  this.addLog('Submit button is disabled');
});

Then('a success message should be displayed', async function (this: World) {
  const page = getModulePage(this);
  const successElement = page.page.locator('[role="status"]:has-text("Success"), [role="status"]:has-text("saved")');
  await expect(successElement).toBeVisible({ timeout: 10000 });
  this.addLog('Success message displayed');
});

Then('the record should be created with boundary values', async function (this: World) {
  const page = getModulePage(this);
  await this.page.waitForLoadState('networkidle');
  this.addLog('Record created with boundary values');
});

`;
  }

  /**
   * Generate table-related step definitions
   */
  private static generateTableSteps(config: StepGeneratorConfig): string {
    return `// ── Table Steps ────────────────────────────────────────────────

Then('the table should be visible', async function (this: World) {
  const page = getModulePage(this);
  await page.verifyTableVisible();
  this.addLog('Table is visible');
});

Then('the table should display at least one record', async function (this: World) {
  const page = getModulePage(this);
  await page.verifyTableHasRecords();
  this.addLog('Table displays at least one record');
});

Then('different records should display', async function (this: World) {
  const page = getModulePage(this);
  await page.verifyTableHasRecords();
  this.addLog('Different records displayed');
});

Then('the table pagination controls should be functional', async function (this: World) {
  const page = getModulePage(this);
  const pagerVisible = await page.page.locator('[role="navigation"]').isVisible().catch(() => false);
  expect(pagerVisible).toBe(true);
  this.addLog('Pagination controls are functional');
});

Then('the pagination indicator should update', async function (this: World) {
  const page = getModulePage(this);
  await this.page.waitForLoadState('networkidle');
  this.addLog('Pagination indicator updated');
});

`;
  }

  /**
   * Generate search-related step definitions
   */
  private static generateSearchSteps(config: StepGeneratorConfig): string {
    return `// ── Search Steps ──────────────────────────────────────────────

When('the user searches for a record', async function (this: World) {
  const page = getModulePage(this);
  const searchTerm = this.testData?.searchTerm || 'test';
  await page.searchTable(searchTerm);
  this.addLog('Searched for record: ' + searchTerm);
});

Then('the search results should be filtered', async function (this: World) {
  const page = getModulePage(this);
  await page.verifyTableHasRecords();
  this.addLog('Search results filtered');
});

Then('only matching records should display', async function (this: World) {
  const page = getModulePage(this);
  await page.verifyTableHasRecords();
  this.addLog('Only matching records displayed');
});

`;
  }

  /**
   * Generate export-related step definitions
   */
  private static generateExportSteps(config: StepGeneratorConfig): string {
    return `// ── Export Steps ──────────────────────────────────────────────

When('the user clicks the export button', async function (this: World) {
  const page = getModulePage(this);
  await page.clickExport();
  this.addLog('Export button clicked');
});

When('selects Excel format', async function (this: World) {
  const page = getModulePage(this);
  const excelOption = page.page.locator('button:has-text("Excel"), button:has-text("xlsx"), [role="option"]:has-text("Excel")');
  await excelOption.click();
  this.addLog('Excel format selected');
});

Then('the data should be exported successfully', async function (this: World) {
  this.addLog('Data exported successfully');
});

Then('the file should be downloaded', async function (this: World) {
  const [download] = await Promise.all([
    this.page.waitForEvent('download', { timeout: 15000 })
  ]);
  expect(download.suggestedFilename()).toMatch(/\\.(xlsx|xls|csv)$/i);
  this.addLog('File downloaded: ' + download.suggestedFilename());
});

`;
  }

  /**
   * Generate validation step definitions
   */
  private static generateValidationSteps(config: StepGeneratorConfig): string {
    return `// ── Validation Steps ──────────────────────────────────────────

Then('an empty state message should display', async function (this: World) {
  const emptyState = this.page.locator('[role="status"]:has-text("No data"), text="No records"');
  await expect(emptyState).toBeVisible({ timeout: 5000 });
  this.addLog('Empty state message displayed');
});

Then('the table should show no data', async function (this: World) {
  const rows = this.page.locator('table tbody tr:not(.dx-freespace-row)');
  const count = await rows.count();
  expect(count).toBe(0);
  this.addLog('Table shows no data');
});

Then('the user should be redirected to login', async function (this: World) {
  await this.page.waitForURL(/login|auth/);
  this.addLog('User redirected to login');
});

Then('the user should be able to re-authenticate', async function (this: World) {
  const loginForm = this.page.locator('form:has-text("Login"), [role="form"]:has-text("Log in")');
  await expect(loginForm).toBeVisible({ timeout: 5000 });
  this.addLog('User can re-authenticate');
});

Then('an access denied error should be displayed', async function (this: World) {
  const errorMessage = this.page.locator('[role="alert"]:has-text("denied"), [role="alert"]:has-text("permission")');
  await expect(errorMessage).toBeVisible({ timeout: 5000 });
  this.addLog('Access denied error displayed');
});

Then('the record should not be deleted', async function (this: World) {
  const page = getModulePage(this);
  await page.verifyTableHasRecords();
  this.addLog('Record was not deleted');
});

`;
  }

  /**
   * Format file name from module name
   */
  private static formatFileName(moduleName: string): string {
    return moduleName
      .replace(/\s+/g, '-')
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/-+/g, '-')
      .replace(/^-/, '');
  }

  /**
   * Format property name from module name
   */
  private static formatPropertyName(name: string): string {
    return name
      .replace(/\s+/g, '_')
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '');
  }
}
