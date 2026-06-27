/**
 * Step Definition Factory - Generate standard step implementations
 * 
 * This factory reduces boilerplate by generating common step implementations
 * for navigation, form filling, assertions, and table operations.
 */

import { Given, When, Then } from '@cucumber/cucumber';
import { World } from '../fixtures/world.fixture';
import { expect } from '@playwright/test';
import { BasePage } from '../pages/base.page';

/**
 * Standard step patterns for common operations
 */
export interface StepPattern {
  name: string;
  regex: RegExp;
  implementation: (world: World, ...args: any[]) => Promise<void>;
}

/**
 * Factory for creating standard step definitions
 */
export class StepFactory {
  /**
   * Create navigation step for a module
   * Example: "Given the user navigates to the User Management module"
   */
  static createNavigationStep(moduleName: string, navigationUrl: string): StepPattern {
    return {
      name: `navigate_to_${moduleName}`,
      regex: new RegExp(`the user navigates to the ${moduleName} module`),
      implementation: async (world: World) => {
        const page = (world as any).page || (world as any).getActivePage?.();
        if (!page) throw new Error('Page not available in World context');
        await page.goto(navigationUrl);
        (world as any).addLog?.(`Navigated to ${moduleName} module`);
      },
    };
  }

  /**
   * Create form filling step for multiple fields
   * Example: "When the user fills the form with the following data:"
   */
  static createFormFillingStep(): StepPattern {
    return {
      name: 'fill_form_with_data',
      regex: /I fill the form with the following data:/,
      implementation: async (world: World, dataTable: any) => {
        const page = (world as any).page || (world as any).getActivePage?.();
        if (!page) throw new Error('Page not available');
        const data = dataTable.rowsHash();

        for (const [fieldLabel, fieldValue] of Object.entries(data)) {
          const fieldSelectors = [
            `label:has-text("${fieldLabel}") ~ input`,
            `input[aria-label="${fieldLabel}"]`,
            `input[placeholder="${fieldLabel}"]`,
            `[data-testid="${fieldLabel}"]`,
          ];

          let filled = false;
          for (const selector of fieldSelectors) {
            try {
              const field = page.locator(selector).first();
              const count = await field.count();
              if (count > 0) {
                await field.fill(String(fieldValue));
                filled = true;
                break;
              }
            } catch {
              // Try next selector
            }
          }

          if (!filled) {
            throw new Error(`Could not fill field: ${fieldLabel}`);
          }
        }

        (world as any).addLog?.(`Filled form fields: ${Object.keys(data).join(', ')}`);
      },
    };
  }

  /**
   * Create assertion step for element visibility
   * Example: "Then the Success Message should be visible"
   */
  static createVisibilityAssertionStep(elementName: string, selector: string): StepPattern {
    return {
      name: `assert_${elementName}_visible`,
      regex: new RegExp(`the ${elementName} should be visible`),
      implementation: async (world: World) => {
        const page = (world as any).page || (world as any).getActivePage?.();
        await expect((page?.locator(selector) || (world as any).page.locator(selector)).first()).toBeVisible({ timeout: 30000 });
        (world as any).addLog?.(`Verified ${elementName} is visible`);
      },
    };
  }

  /**
   * Create assertion step for element text
   * Example: "Then the message should display Success"
   */
  static createTextAssertionStep(elementName: string, selector: string): StepPattern {
    return {
      name: `assert_${elementName}_text`,
      regex: new RegExp(`the ${elementName} should (?:display|contain) (.+)`),
      implementation: async (world: World, expectedText: string) => {
        const page = (world as any).page || (world as any).getActivePage?.();
        await expect((page?.locator(selector) || (world as any).page.locator(selector)).first()).toContainText(expectedText);
        (world as any).addLog?.(`Verified ${elementName} contains: ${expectedText}`);
      },
    };
  }

  /**
   * Create table validation step
   * Example: "Then the table should display 5 records"
   */
  static createTableValidationStep(tableName: string, tableSelector: string): StepPattern {
    return {
      name: `assert_table_${tableName}_records`,
      regex: new RegExp(`the ${tableName} table should display (\\d+) records?`),
      implementation: async (world: World, expectedCount: string) => {
        const page = (world as any).page || (world as any).getActivePage?.();
        const rows = page?.locator(tableSelector).locator('tbody tr:not(.dx-freespace-row)');
        const count = await rows?.count() || 0;
        const expected = parseInt(expectedCount);
        if (count !== expected) {
          throw new Error(`Expected ${expected} records but got ${count}`);
        }
        (world as any).addLog?.(`Verified table displays ${expected} records`);
      },
    };
  }

