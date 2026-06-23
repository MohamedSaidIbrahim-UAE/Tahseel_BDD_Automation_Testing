/**
 * Feature File Generator
 * Generates Gherkin feature files for all 209 modules
 * Uses audit data and templates to create positive + negative scenarios
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
}

interface GeneratorConfig {
  auditDataPath: string;
  outputPath: string;
  moduleName: string;
  moduleData: ModuleAudit;
}

/**
 * Convert module name to kebab-case filename
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
 * Convert module name to Feature title
 */
function moduleNameToFeatureTitle(name: string): string {
  return name
    .split(/[-_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Extract meaningful description from module labels
 */
function getModuleDescription(moduleData: ModuleAudit): string {
  // Use first non-warning label
  const labels = moduleData.labels || [];
  const description = labels.find(l => !l.includes('[WARNING]')) || labels[0] || '';
  return description.replace('[WARNING]', '').trim() || 'Module management and operations';
}

/**
 * Generate form field scenario
 */
function generateFormFieldScenario(moduleData: ModuleAudit): string {
  const fields = (moduleData.formFields || []).filter(f => f.required);
  
  if (fields.length === 0) {
    return '';
  }

  const fieldList = fields.map(f => `- ${f.label}: [Valid value]`).join('\n    ');

  return `
  Scenario: Submit form with valid data
    Given the form is open
    When the user fills the form with the following data:
      ${fieldList}
    And the user submits the form
    Then the success message should be displayed
    And the form should close`;
}

/**
 * Generate table viewing scenario (if has table)
 */
function generateTableScenario(moduleData: ModuleAudit): string {
  if (!moduleData.tableInfo?.hasTable) {
    return '';
  }

  const columns = (moduleData.tableInfo.columns || []).slice(0, 3).join(', ');

  return `
  Scenario: View data in table
    Given the module page is loaded
    When the user views the data table
    Then the table should display the following columns: ${columns}
    And the table should contain at least one row`;
}

/**
 * Generate search/filter scenario (if has search)
 */
function generateSearchScenario(): string {
  return `
  Scenario: Search for data
    Given the module page is loaded
    When the user searches for "test data"
    Then the search results should display
    And the results should contain the search term`;
}

/**
 * Generate export scenario (if has export)
 */
function generateExportScenario(): string {
  return `
  Scenario: Export data to file
    Given the module page is loaded
    When the user clicks the export button
    And the user selects "Excel" format
    Then the file should be downloaded
    And the file should contain valid data`;
}

/**
 * Generate negative scenario - invalid input
 */
function generateNegativeInvalidInputScenario(): string {
  return `
  Scenario: Display validation error for invalid input
    Given the form is open
    When the user enters invalid data in a required field
    Then the validation error should be displayed
    And the form should not submit`;
}

/**
 * Generate negative scenario - missing required fields
 */
function generateNegativeMissingFieldsScenario(): string {
  return `
  Scenario: Prevent submission with missing required fields
    Given the form is open
    When the user tries to submit without filling required fields
    Then the validation errors should be displayed
    And the form should remain open`;
}

/**
 * Generate negative scenario - duplicate/conflict
 */
function generateNegativeDuplicateScenario(): string {
  return `
  Scenario: Handle duplicate entry gracefully
    Given the module page is loaded
    When the user attempts to create a duplicate entry
    Then an appropriate error message should be displayed
    And the duplicate entry should not be created`;
}

/**
 * Generate edge case scenario
 */
function generateEdgeCaseScenario(): string {
  return `
  Scenario: Handle boundary values correctly
    Given the form is open
    When the user enters boundary value data
    Then the data should be processed successfully
    And the result should be valid`;
}

/**
 * Generate complete feature file content
 */
function generateFeatureContent(moduleData: ModuleAudit, moduleName: string): string {
  const title = moduleNameToFeatureTitle(moduleName);
  const description = getModuleDescription(moduleData);
  const featureTitle = `${title} - ${description}`;

  let scenarios = `
  Background:
    Given the user is authenticated
    And the user navigates to the "${title}" module

  # POSITIVE SCENARIOS
  Scenario: Load module page successfully
    When the user opens the module
    Then the module page should load
    And the page title should display "${title}"
    And all main elements should be visible`;

  // Add form scenario if applicable
  const formScenario = generateFormFieldScenario(moduleData);
  if (formScenario) scenarios += formScenario;

  // Add table scenario if applicable
  const tableScenario = generateTableScenario(moduleData);
  if (tableScenario) scenarios += tableScenario;

  // Add search if available
  if (moduleData.hasSearchInput) {
    scenarios += generateSearchScenario();
  }

  // Add export if available
  if (moduleData.hasExportButton) {
    scenarios += generateExportScenario();
  }

  // Add negative scenarios
  scenarios += `

  # NEGATIVE SCENARIOS
${generateNegativeInvalidInputScenario()}
${generateNegativeMissingFieldsScenario()}
${generateNegativeDuplicateScenario()}

  # EDGE CASES
${generateEdgeCaseScenario()}`;

  return `# Feature: ${featureTitle}
  
  As a user
  I want to interact with the ${title} module
  So that I can manage and track ${description.toLowerCase()}

${scenarios}
`;
}

/**
 * Main generator function
 */
function generateFeatureFile(config: GeneratorConfig): void {
  const filename = `${moduleNameToFilename(config.moduleName)}.feature`;
  const filepath = path.join(config.outputPath, filename);

  const content = generateFeatureContent(config.moduleData, config.moduleName);

  // Ensure directory exists
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filepath, content, 'utf-8');
  console.log(`✅ Generated: ${filepath}`);
}

/**
 * Load audit data and generate all feature files
 */
async function generateAllFeatures(auditPath: string, outputPath: string): Promise<void> {
  try {
    const auditData = JSON.parse(fs.readFileSync(auditPath, 'utf-8')) as Record<string, ModuleAudit>;
    
    let count = 0;
    let errors = 0;

    for (const [moduleName, moduleData] of Object.entries(auditData)) {
      try {
        generateFeatureFile({
          auditDataPath: auditPath,
          outputPath,
          moduleName,
          moduleData
        });
        count++;
      } catch (error) {
        console.error(`❌ Failed to generate ${moduleName}:`, error);
        errors++;
      }
    }

    console.log(`\n📊 Generation Complete:`);
    console.log(`   ✅ Successfully generated: ${count} feature files`);
    console.log(`   ❌ Failed: ${errors}`);
    console.log(`   📁 Output directory: ${outputPath}`);
  } catch (error) {
    console.error('Error loading audit data:', error);
    process.exit(1);
  }
}

// Export for use as module
export { generateFeatureFile, generateAllFeatures, moduleNameToFilename };

// Run if executed directly
if (require.main === module) {
  const auditPath = process.argv[2] || './page-audit-results.json';
  const outputPath = process.argv[3] || './Features/Generated';

  console.log(`🚀 Starting Feature File Generation`);
  console.log(`   📊 Audit data: ${auditPath}`);
  console.log(`   📁 Output path: ${outputPath}\n`);

  generateAllFeatures(auditPath, outputPath);
}
