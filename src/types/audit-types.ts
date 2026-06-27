/**
 * Type definitions for page-audit-results.json and module metadata
 * Used by code generation and page object layer
 */

/**
 * Audit element types from page inspection
 */
export interface AuditElement {
  type: string; // e.g., "input[search]", "input[text]", "button", etc.
  selector: string; // CSS selector or class name
  text?: string; // Element text content
  placeholder?: string; // Input placeholder
  ariaLabel?: string; // ARIA label for accessibility
}

/**
 * Table information extracted from page audit
 */
export interface TableInfo {
  hasTable: boolean;
  columns: string[];
  actionButtons: string[];
  rowCount: number;
}

/**
 * Action button information
 */
export interface ActionButton {
  text: string;
  class?: string;
  type?: string;
}

/**
 * Form field information
 */
export interface FormField {
  label: string;
  type: string;
  required: boolean;
}

/**
 * Raw module audit data as extracted from page-audit-results.json
 */
export interface ModuleAuditData {
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

/**
 * Processed module metadata for code generation
 */
export interface ModuleMetadata {
  moduleName: string;
  url: string;
  selectors: Map<string, string[]>; // Map from element key to selector strategies
  elements: {
    inputs: AuditElement[];
    buttons: ActionButton[];
    formFields: FormField[];
    tables: TableInfo | null;
  };
  interactions: string[]; // e.g., ["search", "click", "table_navigation"]
  validationPoints: string[]; // e.g., ["field_required: Email", "table_column: Status"]
  hasAddNew: boolean;
  hasExport: boolean;
  hasColumnChooser: boolean;
  hasSearch: boolean;
  timestamp: string;
}

/**
 * Statistics about module metadata
 */
export interface ModuleStats {
  modulesWithTables: number;
  modulesWithForms: number;
  modulesWithSearch: number;
  modulesWithExport: number;
}

/**
 * Gap analysis results
 */
export interface GapAnalysis {
  missingSelectors: string[];
  ambiguousSelectors: string[];
  potentialIssues: string[];
}

/**
 * Complete module metadata database
 */
export interface ModuleDatabase {
  totalModules: number;
  modules: Map<string, ModuleMetadata>;
  modulesByCategory: Map<string, string[]>;
  stats: ModuleStats;
  gaps: GapAnalysis;
}

/**
 * Feature mapping result
 */
export interface FeatureMapping {
  mapped: Map<string, string>; // Module name -> existing feature file
  gaps: string[]; // Modules without corresponding features
}

/**
 * Selector strategy options
 */
export enum SelectorStrategy {
  CssClass = 'css-class',
  AriaLabel = 'aria-label',
  Placeholder = 'placeholder',
  TextContent = 'text-content',
  TestId = 'test-id',
  Role = 'role',
}

/**
 * Interaction pattern for step definition generation
 */
export interface InteractionPattern {
  type: string; // e.g., "form_fill", "table_navigation", "search"
  methods: string[]; // Suggested method names for POM
  stepExamples: string[]; // Example Gherkin steps
}

/**
 * Validation point for assertion generation
 */
export interface ValidationPoint {
  type: string; // e.g., "field_validation", "table_column", "message"
  target: string; // What is being validated
  methods: string[]; // Suggested assertion method names
}

/**
 * Module generation metadata for code templates
 */
export interface ModuleGenerationMetadata {
  moduleName: string;
  modulePath: string; // Path for feature/page/step files
  category: string; // Category from URL
  hasTable: boolean;
  hasForm: boolean;
  hasSearch: boolean;
  hasExport: boolean;
  url: string;
  selectors: Map<string, string[]>;
  interactions: string[];
  validationPoints: string[];
  requiredMethods: string[]; // Methods to generate in POM
  requiredSteps: string[]; // Steps to generate in step definitions
}

/**
 * Parsed audit results summary
 */
export interface AuditSummary {
  totalModulesAudited: number;
  validModules: number;
  invalidModules: number;
  categoriesIdentified: string[];
  coveragePercentage: number;
  generatedAt: string;
}
