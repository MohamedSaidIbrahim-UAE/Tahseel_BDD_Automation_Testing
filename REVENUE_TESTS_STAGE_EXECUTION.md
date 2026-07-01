# Revenue Reports Tests - Stage Environment Execution

**Environment**: Stage (`https://staging.tahseel.gov.ae/ManagePortal`)  
**Status**: ✅ Ready to Execute  
**Focus**: Correct TEST_ENV setup for stage environment

---

## ⚠️ Important: Correct Environment Setup

### The Problem
```bash
# ❌ WRONG - Uses local environment (http://192.168.5.110/)
npm test -- --profile revenue-tests --tags "@revenue and @automated"

# ✅ CORRECT - Uses stage environment
cross-env TEST_ENV=stage npm test -- --profile revenue-tests --tags "@revenue and @automated"
```

The default `npm test` script has `TEST_ENV=local` hardcoded. We must override it with `cross-env TEST_ENV=stage`.

---

## 🚀 Correct Commands for Stage Environment

### 1. Setup Authentication (First Time Only)

```bash
npm run auth:setup:stage
```

This command already has `TEST_ENV=stage` built in.

### 2. Run Revenue Tests on Stage

```bash
cross-env TEST_ENV=stage npm test -- --profile revenue-tests --tags "@revenue and @automated"
```

**What this does:**
- Sets `TEST_ENV=stage` (uses .env.stage configuration)
- Base URL: `https://staging.tahseel.gov.ae/ManagePortal`
- Browser: Chromium
- Profile: revenue-tests
- Tags: @revenue and @automated
- Executes all shared revenue report scenarios

### 3. Run Specific Feature File on Stage

```bash
cross-env TEST_ENV=stage npm test -- --profile revenue-tests \
  Features/Reports/4.Revenue_Reports/Shared_Revenues_Report_DTPS_and_Sharjah_Municipality.feature
```

### 4. Dry Run (Verify Steps) on Stage

```bash
cross-env TEST_ENV=stage npm test -- --profile revenue-tests --dry-run --tags "@revenue"
```

### 5. Run with Headed Browser on Stage (Debug)

```bash
cross-env TEST_ENV=stage HEADED=true npm test -- --profile revenue-tests --tags "@revenue"
```

---

## 📋 Environment Configuration Verification

### Check .env.stage Configuration

```bash
cat .env.stage
```

**Expected Output:**
```
BASE_URL=https://staging.tahseel.gov.ae/ManagePortal
BROWSER=chromium
TIMEOUT=300000
NAVIGATION_TIMEOUT=60000
ACTION_TIMEOUT=30000
WAIT_FOR_TIMEOUT=45000
MAX_RETRIES=3
RETRY_DELAY=5000
APP_USERNAME=Mohamed.Said
APP_PASSWORD=T@458Pkn55555#
```

### Verify TEST_ENV is Set Correctly

On Windows PowerShell:
```powershell
$env:TEST_ENV='stage'
$env:TEST_ENV  # Should output: stage
```

On Linux/Mac:
```bash
export TEST_ENV='stage'
echo $TEST_ENV  # Should output: stage
```

---

## ✅ Execution Workflow

### Step 1: Authenticate for Stage
```bash
npm run auth:setup:stage
```
**Output**: Logs in with stage credentials, saves authentication state

### Step 2: Run Revenue Tests
```bash
cross-env TEST_ENV=stage npm test -- --profile revenue-tests --tags "@revenue and @automated"
```
**Output**:
```
8 scenarios (8 passed)
52+ steps (52+ passed)
Execution time: 5-10 minutes
```

### Step 3: Review Results
- ✅ All tests should pass
- ✅ All steps should execute successfully
- ✅ Base URL should be: `https://staging.tahseel.gov.ae/ManagePortal`

---

## 🔍 Verify Correct Environment

### Method 1: Check Base URL in Test Output
```bash
# Run test and look for navigation logs
cross-env TEST_ENV=stage npm test -- --profile revenue-tests --dry-run

# Look for: "staging.tahseel.gov.ae" in output
# NOT: "192.168.5.110"
```

### Method 2: Check Environment Variables During Test
The test logs will show:
```
📊 Environment: stage
🌐 Base URL: https://staging.tahseel.gov.ae/ManagePortal
🔐 Timeout: 300000ms
```

### Method 3: Verify in Browser DevTools
If running with `HEADED=true`:
- Check URL bar in browser
- Should show: `https://staging.tahseel.gov.ae/ManagePortal/...`
- NOT: `http://192.168.5.110/...`

---

## 📝 Complete Stage Test Suite Commands

### Full Revenue Reports Test Suite
```bash
# Setup
npm run auth:setup:stage

# Run all revenue tests
cross-env TEST_ENV=stage npm test -- --profile revenue-tests --tags "@revenue and @automated"

# Run all 4 shared revenue report types
cross-env TEST_ENV=stage npm test -- --profile revenue-tests \
  Features/Reports/4.Revenue_Reports/Shared_Revenues_Report_DTPS_and_Sharjah_Municipality.feature \
  Features/Reports/4.Revenue_Reports/Shared_Revenues_Report_SEDD_and_SCTDA.feature \
  Features/Reports/4.Revenue_Reports/Shared_Revenues_Report_Prevention_and_Safety_Authority_and_SAND.feature \
  Features/Reports/4.Revenue_Reports/Shared_Fees_Summary_Sharjah_Municipality_and_Service_Centers.feature
```

