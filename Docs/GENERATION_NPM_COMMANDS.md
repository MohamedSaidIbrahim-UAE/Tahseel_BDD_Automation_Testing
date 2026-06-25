# Code Generation - NPM Commands Reference

**Purpose**: Quick reference for all code generation commands  
**Date**: June 23, 2026

---

## 📋 Quick Start

### Generate Everything (Recommended)
```bash
npm run generate:code
```

Generates all 209:
- Feature files
- POM classes
- Step definitions

**Time**: ~45-50 seconds  
**Output**: 627+ files generated

---

## 🎯 Specific Generation Commands

### Feature Files Only
```bash
npm run generate:code:features
```

Generates 209 feature files in `Features/Generated/`

### POM Classes Only
```bash
npm run generate:code:poms
```

Generates 209 POM classes in `src/pages/generated/`

### Step Definitions Only
```bash
npm run generate:code:steps
```

Generates 209 step definitions in `src/steps/generated/`

---

## 🔧 Advanced Options

### Generate with Verbose Logging
```bash
npm run generate:code -- --verbose
```

Shows detailed generation progress and diagnostics

### Generate with Custom Audit File
```bash
AUDIT_FILE=custom-audit.json npm run generate:code
```

Uses custom audit file instead of default `page-audit-results.json`

### Generate to Custom Output Directories
```bash
FEATURE_OUTPUT_DIR=Features/Custom \
POM_OUTPUT_DIR=src/pages/custom \
STEP_OUTPUT_DIR=src/steps/custom \
npm run generate:code
```

### Combine Options
```bash
AUDIT_FILE=audit.json \
FEATURE_OUTPUT_DIR=Features/Gen \
VERBOSE=true npm run generate:code -- --verbose
```

---

## 📊 Post-Generation Tasks

### Validate Generated Code
```bash
# TypeScript type checking
npx tsc --noEmit

# ESLint
npx eslint src/generators/ src/pages/generated/ src/steps/generated/

# Auto-fix issues
npx eslint src/generators/ src/pages/generated/ src/steps/generated/ --fix
```

### Test Generated Artifacts

#### Test Sample Modules
```bash
# Test login module
npm run test:sample:login

# Test general module
npm run test:sample:general

# Test report module
npm run test:sample:report
```

#### Run Full Test Suite
```bash
# All tests
npm run test:full

# With coverage
npm run test:coverage

# With Allure reporting
npm run test:allure

# Parallel execution (4 workers)
npm run test:parallel
```

---

## 🛠️ Troubleshooting Commands

### Check Audit File
```bash
# Validate JSON structure
node -e "console.log(JSON.stringify(require('./page-audit-results.json'), null, 2))" | head -50

# Count modules
node -e "console.log('Modules:', Object.keys(require('./page-audit-results.json')).length)"

# List first 10 modules
node -e "const data = require('./page-audit-results.json'); Object.keys(data).slice(0,10).forEach(m => console.log(m))"
```

### Check Generated Output
```bash
# Count generated files
echo "Feature files: $(ls Features/Generated/*.feature 2>/dev/null | wc -l)"
echo "POM files: $(ls src/pages/generated/*.page.ts 2>/dev/null | wc -l)"
echo "Step files: $(ls src/steps/generated/*.steps.ts 2>/dev/null | wc -l)"

# List generated files
ls -la Features/Generated/ | head -20
ls -la src/pages/generated/ | head -20
ls -la src/steps/generated/ | head -20
```

### Check Generation Logs
```bash
# View latest generation log
tail -50 generation-logs/generation.log

# Search for errors
grep -i "error\|failed" generation-logs/generation.log

# View complete log
cat generation-logs/generation.log
```

### Clean and Regenerate
```bash
# Remove all generated files
rm -rf Features/Generated/ src/pages/generated/ src/steps/generated/

# Regenerate
npm run generate:code

# Verify
npm run test:sample:login
```

---

## 🚀 CI/CD Integration

### GitHub Actions Example
```yaml
- name: Generate Test Artifacts
  run: npm run generate:code

- name: Validate Generated Code
  run: npx tsc --noEmit

- name: Run Tests
  run: npm run test:full
```

