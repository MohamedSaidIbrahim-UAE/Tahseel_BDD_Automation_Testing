#!/usr/bin/env ts-node

/**
 * Comprehensive Test Automation Framework - Code Generator CLI
 * 
 * Generates feature files, POM classes, and step definitions
 * for all 209 modules from page-audit-results.json
 * 
 * Usage:
 *   npx ts-node src/generators/code-generator-cli.ts --generate all
 *   npx ts-node src/generators/code-generator-cli.ts --generate features
 *   npx ts-node src/generators/code-generator-cli.ts --generate poms
 *   npx ts-node src/generators/code-generator-cli.ts --generate steps
 *   npx ts-node src/generators/code-generator-cli.ts --module "Module Name"
 */

import * as fs from 'fs';
import * as path from 'path';
import { FeatureFileGenerator, ModuleAuditData as FeatureModuleData } from './feature-file-generator';
import { POMGenerator, ModuleAuditData as POMModuleData } from './pom-generator';
import { StepDefinitionGenerator, StepGeneratorConfig } from './step-definition-generator';

interface CLIOptions {
  generate?: 'all' | 'features' | 'poms' | 'steps';
  module?: string;
  category?: string;
  verbose?: boolean;
  dryRun?: boolean;
}

class CodeGeneratorCLI {
  private auditData: any;
  private outputDir: string = path.join(process.cwd(), 'src');
  private featureDir: string = path.join(process.cwd(), 'Features');

  /**
   * Run the CLI
   */
  async run(options: CLIOptions): Promise<void> {
    console.log('🚀 Comprehensive Test Automation Framework - Code Generator');
    console.log('━'.repeat(60));

    try {
      // Load audit data
      await this.loadAuditData();

      if (options.generate === 'all') {
        await this.generateAll();
      } else if (options.generate === 'features') {
        await this.generateFeatures(options.category);
      } else if (options.generate === 'poms') {
        await this.generatePOMs(options.category);
      } else if (options.generate === 'steps') {
        await this.generateSteps(options.category);
      } else if (options.module) {
        await this.generateForModule(options.module);
      } else {
        this.printUsage();
      }

      console.log('✅ Code generation completed successfully');
    } catch (error) {
      console.error('❌ Code generation failed:', error);
      process.exit(1);
    }
  }

  /**
   * Load audit data from page-audit-results.json
   */
  private async loadAuditData(): Promise<void> {
    const auditPath = path.join(process.cwd(), 'page-audit-results.json');
    if (!fs.existsSync(auditPath)) {
      throw new Error(`Audit file not found: ${auditPath}`);
    }

    const auditContent = fs.readFileSync(auditPath, 'utf-8');
    this.auditData = JSON.parse(auditContent);
    console.log(`📊 Loaded audit data with ${Object.keys(this.auditData).length} modules`);
  }

  /**
   * Generate all artifacts (features, POMs, steps)
   */
  private async generateAll(): Promise<void> {
    console.log('\n📝 Generating all artifacts...\n');

    const categories = this.getCategoriesFromAudit();
    for (const category of categories) {
      console.log(`\n📂 Processing category: ${category}`);
      await this.generateFeatures(category);
      await this.generatePOMs(category);
      await this.generateSteps(category);
    }
  }

  /**
   * Generate feature files for a category
   */
  private async generateFeatures(category?: string): Promise<void> {
    console.log('📄 Generating feature files...');

    const modules = this.filterModulesByCategory(category);
    let successCount = 0;

    for (const [id, moduleData] of Object.entries(modules)) {
      try {
        const feature = FeatureFileGenerator.generateFeatureFile(moduleData as FeatureModuleData);
        const fileName = this.formatFileName(moduleData.displayName);
        const categoryPath = path.join(this.featureDir, moduleData.category);

        // Create directory if it doesn't exist
        if (!fs.existsSync(categoryPath)) {
          fs.mkdirSync(categoryPath, { recursive: true });
        }

        const filePath = path.join(categoryPath, `${fileName}.feature`);
        fs.writeFileSync(filePath, feature);
        successCount++;

        console.log(`  ✓ Generated: ${filePath}`);
      } catch (error) {
        console.error(`  ✗ Error generating feature for ${moduleData.displayName}:`, error);
      }
    }

    console.log(`✅ Generated ${successCount}/${Object.keys(modules).length} feature files`);
  }

