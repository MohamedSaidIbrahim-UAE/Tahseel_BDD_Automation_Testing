# Phase 3: Code Generation & Creation - Implementation Guide

**Status**: Framework Ready - Generators Implemented  
**Date**: June 23, 2026  
**Objective**: Generate 209 feature files, POM classes, and step definitions

---

## 🎯 Phase 3 Overview

Phase 3 automates the creation of test artifacts for all 209 modules using code generators built in Phase 2. This guide explains how to use the generators and what each produces.

---

## 📋 Generated Artifacts

### 1. Feature Files (209 files)
**Location**: `Features/Generated/`  
**Format**: Gherkin (.feature)  
**Content per file**:
- Background section (login, navigation)
- Positive scenarios (happy path, main workflows)
- Negative scenarios (validation, error handling)
- Edge case scenarios (boundary values, performance)

**Example**:
```gherkin
@module @automated @table @form @search
Feature: User Management
  As a user
  I want to interact with the User Management module
  So that I can manage user data

  Background:
    Given the user is authenticated and logged in
    And the user navigates to the "User Management" module
    And the page loads successfully

  # POSITIVE SCENARIOS
  Scenario: User can access the User Management module
    Then the page should display the User Management header
    And the module should be fully loaded

  # NEGATIVE SCENARIOS
  Scenario: Form validation for required fields
    When the user clicks the "Add New" button
    And the user tries to submit an empty form
    Then validation errors should be displayed
    And the form should remain open
```

### 2. POM Classes (209 files)
**Location**: `src/pages/generated/`  
**Format**: TypeScript (.page.ts)  
**Content per file**:
- Class extending BasePage
- Selectors object with multi-strategy fallbacks
- Methods for common operations (navigate, fill, submit, verify)
- Table/form/search specific methods

**Example**:
```typescript
export class UserManagementPage extends BasePage {
  readonly pageUrl = 'https://staging.tahseel.gov.ae/ManagePortal/users';
  readonly moduleName = 'User Management';

  readonly selectors = {
    pageTitle: 'h1, [role="heading"][aria-level="1"], .page-title',
    dataTable: '[role="grid"], table[role="grid"], .dx-data-grid, table',
    // ... more selectors
  };

  async navigateToModule(): Promise<void> { }
  async waitForTableReady(): Promise<void> { }
  async getRowCount(): Promise<number> { }
  async fillForm(data: { [key: string]: string }): Promise<void> { }
  async submitForm(): Promise<void> { }
}
```

### 3. Step Definitions (209 files)
**Location**: `src/steps/generated/`  
**Format**: TypeScript (.steps.ts)  
**Content per file**:
- Given steps (setup, navigation, preconditions)
- When steps (user actions)
- Then steps (verification, assertions)

**Example**:
```typescript
@Given('the user navigates to the {string} module')
async navigateToModule(this: World, moduleName: string) {
  userManagementPage = new UserManagementPage(this.getActivePage().rawPage);
  await userManagementPage.navigateToModule();
  this.addLog(`Navigated to ${moduleName}`);
}

@When('the user searches the table for {string}')
async searchTable(this: World, searchTerm: string) {
  await userManagementPage.searchTable(searchTerm);
  this.addLog(`Searched table for: ${searchTerm}`);
}

@Then('the table should contain at least one record')
async verifyTableHasRecords(this: World) {
  await userManagementPage.verifyTableHasRecords();
  this.addLog('Verified table has records');
}
```

---

## 🚀 Running the Generators

### Option 1: Generate All (Recommended)
```bash
npm run generate:code:all
# or
npm run generate:code
```

This generates all 209:
- Feature files (Features/Generated/)
- POM classes (src/pages/generated/)
- Step definitions (src/steps/generated/)

### Option 2: Generate Specific Type
```bash
# Feature files only
npm run generate:code:features

# POM classes only
npm run generate:code:poms

# Step definitions only
npm run generate:code:steps
```

### Option 3: Using Custom Paths
```bash
# With environment variables
AUDIT_FILE=page-audit-results.json \
FEATURE_OUTPUT_DIR=Features/Custom \
POM_OUTPUT_DIR=src/pages/custom \
STEP_OUTPUT_DIR=src/steps/custom \
npm run generate:code
```