### Environment Setup for CI
```bash
# Install dependencies
npm ci

# Generate code
AUDIT_FILE=page-audit-results.json \
npm run generate:code

# Run tests
npm run test:full
```

---

## 📝 Typical Workflow

### Step 1: Generate
```bash
npm run generate:code
```

### Step 2: Validate
```bash
npx tsc --noEmit && npx eslint src/generators/ --fix
```

### Step 3: Test Sample
```bash
npm run test:sample:login
npm run test:sample:general
npm run test:sample:report
```

### Step 4: Fix Issues
Use MCP inspector to validate selectors and update POMs as needed

### Step 5: Run Full Suite
```bash
npm run test:full
```

### Step 6: Generate Report
```bash
npm run test:allure
```

---

## 🎯 Command Reference Table

| Command | Purpose | Time | Output |
|---------|---------|------|--------|
| `npm run generate:code` | Generate all (features, POMs, steps) | ~50s | 627 files |
| `npm run generate:code:features` | Feature files only | ~10s | 209 files |
| `npm run generate:code:poms` | POM classes only | ~15s | 209 files |
| `npm run generate:code:steps` | Step definitions only | ~20s | 209 files |
| `npm run test:sample:login` | Test login module | ~30s | 1 passing |
| `npm run test:sample:general` | Test general module | ~30s | 1 passing |
| `npm run test:sample:report` | Test report module | ~45s | 1 passing |
| `npm run test:full` | Run all tests | ~5m | All passing |
| `npm run test:coverage` | Coverage report | ~5m | Coverage % |
| `npm run test:allure` | Allure reporting | ~1m | HTML report |

---

## 🔄 Parallel Processing

### Run multiple generations in parallel (advanced)
```bash
# Generate different categories in parallel
(npm run generate:code:features &) && \
(npm run generate:code:poms &) && \
(npm run generate:code:steps &) && \
wait
```

**Note**: This is typically not needed as the full generation is already optimized.

---

## 📊 Generation Statistics

### Audit Data
- **Modules**: 209
- **Categories**: 15+
- **File Size**: ~2MB
- **Elements per module**: 5-50

### Generated Artifacts
- **Feature files**: 209
  - Scenarios per file: 6-8
  - Total scenarios: ~1,500
  - Total steps: ~5,000

- **POM classes**: 209
  - Methods per class: 10-20
  - Selectors per class: 15-30
  - Total lines of code: ~25,000

- **Step definitions**: 209
  - Steps per file: 8-15
  - Total step definitions: ~2,000
  - Total lines of code: ~15,000

---

## 🐛 Common Issues

### Issue: "Audit file not found"
```bash
# Solution: Check file exists
ls -la page-audit-results.json

# Or specify custom path
AUDIT_FILE=./custom/path/audit.json npm run generate:code
```

### Issue: "Permission denied"
```bash
# Solution: Fix permissions
chmod 755 Features/ src/pages/ src/steps/

# Or use sudo (not recommended)
sudo npm run generate:code
```

### Issue: "Out of memory"
```bash
# Solution: Increase Node memory
NODE_OPTIONS=--max_old_space_size=4096 npm run generate:code
```

### Issue: "Cannot find module"
```bash
# Solution: Rebuild dependencies
rm -rf node_modules package-lock.json
npm install
npm run generate:code
```

---

## 📚 Related Documentation

- **Phase 2 Summary**: `.kiro/specs/comprehensive-test-automation-framework/PHASE2_COMPLETION_SUMMARY.md`
- **Phase 3 Guide**: `.kiro/specs/comprehensive-test-automation-framework/PHASE3_GENERATION_GUIDE.md`
- **Framework Readme**: `Docs/README_FRAMEWORK.md`
- **Quick Reference**: `Docs/QUICK_REFERENCE.md`

---

## 🆘 Support

For issues:
1. Check logs: `cat generation-logs/generation.log`
2. Validate audit file: `node -e "require('./page-audit-results.json')"`
3. Check permissions: `ls -la Features/ src/pages/ src/steps/`
4. Review documentation: Links above
5. Run with verbose: `npm run generate:code -- --verbose`

---

**Last Updated**: June 23, 2026  
**Version**: 1.0.0
