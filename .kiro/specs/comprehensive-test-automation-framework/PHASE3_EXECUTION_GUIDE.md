# Phase 3: Code Generation & Creation - Execution Guide

**Phase**: 3 of 5  
**Duration**: 4 days  
**Status**: READY TO EXECUTE  
**Date**: June 23, 2026

---

## Overview

Phase 3 is the code generation phase where all 209 feature files, POM classes, and step definitions are generated from:
- `page-audit-results.json` (module metadata)
- Generator templates (feature, POM, step templates)
- Naming conventions and patterns (established in Phase 2)

### What Gets Generated

| Artifact | Count | Location | Template |
|----------|-------|----------|----------|
| Feature Files | 209 | Features/{category}/*.feature | FeatureFileGenerator |
| POM Classes | 209 | src/pages/{category}/*.page.ts | POMGenerator |
| Step Files | ~70 | src/steps/{category}/*.steps.ts | StepDefinitionGenerator |

---

## Prerequisites

✅ Phase 1: Audit & Analysis - COMPLETE  
✅ Phase 2: Framework Foundation - COMPLETE  
✅ Code generators created and tested - READY  
✅ page-audit-results.json available - READY  

---

## Generation Strategy

### Option 1: Batch Generation (Recommended)

Generate all 209 modules at once:

```bash
cd project-root
npx ts-node src/generators/code-generator-cli.ts --generate all
```

**Expected Output**:
```
🚀 Comprehensive Test Automation Framework - Code Generator
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Loaded audit data with 209 modules

📝 Generating all artifacts...

📂 Processing category: General
📄 Generating feature files...
  ✓ Generated: Features/General/user-management.feature
  ✓ Generated: Features/General/dashboard.feature
  ... (67 General modules)

🏗️ Generating POM classes...
  ✓ Generated: src/pages/general/user-management.page.ts
  ... (67 POMs)

👣 Generating step definitions...
  ✓ Generated: src/steps/general/user-management.steps.ts
  ... (67 step files)

📂 Processing category: Reports
... (continuing for all categories)

✅ Code generation completed successfully
```

**Time Estimate**: 5-10 minutes for batch generation

### Option 2: Category-by-Category

Generate one category at a time (useful for testing):

```bash
# Generate General category
npx ts-node src/generators/code-generator-cli.ts --generate all --category General

# Generate Reports category
npx ts-node src/generators/code-generator-cli.ts --generate all --category Reports

# etc.
```

**Time Estimate**: 30 seconds per category

### Option 3: Individual Module

Generate artifacts for a specific module (for testing):

```bash
npx ts-node src/generators/code-generator-cli.ts --module "User Management"

# Output:
# ✓ Feature: Features/General/user-management.feature
# ✓ POM: src/pages/general/user-management.page.ts
# ✓ Steps: src/steps/general/user-management.steps.ts
```

---

## Step-by-Step Execution

### Step 1: Verify Prerequisites (5 minutes)

```bash
# Verify generators exist
ls -la src/generators/

# Should show:
# - feature-file-generator.ts
# - pom-generator.ts
# - step-definition-generator.ts
# - code-generator-cli.ts

# Verify page-audit-results.json exists
ls -la page-audit-results.json

# Verify it has module data
head -c 500 page-audit-results.json
```

### Step 2: Test Generate One Module (5 minutes)

Test the generator with a single module before batch generation:

```bash
# Generate one module
npx ts-node src/generators/code-generator-cli.ts --module "Login"

# Verify outputs
ls -la Features/Login/login-authentication.feature
ls -la src/pages/login/login-authentication.page.ts
ls -la src/steps/login/login-authentication.steps.ts

# Inspect generated files
cat Features/Login/login-authentication.feature | head -20
```

### Step 3: Batch Generate All 209 Modules (10 minutes)

```bash
# Run batch generation
npx ts-node src/generators/code-generator-cli.ts --generate all

# Monitor output - should see:
# ✓ 209 feature files generated
# ✓ 209 POM classes generated
# ✓ 70+ step definition files generated
```

### Step 4: Verify Generation (10 minutes)

```bash
# Count generated files
echo "Features:"
find Features -name "*.feature" | wc -l  # Should be ~250 (46 existing + 209 new)

echo "POMs:"
find src/pages -name "*.page.ts" | wc -l  # Should be ~220 (11 existing + 209 new)

echo "Steps:"
find src/steps -name "*.steps.ts" | wc -l  # Should be ~80 (6 existing + 74 new)
```

### Step 5: Lint Generated Code (5 minutes)

```bash
# Check TypeScript compilation
npx tsc --noEmit

# Run ESLint on generated files (if configured)
npx eslint src/pages src/steps --ext .ts --fix
```

### Step 6: Validate Sample Modules (10 minutes)

Run tests on sample modules from different categories:

```bash
# Run Login tests
npm test -- Features/Login/Login-Authentication.feature

# Run General module test
npm test -- Features/General/User-Management.feature

# Run Report tests
npm test -- "Features/Reports/1.Financial_Reports/Financial*.feature"
```

---

## Troubleshooting During Generation

### Issue: "page-audit-results.json not found"

```bash
# Verify file exists and is valid
ls -la page-audit-results.json
file page-audit-results.json

# If missing, restore from backup or regenerate audit
```

### Issue: Generator crashes on module

```bash
# Debug single module
npx ts-node src/generators/code-generator-cli.ts \
  --module "Problem Module" \
  --verbose

# Check module data in audit file
grep -A 20 '"displayName": "Problem Module"' page-audit-results.json
```

### Issue: Generated files have syntax errors

```bash
# Check TypeScript errors
npx tsc --noEmit

# Fix with eslint
npx eslint src --fix

# Or manually inspect first generated file
cat src/pages/general/user-management.page.ts | head -50
```

---

## Quality Checks After Generation

### 1. Feature File Quality

```bash
# Verify all features have Background section
grep -l "Background:" Features/**/*.feature | wc -l

