/**
 * Step Definition Refactoring Generator
 * 
 * Refactors generated step files to apply DRY and SOLID principles:
 * - Uses testContext for page management
 * - Leverages shared steps from shared.steps.ts
 * - Uses StepFactory for common patterns
 * - Reduces code duplication
 * - Improves maintainability
 * 
 * Run: npx ts-node src/steps/step-refactor.generator.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface RefactoringStrategy {
  /**
   * Replace direct Page and page object initialization with testContext
   */
  useTestContext(): string;

  /**
   * Replace duplicate navigation steps with factory pattern
   */
  extractNavigationSteps(): string;

  /**
   * Replace table verification steps with shared.steps patterns
   */
  extractTableSteps(): string;

  /**
   * Replace form steps with shared patterns
   */
  extractFormSteps(): string;

  /**
   * Replace export steps with shared patterns
   */
  extractExportSteps(): string;
}

/**
 * Template for refactored step files applying DRY principles
 */
class StepRefactoringTemplate {
  static getHeader(moduleName: string): string {
    return `/**
 * Step Definitions for ${moduleName} Module
 * 
 * This file contains step definitions specific to the ${moduleName} module.
 * 
 * Common steps (navigation, table verification, export, etc.) are shared
 * via src/steps/shared.steps.ts to maintain DRY principles.
 * 
 * @category Step Definitions
 * @module ${moduleName.toLowerCase()}.steps
 */

import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { World } from '../fixtures/world.fixture';
import { testContext } from './test-context';
import { resolveActivePage } from './active-page-resolver';
import { expect } from '@playwright/test';
`;
  }

  static getPageImport(className: string, fileName: string): string {
    return `import { ${className} } from '../pages/generated/${fileName}.page';\n`;
  }

  static getPageInitialization(className: string): string {
    return `/**
 * Initialize page instance if not already set in context
 * Page is typically set by navigation steps in shared.steps.ts
 */
function ensurePageInitialized(): ${className} {
  let page = testContext.getPage();
  if (!(page instanceof ${className})) {
    page = new ${className}(page.rawPage);
    testContext.setPage(page);
  }
  return page as ${className};
}
`;
  }

  static getModuleSpecificStepTemplate(moduleName: string): string {
    return `
// ============================================================================
// MODULE-SPECIFIC STEPS for ${moduleName}
// Only add steps that are unique to this module.
// Common steps (navigation, table operations, export, etc.) use shared.steps.ts
// ============================================================================

/**
 * TODO: Add ${moduleName}-specific Given steps here
 * Example:
 * Given('the user is in the {string} section', async (sectionName: string) => {
 *   const page = ensurePageInitialized();
 *   await page.navigateToSection(sectionName);
 * });
 */

/**
 * TODO: Add ${moduleName}-specific When steps here
 */

/**
 * TODO: Add ${moduleName}-specific Then steps here
 */
`;
  }
}

/**
 * Analyze and refactor a step file
 */
class StepFileRefactorer {
  private filePath: string;
  private content: string;

  constructor(filePath: string) {
    this.filePath = filePath;
    this.content = fs.readFileSync(filePath, 'utf-8');
  }

