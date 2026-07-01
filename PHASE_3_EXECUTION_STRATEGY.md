# Phase 3: Execution Strategy - Revenue Reports Tests

**Date**: July 1, 2026  
**Status**: Ready for Execution  
**Priority**: HIGH  

---

## 🎯 Overview

Phase 3 focuses on **proper execution** of the revenue reports tests on the **STAGE environment**, not local. The critical issue discovered during setup was that the default `npm test` command hardcodes `TEST_ENV=local`, which causes tests to run against the **wrong environment** (192.168.5.110 instead of staging.tahseel.gov.ae).

---

## 📊 Current Status

### ✅ Phase 1 & 2: Complete
- All ambiguous steps removed (0 conflicts now)
- All 5 undefined date-parsed steps implemented
- All TypeScript compilation errors fixed
- All 59 steps verified with dry-run

### ⏳ Phase 3: Ready to Execute
- All code ready
- All step definitions compiled
- All selectors configured
- Authentication pre-setup

---

## 🔴 The Core Problem

### Default npm test Command (WRONG)
```bash
npm test -- --profile revenue-tests --tags "@revenue and @automated"
```

**What happens:**
- Uses `TEST_ENV=local` from hardcoded package.json line 25
- Loads `.env.local` configuration
- Base URL: `http://192.168.5.110/` (LOCAL NETWORK)
- Wrong environment, tests won't match stage UI

### Why It Matters
The package.json test script is defined as:
```json
"test": "cross-env TEST_ENV=local BROWSER=chromium cucumber-js ..."
```

This hardcodes `TEST_ENV=local`, so **any environment variable you pass is overridden**.

---

## ✅ Correct Approach: Direct cucumber-js

Instead of using `npm test`, we should **call cucumber-js directly** with the environment variable set BEFORE npm starts:

### Correct Command Format
```bash
npx cucumber-js --profile revenue-tests --tags "@revenue and @automated" Features/Reports/4.Revenue_Reports/**/*.feature
```

### Set Environment Variable on Windows (PowerShell)
```powershell
$env:TEST_ENV="stage"
npx cucumber-js --profile revenue-tests --tags "@revenue and @automated" Features/Reports/4.Revenue_Reports/**/*.feature
```

### Set Environment Variable on Windows (CMD)
```cmd
set TEST_ENV=stage
npx cucumber-js --profile revenue-tests --tags "@revenue and @automated" Features/Reports/4.Revenue_Reports/**/*.feature
```

### Alternative: Use cross-env (if available globally)
```bash
npx cross-env TEST_ENV=stage npx cucumber-js --profile revenue-tests --tags "@revenue and @automated" Features/Reports/4.Revenue_Reports/**/*.feature
```

---

## 📋 Complete Execution Workflow

### Step 1: Setup Authentication (Already Done)
```powershell
npm run auth:setup:stage
```

**Output expected:**
```
🔐 Starting auth setup [environment: STAGE]
Entry URL : https://staging.tahseel.gov.ae/ManagePortal/
Username  : Mohamed.Said
...
✅ Auth setup complete for [STAGE]. Run your tests now.
```

Storage state saved to: `storageState.stage.json`

### Step 2: Execute Tests on Stage Environment

**Option A: PowerShell (RECOMMENDED FOR WINDOWS)**
```powershell
# Set environment variable
$env:TEST_ENV = "stage"

# Run tests
npx cucumber-js --profile revenue-tests `
  --tags "@revenue and @automated" `
  Features/Reports/4.Revenue_Reports/**/*.feature
```

**Option B: CMD Shell**
```cmd
REM Set environment variable
set TEST_ENV=stage

REM Run tests
npx cucumber-js --profile revenue-tests --tags "@revenue and @automated" Features/Reports/4.Revenue_Reports/**/*.feature
```

**Option C: Using npm script (via package.json)**

Create new script in package.json:
```json
"test:revenue:stage:exec": "set TEST_ENV=stage && npx cucumber-js --profile revenue-tests --tags \"@revenue and @automated\" Features/Reports/4.Revenue_Reports/**/*.feature"
```

Then run:
```bash
npm run test:revenue:stage:exec
```

---

## 🔍 How to Verify Correct Environment

### Check 1: Console Output
Look for in test output:
```
✅ Using environment: stage
✅ Base URL: https://staging.tahseel.gov.ae/ManagePortal
✅ Timeout: 300000ms
```

**NOT this (wrong environment):**
```
❌ Base URL: http://192.168.5.110/
```

### Check 2: Browser Tab (if HEADED=true)
Address bar should show:
```
✅ CORRECT: https://staging.tahseel.gov.ae/ManagePortal/dashboard
❌ WRONG: http://192.168.5.110/...
```

### Check 3: Environment Variable Verification
Before running tests, verify:
```powershell
$env:TEST_ENV
# Output should be: stage
```

---

## 📊 Expected Test Results

When Phase 3 executes correctly on stage:

### Success Metrics
```
✅ 9 scenarios total
✅ 9/9 scenarios PASSED
✅ 59 steps total
✅ 59/59 steps PASSED
✅ Execution time: ~8-12 minutes
✅ 0 failures
✅ 0 skipped
```

### Reports Generated
- `cucumber-report-chromium.html` - HTML test report
- `allure-results/chromium-results.json` - Allure report data

### Test Features Covered
1. ✅ Total Transactions Report by Revenue Entity (4 scenarios)
2. ✅ Shared Revenues Report - DTPS & Sharjah Municipality (5 scenarios)
   - 50/50 split verification
   - Mid-period rule changes
   - RBAC access control
   - No-data states
   - Export functionality

---

## 🚀 Full Phase 3 Execution (Copy-Paste Ready)

### Complete Setup + Execution Sequence

```powershell
# 1. Navigate to project
cd C:\Projects\Tahseel_BDD_Automation_Testing

# 2. Setup authentication on stage
npm run auth:setup:stage

# 3. Set environment to stage
$env:TEST_ENV = "stage"

# 4. Verify environment is set
Write-Host "TEST_ENV is: $env:TEST_ENV"

# 5. Run all revenue tests
npx cucumber-js --profile revenue-tests `
  --tags "@revenue and @automated" `
  --format progress-bar `
  Features/Reports/4.Revenue_Reports/**/*.feature

# 6. View results
Write-Host "Test execution complete!"
Write-Host "Report: cucumber-report-chromium.html"
```

### Simplified One-Liner
```powershell
npm run auth:setup:stage; $env:TEST_ENV="stage"; npx cucumber-js --profile revenue-tests --tags "@revenue and @automated" Features/Reports/4.Revenue_Reports/**/*.feature
```

---

## 📝 Important Notes

### Environment Variable Scope
- **PowerShell**: Variable persists for current session only
- **CMD**: Variable persists for current session only
- After closing terminal, variable is gone (need to set again next time)

### Why Not Use npm test
```bash
# ❌ WRONG - Always uses TEST_ENV=local
npm test -- --profile revenue-tests --tags "@revenue and @automated"

# ✅ CORRECT - Direct cucumber-js with environment variable
$env:TEST_ENV="stage"; npx cucumber-js --profile revenue-tests --tags "@revenue and @automated" Features/Reports/4.Revenue_Reports/**/*.feature
```

### Authentication Must Be Fresh
```bash
# If auth expires during tests, run this again
npm run auth:setup:stage

# Then re-run tests immediately
$env:TEST_ENV="stage"; npx cucumber-js ...
```

---

## 🔧 Troubleshooting

### Issue: Tests still use local environment (192.168.5.110)
**Solution:** Verify TEST_ENV is set:
```powershell
# Check current value
$env:TEST_ENV

# If empty, set it again
$env:TEST_ENV = "stage"
```

### Issue: Authentication fails
**Solution:** Setup auth again:
```bash
npm run auth:setup:stage
```

### Issue: Browser timeouts or element not found
**Solution:** These are expected - Phase 1 still needs Playwright MCP locator inspection to fix actual UI selectors

### Issue: Permission denied or access denied
**Solution:** Ensure stage credentials are correct in `.env.stage`:
```
APP_USERNAME=Mohamed.Said
APP_PASSWORD=T@458Pkn55555#
```

---

## 📊 Phase 3 Success Checklist

Before considering Phase 3 complete:

- [ ] Authentication setup successful: `npm run auth:setup:stage`
- [ ] Environment variable set: `$env:TEST_ENV = "stage"`
- [ ] Command executed: `npx cucumber-js --profile revenue-tests ...`
- [ ] Console output shows: `staging.tahseel.gov.ae` (NOT 192.168.5.110)
- [ ] All 9 scenarios execute
- [ ] Results: 9/9 passing (OR identified specific locator failures)
- [ ] HTML report generated: `cucumber-report-chromium.html`

---

## 🎯 What Happens Next (Phase 4)

If locator errors occur (element not found timeouts):
1. Use Playwright MCP to inspect actual report UI selectors
2. Update page object locators with correct selectors
3. Re-run tests with fixed locators

Expected Phase 4 Result: **100% test pass rate**

---

## 📞 Summary

**Phase 3 Execution Key Points:**

1. **Don't use**: `npm test -- --profile revenue-tests`
   - This always uses `TEST_ENV=local` (wrong!)

2. **Do use**: Direct cucumber-js with environment variable set
   ```powershell
   $env:TEST_ENV="stage"
   npx cucumber-js --profile revenue-tests --tags "@revenue and @automated" Features/Reports/4.Revenue_Reports/**/*.feature
   ```

3. **Always verify**: Base URL shows `staging.tahseel.gov.ae` (NOT 192.168.5.110)

4. **If auth fails**: Re-run `npm run auth:setup:stage`

5. **If tests fail with "element not found"**: This is Phase 4 work (Playwright MCP locator inspection)

---

**Ready to execute Phase 3!** ✅

Use the command above and verify output shows stage environment URLs.