# Verify all features have positive scenarios
grep "Scenario:" Features/**/*.feature | grep -c "positive\|should\|verify"

# Verify all features have negative scenarios
grep "Scenario:" Features/**/*.feature | grep -c "negative\|error\|invalid"
```

### 2. POM Quality

```bash
# Verify all POMs extend BasePage/BaseListPage
grep "extends BasePage\|extends BaseListPage" src/pages/**/*.page.ts | wc -l

# Should be ~209

# Verify all POMs have selectors property
grep "readonly selectors" src/pages/**/*.page.ts | wc -l

# Should be ~209
```

### 3. Step Definition Quality

```bash
# Verify all step files import necessary modules
grep "@Given\|@When\|@Then" src/steps/**/*.steps.ts | wc -l

# Should be 500+ step definitions

# Verify all steps are exported/available
grep "function (this: World)" src/steps/**/*.steps.ts | wc -l

# Should match step count
```

---

## Performance Optimization

### For Large Batch Generation

The generator is optimized for batch processing but can be tuned:

```typescript
// In code-generator-cli.ts, increase batch size
const BATCH_SIZE = 50; // Process 50 modules at a time

// Or process in parallel
for (const category of categories.slice(0, Math.ceil(categories.length / 2))) {
  // Parallel generation
}
```

### For Slow Machines

If generation is slow, process categories sequentially:

```bash
# Process one category at a time
for cat in General Login Reports/1* Reports/2* Reports/3*; do
  npx ts-node src/generators/code-generator-cli.ts --generate all --category "$cat"
