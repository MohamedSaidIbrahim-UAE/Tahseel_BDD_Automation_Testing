/**
 * Code Generator Index - Unified interface for all generators
 * 
 * This module provides a unified interface to run all code generators
 * for features, POMs, and step definitions.
 */

import { FeatureFileBatchGenerator } from './feature-file-generator';
import { POMLBatchGenerator } from './pom-generator';
import { StepBatchGenerator } from './step-generator';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Code generator configuration
 */
export interface GeneratorConfig {
  auditFilePath: string;
  featureOutputDir: string;
  pomOutputDir: string;
  stepOutputDir: string;
  verbose: boolean;
}

/**
 * Generation results
 */
export interface GenerationResults {
  featureFiles: number;
  pomClasses: number;
  stepDefinitions: number;
  totalTime: number;
  timestamp: Date;
}

/**
 * Unified code generator
 */
export class CodeGenerator {
  /**
   * Run all generators
   */
  static async generateAll(config: GeneratorConfig): Promise<GenerationResults> {
    const startTime = Date.now();
    const results: GenerationResults = {
      featureFiles: 0,
      pomClasses: 0,
      stepDefinitions: 0,
      totalTime: 0,
      timestamp: new Date(),
    };

    try {
      if (config.verbose) {
        console.log('[CodeGenerator] Starting code generation...');
        console.log(`[CodeGenerator] Audit file: ${config.auditFilePath}`);
        console.log(`[CodeGenerator] Feature output: ${config.featureOutputDir}`);
        console.log(`[CodeGenerator] POM output: ${config.pomOutputDir}`);
        console.log(`[CodeGenerator] Step output: ${config.stepOutputDir}`);
      }

      // Validate audit file exists
      if (!fs.existsSync(config.auditFilePath)) {
        throw new Error(`Audit file not found: ${config.auditFilePath}`);
      }

      // Generate feature files
      if (config.verbose) console.log('\n[CodeGenerator] Generating feature files...');
      results.featureFiles = FeatureFileBatchGenerator.generateFromAuditFile(
        config.auditFilePath,
        config.featureOutputDir
      );

      // Generate POM classes
      if (config.verbose) console.log('\n[CodeGenerator] Generating POM classes...');
      results.pomClasses = POMLBatchGenerator.generateFromAuditFile(
        config.auditFilePath,
        config.pomOutputDir
      );

      // Generate step definitions
      if (config.verbose) console.log('\n[CodeGenerator] Generating step definitions...');
      results.stepDefinitions = StepBatchGenerator.generateFromAuditFile(
        config.auditFilePath,
        config.stepOutputDir
      );

      results.totalTime = Date.now() - startTime;

      if (config.verbose) {
        console.log('\n[CodeGenerator] ✓ Generation complete!');
        this.printSummary(results);
      }

      return results;
    } catch (error) {
      console.error('[CodeGenerator] Error during generation:', error);
      throw error;
    }
  }

  /**
   * Print generation summary
   */
  private static printSummary(results: GenerationResults): void {
    const summary = `
╔════════════════════════════════════════════════════╗
║          CODE GENERATION COMPLETE                  ║
╠════════════════════════════════════════════════════╣
║ Feature Files:        ${results.featureFiles.toString().padEnd(30)} ║
║ POM Classes:          ${results.pomClasses.toString().padEnd(30)} ║
║ Step Definitions:     ${results.stepDefinitions.toString().padEnd(30)} ║
║ Total Time:           ${(results.totalTime / 1000).toFixed(2)}s ${' '.repeat(22)} ║
║ Timestamp:            ${results.timestamp.toISOString().padEnd(30)} ║
╚════════════════════════════════════════════════════╝
    `;
    console.log(summary);
  }

  /**
   * Generate with default configuration
   */
  static async generateWithDefaults(): Promise<GenerationResults> {
    const config: GeneratorConfig = {
      auditFilePath: 'page-audit-results.json',
      featureOutputDir: 'Features/Generated',
      pomOutputDir: 'src/pages/generated',
      stepOutputDir: 'src/steps/generated',
      verbose: true,
    };

    return this.generateAll(config);
  }

  /**
   * Generate from environment variables
   */
  static async generateFromEnv(): Promise<GenerationResults> {
    const config: GeneratorConfig = {
      auditFilePath: process.env.AUDIT_FILE || 'page-audit-results.json',
      featureOutputDir: process.env.FEATURE_OUTPUT_DIR || 'Features/Generated',
      pomOutputDir: process.env.POM_OUTPUT_DIR || 'src/pages/generated',
      stepOutputDir: process.env.STEP_OUTPUT_DIR || 'src/steps/generated',
      verbose: process.env.VERBOSE === 'true',
    };

    return this.generateAll(config);
  }
}

/**
 * CLI entry point
 */
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: npm run generate:code [options]

Options:
  --all              Generate all artifacts (features, POMs, steps)
  --features         Generate feature files only
  --poms             Generate POM classes only
  --steps            Generate step definitions only
  --audit FILE       Specify audit file path (default: page-audit-results.json)
  --output DIR       Specify output directory (default: auto-determined)
  --verbose          Verbose output
  --help             Show this help message

Examples:
  npm run generate:code --all
  npm run generate:code --features --audit audit.json
  npm run generate:code --poms --output src/pages/custom
    `);
  } else if (args.includes('--all')) {
    CodeGenerator.generateWithDefaults().catch((err) => {
      console.error('Generation failed:', err);
      process.exit(1);
    });
  } else {
    // Default: generate all
    CodeGenerator.generateWithDefaults().catch((err) => {
      console.error('Generation failed:', err);
      process.exit(1);
    });
  }
}

export { FeatureFileGenerator, FeatureFileBatchGenerator } from './feature-file-generator';
export { POMGenerator, POMLBatchGenerator } from './pom-generator';
export { StepGenerator, StepBatchGenerator } from './step-generator';
