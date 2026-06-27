/**
 * Parse page-audit-results.json and create module metadata database
 * Validates JSON structure, extracts 209+ module definitions
 * Maps modules to existing features and identifies gaps
 */

import * as fs from 'fs';
import * as path from 'path';

// Types for audit data
interface AuditElement {
  type: string;
  selector: string;
  text?: string;
  placeholder?: string;
  ariaLabel?: string;
}

interface TableInfo {
  hasTable: boolean;
  columns: string[];
  actionButtons: string[];
  rowCount: number;
}

interface ActionButton {
  text: string;
  class?: string;
  type?: string;
}

interface FormField {
  label: string;
  type: string;
  required: boolean;
}

interface ModuleAuditData {
  url: string;
  labels: string[];
  hasAddNewButton: boolean;
  hasExportButton: boolean;
  hasColumnChooserButton: boolean;
  hasSearchInput: boolean;
  timestamp: string;
  interactiveElements: AuditElement[];
  tableInfo: TableInfo;
  actionButtons: ActionButton[];
  formFields: FormField[];
  allButtonTexts: string[];
}

interface ModuleMetadata {
  moduleName: string;
  url: string;
  selectors: Map<string, string[]>;
  elements: {
    inputs: AuditElement[];
    buttons: ActionButton[];
    formFields: FormField[];
    tables: TableInfo | null;
  };
  interactions: string[];
  validationPoints: string[];
  hasAddNew: boolean;
  hasExport: boolean;
  hasColumnChooser: boolean;
  hasSearch: boolean;
  timestamp: string;
}

interface ModuleDatabase {
  totalModules: number;
  modules: Map<string, ModuleMetadata>;
  modulesByCategory: Map<string, string[]>;
  stats: {
    modulesWithTables: number;
    modulesWithForms: number;
    modulesWithSearch: number;
    modulesWithExport: number;
  };
  gaps: {
    missingSelectors: string[];
    ambiguousSelectors: string[];
    potentialIssues: string[];
  };
}

/**
 * Main parsing function
 */
export class PageAuditParser {
  /**
   * Parse the JSON file and validate structure
   */
  static validateJsonStructure(data: any): boolean {
    if (typeof data !== 'object' || data === null) {
      console.error('Invalid JSON: root must be an object');
      return false;
    }

    let validCount = 0;
    for (const [moduleName, moduleData] of Object.entries(data)) {
      if (!this.isValidModuleData(moduleData as any)) {
        console.warn(`[WARN] Invalid module structure: ${moduleName}`);
        continue;
      }
      validCount++;
    }

    console.log(`✓ JSON structure validated. Valid modules: ${validCount}`);
    return validCount > 0;
  }

  /**
   * Check if module data has required fields
   */
  private static isValidModuleData(data: any): boolean {
    const required = ['url', 'timestamp', 'interactiveElements', 'tableInfo', 'formFields'];
    return required.every(field => field in data);
  }

  /**
   * Extract all module definitions from parsed JSON
   */
  static extractModules(data: any): ModuleMetadata[] {
    const modules: ModuleMetadata[] = [];

    for (const [moduleName, moduleData] of Object.entries(data)) {
      if (!this.isValidModuleData(moduleData as any)) continue;

      const metadata = this.createModuleMetadata(moduleName, moduleData as ModuleAuditData);
      modules.push(metadata);
    }

    console.log(`✓ Extracted ${modules.length} module definitions`);
    return modules;
  }

  /**
   * Create metadata object from audit data
   */
  private static createModuleMetadata(moduleName: string, data: ModuleAuditData): ModuleMetadata {
    const selectors = this.extractSelectors(data);
    const interactions = this.extractInteractions(data);
    const validationPoints = this.extractValidationPoints(data);

    return {
      moduleName,
      url: data.url,
      selectors,
      elements: {
        inputs: data.interactiveElements || [],
        buttons: data.actionButtons || [],
        formFields: data.formFields || [],
        tables: data.tableInfo || null,
      },
      interactions,
      validationPoints,
      hasAddNew: data.hasAddNewButton || false,
      hasExport: data.hasExportButton || false,
      hasColumnChooser: data.hasColumnChooserButton || false,
      hasSearch: data.hasSearchInput || false,
      timestamp: data.timestamp,
    };
  }

