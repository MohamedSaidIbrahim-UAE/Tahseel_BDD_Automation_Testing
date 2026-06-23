# NPM Commands Deployment Guide

**Revenue Reports - Professional Test Execution Commands**

---

## ✅ Deployment Status

```
✅ VERIFIED: package.json is valid JSON
✅ DEPLOYED: 35 professional revenue report testing commands
✅ READY: All commands tested and functional
✅ DOCUMENTED: Complete usage guides provided
```

---

## 🎯 Quick Execution Examples

### **Test All Revenue Reports**
```bash
npm run test:revenue:all
```
Expected output: All @revenue and @automated scenarios on Stage

### **Test Single Report**
```bash
npm run test:revenue:total-transactions
npm run test:revenue:detailed-transactions
npm run test:revenue:shared-dtps
```

### **Run Complete Setup + Tests**
```bash
npm run test:revenue:complete
```
Runs auth setup + all revenue tests

---

## 📊 All 35 Available Commands

### **Single Report Commands (3)**
```bash
npm run test:revenue:total-transactions
npm run test:revenue:detailed-transactions
npm run test:revenue:shared-dtps
```

### **Category Commands (5)**
```bash
npm run test:revenue:all              # All reports
npm run test:revenue:summary          # Summary reports
npm run test:revenue:split            # Revenue splitting tests
npm run test:revenue:rbac             # RBAC tests
npm run test:revenue:export           # Export tests
```

### **Split Percentage Commands (4)**
```bash
npm run test:revenue:50-50            # DTPS & Sharjah
npm run test:revenue:60-40            # SEDD & SCTDA
npm run test:revenue:70-30            # Safety & SAND
npm run test:revenue:80-20            # Municipality & Centers
```

### **Environment - Stage (4)**
```bash
npm run test:revenue:stage            # Headless
npm run test:revenue:stage:headed     # Watch browser
npm run test:revenue:stage:firefox    # Firefox
npm run test:revenue:stage:webkit     # Webkit (Safari)
```

### **Environment - Local (4)**
```bash
npm run test:revenue:local            # Headless
npm run test:revenue:local:headed     # Watch browser
npm run test:revenue:local:firefox    # Firefox
npm run test:revenue:local:webkit     # Webkit (Safari)
```

### **Performance Commands (2)**
```bash
npm run test:revenue:parallel         # 2 parallel threads
npm run test:revenue:parallel:4       # 4 parallel threads (fastest)
```

### **Debug & Development (3)**
```bash
npm run test:revenue:debug            # Playwright Inspector
npm run test:revenue:verbose          # Detailed output
npm run test:revenue:dry-run          # Check step definitions
```

### **Comprehensive Suites (3)**
```bash
npm run test:revenue:complete         # Auth setup + all tests
npm run test:revenue:complete:headed  # Headed mode
npm run test:revenue:complete:cross-browser  # All browsers
```

### **Report Generation (2)**
```bash
npm run test:revenue:report           # HTML + JSON reports
npm run test:revenue:report:allure    # Allure-compatible results
```

### **Example/Demo Commands (3)**
```bash
npm run test:revenue:example:split    # Split verification demo
npm run test:revenue:example:rbac     # RBAC demo
npm run test:revenue:example:export   # Export demo
```

### **Quick Run Commands (2)**
```bash
npm run test:revenue:quick            # Positive E2E tests
npm run test:revenue:quick:headed     # With browser view
```

---

## 🔄 Common Workflows

### **1. First-Time Setup**
```bash
# Setup authentication for stage
npm run auth:setup-stage

# Run quick test
npm run test:revenue:quick

# View results
npm run test:revenue:report
```

### **2. Development Workflow**
```bash
# Test single report
npm run test:revenue:detailed-transactions

# If debugging needed
npm run test:revenue:stage:headed

# Check steps
npm run test:revenue:dry-run
```

### **3. QA Testing**
```bash
# Complete testing
npm run test:revenue:complete

# Generate reports
npm run test:revenue:report
```

### **4. Regression Testing**
```bash
# Fast parallel execution
npm run test:revenue:parallel:4

# Generate comprehensive reports
npm run test:revenue:report:allure
```

### **5. Cross-Browser Testing**
```bash
# Test all browsers
npm run test:revenue:complete:cross-browser

# Generate reports
npm run test:revenue:report
```

---

## 🚀 Running Tests

### **Option 1: Run from Terminal**
```bash
# Direct execution
npm run test:revenue:all

# Or with custom environment
TEST_ENV=stage npm run test:revenue:split
```

### **Option 2: Run from VS Code**
```json
// In VS Code terminal:
npm run test:revenue:quick:headed
// Runs with visible browser
```

### **Option 3: Run from CI/CD**
```bash
# In pipeline
npm run auth:setup-stage
npm run test:revenue:report:allure
```

---

## 📋 Command Structure

Each command follows this pattern:
```bash
npm run test:revenue:[report-type]:[environment][:option]
```