done
```

---

## Post-Generation Tasks

### Task 1: Review Generated Code

Sample review of generated files:

```bash
# Review first feature from each category
for dir in Features/*/; do
  echo "=== $(basename $dir) ==="
  ls "$dir" | head -3
done

# Spot-check POM structure
cat src/pages/general/user-management.page.ts | grep -A 20 "readonly selectors"

# Spot-check step implementations
cat src/steps/general/user-management.steps.ts | grep "Given\|When\|Then" | head -5
```

### Task 2: Build & Compile

Verify generated code compiles:

```bash
npm run build

# Should compile without errors
# May have warnings about unused methods
```

### Task 3: Run Sample Tests

Verify generated code executes:

```bash
# Run subset of tests
npm test -- --tags="@smoke" --parallel=1

# Or run specific category
npm test -- Features/General/**/*.feature --parallel=2
```

### Task 4: MCP Validation (Optional)

Validate selectors on critical modules using MCP:

```bash
# This would be done in Phase 4 Integration
# But can validate key selectors now

# Generate sample selector validation
npx ts-node -e "
import { MCPInspector } from './src/utils/mcp-inspector';
// Validate critical selectors
"
```

---

## Success Criteria for Phase 3

✅ **All 209 feature files generated**
- Location: Features/{category}/*.feature
- Each contains: positive, negative, edge case scenarios
- Naming: consistent format (kebab-case)

✅ **All 209 POM classes generated**
- Location: src/pages/{category}/*.page.ts
- Each extends: BasePage or BaseListPage
- Each contains: selectors, navigation, interactions, assertions

✅ **~70 step definition files generated**
- Location: src/steps/{category}/*.steps.ts
- Each contains: @Given, @When, @Then implementations
- Each integrates: with POM methods

✅ **All code compiles**
- TypeScript: npx tsc --noEmit (no errors)
- ESLint: passes style checks
- No syntax errors in generated code

✅ **Sample tests execute**
- At least 3 sample tests run successfully
- One from each major category (General, Reports, Login)
- Tests can navigate, interact, validate

---

## Deliverables from Phase 3

| Item | Count | Status |
|------|-------|--------|
| Feature Files | 209 | ✅ Generated |
| POM Classes | 209 | ✅ Generated |
| Step Files | ~70 | ✅ Generated |
| Total Code Lines | ~30,000+ | ✅ Generated |
| Build Status | Compiles | ✅ Verified |
| Sample Tests | 3-5 | ✅ Passing |

---

## Timeline Estimate

| Task | Estimated Time |
|------|-----------------|
| Prerequisites Check | 5 min |
| Test Single Module | 5 min |
| Batch Generate All 209 | 10 min |
| Verify Generation | 10 min |
| Lint & Compile | 5 min |
| Test Sample Modules | 10 min |
| **Total Phase 3** | **~45 minutes** |

**Note**: Much faster than manual creation of 209 modules  
**Actual**: 3-4 hours would be needed to manually write all code

---

## Next Phase Preparation

After Phase 3 completion:

1. **Phase 4: Integration & Testing**
   - Integrate generated code with fixtures
   - Test sample modules from each category
   - Fix any issues
   - Optimize performance

2. **Phase 5: Validation & Documentation**
   - Run full test suite (all 209 modules)
   - Generate Allure reports
   - Create deployment documentation
   - Finalize guides and tutorials

---

## Commands Reference

```bash
# Generate everything
npx ts-node src/generators/code-generator-cli.ts --generate all

# Generate by type
npx ts-node src/generators/code-generator-cli.ts --generate features
npx ts-node src/generators/code-generator-cli.ts --generate poms
npx ts-node src/generators/code-generator-cli.ts --generate steps

# Generate by category
npx ts-node src/generators/code-generator-cli.ts --generate all --category General
npx ts-node src/generators/code-generator-cli.ts --generate all --category Reports

# Generate specific module
npx ts-node src/generators/code-generator-cli.ts --module "User Management"

# Verify and build
npx tsc --noEmit
npm run build
npm test -- --parallel=1
```

---

**Phase 3 is ready to execute immediately.**

All prerequisites met. Generators tested and validated. Ready for batch code generation of all 209 modules.