  /**
   * Extract all selectors from module data
   */
  private static extractSelectors(data: ModuleAuditData): Map<string, string[]> {
    const selectors = new Map<string, string[]>();

    // Extract from interactive elements
    data.interactiveElements?.forEach((elem, idx) => {
      const key = `input_${idx}`;
      selectors.set(key, [elem.selector, `[aria-label="${elem.ariaLabel}"]`, elem.placeholder].filter(Boolean) as string[]);
    });

    // Extract from action buttons
    data.actionButtons?.forEach((btn, idx) => {
      const key = `button_${idx}`;
      selectors.set(key, [btn.class, `button:has-text("${btn.text}")`].filter(Boolean) as string[]);
    });

    // Extract from form fields
    data.formFields?.forEach((field, idx) => {
      const key = `field_${field.label?.replace(/\s+/g, '_') || idx}`;
      selectors.set(key, [`label:has-text("${field.label}")`]);
    });

    // Extract from table
    if (data.tableInfo?.hasTable) {
      selectors.set('table', ['table[role="grid"]', '.dx-datagrid', 'table.report-table']);
      data.tableInfo.columns?.forEach((col, idx) => {
        selectors.set(`column_${col.replace(/\s+/g, '_')}`, [`th:has-text("${col}")`]);
      });
    }

    return selectors;
  }

  /**
   * Extract interaction types from module
   */
  private static extractInteractions(data: ModuleAuditData): string[] {
    const interactions: Set<string> = new Set();

    // Detect interaction types from elements
    data.interactiveElements?.forEach(elem => {
      if (elem.type?.includes('search')) interactions.add('search');
      if (elem.type?.includes('input')) interactions.add('input');
      if (elem.type?.includes('text')) interactions.add('text_input');
    });

    // Detect button interactions
    if (data.actionButtons && data.actionButtons.length > 0) interactions.add('click');
    if (data.hasAddNewButton) interactions.add('add_new');
    if (data.hasExportButton) interactions.add('export');
    if (data.hasColumnChooserButton) interactions.add('column_selection');

    // Detect table interactions
    if (data.tableInfo?.hasTable) {
      interactions.add('table_navigation');
      interactions.add('row_selection');
      if (data.tableInfo.columns.length > 0) interactions.add('column_sorting');
    }

    // Detect form interactions
    if (data.formFields && data.formFields.length > 0) interactions.add('form_fill');

    return Array.from(interactions);
  }

  /**
   * Extract validation points from module
   */
  private static extractValidationPoints(data: ModuleAuditData): string[] {
    const validations: Set<string> = new Set();

    // Check for labels (often validation messages)
    data.labels?.forEach(label => {
      if (label.includes('WARNING')) validations.add('heading_mismatch_warning');
      if (label.includes('Error')) validations.add('error_message');
      validations.add(`label: ${label}`);
    });

    // Form fields are validation points
    data.formFields?.forEach(field => {
      validations.add(`field_required: ${field.label}`);
      if (field.required) validations.add(`required_field: ${field.label}`);
    });

    // Table columns are validation points
    if (data.tableInfo?.columns) {
      data.tableInfo.columns.forEach(col => {
        validations.add(`table_column: ${col}`);
      });
    }

    return Array.from(validations);
  }

  /**
   * Map modules to existing features and identify gaps
   */
  static mapToExistingFeatures(modules: ModuleMetadata[], existingFeatures: string[]): {
    mapped: Map<string, string>;
    gaps: string[];
  } {
    const mapped = new Map<string, string>();
    const gaps: string[] = [];

    const featureMap = new Map(existingFeatures.map(f => [f.toLowerCase(), f]));

    modules.forEach(module => {
      const moduleNameLower = module.moduleName.toLowerCase();
      if (featureMap.has(moduleNameLower)) {
        mapped.set(module.moduleName, featureMap.get(moduleNameLower)!);
      } else {
        gaps.push(module.moduleName);
      }
    });

    console.log(`✓ Mapped ${mapped.size} modules to existing features`);
    console.log(`✓ Identified ${gaps.length} gap modules (missing features)`);

    return { mapped, gaps };
  }