### Examples:
- `test:revenue:all` - All reports, Stage, Headless
- `test:revenue:stage:headed` - All reports, Stage, Visible
- `test:revenue:local:firefox` - All reports, Local, Firefox
- `test:revenue:50-50` - 50/50 split tests, Stage
- `test:revenue:parallel:4` - Parallel execution, 4 threads

---

## 🎯 Tag-Based Organization

Commands use these tags for filtering:

| Tag | Purpose | Included In |
|-----|---------|------------|
| `@revenue` | All revenue tests | All commands |
| `@automated` | Phase 1-2 tests | All commands |
| `@e2e` | End-to-end tests | `summary`, `quick` |
| `@split` | Revenue splitting | `split`, `50-50`, etc. |
| `@rbac` | Role-based access | `rbac` |
| `@export` | Export tests | `export` |
| `@positive` | Positive scenarios | `quick` |
| `@negative` | Error scenarios | `rbac` (subset) |

---

## 🔧 Customization

### Run Specific Scenario
```bash
# By feature file
cross-env TEST_ENV=stage BROWSER=chromium cucumber-js \
  Features/Reports/4.Revenue_Reports/Total_Transactions_Report_by_Revenue_Entity.feature

# By tag combination
cross-env TEST_ENV=stage BROWSER=chromium cucumber-js \
  --tags "@revenue and @split and @positive" \
  Features/Reports/4.Revenue_Reports/**/*.feature
```

### Set Custom Environment Variables
```bash
# With custom settings
TEST_ENV=local HEADED=true DEBUG=true npm run test:revenue:all

# Or using cross-env
cross-env TEST_ENV=local HEADED=true npm run test:revenue:stage:headed
```

---

## 📊 Command Statistics

| Metric | Count |
|--------|-------|
| Total Commands | 35 |
| Single Report Tests | 3 |
| Category Filters | 5 |
| Split Percentages | 4 |
| Stage Environment | 4 |
| Local Environment | 4 |
| Performance Options | 2 |
| Debug/Dev Commands | 3 |
| Complete Suites | 3 |
| Report Generation | 2 |
| Example Commands | 3 |
| Quick Commands | 2 |

---

## ✅ Validation Checklist

- [x] All 35 commands defined in package.json
- [x] JSON syntax is valid
- [x] All commands tested and verified
- [x] Commands follow consistent naming pattern
- [x] All environments covered (Stage, Local)
- [x] All browsers supported (Chromium, Firefox, Webkit)
- [x] Performance options included (Parallel execution)
- [x] Debug capabilities provided
- [x] Report generation integrated
- [x] Documentation complete

---

## 🐛 Troubleshooting Commands

### Command Not Found
```bash
# List all available commands
npm run

# Or search for revenue commands
npm run | Select-String "revenue"
```

### JSON Parse Error
```bash
# Validate package.json
node -e "require('./package.json'); console.log('✅ Valid JSON')"
```

### Authentication Issues
```bash
# Setup auth for stage
npm run auth:setup-stage

# Test auth
npm run auth:test:stage
```

### Browser Issues
```bash
# Install browsers
npx playwright install chromium firefox webkit

# Run with headed mode to see issues
npm run test:revenue:stage:headed
```

---

## 📖 Documentation Files

| File | Purpose |
|------|---------|
| `REVENUE_REPORTS_TEST_COMMANDS_GUIDE.md` | Complete command guide |
| `REVENUE_REPORTS_COMMANDS_CHEATSHEET.md` | Quick reference (1-page) |
| `NPM_COMMANDS_DEPLOYMENT_GUIDE.md` | This file |
| `package.json` | Command definitions |

---

## 🎉 Ready to Test?

### Start Here:
```bash
# 1. Setup
npm run auth:setup-stage

# 2. Quick test
npm run test:revenue:quick

# 3. Full test
npm run test:revenue:complete

# 4. Reports
npm run test:revenue:report
```

---

## 📞 Quick Help

### Most Common Commands
```bash
npm run test:revenue:all          # Test everything
npm run test:revenue:complete     # Setup + test everything
npm run test:revenue:quick        # Quick positive tests
npm run test:revenue:parallel:4   # Fast parallel execution
npm run test:revenue:report       # Generate reports
```

### By Role

**QA Testing:**
```bash
npm run test:revenue:complete
npm run test:revenue:report
```

**Development:**
```bash
npm run test:revenue:stage:headed
npm run test:revenue:dry-run
```

**Regression:**
```bash
npm run test:revenue:parallel:4
npm run test:revenue:report:allure
```

**Demo/POC:**
```bash
npm run test:revenue:example:split
npm run test:revenue:example:rbac
```

---

## 🚀 Deployment Notes

- ✅ All commands use proper environment variables
- ✅ Cross-platform support (Windows, Mac, Linux)
- ✅ Parallel execution for performance
- ✅ Multiple browser support
- ✅ Report generation integrated
- ✅ RBAC testing included
- ✅ Split percentage validation
- ✅ Export functionality tests
- ✅ Debug/development modes
- ✅ CI/CD ready

---

**Version:** 1.0.0  
**Commands Deployed:** 35  
**Status:** ✅ PRODUCTION READY  
**Date:** June 22, 2026

---

**Happy Testing!** 🚀
