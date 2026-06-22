# Revenue Reports Test Commands Guide

**Professional Testing Commands for Revenue Reports Automation Framework**

---

## 🎯 Quick Start Commands

### Run All Revenue Reports (Default - Stage Environment)
```bash
npm run test:revenue:all
# Runs ALL @revenue and @automated scenarios on Stage
```

### Run Single Revenue Report
```bash
# Total Transactions Report
npm run test:revenue:total-transactions

# Detailed Transactions Report  
npm run test:revenue:detailed-transactions

# Shared Revenues - DTPS & Sharjah (50/50)
npm run test:revenue:shared-dtps
```

### Run Complete Suite with Authentication Setup
```bash
# Full setup + run all revenue tests
npm run test:revenue:complete

# Headed mode (watch browser)
npm run test:revenue:complete:headed

# Cross-browser testing
npm run test:revenue:complete:cross-browser
```

---

## 📊 Test Categories

### By Report Type
```bash
# All Summary Reports
npm run test:revenue:summary

# All Revenue Splitting Reports
npm run test:revenue:split

# All RBAC/Role-Based Access Tests
npm run test:revenue:rbac

# All Export Tests (PDF/Excel)
npm run test:revenue:export
```

### By Split Percentage
```bash
# 50/50 Split - DTPS & Sharjah Municipality
npm run test:revenue:50-50

# 60/40 Split - SEDD & SCTDA  
npm run test:revenue:60-40

# 70/30 Split - Prevention & Safety Authority & SAND
npm run test:revenue:70-30

# 80/20 Split - Sharjah Municipality & Service Centers
npm run test:revenue:80-20
```

---

## 🌍 Environment-Specific Testing

### Stage Environment (Recommended for Testing)
```bash
# Headless (default)
npm run test:revenue:stage

# Headed (watch browser)
npm run test:revenue:stage:headed

# Firefox browser
npm run test:revenue:stage:firefox

# Webkit browser (Safari)
npm run test:revenue:stage:webkit
```

### Local Environment (Development)
```bash
# Headless (local environment)
npm run test:revenue:local

# Headed (watch browser)
npm run test:revenue:local:headed

# Firefox (local)
npm run test:revenue:local:firefox

# Webkit (local)
npm run test:revenue:local:webkit
```

---

## ⚡ Performance & Parallel Testing

### Parallel Execution
```bash
# Run 2 scenarios in parallel
npm run test:revenue:parallel

# Run 4 scenarios in parallel (fastest)
npm run test:revenue:parallel:4
```

### Quick Run (Positive Scenarios Only)
```bash
# Quick positive E2E tests only
npm run test:revenue:quick

# Quick tests with visible browser
npm run test:revenue:quick:headed
```

---

## 🔍 Debug & Development

### Debug Mode
```bash
# Debug with PWDEBUG=1 (Playwright Inspector)
npm run test:revenue:debug
```

### Verbose Output
```bash
# JSON + Progress bar output
npm run test:revenue:verbose
```

### Dry Run (Check Step Definitions)
```bash
# No execution, just check step definitions
npm run test:revenue:dry-run
```

---

## 📈 Reporting & Output

### Generate Test Reports
```bash
# HTML + JSON reports
npm run test:revenue:report

# Allure-compatible results
npm run test:revenue:report:allure
```

### Example Commands for Common Use Cases
```bash
# Test revenue splitting feature
npm run test:revenue:example:split

# Test RBAC (role-based access control)
npm run test:revenue:example:rbac

# Test export functionality
npm run test:revenue:example:export
```

---

## 🎯 Common Workflows

### 1. **Development Workflow**
```bash
# 1. Setup authentication
npm run auth:setup-stage

# 2. Run single report for development
npm run test:revenue:detailed-transactions

# 3. If browser issues, run headed
npm run test:revenue:stage:headed
```

### 2. **QA Testing Workflow**
```bash
# 1. Complete setup + run all tests
npm run test:revenue:complete

# 2. Generate detailed reports
npm run test:revenue:report

# 3. Cross-browser verification
npm run test:revenue:complete:cross-browser
```

### 3. **Regression Testing Workflow**
```bash
# 1. Run all revenue tests
npm run test:revenue:all

# 2. Run in parallel for speed
npm run test:revenue:parallel:4

# 3. Generate allure reports
npm run test:revenue:report:allure
```

### 4. **Pre-Deployment Verification**
```bash
# 1. Complete cross-browser testing
npm run test:revenue:complete:cross-browser

# 2. Generate comprehensive reports
npm run test:revenue:report
```

---

## 📊 Tag-Based Filtering

Our revenue reports use structured tags for precise testing:

### Primary Tags
- `@revenue` - All revenue-related tests
- `@automated` - Automated in Phase 1-2
- `@split` - Revenue splitting tests
- `@rbac` - Role-based access control
- `@export` - Export functionality tests
- `@e2e` - End-to-end positive scenarios
- `@negative` - Edge cases and error handling

### Combined Tags for Precision
```bash
# Run only positive E2E revenue tests
npm run test:revenue:quick  # Uses: @revenue @e2e @positive @automated

# Run only negative/RBAC tests
npm run test:revenue:rbac   # Uses: @revenue @rbac @automated

# Run only split tests (no negative)
npm run test:revenue:50-50  # Uses: @revenue @split @automated and not @negative
```

---

## 🔧 Advanced Usage

### Custom Tag Filtering
```bash
# Custom tag combination (example)
cross-env TEST_ENV=stage BROWSER=chromium cucumber-js --profile chromium --tags "@revenue and @automated and @positive and not @skip" Features/Reports/4.Revenue_Reports/**/*.feature
```