  /**
   * Generate POM classes for a category
   */
  private async generatePOMs(category?: string): Promise<void> {
    console.log('🏗️ Generating POM classes...');

    const modules = this.filterModulesByCategory(category);
    let successCount = 0;

    for (const [id, moduleData] of Object.entries(modules)) {
      try {
        const pom = POMGenerator.generatePOMClass(moduleData as POMModuleData);
        const fileName = this.formatFileName(moduleData.displayName);
        const categoryPath = path.join(this.outputDir, 'pages', moduleData.category.toLowerCase());

        // Create directory if it doesn't exist
        if (!fs.existsSync(categoryPath)) {
          fs.mkdirSync(categoryPath, { recursive: true });
        }

        const filePath = path.join(categoryPath, `${fileName}.page.ts`);
        fs.writeFileSync(filePath, pom);
        successCount++;

        console.log(`  ✓ Generated: ${filePath}`);
      } catch (error) {
        console.error(`  ✗ Error generating POM for ${moduleData.displayName}:`, error);
      }
    }

    console.log(`✅ Generated ${successCount}/${Object.keys(modules).length} POM classes`);
  }

  /**
   * Generate step definitions for a category
   */
  private async generateSteps(category?: string): Promise<void> {
    console.log('👣 Generating step definitions...');

    const modules = this.filterModulesByCategory(category);
    let successCount = 0;

    for (const [id, moduleData] of Object.entries(modules)) {
      try {
        const config: StepGeneratorConfig = {
          moduleName: moduleData.displayName,
          className: this.formatClassName(moduleData.displayName),
          pomPath: `${moduleData.category.toLowerCase()}/${this.formatFileName(moduleData.displayName)}`,
          category: moduleData.category,
          hasForm: moduleData.forms && moduleData.forms.length > 0,
          hasTables: moduleData.tables && moduleData.tables.length > 0,
          hasSearch: moduleData.actions && moduleData.actions.some((a: any) => a.type === 'search'),
          hasExport: moduleData.actions && moduleData.actions.some((a: any) => a.type === 'export'),
        };

        const steps = StepDefinitionGenerator.generateStepDefinitions(config);
        const fileName = this.formatFileName(moduleData.displayName);
        const categoryPath = path.join(this.outputDir, 'steps', moduleData.category.toLowerCase());

        // Create directory if it doesn't exist
        if (!fs.existsSync(categoryPath)) {
          fs.mkdirSync(categoryPath, { recursive: true });
        }

        const filePath = path.join(categoryPath, `${fileName}.steps.ts`);
        fs.writeFileSync(filePath, steps);
        successCount++;

        console.log(`  ✓ Generated: ${filePath}`);
      } catch (error) {
        console.error(`  ✗ Error generating steps for ${moduleData.displayName}:`, error);
      }
    }

    console.log(`✅ Generated ${successCount}/${Object.keys(modules).length} step files`);
  }

