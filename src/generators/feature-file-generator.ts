/**
 * Feature File Generator - Generate Gherkin feature files from audit data
 * 
 * This script generates complete feature files with positive, negative, and
 * edge case scenarios for each module based on page-audit-results.json
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
  hasColumnChooser: boolean;
  labels: string[];
}

/**
 * Feature file generator
 */
export class FeatureFileGenerator {
  /**
   * Generate feature file content from module data
   */
  static generateFeatureFile(module: ModuleAuditData, moduleIndex: number): string {
    const moduleName = this.sanitizeModuleName(module.moduleName);
    const featureTitle = `${moduleName} - Management`;
    const tags = this.generateTags(module);

    let scenarios = '';

    // Background section
    scenarios += this.generateBackground(moduleName);

    // POSITIVE SCENARIOS
    scenarios += this.generatePositiveScenarios(module, moduleName);

    // NEGATIVE SCENARIOS
    scenarios += this.generateNegativeScenarios(module, moduleName);

    // EDGE CASE SCENARIOS
    scenarios += this.generateEdgeCaseScenarios(module, moduleName);

    // Build complete feature
    const feature = `${tags}
Feature: ${featureTitle}
  As a user
  I want to interact with the ${moduleName} module
  So that I can manage ${moduleName} data

${scenarios}`;

    return feature;
  }

  /**
   * Generate tags for the feature
   */
  private static generateTags(module: ModuleAuditData): string {
    const tags = ['@module', '@automated'];

    if (module.hasTable) tags.push('@table');
    if (module.hasForm) tags.push('@form');
    if (module.hasSearch) tags.push('@search');
    if (module.hasExport) tags.push('@export');
    if (module.hasColumnChooser) tags.push('@columns');

    return tags.map((tag) => tag).join(' ') + '\n';
  }

  /**
   * Generate background section
   */
  private static generateBackground(moduleName: string): string {
    return `\n  Background:
    Given the user is authenticated and logged in
    And the user navigates to the "${moduleName}" module
    And the page loads successfully

`;
  }

  /**
   * Generate positive scenarios
   */
  private static generatePositiveScenarios(module: ModuleAuditData, moduleName: string): string {
    let scenarios = '  # POSITIVE SCENARIOS - Happy path testing\n\n';

    // Scenario 1: View module with data
    scenarios += `  Scenario: User can access the ${moduleName} module
    Then the page should display the ${moduleName} header
    And the module should be fully loaded\n\n`;

    // Scenario 2: Table/List viewing (if applicable)
    if (module.hasTable) {
      scenarios += `  Scenario: View all records in ${moduleName}
    When the user waits for the data to load
    Then the ${moduleName} table should be visible
    And the table should contain at least one record
    And the table columns should be properly formatted\n\n`;
    }

    // Scenario 3: Search functionality (if applicable)
    if (module.hasSearch) {
      scenarios += `  Scenario: Search for a record in ${moduleName}
    When the user enters a search term in the search field
    And the user waits for search results
    Then only records matching the search term should be displayed
    And the result count should match the filter applied\n\n`;
    }

    // Scenario 4: Export functionality (if applicable)
    if (module.hasExport) {
      scenarios += `  Scenario: Export ${moduleName} data to Excel
    When the user clicks the export button
    And the user selects "Excel" from the export options
    Then a file should be downloaded
    And the file should have a valid Excel extension\n\n`;
    }

    // Scenario 5: Form submission (if applicable)
    if (module.hasForm) {
      scenarios += `  Scenario: Create a new record in ${moduleName}
    When the user clicks the "Add New" button
    Then the ${moduleName} form should be displayed
    When the user fills the form with valid data
    And the user clicks the "Save" button
    Then the record should be saved successfully
    And a success message should be displayed\n\n`;
    }

    // Scenario 6: Column chooser (if applicable)
    if (module.hasColumnChooser) {
      scenarios += `  Scenario: Customize ${moduleName} table columns
    When the user clicks the column chooser button
    Then the column selector should be displayed
    When the user selects a column to hide
    And the user closes the column selector
    Then the selected column should be hidden from the table\n\n`;
    }

    return scenarios;
  }

  /**
   * Generate negative scenarios
   */
  private static generateNegativeScenarios(module: ModuleAuditData, moduleName: string): string {
    let scenarios = '  # NEGATIVE SCENARIOS - Error handling and validation\n\n';

    // Scenario 1: Invalid form submission
    if (module.hasForm) {
      scenarios += `  Scenario: Form validation for required fields
    When the user clicks the "Add New" button
    And the user tries to submit an empty form
    Then validation errors should be displayed
    And the form should remain open\n\n`;
    }

    // Scenario 2: Search with no results
    if (module.hasSearch) {
      scenarios += `  Scenario: Search returns no results
    When the user searches for a non-existent record
    Then the table should display an empty state message
    And the record count should show zero results\n\n`;
    }

    // Scenario 3: Access denied (if RBAC is applicable)
    scenarios += `  Scenario: User without permission cannot access restricted action
    When the user attempts to access a restricted action
    Then the action button should be disabled or hidden
    And an access denied message should be displayed\n\n`;

    // Scenario 4: Network error handling
    scenarios += `  Scenario: Handle network error gracefully
    When a network error occurs during data load
    Then an error message should be displayed
    And the user should be able to retry the operation\n\n`;

    return scenarios;
  }

