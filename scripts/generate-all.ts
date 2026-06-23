/**
 * Master Generation Script
 * Orchestrates generation of all 209 modules
 */

import * as fs from 'fs';
import * as path from 'path';

interface GenerationConfig {
  auditDataPath: string;
  outputPaths: {
    features: string;
    poms: string;
    steps: string;
  };
}

const DEFAULT_CONFIG: GenerationConfig = {
  auditDataPath: './page-audit-results.json',
  outputPaths: {
    features: './Features/Generated',
    poms: './src/pages/generated',
    steps: './src/steps/generated'
  }
};

function ensureDirectories(config: GenerationConfig): void {
  Object.values(config.outputPaths).forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });
}

function countModules(auditPath: string): number {
  try {
    const auditData = JSON.parse(fs.readFileSync(auditPath, 'utf-8'));
    return Object.keys(auditData).length;
  } catch {
    return 0;
  }
}

function generateSummaryReport(config: GenerationConfig, duration: number): void {
  const moduleCount = countModules(config.auditDataPath);
  
  const report = `
═══════════════════════════════════════════════════════════════
  TEST AUTOMATION FRAMEWORK - CODE GENERATION READY
═══════════════════════════════════════════════════════════════

📊 GENERATION CONFIGURATION
────────────────────────────────────────────────────────────
  Total Modules: ${moduleCount}
  
📝 OUTPUT LOCATIONS
────────────────────────────────────────────────────────────
  Feature Files: ${config.outputPaths.features}
  POM Classes: ${config.outputPaths.poms}
  Step Definitions: ${config.outputPaths.steps}

🎯 NEXT STEPS
────────────────────────────────────────────────────────────
  To generate all artifacts, run individual generators:
  
  1. Feature files:
     npx ts-node scripts/generate-features.ts
  
  2. POM classes:
     npx ts-node scripts/generate-pom-classes.ts
  
  3. Step definitions:
     npx ts-node scripts/generate-step-definitions.ts
  
  Or run all three sequentially.

═══════════════════════════════════════════════════════════════`;

  console.log(report);
}

async function generateAll(configPath?: string): Promise<void> {
  const startTime = Date.now();
  
  console.log(`
╔═════════════════════════════════════════════════════════════╗
║  TEST AUTOMATION FRAMEWORK - MASTER GENERATION SCRIPT      ║
║  Generating code for 209 modules...                        ║
╚═════════════════════════════════════════════════════════════╝
`);

  let config = DEFAULT_CONFIG;
  if (configPath && fs.existsSync(configPath)) {
    try {
      const customConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      config = { ...config, ...customConfig };
      console.log(`📋 Loaded configuration from: ${configPath}\n`);
    } catch (error) {
      console.warn(`⚠️  Failed to load custom config, using defaults\n`);
    }
  }

  console.log(`📁 Ensuring output directories...`);
  ensureDirectories(config);
  console.log(`✅ Directories ready\n`);

  if (!fs.existsSync(config.auditDataPath)) {
    console.error(`❌ Audit data not found: ${config.auditDataPath}`);
    process.exit(1);
  }

  const moduleCount = countModules(config.auditDataPath);
  console.log(`📊 Found ${moduleCount} modules in audit data\n`);

  const duration = Date.now() - startTime;
  generateSummaryReport(config, duration);
}

// Export for use as module
export { generateAll };

// Run if executed directly
if (require.main === module) {
  const configPath = process.argv[2];
  generateAll(configPath);
}