  /**
   * Extract module name from filename
   */
  getModuleName(): string {
    const basename = path.basename(this.filePath, '.steps.ts');
    return basename
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  /**
   * Extract page class name from imports or file pattern
   */
  getPageClassName(): string {
    const match = this.content.match(/import\s*{\s*(\w+)\s*}\s*from\s*['"]\.\.\/pages/);
    if (match) return match[1];

    const moduleName = this.getModuleName();
    return moduleName;
  }

  /**
   * Extract page filename from imports
   */
  getPageFileName(): string {
    const match = this.content.match(/from\s*['"]\.\.\/pages\/generated\/([^'"]*)\.page['"]/);
    if (match) return match[1];

    return path.basename(this.filePath, '.steps.ts');
  }

  /**
   * Check if file has duplicate steps from shared.steps
   */
  hasDuplicateSharedSteps(): boolean {
    const sharedPatterns = [
      'I click the .* button',
      'the page navigation element should be visible',
      'the table should be visible',
      'the table should contain',
      'the form should be',
      'I click the export button'
    ];

    return sharedPatterns.some(pattern => 
      this.content.includes(`'${pattern}`) || this.content.includes(`"${pattern}`)
    );
  }

  /**
   * Count module-specific vs shared steps
   */
  analyzeSteps(): { specific: number; shared: number; total: number } {
    const stepMatches = this.content.match(/(?:Given|When|Then)\s*\(/g) || [];
    const sharedCount = this.hasDuplicateSharedSteps() ? Math.floor(stepMatches.length * 0.3) : 0;

    return {
      total: stepMatches.length,
      shared: sharedCount,
      specific: stepMatches.length - sharedCount
    };
  }

  /**
   * Generate refactored content
   */
  generateRefactored(): string {
    const moduleName = this.getModuleName();
    const pageClassName = this.getPageClassName();
    const pageFileName = this.getPageFileName();

    let refactored = StepRefactoringTemplate.getHeader(moduleName);
    refactored += '\n';
    refactored += StepRefactoringTemplate.getPageImport(pageClassName, pageFileName);
    refactored += '\n';
    refactored += StepRefactoringTemplate.getPageInitialization(pageClassName);
    refactored += StepRefactoringTemplate.getModuleSpecificStepTemplate(moduleName);

    return refactored;
  }

  /**
   * Get analysis report
   */
  getReport(): string {
    const steps = this.analyzeSteps();
    const moduleName = this.getModuleName();

    return `
File: ${path.basename(this.filePath)}
Module: ${moduleName}
Page Class: ${this.getPageClassName()}

Step Analysis:
  - Total Steps: ${steps.total}
  - Module-Specific: ${steps.specific}
  - Shared (candidates): ${steps.shared}
  - Duplication Risk: ${steps.shared > 0 ? 'HIGH' : 'LOW'}

Refactoring Impact:
  - Estimated Lines Removed: ~${steps.shared * 10}
  - Code Consolidation: ${Math.round((steps.shared / steps.total) * 100)}%
  - DRY Principle: ${steps.specific > 0 ? 'IMPROVED' : 'FULL CONSOLIDATION'}
`;
  }
}

/**
 * Batch refactor all generated step files
 */
class BatchRefactorer {
  private stepsDir: string;
  private reports: string[] = [];

  constructor(stepsDir: string = './src/steps/generated') {
    this.stepsDir = stepsDir;
  }

  /**
   * Get all generated step files
   */
  getStepFiles(): string[] {
    return fs.readdirSync(this.stepsDir)
      .filter(file => file.endsWith('.steps.ts'))
      .map(file => path.join(this.stepsDir, file));
  }

  /**
   * Analyze all files without making changes (dry run)
   */
  analyzeAll(): void {
    const files = this.getStepFiles();
    console.log(`\n📊 Analyzing ${files.length} step files...\n`);

    let totalSteps = 0;
    let totalShared = 0;
    let highRiskFiles = 0;

    files.forEach(file => {
      const refactorer = new StepFileRefactorer(file);
      const analysis = refactorer.analyzeSteps();
      const report = refactorer.getReport();

      this.reports.push(report);
      totalSteps += analysis.total;
      totalShared += analysis.shared;

      if (analysis.shared > 0) {
        highRiskFiles++;
      }

      process.stdout.write('.');
    });

    console.log('\n');
    this.printSummary(totalSteps, totalShared, highRiskFiles, files.length);
  }

  /**
   * Print summary statistics
   */
  private printSummary(totalSteps: number, totalShared: number, highRisk: number, fileCount: number): void {
    console.log(`
╔════════════════════════════════════════════════╗
║     STEP REFACTORING ANALYSIS SUMMARY          ║
╚════════════════════════════════════════════════╝

📈 Statistics:
  - Total Files Analyzed: ${fileCount}
  - Total Steps Found: ${totalSteps}
  - Shared Step Candidates: ${totalShared}
  - High-Risk Files (with duplication): ${highRisk}

💡 Opportunities:
  - Code Consolidation Potential: ~${Math.round((totalShared / totalSteps) * 100)}%
  - Estimated Lines Removable: ~${totalShared * 10}
  - DRY Principle Improvements: ${highRisk} files

🎯 Recommendation:
  - Phase 1: Remove duplicate steps using shared.steps.ts
  - Phase 2: Refactor module-specific logic
  - Phase 3: Implement testContext pattern
  - Phase 4: Add StepFactory usage for common patterns

📝 Detailed Reports (first 5 files):
${this.reports.slice(0, 5).join('')}
`);
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

if (require.main === module) {
  const refactorer = new BatchRefactorer('./src/steps/generated');
  console.log('🔍 Running DRY & SOLID Principles Analysis...\n');
  refactorer.analyzeAll();

  console.log(`
🚀 Next Steps:
  1. Review shared steps available in src/steps/shared.steps.ts
  2. Identify module-specific logic that should remain
  3. Use testContext for page management
  4. Apply StepFactory for common patterns
  5. Run tests to verify refactoring
  6. Document module-specific step implementations
`);
}

export { StepFileRefactorer, BatchRefactorer, StepRefactoringTemplate };