  /**
   * Create and return the module metadata database
   */
  static createDatabase(modules: ModuleMetadata[]): ModuleDatabase {
    const database: ModuleDatabase = {
      totalModules: modules.length,
      modules: new Map(),
      modulesByCategory: new Map(),
      stats: {
        modulesWithTables: 0,
        modulesWithForms: 0,
        modulesWithSearch: 0,
        modulesWithExport: 0,
      },
      gaps: {
        missingSelectors: [],
        ambiguousSelectors: [],
        potentialIssues: [],
      },
    };

    // Populate modules map
    modules.forEach(module => {
      database.modules.set(module.moduleName, module);

      // Extract category from URL
      const category = this.extractCategory(module.url);
      if (!database.modulesByCategory.has(category)) {
        database.modulesByCategory.set(category, []);
      }
      database.modulesByCategory.get(category)!.push(module.moduleName);

      // Update statistics
      if (module.elements.tables) database.stats.modulesWithTables++;
      if (module.elements.formFields.length > 0) database.stats.modulesWithForms++;
      if (module.hasSearch) database.stats.modulesWithSearch++;
      if (module.hasExport) database.stats.modulesWithExport++;

      // Check for issues
      if (module.selectors.size === 0) {
        database.gaps.missingSelectors.push(module.moduleName);
      }

      // Check for ambiguous selectors
      module.selectors.forEach((sels, key) => {
        if (sels.length > 3) {
          database.gaps.ambiguousSelectors.push(`${module.moduleName}: ${key}`);
        }
      });
    });

    console.log(`✓ Created module metadata database with ${database.totalModules} modules`);
    return database;
  }

  /**
   * Extract category from module URL
   */
  private static extractCategory(url: string): string {
    const parts = url.split('/');
    if (parts.length >= 4) {
      return parts[3]; // e.g., 'business-intelligence', 'refund', etc.
    }
    return 'uncategorized';
  }

  /**
   * Save database to file for later use
   */
  static saveDatabase(database: ModuleDatabase, outputPath: string): void {
    // Convert Map to JSON-serializable format
    const dbJson = {
      totalModules: database.totalModules,
      modules: Array.from(database.modules.entries()).map(([name, metadata]) => ({
        ...metadata,
        selectors: Array.from(metadata.selectors.entries()),
      })),
      modulesByCategory: Array.from(database.modulesByCategory.entries()),
      stats: database.stats,
      gaps: database.gaps,
    };

    fs.writeFileSync(outputPath, JSON.stringify(dbJson, null, 2));
    console.log(`✓ Database saved to ${outputPath}`);
  }

  /**
   * Main execution flow
   */
  static run(auditFilePath: string, outputDir: string = 'src/config'): void {
    console.log('=== Page Audit Results Parser ===\n');

    try {
      // 1.4.1 Validate JSON structure
      console.log('Step 1.4.1: Validating JSON structure...');
      const rawData = fs.readFileSync(auditFilePath, 'utf-8');
      let jsonData: any;

      try {
        jsonData = JSON.parse(rawData);
      } catch (e) {
        console.error(`✗ Failed to parse JSON: ${e}`);
        return;
      }

      if (!this.validateJsonStructure(jsonData)) {
        console.error('✗ JSON validation failed');
        return;
      }
      console.log();

      // 1.4.2 Extract all module definitions
      console.log('Step 1.4.2: Extracting module definitions...');
      const modules = this.extractModules(jsonData);
      console.log();

      // 1.4.3 Map modules to existing features
      console.log('Step 1.4.3: Mapping modules to existing features...');
      const existingFeatures = this.findExistingFeatures();
      const { mapped, gaps } = this.mapToExistingFeatures(modules, existingFeatures);
      console.log();

      // 1.4.4 Identify gaps
      console.log('Step 1.4.4: Identifying gaps...');
      console.log(`✓ Gap modules to be generated: ${gaps.length}`);
      if (gaps.length > 0) {
        console.log('  Sample gap modules:');
        gaps.slice(0, 10).forEach(m => console.log(`    - ${m}`));
      }
      console.log();

      // 1.4.5 Create module metadata database
      console.log('Step 1.4.5: Creating module metadata database...');
      const database = this.createDatabase(modules);
      console.log(`  - Modules with tables: ${database.stats.modulesWithTables}`);
      console.log(`  - Modules with forms: ${database.stats.modulesWithForms}`);
      console.log(`  - Modules with search: ${database.stats.modulesWithSearch}`);
      console.log(`  - Modules with export: ${database.stats.modulesWithExport}`);
      console.log(`  - Modules with missing selectors: ${database.gaps.missingSelectors.length}`);
      console.log(`  - Modules with ambiguous selectors: ${database.gaps.ambiguousSelectors.length}`);
      console.log();

      // Save database
      console.log('Step 1.4: Saving metadata database...');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      this.saveDatabase(database, path.join(outputDir, 'page-audit-metadata.json'));

      // Generate summary report
      console.log('Step 1.4: Generating summary report...');
      this.generateReport(database, gaps, mapped, path.join(outputDir, 'page-audit-report.md'));

      console.log('\n=== Parsing Complete ===');
      console.log(`✓ Total modules processed: ${database.totalModules}`);
      console.log(`✓ Modules mapped: ${mapped.size}`);
      console.log(`✓ Gap modules identified: ${gaps.length}`);
    } catch (error) {
      console.error(`✗ Parsing failed: ${error}`);
    }
  }

