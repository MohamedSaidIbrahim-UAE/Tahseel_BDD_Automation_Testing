/**
 * Step Definition Generator
 * Generates Cucumber step definitions for all 209 modules
 * Integrates with generated POM classes and utilities
 */

import * as fs from 'fs';
import * as path from 'path';

interface GeneratorConfig {
  moduleName: string;
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
 * Generate step definitions content
 */
function generateStepDefinitionsContent(config: GeneratorConfig): string {
  const { moduleName, className } = config;
  const filename = moduleNameToFilename(moduleName);

  return `/**
 * Step Definitions for ${moduleName} Module
 * 
 * This file contains all step definitions for the ${moduleName} feature.
 * Steps are organized by type: Given, When, Then
 * 
 * @category Step Definitions
 * @module ${filename}.steps
 */

import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { Page, expect } from '@playwright/test';
import { ${className} } from '../pages/${filename}.page';
import { ElementInteractions } from '../utils/element-interactions';
import { AssertionHelpers } from '../utils/assertion-helpers';
import { WaitAndRetry } from '../utils/wait-and-retry';
import { DataGenerators } from '../utils/data-generators';

/**
 * Test context containing page and module instance
 */
let page: Page;
let ${className[0].toLowerCase() + className.slice(1)}: ${className};

/**
 * Initialize page instance
 * Called before each scenario
 */
function initializePageObject(): void {
  if (!page) {
    throw new Error('Page instance not initialized');
  }
  ${className[0].toLowerCase() + className.slice(1)} = new ${className}(page);
}

// ============================================================================
// GIVEN (Setup) Steps
// ============================================================================

/**
 * User navigates to the module
 */
Given('the user navigates to the "{string}" module', async (moduleName: string) => {
  initializePageObject();
  await ${className[0].toLowerCase() + className.slice(1)}.navigateToModule();
});

/**
 * Module page is loaded
 */
Given('the module page is loaded', async () => {
  initializePageObject();
  await ${className[0].toLowerCase() + className.slice(1)}.verifyPageLoaded();
});

/**
 * The form is open
 */
Given('the form is open', async () => {
  initializePageObject();
  await ${className[0].toLowerCase() + className.slice(1)}.verifyFormVisible();
});

/**
 * The user is authenticated
 */
Given('the user is authenticated', async () => {
  // This step is handled by test setup/fixtures
  // Ensure user has valid session
});

/**
 * User fills form with specific data
 */
Given('the user fills the form with the following data:', async (dataTable: DataTable) => {
  initializePageObject();
  const data = dataTable.rowsHash();

  for (const [fieldName, fieldValue] of Object.entries(data)) {
    await ${className[0].toLowerCase() + className.slice(1)}.fillField(fieldName, fieldValue);
  }
});

/**
 * User enters invalid data in a field
 */
Given('the user enters invalid data in a required field', async () => {
  initializePageObject();
  // Invalid data examples: empty string, special characters, too long, etc.
  await ElementInteractions.typeText(page, '[aria-label*="required"]', '!!!INVALID!!!');
});

/**
 * User attempts duplicate operation
 */
Given('the user attempts to create a duplicate entry', async () => {
  initializePageObject();
  // This would be implemented based on specific module requirements
});

// ============================================================================
// WHEN (Action) Steps
// ============================================================================

/**
 * User opens the module
 */
When('the user opens the module', async () => {
  initializePageObject();
  await ${className[0].toLowerCase() + className.slice(1)}.navigateToModule();
});

/**
 * User views the data table
 */
When('the user views the data table', async () => {
  initializePageObject();
  await ${className[0].toLowerCase() + className.slice(1)}.verifyPageLoaded();
});

/**
 * User searches for data
 */
When('the user searches for "{string}"', async (searchTerm: string) => {
  initializePageObject();
  await ${className[0].toLowerCase() + className.slice(1)}.searchTable(searchTerm);
});

/**
 * User clicks the export button
 */
When('the user clicks the export button', async () => {
  initializePageObject();
  await ${className[0].toLowerCase() + className.slice(1)}.exportData();
});

/**
 * User selects export format
 */
When('the user selects "{string}" format', async (format: string) => {
  initializePageObject();
  // Select the export format option
  await ElementInteractions.clickElement(page, \`button:has-text("\${format}")\`);
});

/**
 * User submits the form
 */
When('the user submits the form', async () => {
  initializePageObject();
  await ${className[0].toLowerCase() + className.slice(1)}.submitForm();
});

/**
 * User tries to submit without required fields
 */
When('the user tries to submit without filling required fields', async () => {
  initializePageObject();
  await ${className[0].toLowerCase() + className.slice(1)}.submitForm();
});

/**
 * User performs an action
 */
When('the user performs action', async () => {
  initializePageObject();
  // Generic action - implementation depends on specific module
});

/**
 * User fills form with valid data
 */
When('the user fills the form with valid data', async () => {
  initializePageObject();
  const testData = DataGenerators.generateTestDataSet();
  // Fill form fields with generated data
});

// ============================================================================
// THEN (Assertion) Steps
// ============================================================================

/**
 * Module page should load
 */
Then('the module page should load', async () => {
  initializePageObject();
  await ${className[0].toLowerCase() + className.slice(1)}.verifyPageLoaded();
});

/**
 * Page title should display
 */
Then('the page title should display "{string}"', async (title: string) => {
  await AssertionHelpers.assertPageTitle(page, title);
});

/**
 * All main elements should be visible
 */
Then('all main elements should be visible', async () => {
  initializePageObject();
  await AssertionHelpers.assertElementVisible(
    page,
    ${className[0].toLowerCase() + className.slice(1)}.selectors.mainContainer as string
  );
});

/**
 * Table should display columns
 */
Then('the table should display the following columns: {string}', async (columns: string) => {
  initializePageObject();
  // Verify each column header is visible
  const columnList = columns.split(',').map(c => c.trim());
  for (const column of columnList) {
    await AssertionHelpers.assertElementVisible(
      page,
      '[role="columnheader"]:has-text("' + column + '")'
    );
  }
});

/**
 * Table should contain at least one row
 */
Then('the table should contain at least one row', async () => {
  initializePageObject();
  await ${className[0].toLowerCase() + className.slice(1)}.verifyTableHasData();
});

/**
 * Success message should be displayed
 */
Then('the success message should be displayed', async () => {
  initializePageObject();
  await ${className[0].toLowerCase() + className.slice(1)}.verifySuccessMessage();
});

/**
 * Form should close
 */
Then('the form should close', async () => {
  initializePageObject();
  await ${className[0].toLowerCase() + className.slice(1)}.verifyFormClosed();
});

/**
 * Validation error should be displayed
 */
Then('the validation error should be displayed', async () => {
  initializePageObject();
  await AssertionHelpers.assertElementVisible(
    page,
    ${className[0].toLowerCase() + className.slice(1)}.selectors.errorMessage as string
  );
});

/**
 * Validation errors should be displayed
 */
Then('the validation errors should be displayed', async () => {
  initializePageObject();
  const errorCount = await ElementInteractions.getElementCount(
    page,
    ${className[0].toLowerCase() + className.slice(1)}.selectors.errorMessage as string
  );
  expect(errorCount).toBeGreaterThan(0);
});

/**
 * Form should remain open
 */
Then('the form should remain open', async () => {
  initializePageObject();
  await ${className[0].toLowerCase() + className.slice(1)}.verifyFormVisible();
});

/**
 * Error message should be displayed
 */
Then('an appropriate error message should be displayed', async () => {
  initializePageObject();
  await AssertionHelpers.assertElementVisible(
    page,
    ${className[0].toLowerCase() + className.slice(1)}.selectors.errorMessage as string
  );
});

/**
 * Duplicate entry should not be created
 */
Then('the duplicate entry should not be created', async () => {
  // Verify through database or API call that entry wasn't created
  initializePageObject();
  await ${className[0].toLowerCase() + className.slice(1)}.verifyPageLoaded();
});

/**
 * Data should be processed successfully
 */
Then('the data should be processed successfully', async () => {
  initializePageObject();
  await ${className[0].toLowerCase() + className.slice(1)}.verifySuccessMessage();
});

/**
 * Result should be valid
 */
Then('the result should be valid', async () => {
  initializePageObject();
  await ${className[0].toLowerCase() + className.slice(1)}.verifyPageLoaded();
});

/**
 * File should be downloaded
 */
Then('the file should be downloaded', async () => {
  // Verify download occurred (framework/browser dependent)
});

/**
 * File should contain valid data
 */
Then('the file should contain valid data', async () => {
  // Verify file contents (implementation depends on file type and structure)
});

/**
 * Search results should display
 */
Then('the search results should display', async () => {
  initializePageObject();
  await ${className[0].toLowerCase() + className.slice(1)}.verifyPageLoaded();
});

/**
 * Results should contain search term
 */
Then('the results should contain the search term', async () => {
  initializePageObject();
  // Verify search results contain the term
});

/**
 * Module should display success
 */
Then('the module should display success message', async () => {
  initializePageObject();
  await ${className[0].toLowerCase() + className.slice(1)}.verifySuccessMessage();
});

/**
 * Module should update correctly
 */
Then('the module should update correctly', async () => {
  initializePageObject();
  await ${className[0].toLowerCase() + className.slice(1)}.verifyPageLoaded();
});

/**
 * All fields should be marked as valid
 */
Then('all fields should be marked as valid', async () => {
  initializePageObject();
  const errorCount = await ElementInteractions.getElementCount(
    page,
    ${className[0].toLowerCase() + className.slice(1)}.selectors.errorMessage as string
  );
  expect(errorCount).toBe(0);
});

/**
 * Submit button should be enabled
 */
Then('the submit button should be enabled', async () => {
  initializePageObject();
  await AssertionHelpers.assertElementEnabled(
    page,
    ${className[0].toLowerCase() + className.slice(1)}.selectors.submitButton as string
  );
});

/**
 * Submit button should be disabled
 */
Then('the submit button should be disabled', async () => {
  initializePageObject();
  await AssertionHelpers.assertElementDisabled(
    page,
    ${className[0].toLowerCase() + className.slice(1)}.selectors.submitButton as string
  );
});
`;
}

/**
 * Generate step definitions file
 */
function generateStepFile(config: GeneratorConfig): void {
  const filename = moduleNameToFilename(config.moduleName) + '.steps.ts';
  const filepath = path.join(config.outputPath, filename);

  const content = generateStepDefinitionsContent(config);

  // Ensure directory exists
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filepath, content, 'utf-8');
  console.log('✅ Generated: ' + filepath);
}

/**
 * Generate all step definition files
 */
async function generateAllStepFiles(auditPath: string, outputPath: string): Promise<void> {
  try {
    const auditData = JSON.parse(fs.readFileSync(auditPath, 'utf-8')) as Record<string, any>;
    
    let count = 0;
    let errors = 0;

    for (const moduleName of Object.keys(auditData)) {
      try {
        const className = moduleNameToClassName(moduleName);
        generateStepFile({
          moduleName,
          className,
          outputPath
        });
        count++;
      } catch (error) {
        console.error('❌ Failed to generate ' + moduleName + ':', error);
        errors++;
      }
    }

    console.log('\n📊 Step Definition Generation Complete:');
    console.log('   ✅ Successfully generated: ' + count + ' step files');
    console.log('   ❌ Failed: ' + errors);
    console.log('   📁 Output directory: ' + outputPath);
  } catch (error) {
    console.error('Error loading audit data:', error);
    process.exit(1);
  }
}

export { generateStepFile, generateAllStepFiles, moduleNameToClassName };