### Option 4: Programmatic Usage
```typescript
import { CodeGenerator, GeneratorConfig } from './src/generators';

const config: GeneratorConfig = {
  auditFilePath: 'page-audit-results.json',
  featureOutputDir: 'Features/Generated',
  pomOutputDir: 'src/pages/generated',
  stepOutputDir: 'src/steps/generated',
  verbose: true,
};

const results = await CodeGenerator.generateAll(config);
console.log(`Generated ${results.featureFiles} features in ${results.totalTime}ms`);
```

---

## 📊 Generation Output

### What the Generators Produce

**Feature Files** (per module):
```
✓ Generated: Features/Generated/user-management.feature
✓ Generated: Features/Generated/department-management.feature
...
✓ Generated 209 feature files in Features/Generated
```

**POM Classes** (per module):
```
✓ Generated POM: src/pages/generated/user-management.page.ts
✓ Generated POM: src/pages/generated/department-management.page.ts
...
✓ Generated 209 POM classes in src/pages/generated
```

**Step Definitions** (per module):
```
✓ Generated steps: src/steps/generated/user-management.steps.ts
✓ Generated steps: src/steps/generated/department-management.steps.ts
...
✓ Generated 209 step definition files in src/steps/generated
```

### Generation Summary
```
╔════════════════════════════════════════════════════╗
║          CODE GENERATION COMPLETE                  ║
╠════════════════════════════════════════════════════╣
║ Feature Files:        209                          ║
║ POM Classes:          209                          ║
║ Step Definitions:     209                          ║
║ Total Time:           45.23s                       ║
║ Timestamp:            2026-06-23T15:30:00.000Z     ║
╚════════════════════════════════════════════════════╝
```

---

## 🔧 Generator Architecture

### FeatureFileGenerator
- **File**: `src/generators/feature-file-generator.ts`
- **Class**: `FeatureFileGenerator`
- **Methods**:
  - `generateFeatureFile(module)` - Generate single feature
  - `generateAllFeatureFiles(auditData, outputDir)` - Batch generation
  - `writeFeatureFile(filePath, content)` - Write to disk

### POMGenerator
- **File**: `src/generators/pom-generator.ts`
- **Class**: `POMGenerator`
- **Methods**:
  - `generatePOMClass(module)` - Generate single POM
  - `generateAllPOMClasses(auditData, outputDir)` - Batch generation
  - `writePOMFile(filePath, content)` - Write to disk

### StepGenerator
- **File**: `src/generators/step-generator.ts`
- **Class**: `StepGenerator`
- **Methods**:
  - `generateStepDefinitions(module)` - Generate single step file
  - `generateAllStepDefinitions(auditData, outputDir)` - Batch generation
  - `writeStepFile(filePath, content)` - Write to disk

### CodeGenerator (Unified)
- **File**: `src/generators/index.ts`
- **Class**: `CodeGenerator`
- **Methods**:
  - `generateAll(config)` - Run all generators
  - `generateWithDefaults()` - Use default paths
  - `generateFromEnv()` - Use environment variables

---

## 📦 Input Data

### page-audit-results.json Structure
```json
{
  "User Management": {
    "url": "https://staging.tahseel.gov.ae/ManagePortal/users",
    "labels": ["User Name", "Email", "Role"],
    "hasTable": true,
    "hasForm": true,
    "hasSearch": true,
    "hasExport": true,
    "hasColumnChooser": false,
    "interactiveElements": [
      { "type": "input[text]", "placeholder": "Search...", "ariaLabel": "Search input" },
      { "type": "button", "text": "Add New", "class": "btn-primary" }
    ],
    "tableInfo": {
      "hasTable": true,
      "columns": ["Name", "Email", "Role", "Status"],
      "actionButtons": ["Edit", "View", "Delete"]
    },
    "formFields": [
      { "label": "User Name", "type": "input", "required": true },
      { "label": "Email", "type": "input", "required": true }
    ]
  },
  ...209 more modules
}
```

---

## ⚙️ Generated Code Quality