  /**
   * Find existing feature files
   */
  private static findExistingFeatures(): string[] {
    const featuresDir = './Features';
    const features: string[] = [];

    if (!fs.existsSync(featuresDir)) {
      console.warn(`  [WARN] Features directory not found at ${featuresDir}`);
      return features;
    }

    const walkDir = (dir: string) => {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          walkDir(filePath);
        } else if (file.endsWith('.feature')) {
          features.push(file.replace('.feature', ''));
        }
      });
    };

    walkDir(featuresDir);
    console.log(`✓ Found ${features.length} existing feature files`);
    return features;
  }

  /**
   * Generate markdown report of parsing results
   */
  private static generateReport(
    database: ModuleDatabase,
    gaps: string[],
    mapped: Map<string, string>,
    outputPath: string
  ): void {
    let report = '# Page Audit Parsing Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;

    report += '## Summary\n\n';
    report += `- **Total Modules**: ${database.totalModules}\n`;
    report += `- **Modules Mapped**: ${mapped.size}\n`;
    report += `- **Gap Modules**: ${gaps.length}\n`;
    report += `- **Coverage**: ${((mapped.size / database.totalModules) * 100).toFixed(1)}%\n\n`;

    report += '## Statistics\n\n';
    report += `- Modules with tables: ${database.stats.modulesWithTables}\n`;
    report += `- Modules with forms: ${database.stats.modulesWithForms}\n`;
    report += `- Modules with search: ${database.stats.modulesWithSearch}\n`;
    report += `- Modules with export: ${database.stats.modulesWithExport}\n\n`;

    report += '## Categories\n\n';
    database.modulesByCategory.forEach((modules, category) => {
      report += `### ${category}\n`;
      report += `**${modules.length}** modules: ${modules.slice(0, 5).join(', ')}${modules.length > 5 ? '...' : ''}\n\n`;
    });

    report += '## Issues\n\n';
    report += `### Missing Selectors (${database.gaps.missingSelectors.length})\n`;
    database.gaps.missingSelectors.slice(0, 10).forEach(m => {
      report += `- ${m}\n`;
    });
    if (database.gaps.missingSelectors.length > 10) {
      report += `- ... and ${database.gaps.missingSelectors.length - 10} more\n`;
    }
    report += '\n';

    report += `### Ambiguous Selectors (${database.gaps.ambiguousSelectors.length})\n`;
    database.gaps.ambiguousSelectors.slice(0, 10).forEach(item => {
      report += `- ${item}\n`;
    });
    if (database.gaps.ambiguousSelectors.length > 10) {
      report += `- ... and ${database.gaps.ambiguousSelectors.length - 10} more\n`;
    }

    fs.writeFileSync(outputPath, report);
    console.log(`✓ Report saved to ${outputPath}`);
  }
}

// Execute if run directly
if (require.main === module) {
  const auditFile = process.argv[2] || 'page-audit-results.json';
  PageAuditParser.run(auditFile);
}

export default PageAuditParser;
