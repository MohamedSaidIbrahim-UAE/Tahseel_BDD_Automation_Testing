/**
 * Locator Builder - Build selectors dynamically from audit data
 * 
 * This utility constructs CSS selectors and Playwright locators based on
 * module audit data extracted from page-audit-results.json
 */

/**
 * Represents element metadata from page audit
 */
export interface AuditElement {
  type: string;
  selector?: string;
  text?: string;
  placeholder?: string;
  ariaLabel?: string;
  class?: string;
  id?: string;
  role?: string;
  dataTestId?: string;
  name?: string;
}

/**
 * Result of locator building
 */
export interface LocatorResult {
  primary: string;
  fallbacks: string[];
  strategies: string[];
}

/**
 * Dynamic locator builder for module elements
 */
export class LocatorBuilder {
  /**
   * Build a comprehensive selector from audit element data
   * Returns primary selector and fallback chain
   */
  static buildSelector(element: AuditElement): LocatorResult {
    const strategies: string[] = [];
    const selectors: string[] = [];

    // Strategy 1: data-testid (most reliable)
    if (element.dataTestId) {
      const selector = `[data-testid="${element.dataTestId}"]`;
      selectors.push(selector);
      strategies.push('data-testid');
    }

    // Strategy 2: aria-label (accessible)
    if (element.ariaLabel) {
      const selector = `[aria-label="${element.ariaLabel}"]`;
      selectors.push(selector);
      strategies.push('aria-label');
    }

    // Strategy 3: role-based (semantic)
    if (element.role) {
      const selector = `[role="${element.role}"]`;
      selectors.push(selector);
      strategies.push('role');
    }

    // Strategy 4: text content
    if (element.text) {
      const selector = `:has-text("${element.text}")`;
      selectors.push(selector);
      strategies.push('text');
    }

    // Strategy 5: CSS class
    if (element.class) {
      const selector = `.${element.class.split(' ').join('.')}`;
      selectors.push(selector);
      strategies.push('class');
    }

    // Strategy 6: ID
    if (element.id) {
      const selector = `#${element.id}`;
      selectors.push(selector);
      strategies.push('id');
    }

    // Strategy 7: Element type and other attributes
    if (element.type) {
      let selector = element.type;
      if (element.placeholder) {
        selector += `[placeholder="${element.placeholder}"]`;
      }
      if (element.name) {
        selector += `[name="${element.name}"]`;
      }
      selectors.push(selector);
      strategies.push('type');
    }

    // Strategy 8: Generic fallback
    if (element.selector) {
      selectors.push(element.selector);
      strategies.push('audit-selector');
    }

    // Return with primary selector and fallbacks
    return {
      primary: selectors[0] || '*',
      fallbacks: selectors.slice(1),
      strategies,
    };
  }

  /**
   * Build selector with explicit fallback chain
   */
  static buildSelectorChain(element: AuditElement): string {
    const result = this.buildSelector(element);
    return [result.primary, ...result.fallbacks].join(', ');
  }

  /**
   * Build table row selector for finding data in reports
   */
  static buildTableRowSelector(
    tableSelector: string,
    searchTerm: string,
    columnIndex?: number
  ): string {
    if (columnIndex !== undefined) {
      return `${tableSelector} tbody tr:has(td:nth-child(${columnIndex + 1}):has-text("${searchTerm}"))`;
    }
    return `${tableSelector} tbody tr:has-text("${searchTerm}")`;
  }

  /**
   * Build form field selector
   */
  static buildFormFieldSelector(
    formSelector: string,
    fieldLabel: string,
    fieldType: string = 'input'
  ): string {
    // Try by label first
    return (
      `${formSelector} label:has-text("${fieldLabel}") ~ ${fieldType}, ` +
      `${formSelector} [aria-label="${fieldLabel}"], ` +
      `${formSelector} [placeholder="${fieldLabel}"], ` +
      `${formSelector} [name="${fieldLabel}"]`
    );
  }

  /**
   * Build button selector by text
   */
  static buildButtonSelector(
    buttonText: string,
    containerSelector?: string
  ): string {
    const prefix = containerSelector ? `${containerSelector} ` : '';
    return (
      `${prefix}button:has-text("${buttonText}"), ` +
      `${prefix}[role="button"]:has-text("${buttonText}"), ` +
      `${prefix}[aria-label="${buttonText}"]`
    );
  }

  /**
   * Build dropdown selector
   */
  static buildDropdownSelector(
    label: string,
    containerSelector?: string
  ): string {
    const prefix = containerSelector ? `${containerSelector} ` : '';
    return (
      `${prefix}select[aria-label="${label}"], ` +
      `${prefix}[role="combobox"][aria-label="${label}"], ` +
      `${prefix}[class*="select"] [aria-label="${label}"]`
    );
  }

  /**
   * Build search/filter input selector
   */
  static buildSearchSelector(containerSelector?: string): string {
    const prefix = containerSelector ? `${containerSelector} ` : '';
    return (
      `${prefix}input[placeholder*="Search"], ` +
      `${prefix}input[aria-label*="Search"], ` +
      `${prefix}[role="searchbox"]`
    );
  }

  /**
   * Build pagination selector
   */
  static buildPaginationSelector(): string {
    return (
      `[role="navigation"][aria-label*="Pager"], ` +
      `[class*="pagination"], ` +
      `[class*="pager"]`
    );
  }

  /**
   * Build data grid selector
   */
  static buildDataGridSelector(): string {
    return (
      `[role="grid"], ` +
      `table[role="grid"], ` +
      `[class*="data-grid"], ` +
      `[class*="datagrid"], ` +
      `.dx-data-grid, ` +
      `table.report-table, ` +
      `table`
    );
  }

  /**
   * Build export button selector
   */
  static buildExportSelector(): string {
    return (
      `[title="Export"], ` +
      `[aria-label*="Export"], ` +
      `button:has-text("Export"), ` +
      `[class*="export"]`
    );
  }

  /**
   * Build column chooser selector
   */
  static buildColumnChooserSelector(): string {
    return (
      `[aria-label="Column Chooser"], ` +
      `[title="Column Chooser"], ` +
      `[class*="column-chooser"]`
    );
  }
}

/**
 * Audit element from page-audit-results.json
 */
export type ModuleAuditElement = {
  type: string;
  selector?: string;
  text?: string;
  placeholder?: string;
  ariaLabel?: string;
  class?: string;
  id?: string;
};

/**
 * Module audit data structure
 */
export interface ModuleAuditData {
  moduleName: string;
  url: string;
  labels: string[];
  elements: ModuleAuditElement[];
  hasTable: boolean;
  hasForm: boolean;
  hasSearch: boolean;
  hasExport: boolean;
  hasColumnChooser: boolean;
  actions: string[];
}