### Feature Files Include
- ✅ Module-specific tags (@module, @table, @form, etc.)
- ✅ Positive scenarios (happy path)
- ✅ Negative scenarios (validation, errors)
- ✅ Edge cases (boundary values, special characters)
- ✅ Properly formatted Gherkin syntax
- ✅ Comprehensive background setup

### POM Classes Include
- ✅ Extend BasePage with inheritance
- ✅ Multi-strategy selectors with fallbacks
- ✅ Methods for all common operations
- ✅ Proper wait strategies and error handling
- ✅ Typed method signatures
- ✅ JSDoc documentation

### Step Definitions Include
- ✅ Proper Given/When/Then structure
- ✅ World context injection
- ✅ POM instantiation and method calls
- ✅ Logging and test tracking
- ✅ Module-specific steps
- ✅ Common step patterns

---

## 🔄 Post-Generation Tasks

After running the generators, perform these tasks:

### 1. Review Generated Code (Phase 4.1)
```bash
# Check for TypeScript errors
npx tsc --noEmit

# Run linter
npx eslint src/generators/ src/pages/generated/ src/steps/generated/
```

### 2. Test Sample Modules (Phase 4.4)
```bash
# Test Login module
npx cucumber-js --require-module ts-node/register \
  Features/Generated/login-authentication.feature

# Test a General module
npx cucumber-js --require-module ts-node/register \
  Features/Generated/user-management.feature

# Test a Report module
npx cucumber-js --require-module ts-node/register \
  Features/Generated/total-transactions-revenue-entity.feature
```

### 3. Fix Locators with MCP (Phase 4.3)
```typescript
import { MCPPlaywrightInspector } from './src/utils/mcp-playwright-inspector';

// For each failing test
const selector = await MCPPlaywrightInspector.findSelectorForElementByText(
  page,
  'Add New',
  'button'
);

// Update POM with correct selector
```

### 4. Validate All Tests (Phase 5.1)
```bash
# Run full test suite
npm run test:full

# Generate coverage report
npm run test:coverage

# Run with reporting
npm run test:allure
```

---

## 📈 Generator Performance

### Typical Generation Time
- **209 Feature Files**: ~5-10 seconds
- **209 POM Classes**: ~8-15 seconds
- **209 Step Definitions**: ~10-20 seconds
- **Total (All)**: ~40-50 seconds

### System Requirements
- Node.js 18+
- TypeScript 5+
- Sufficient disk space for generated files (~5-10MB)

---

## ✅ Success Criteria

After Phase 3 generation:
- [ ] All 209 feature files generated successfully
- [ ] All 209 POM classes generated successfully
- [ ] All 209 step definition files generated successfully
- [ ] No TypeScript compilation errors
- [ ] All files follow naming conventions
- [ ] All selectors include fallback chains
- [ ] All methods have proper error handling
- [ ] All steps linked to POM methods

---

## 🐛 Troubleshooting

### Issue: "Audit file not found"
**Solution**: Ensure `page-audit-results.json` exists in project root
```bash
ls -la page-audit-results.json
```

### Issue: "Output directory not writable"
**Solution**: Check directory permissions
```bash
chmod 755 Features/ src/pages/ src/steps/
```

### Issue: "Module name contains invalid characters"
**Solution**: Module names are auto-sanitized, but check audit data formatting

### Issue: "Generated code has TypeScript errors"
**Solution**: Run linter and fix issues
```bash
npx eslint src/generators/ --fix
```

---

## 📚 Next Steps

1. **Run Generators** (Phase 3.2-3.6)
   ```bash
   npm run generate:code:all
   ```

2. **Review Generated Code** (Phase 4.1-4.2)
   ```bash
   npx tsc --noEmit
   ```

3. **Test Sample Modules** (Phase 4.4)
   ```bash
   npm run test:sample
   ```

4. **Fix Locators with MCP** (Phase 4.3)
   - Use MCPPlaywrightInspector to validate selectors

5. **Run Full Validation** (Phase 5.1)
   ```bash
   npm run test:full
   ```

---

## 📞 Support

For issues or questions:
1. Check logs in `generation-logs/` directory
2. Review audit data in `page-audit-results.json`
3. Inspect generated files in output directories
4. Check Phase 2 framework documentation

---

**End of Phase 3 Guide**  
**Last Updated**: June 23, 2026