  /**
   * Create search/filter step
   * Example: "When the user searches for Transaction 123"
   */
  static createSearchStep(module: string, searchSelector: string): StepPattern {
    return {
      name: `search_${module}`,
      regex: /the user searches for (.+)/,
      implementation: async (world: World, searchTerm: string) => {
        const page = (world as any).page || (world as any).getActivePage?.();
        const searchInput = page?.locator(searchSelector).first();
        await searchInput?.fill(searchTerm);
        await page?.waitForTimeout(800);
        (world as any).addLog?.(`Searched for: ${searchTerm}`);
      },
    };
  }

  /**
   * Create export step
   * Example: "When the user exports to Excel"
   */
  static createExportStep(format: string = 'Excel'): StepPattern {
    return {
      name: `export_to_${format.toLowerCase()}`,
      regex: new RegExp(`the user exports to ${format}`),
      implementation: async (world: World) => {
        const page = (world as any).page || (world as any).getActivePage?.();

        // Wait for download
        const [download] = await Promise.all([
          page?.context().waitForEvent('download', { timeout: 30000 }),
          page?.locator('[title="Export"], [aria-label*="Export"]').first().click(),
        ]);

        const filename = download?.suggestedFilename() || '';
        if (!filename.match(/\.(xlsx|xls|csv|pdf)$/i)) {
          throw new Error(`Invalid export file extension: ${filename}`);
        }
        (world as any).addLog?.(`Exported: ${filename}`);
      },
    };
  }

  /**
   * Create click step for buttons
   * Example: "When the user clicks Submit"
   */
  static createClickStep(buttonName: string, buttonSelector: string): StepPattern {
    return {
      name: `click_${buttonName.toLowerCase()}`,
      regex: new RegExp(`the user clicks (?:the )?${buttonName}(?: button)?`),
      implementation: async (world: World) => {
        const page = (world as any).page || (world as any).getActivePage?.();
        await page?.locator(buttonSelector).first().click();
        (world as any).addLog?.(`Clicked ${buttonName}`);
      },
    };
  }

  /**
   * Create data validation step
   * Example: "Then the report should show entity totals matching the split rule"
   */
  static createDataValidationStep(
    description: string,
    validationFn: (page: BasePage) => Promise<void>
  ): StepPattern {
    return {
      name: `validate_${description.toLowerCase().replace(/\s+/g, '_')}`,
      regex: new RegExp(description),
      implementation: async (world: World) => {
        const page = (world as any).page || (world as any).getActivePage?.();
        await validationFn(page);
        (world as any).addLog?.(`Validated: ${description}`);
      },
    };
  }

  /**
   * Register a step pattern with Cucumber
   */
  static registerStep(pattern: StepPattern, stepType: 'given' | 'when' | 'then' = 'when'): void {
    const decorator = stepType === 'given' ? Given : stepType === 'then' ? Then : When;
    decorator(pattern.regex, pattern.implementation);
  }

  /**
   * Register multiple step patterns
   */
  static registerSteps(patterns: StepPattern[], stepType: 'given' | 'when' | 'then' = 'when'): void {
    patterns.forEach((pattern) => this.registerStep(pattern, stepType));
  }
}

/**
 * Common step patterns used across all modules
 */
export class CommonStepPatterns {
  /**
   * Get navigation pattern (works for any module)
   */
  static getNavigationPattern(moduleName: string, url: string): StepPattern {
    return StepFactory.createNavigationStep(moduleName, url);
  }

  /**
   * Get form filling pattern (works for any form)
   */
  static getFormFillingPattern(): StepPattern {
    return StepFactory.createFormFillingStep();
  }

  /**
   * Get common button click patterns
   */
  static getCommonButtonPatterns(): StepPattern[] {
    return [
      StepFactory.createClickStep('Add New', 'button.btn-primary, [aria-label="Add New"]'),
      StepFactory.createClickStep('Save', '[aria-label="Save"], button:has-text("Save")'),
      StepFactory.createClickStep('Cancel', '[aria-label="Cancel"], button:has-text("Cancel")'),
      StepFactory.createClickStep('Delete', '[aria-label="Delete"], button:has-text("Delete")'),
      StepFactory.createClickStep('Edit', '[aria-label="Edit"], button:has-text("Edit")'),
      StepFactory.createClickStep('Export', '[title="Export"], [aria-label*="Export"]'),
    ];
  }

  /**
   * Get common table assertion patterns
   */
  static getCommonTablePatterns(): StepPattern[] {
    return [
      StepFactory.createTableValidationStep('results', 'table'),
      StepFactory.createTableValidationStep('data', '[role="grid"]'),
    ];
  }
}