  /**
   * Generate edge case scenarios
   */
  private static generateEdgeCaseScenarios(module: ModuleAuditData, moduleName: string): string {
    let scenarios = '  # EDGE CASE SCENARIOS - Boundary and special cases\n\n';

    // Scenario 1: Large dataset pagination
    if (module.hasTable) {
      scenarios += `  Scenario: Table pagination with large dataset
    When the ${moduleName} table contains more than 100 records
    And the user navigates to the last page
    Then the last page should display correctly
    And the record count should match the expected total\n\n`;
    }

    // Scenario 2: Special characters in search
    if (module.hasSearch) {
      scenarios += `  Scenario: Search with special characters
    When the user searches for special characters like "@#$%"
    Then the search should handle special characters gracefully
    And the appropriate results or "no results" message should display\n\n`;
    }

    // Scenario 3: Concurrent operations
    scenarios += `  Scenario: Handle rapid successive operations
    When the user performs multiple operations in quick succession
    Then the system should debounce the requests appropriately
    And only one successful operation should complete\n\n`;

    // Scenario 4: Export large dataset
    if (module.hasExport) {
      scenarios += `  Scenario: Export large dataset performance
    When the user exports more than 1000 records
    Then the export should complete within a reasonable time
    And the file should contain all records\n\n`;
    }

    return scenarios;
  }

  /**
   * Sanitize module name for feature file
   */
  private static sanitizeModuleName(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9_\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 100);
  }

  /**
   * Generate feature file path from module name
   */
  static getFeatureFilePath(module: ModuleAuditData, baseDir: string): string {
    const fileName = this.sanitizeModuleName(module.moduleName)
      .toLowerCase()
      .replace(/\s+/g, '-');

    return path.join(baseDir, `${fileName}.feature`);
  }

  /**
   * Write feature file to disk
   */
  static writeFeatureFile(filePath: string, content: string): void {
    const dir = path.dirname(filePath);

    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✓ Generated: ${filePath}`);
  }

  /**
   * Generate all feature files from audit data
   */
  static generateAllFeatureFiles(auditData: { [key: string]: ModuleAuditData }, baseDir: string): void {
    let count = 0;

    for (const [moduleName, moduleData] of Object.entries(auditData)) {
      const content = this.generateFeatureFile(moduleData, count++);
      const filePath = this.getFeatureFilePath(moduleData, baseDir);
      this.writeFeatureFile(filePath, content);
    }

    console.log(`\n✓ Generated ${count} feature files in ${baseDir}`);
  }

  /**
   * Generate feature file template for manual customization
   */
  static generateTemplate(moduleName: string): string {
    return `# Template for ${moduleName} feature file
# Copy and customize this template for module-specific scenarios

@module
Feature: ${moduleName}
  As a user
  I want to interact with the ${moduleName} module
  So that I can manage ${moduleName} data

  Background:
    Given the user is authenticated and logged in
    And the user navigates to the "${moduleName}" module

  # TODO: Add positive scenarios
  Scenario: [Positive scenario title]
    When [action]
    Then [expected result]

  # TODO: Add negative scenarios
  Scenario: [Negative scenario title]
    When [action]
    Then [expected error]

  # TODO: Add edge cases
  Scenario: [Edge case scenario title]
    When [boundary condition]
    Then [expected behavior]
`;
  }
}

/**
 * Batch feature file generator for all modules
 */
export class FeatureFileBatchGenerator {
  /**
   * Load audit data from JSON file
   */
  static loadAuditData(auditFilePath: string): { [key: string]: ModuleAuditData } {
    try {
      const content = fs.readFileSync(auditFilePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error(`Error loading audit data from ${auditFilePath}:`, error);
      return {};
    }
  }

  /**
   * Generate all feature files from audit JSON
   */
  static generateFromAuditFile(auditFilePath: string, outputDir: string): number {
    console.log(`Loading audit data from: ${auditFilePath}`);
    const auditData = this.loadAuditData(auditFilePath);

    console.log(`Found ${Object.keys(auditData).length} modules in audit data`);
    console.log(`Generating feature files to: ${outputDir}`);

    FeatureFileGenerator.generateAllFeatureFiles(auditData, outputDir);

    return Object.keys(auditData).length;
  }

  /**
   * Generate statistics about generated features
   */
  static generateStatistics(outputDir: string): object {
    const featureFiles = fs.readdirSync(outputDir).filter((f) => f.endsWith('.feature'));

    return {
      totalFeatureFiles: featureFiles.length,
      totalLines: featureFiles.reduce(
        (sum, file) => sum + fs.readFileSync(path.join(outputDir, file), 'utf-8').split('\n').length,
        0
      ),
      generatedTime: new Date().toISOString(),
    };
  }
}

/**
 * Export for use in scripts
 */
if (require.main === module) {
  const auditFilePath = process.argv[2] || 'page-audit-results.json';
  const outputDir = process.argv[3] || 'Features/Generated';

  FeatureFileBatchGenerator.generateFromAuditFile(auditFilePath, outputDir);
}