### Custom Environment Variables
```bash
# Set custom environment variables
TEST_ENV=stage HEADED=true DEBUG=true BROWSER=chromium npm run test:revenue:all
```

### Specific Feature File Testing
```bash
# Test specific feature file directly
cross-env TEST_ENV=stage BROWSER=chromium cucumber-js --profile chromium Features/Reports/4.Revenue_Reports/Detailed_Transactions_Report_by_Revenue_Entity.feature
```

---

## 🚀 Command Reference Table

| Command | Description | Environment | Browser | Key Tags |
|---------|-------------|-------------|---------|----------|
| `test:revenue:all` | All revenue reports | Stage | Chromium | `@revenue @automated` |
| `test:revenue:summary` | Summary reports | Stage | Chromium | `@revenue @e2e @automated` |
| `test:revenue:split` | Split validation tests | Stage | Chromium | `@revenue @split @automated` |
| `test:revenue:rbac` | RBAC tests | Stage | Chromium | `@revenue @rbac @automated` |
| `test:revenue:export` | Export tests | Stage | Chromium | `@revenue @export @automated` |
| `test:revenue:stage:headed` | Headed mode | Stage | Chromium | `@revenue @automated` |
| `test:revenue:parallel:4` | Parallel execution | Stage | Chromium | `@revenue @automated` |
| `test:revenue:complete` | Full setup + tests | Stage | Chromium | `@revenue @automated` |
| `test:revenue:50-50` | 50/50 split tests | Stage | Chromium | `@revenue @split @automated` |
| `test:revenue:debug` | Debug mode | Stage | Chromium | `@revenue @debug` |

---

## ⚠️ Troubleshooting

### Common Issues & Solutions

#### 1. Authentication Issues
```bash
# Ensure auth is set up before running tests
npm run auth:setup-stage

# If auth fails, check auth logs in scripts/auth-setup.ts
npm run auth:setup-stage -- --verbose
```

#### 2. Browser Launch Issues
```bash
# Try headed mode to see what's happening
npm run test:revenue:stage:headed

# Try different browser
npm run test:revenue:stage:firefox

# Install missing browsers
npx playwright install chromium firefox webkit
```

#### 3. Test Timeout Issues
```bash
# Use parallel execution for speed
npm run test:revenue:parallel:4

# Check for network issues in stage environment
ping staging.tahseel.gov.ae
```

#### 4. Step Definition Issues
```bash
# Dry run to check step definitions
npm run test:revenue:dry-run

# Check for undefined steps in output
npm run test:revenue:verbose
```

---

## 📁 File Structure Reference

```
Features/Reports/4.Revenue_Reports/
├── Total_Transactions_Report_by_Revenue_Entity.feature
├── Detailed_Transactions_Report_by_Revenue_Entity.feature
├── Shared_Revenues_Report_DTPS_and_Sharjah_Municipality.feature
├── Shared_Revenues_Report_SEDD_and_SCTDA.feature
├── Shared_Revenues_Report_Prevention_and_Safety_Authority_and_SAND.feature
├── Shared_Fees_Summary_Sharjah_Municipality_and_Service_Centers.feature
└── 8 other report features (Phase 3-4)
```

---

## 🔗 Related Commands

### Authentication Commands
```bash
# Stage environment auth
npm run auth:setup-stage

# Local environment auth
npm run auth:setup:local

# Test authentication
npm run auth:test:stage
```

### General Testing Commands
```bash
# All tests (not just revenue)
npm run test:all-local

# Generate reports
npm run test:report

# Clean test artifacts
npm run test:clean
```

---

## ✅ Best Practices

### 1. **Always Use Environment-Specific Commands**
```bash
# ✅ Good - Stage environment
npm run test:revenue:stage

# ❌ Avoid - Default may be local
npm run test:revenue:all  # Uses Stage (good)
```

### 2. **Use Parallel Execution for Speed**
```bash
# ✅ Good for regression testing
npm run test:revenue:parallel:4

# ❌ Single execution for debugging only
npm run test:revenue:stage
```

### 3. **Generate Reports for CI/CD**
```bash
# ✅ Good for CI/CD pipelines
npm run test:revenue:report:allure

# ✅ Combine with setup
npm run auth:setup-stage && npm run test:revenue:report
```

### 4. **Test Different Browsers**
```bash
# ✅ Cross-browser testing
npm run test:revenue:complete:cross-browser

# ✅ Individual browser tests
npm run test:revenue:stage:firefox
npm run test:revenue:stage:webkit
```

---

## 📞 Support

### Quick Help
```bash
# Show all available commands
npm run | grep "revenue"

# Check command definitions
cat package.json | grep -A2 -B2 "test:revenue:"
```

### Documentation
- **This Guide:** Complete command reference
- **Quick Reference:** `REVENUE_REPORTS_QUICK_REFERENCE.md`
- **Implementation Guide:** `IMPLEMENTATION_SUMMARY_REVENUE_REPORTS.md`
- **Upgrade Guide:** `REVENUE_REPORTS_AUTOMATION_UPGRADE.md`

### Getting Help
1. Check the browser console for errors
2. Run with `--verbose` flag for detailed output
3. Use `npm run test:revenue:dry-run` to check steps
4. Review step definitions in `src/steps/reports/`

---

## 🎉 Ready to Test?

### Start Here:
```bash
# Complete testing workflow
npm run test:revenue:complete

# Quick verification
npm run test:revenue:quick

# Generate reports
npm run test:revenue:report
```

---

**Happy Testing!** 🚀

**Framework Version:** 1.0.0  
**Last Updated:** June 22, 2026  
**Commands Available:** 25+ professional revenue report testing commands
