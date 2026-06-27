/**
 * Master Code Generation Script
 * 
 * This script orchestrates the generation of all test artifacts:
 * - 209 feature files
 * - 209 POM classes
 * - 209 step definition files
 * 
 * Usage:
 *   npm run generate:code
 *   npm run generate:code -- --verbose
 *   npm run generate:code -- --features-only
 */

import { CodeGenerator, GeneratorConfig } from '../generators';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Parse command line arguments
 */
function parseArgs(): {
  auditFile: string;
  outputMode: 'all' | 'features' | 'poms' | 'steps';
  verbose: boolean;
  logDir: string;
} {
  const args = process.argv.slice(2);

  return {
    auditFile: process.env.AUDIT_FILE || 'page-audit-results.json',
    outputMode: args.includes('--features-only')
      ? 'features'
      : args.includes('--poms-only')
      ? 'poms'
      : args.includes('--steps-only')
      ? 'steps'
      : 'all',
    verbose: args.includes('--verbose') || process.env.VERBOSE === 'true',
    logDir: process.env.LOG_DIR || 'generation-logs',
  };
}

/**
 * Create log directory
 */
function setupLogging(logDir: string): void {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
}

/**
 * Log generation event
 */
function log(message: string, logDir: string): void {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;

  const logFile = path.join(logDir, 'generation.log');
  fs.appendFileSync(logFile, logMessage);

  console.log(message);
}

/**
 * Main generation orchestration
 */
async function main(): Promise<void> {
  const args = parseArgs();

  console.log(`
╔═══════════════════════════════════════════════════════╗
║        Test Framework Code Generation Tool            ║
║                                                       ║
║  Generates feature files, POMs, and steps for         ║
║  all 209 modules from page-audit-results.json         ║
╚═══════════════════════════════════════════════════════╝
  `);

  // Setup
  setupLogging(args.logDir);
  log('Starting code generation...', args.logDir);

  if (args.verbose) {
    log(`Audit File: ${args.auditFile}`, args.logDir);
    log(`Output Mode: ${args.outputMode}`, args.logDir);
    log(`Verbose: ${args.verbose}`, args.logDir);
  }

  // Validate audit file
  if (!fs.existsSync(args.auditFile)) {
    const error = `ERROR: Audit file not found: ${args.auditFile}`;
    log(error, args.logDir);
    console.error(`\n❌ ${error}`);
    process.exit(1);
  }

  try {
    // Determine output directories
    const baseDir = process.cwd();
    const config: GeneratorConfig = {
      auditFilePath: args.auditFile,
      featureOutputDir: path.join(baseDir, 'Features', 'Generated'),
      pomOutputDir: path.join(baseDir, 'src', 'pages', 'generated'),
      stepOutputDir: path.join(baseDir, 'src', 'steps', 'generated'),
      verbose: args.verbose,
    };

    // Run generation
    log(`\nStarting generation with config:`, args.logDir);
    log(`  Features → ${config.featureOutputDir}`, args.logDir);
    log(`  POMs → ${config.pomOutputDir}`, args.logDir);
    log(`  Steps → ${config.stepOutputDir}`, args.logDir);

    const startTime = Date.now();
    const results = await CodeGenerator.generateAll(config);
    const duration = Date.now() - startTime;

    // Log results
    log(`\n✅ Generation completed successfully!`, args.logDir);
    log(`Generated ${results.featureFiles} feature files`, args.logDir);
    log(`Generated ${results.pomClasses} POM classes`, args.logDir);
    log(`Generated ${results.stepDefinitions} step definitions`, args.logDir);
    log(`Total time: ${(duration / 1000).toFixed(2)}s`, args.logDir);

    // Print summary
    printSummary(results, duration);

    // Post-generation recommendations
    printRecommendations(args.logDir);

    log(`\nLog file: ${path.join(args.logDir, 'generation.log')}`, args.logDir);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    log(`\n❌ Generation failed: ${errorMsg}`, args.logDir);
    console.error(`\n❌ Generation failed:\n${errorMsg}`);
    process.exit(1);
  }
}

/**
 * Print generation summary
 */
function printSummary(results: any, duration: number): void {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║            GENERATION COMPLETE ✅                    ║
╠═══════════════════════════════════════════════════════╣
║                                                       ║
║  Feature Files:     ${results.featureFiles.toString().padEnd(20)} ║
║  POM Classes:       ${results.pomClasses.toString().padEnd(20)} ║
║  Step Definitions:  ${results.stepDefinitions.toString().padEnd(20)} ║
║  Total Generated:   ${(results.featureFiles + results.pomClasses + results.stepDefinitions).toString().padEnd(20)} ║
║  Execution Time:    ${(duration / 1000).toFixed(2)}s${' '.repeat(27)} ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
}

/**
 * Print post-generation recommendations
 */
function printRecommendations(logDir: string): void {
  console.log(`
📋 POST-GENERATION CHECKLIST:

1. Review Generated Code
   $ npx tsc --noEmit
   $ npx eslint src/generators/ src/pages/generated/ src/steps/generated/

2. Test Sample Modules
   $ npm run test:sample:login
   $ npm run test:sample:general
   $ npm run test:sample:report

3. Validate All Selectors (Phase 4.3)
   - Use MCP Playwright Inspector to validate critical selectors
   - Update page objects with correct locators if needed

4. Run Full Test Suite (Phase 5.1)
   $ npm run test:full

5. Generate Coverage Report
   $ npm run test:coverage

📁 Output Files:
   - Features: Features/Generated/
   - POMs: src/pages/generated/
   - Steps: src/steps/generated/
   - Logs: ${logDir}/generation.log

📚 Documentation:
   - Phase 3 Guide: .kiro/specs/comprehensive-test-automation-framework/PHASE3_GENERATION_GUIDE.md
   - Phase 2 Summary: .kiro/specs/comprehensive-test-automation-framework/PHASE2_COMPLETION_SUMMARY.md

For issues or questions, check the generation logs above.
  `);
}

// Run the script
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