  /**
   * Generate all artifacts for a specific module
   */
  private async generateForModule(moduleName: string): Promise<void> {
    console.log(`\n🎯 Generating artifacts for module: ${moduleName}\n`);

    const module = Object.values(this.auditData).find((m: any) => m.displayName === moduleName);
    if (!module) {
      throw new Error(`Module not found: ${moduleName}`);
    }

    // Generate feature
    const feature = FeatureFileGenerator.generateFeatureFile(module as FeatureModuleData);
    const fileName = this.formatFileName(module.displayName);
    const featurePath = path.join(this.featureDir, module.category, `${fileName}.feature`);
    fs.mkdirSync(path.dirname(featurePath), { recursive: true });
    fs.writeFileSync(featurePath, feature);
    console.log(`✓ Feature: ${featurePath}`);

    // Generate POM
    const pom = POMGenerator.generatePOMClass(module as POMModuleData);
    const pomPath = path.join(this.outputDir, 'pages', module.category.toLowerCase(), `${fileName}.page.ts`);
    fs.mkdirSync(path.dirname(pomPath), { recursive: true });
    fs.writeFileSync(pomPath, pom);
    console.log(`✓ POM: ${pomPath}`);

    // Generate steps
    const config: StepGeneratorConfig = {
      moduleName: module.displayName,
      className: this.formatClassName(module.displayName),
      pomPath: `${module.category.toLowerCase()}/${fileName}`,
      category: module.category,
      hasForm: module.forms && module.forms.length > 0,
      hasTables: module.tables && module.tables.length > 0,
      hasSearch: module.actions && module.actions.some((a: any) => a.type === 'search'),
      hasExport: module.actions && module.actions.some((a: any) => a.type === 'export'),
    };
    const steps = StepDefinitionGenerator.generateStepDefinitions(config);
    const stepsPath = path.join(this.outputDir, 'steps', module.category.toLowerCase(), `${fileName}.steps.ts`);
    fs.mkdirSync(path.dirname(stepsPath), { recursive: true });
    fs.writeFileSync(stepsPath, steps);
    console.log(`✓ Steps: ${stepsPath}`);
  }

  /**
   * Get unique categories from audit data
   */
  private getCategoriesFromAudit(): string[] {
    const categories = new Set<string>();
    for (const module of Object.values(this.auditData)) {
      categories.add((module as any).category);
    }
    return Array.from(categories).sort();
  }

  /**
   * Filter modules by category
   */
  private filterModulesByCategory(category?: string): Record<string, any> {
    if (!category) return this.auditData;
    return Object.entries(this.auditData).reduce((acc, [id, module]: any) => {
      if (module.category === category) {
        acc[id] = module;
      }
      return acc;
    }, {} as Record<string, any>);
  }

  /**
   * Format file name from module name
   */
  private formatFileName(name: string): string {
    return name
      .replace(/\s+/g, '-')
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/-+/g, '-')
      .replace(/^-/, '');
  }

  /**
   * Format class name
   */
  private formatClassName(name: string): string {
    return name
      .split(/[-_\s]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('')
      .replace(/([a-z])([A-Z])/g, '$1$2') + 'Page';
  }

  /**
   * Print CLI usage
   */
  private printUsage(): void {
    console.log(`
Usage: npx ts-node src/generators/code-generator-cli.ts [options]

Options:
  --generate all       Generate all artifacts (features, POMs, steps)
  --generate features  Generate only feature files
  --generate poms      Generate only POM classes
  --generate steps     Generate only step definitions
  --module NAME        Generate all artifacts for specific module
  --category NAME      Filter by category (e.g., General, Reports)
  --verbose            Print detailed output
  --dry-run            Show what would be generated without creating files

Examples:
  # Generate all 209 modules
  npx ts-node src/generators/code-generator-cli.ts --generate all

  # Generate only General category
  npx ts-node src/generators/code-generator-cli.ts --generate all --category General

  # Generate specific module
  npx ts-node src/generators/code-generator-cli.ts --module "User Management"
    `);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options: CLIOptions = {};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--generate' && i + 1 < args.length) {
    options.generate = args[++i] as any;
  } else if (args[i] === '--module' && i + 1 < args.length) {
    options.module = args[++i];
  } else if (args[i] === '--category' && i + 1 < args.length) {
    options.category = args[++i];
  } else if (args[i] === '--verbose') {
    options.verbose = true;
  } else if (args[i] === '--dry-run') {
    options.dryRun = true;
  }
}

// Run CLI
const cli = new CodeGeneratorCLI();
cli.run(options).catch(console.error);