### Individual Feature File
```bash
# DTPS & Sharjah Municipality
cross-env TEST_ENV=stage npm test -- --profile revenue-tests \
  Features/Reports/4.Revenue_Reports/Shared_Revenues_Report_DTPS_and_Sharjah_Municipality.feature

# SEDD & SCTDA
cross-env TEST_ENV=stage npm test -- --profile revenue-tests \
  Features/Reports/4.Revenue_Reports/Shared_Revenues_Report_SEDD_and_SCTDA.feature

# Safety & SAND
cross-env TEST_ENV=stage npm test -- --profile revenue-tests \
  Features/Reports/4.Revenue_Reports/Shared_Revenues_Report_Prevention_and_Safety_Authority_and_SAND.feature

# Municipality & Centers
cross-env TEST_ENV=stage npm test -- --profile revenue-tests \
  Features/Reports/4.Revenue_Reports/Shared_Fees_Summary_Sharjah_Municipality_and_Service_Centers.feature
```

### Dry Run to Verify Steps
```bash
cross-env TEST_ENV=stage npm test -- --profile revenue-tests --dry-run --tags "@revenue"
```

### Debug with Headed Browser
```bash
cross-env TEST_ENV=stage HEADED=true npm test -- --profile revenue-tests --tags "@revenue"
```

---

## ❌ Common Mistakes to Avoid

### ❌ WRONG: Missing cross-env
```bash
TEST_ENV=stage npm test -- --profile revenue-tests
# This won't work on Windows - use cross-env!
```

### ✅ CORRECT: With cross-env
```bash
cross-env TEST_ENV=stage npm test -- --profile revenue-tests
# Works on all platforms (Windows, Mac, Linux)
```

### ❌ WRONG: Using local environment
```bash
npm test -- --profile revenue-tests --tags "@revenue"
# This uses TEST_ENV=local (from package.json default)
# Base URL: http://192.168.5.110/
# NOT what we want!
```

### ✅ CORRECT: Explicit stage environment
```bash
cross-env TEST_ENV=stage npm test -- --profile revenue-tests --tags "@revenue"
# This uses TEST_ENV=stage
# Base URL: https://staging.tahseel.gov.ae/ManagePortal
# Correct!
```

### ❌ WRONG: npm run test command
```bash
npm run test -- --profile revenue-tests
# npm run test has TEST_ENV=local hardcoded
```

### ✅ CORRECT: Direct npm test with cross-env
```bash
cross-env TEST_ENV=stage npm test -- --profile revenue-tests
# Overrides the hardcoded TEST_ENV=local
```

---

## 🎯 Quick Reference

### Setup & Run (Complete)
```bash
# 1. Setup authentication
npm run auth:setup:stage

# 2. Run all revenue tests on stage
cross-env TEST_ENV=stage npm test -- --profile revenue-tests --tags "@revenue and @automated"

# 3. Check results
# Expected: ✅ All tests pass
```

### Key Command
```bash
cross-env TEST_ENV=stage npm test -- --profile revenue-tests --tags "@revenue and @automated"
```

### Key Components
| Component | Value | Location |
|-----------|-------|----------|
| Environment override | `cross-env TEST_ENV=stage` | Command prefix |
| Test command | `npm test` | Package.json |
| Profile | `--profile revenue-tests` | cucumber.js |
| Tags | `--tags "@revenue and @automated"` | Feature files |
| Base URL | `https://staging.tahseel.gov.ae/ManagePortal` | .env.stage |

---

## 📊 Expected Environment Configuration

When running with `cross-env TEST_ENV=stage`:

```
✅ BASE_URL: https://staging.tahseel.gov.ae/ManagePortal
✅ BROWSER: chromium
✅ USERNAME: Mohamed.Said
✅ PASSWORD: T@458Pkn55555# (configured)
✅ TIMEOUT: 300000ms
✅ NAVIGATION_TIMEOUT: 60000ms
✅ ACTION_TIMEOUT: 30000ms
✅ MAX_RETRIES: 3
```

---

## ✨ Verification Checklist

Before running tests:

- ✅ Have you run `npm run auth:setup:stage`?
- ✅ Are you using `cross-env TEST_ENV=stage`?
- ✅ Is your command: `cross-env TEST_ENV=stage npm test -- --profile revenue-tests`?
- ✅ Does your .env.stage have correct BASE_URL?
- ✅ Are credentials configured in .env.stage?

All checked? Ready to run! ✅

---

## 🚀 Final Commands

### To Execute Revenue Tests on Stage Environment

```bash
# 1. First time setup
npm run auth:setup:stage

# 2. Run tests
cross-env TEST_ENV=stage npm test -- --profile revenue-tests --tags "@revenue and @automated"
```

That's it! The tests will now run against:
- ✅ Stage environment: `https://staging.tahseel.gov.ae/ManagePortal`
- ✅ All 8 shared revenue report scenarios
- ✅ All 52+ steps
- ✅ Expected: All passing

---

**Key Takeaway**: Always use `cross-env TEST_ENV=stage` before `npm test` to override the default local environment!

```bash
✅ CORRECT: cross-env TEST_ENV=stage npm test -- --profile revenue-tests
❌ WRONG: npm test -- --profile revenue-tests
```
