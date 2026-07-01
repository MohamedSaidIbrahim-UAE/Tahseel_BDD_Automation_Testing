# CRITICAL: Stage Environment Execution Guide

**PRIORITY**: HIGH  
**ISSUE**: Wrong environment selection  
**SOLUTION**: Use correct `cross-env TEST_ENV=stage` command  
**Impact**: Determines if tests run on stage vs local

---

## 🔴 THE PROBLEM

The default `npm test` command uses `TEST_ENV=local` which causes tests to run on:
- ❌ **Local URL**: `http://192.168.5.110/`
- ❌ **Wrong environment**: Local machine

But we need tests to run on:
- ✅ **Stage URL**: `https://staging.tahseel.gov.ae/ManagePortal`
- ✅ **Correct environment**: Stage server

---

## ✅ THE SOLUTION

### Use This Command (CORRECT)
```bash
cross-env TEST_ENV=stage npm test -- --profile revenue-tests --tags "@revenue and @automated"
```

### NOT This Command (WRONG)
```bash
npm test -- --profile revenue-tests --tags "@revenue and @automated"
```

---

## 🎯 Complete Execution Workflow

### Step 1: Setup Authentication for Stage
```bash
npm run auth:setup:stage
```

**Expected Output:**
```
✅ Authenticating on stage environment...
✅ Login successful: Mohamed.Said
✅ Authentication state saved
```

### Step 2: Run Revenue Tests on Stage
```bash
cross-env TEST_ENV=stage npm test -- --profile revenue-tests --tags "@revenue and @automated"
```

**What happens:**
1. Sets `TEST_ENV=stage` (loads .env.stage configuration)
2. Uses stage base URL: `https://staging.tahseel.gov.ae/ManagePortal`
3. Logs in with stage credentials
4. Executes all revenue test scenarios
5. Reports results

**Expected Output:**
```
✅ Using environment: stage
✅ Base URL: https://staging.tahseel.gov.ae/ManagePortal
✅ Browser: chromium

8 scenarios (8 passed)
52+ steps (52+ passed)

✅ All tests PASSED
```

---

## 📋 Environment Configuration

### .env.stage Configuration
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

### How TEST_ENV Works

```
TEST_ENV=stage  →  Loads .env.stage  →  BASE_URL=https://staging.tahseel.gov.ae/...
TEST_ENV=local  →  Loads .env.local  →  BASE_URL=http://192.168.5.110/...
```

---

## 🔍 How to Verify Correct Environment

### Check 1: Look for Stage URL in Console
```bash
# Run test with this command:
cross-env TEST_ENV=stage npm test -- --profile revenue-tests --dry-run

# Look for in output:
# ✅ CORRECT: "staging.tahseel.gov.ae"
# ❌ WRONG: "192.168.5.110"
```

### Check 2: Use Headed Browser to See URL
```bash
# Run with visible browser:
cross-env TEST_ENV=stage HEADED=true npm test -- --profile revenue-tests --tags "@revenue" --parallel 1

# In browser window, check address bar:
# ✅ CORRECT: https://staging.tahseel.gov.ae/ManagePortal
# ❌ WRONG: http://192.168.5.110/
```

### Check 3: Review Test Output
```bash
# After test completes, check reports:
# Look for: "Environment: stage"
# Look for: "Base URL: https://staging.tahseel.gov.ae"
```

---

## 💡 Why This Matters

| Factor | Local | Stage |
|--------|-------|-------|
| Environment | `TEST_ENV=local` | `TEST_ENV=stage` |
| Base URL | `http://192.168.5.110/` | `https://staging.tahseel.gov.ae/ManagePortal` |
| Database | Local test DB | Actual stage DB |
| Credentials | Local user | Mohamed.Said |
| Purpose | Development | UAT/Staging validation |
| Network | Internal only | Accessible via VPN |

**Without** `cross-env TEST_ENV=stage`: Tests run on local (wrong!)  
**With** `cross-env TEST_ENV=stage`: Tests run on stage (correct!)

---

## 📝 Reference Commands

### All Revenue Tests on Stage
```bash
cross-env TEST_ENV=stage npm test -- --profile revenue-tests --tags "@revenue and @automated"
```

### Specific Feature File on Stage
```bash
cross-env TEST_ENV=stage npm test -- --profile revenue-tests \
  Features/Reports/4.Revenue_Reports/Shared_Revenues_Report_DTPS_and_Sharjah_Municipality.feature
```

### Dry Run on Stage (Verify Steps)
```bash
cross-env TEST_ENV=stage npm test -- --profile revenue-tests --dry-run --tags "@revenue"
```

### Debug with Headed Browser on Stage
```bash
cross-env TEST_ENV=stage HEADED=true npm test -- --profile revenue-tests --tags "@revenue"
```

### All 4 Shared Revenue Reports on Stage
```bash
cross-env TEST_ENV=stage npm test -- --profile revenue-tests \
  Features/Reports/4.Revenue_Reports/Shared_Revenues_Report_DTPS_and_Sharjah_Municipality.feature \
  Features/Reports/4.Revenue_Reports/Shared_Revenues_Report_SEDD_and_SCTDA.feature \
  Features/Reports/4.Revenue_Reports/Shared_Revenues_Report_Prevention_and_Safety_Authority_and_SAND.feature \
  Features/Reports/4.Revenue_Reports/Shared_Fees_Summary_Sharjah_Municipality_and_Service_Centers.feature
```

---

## ✨ Best Practices

### ✅ DO
- ✅ Use `cross-env TEST_ENV=stage` for stage tests
- ✅ Run `npm run auth:setup:stage` first
- ✅ Verify URL shows staging.tahseel.gov.ae
- ✅ Use `--profile revenue-tests` for correct profile
- ✅ Use `--tags "@revenue and @automated"` for filtering

### ❌ DON'T
- ❌ Use `npm test` without `cross-env TEST_ENV=stage`
- ❌ Forget to setup authentication first
- ❌ Mix up local and stage commands
- ❌ Use different profiles
- ❌ Skip environment verification

---

## 🚀 Quick Copy-Paste Commands

### Setup and Run (Copy-Paste Ready)

```bash
# 1. Setup authentication
npm run auth:setup:stage

# 2. Run revenue tests on stage
cross-env TEST_ENV=stage npm test -- --profile revenue-tests --tags "@revenue and @automated"
```

Just copy and paste these commands into your terminal!

---

## 📊 Verification Checklist

Before assuming tests are running on stage, verify:

- [ ] Command includes `cross-env TEST_ENV=stage`
- [ ] Console output shows `staging.tahseel.gov.ae` URL
- [ ] Browser shows stage domain (if HEADED=true)
- [ ] Authentication was successful
- [ ] Test output references stage environment
- [ ] No references to `192.168.5.110`

---

## ⚠️ Common Mistakes

### Mistake 1: Using Wrong Command
```bash
❌ WRONG:
npm test -- --profile revenue-tests

✅ CORRECT:
cross-env TEST_ENV=stage npm test -- --profile revenue-tests
```

### Mistake 2: Missing auth setup
```bash
❌ WRONG:
# Run test without authentication

✅ CORRECT:
npm run auth:setup:stage  # First
cross-env TEST_ENV=stage npm test -- --profile revenue-tests  # Then
```

### Mistake 3: Not verifying environment
```bash
❌ WRONG:
# Run test and assume it's on stage

✅ CORRECT:
# Run test and verify output shows:
# - "staging.tahseel.gov.ae"
# - "Environment: stage"
# - NOT "192.168.5.110"
```

---

## 🎯 Summary

### The Critical Difference

```
WITHOUT cross-env TEST_ENV=stage:
  npm test -- --profile revenue-tests
  ↓
  Uses: http://192.168.5.110/
  Environment: LOCAL (WRONG!)

WITH cross-env TEST_ENV=stage:
  cross-env TEST_ENV=stage npm test -- --profile revenue-tests
  ↓
  Uses: https://staging.tahseel.gov.ae/ManagePortal
  Environment: STAGE (CORRECT!)
```

---

## 🔑 Remember

**Always use this command for stage testing:**

```bash
cross-env TEST_ENV=stage npm test -- --profile revenue-tests --tags "@revenue and @automated"
```

**Never use this for stage testing:**

```bash
npm test -- --profile revenue-tests  # ❌ USES LOCAL!
```

---

## 📞 Troubleshooting

### Tests show local URL (192.168.5.110)
**Solution**: Add `cross-env TEST_ENV=stage` prefix

### Tests fail to authenticate
**Solution**: Run `npm run auth:setup:stage` first

### Browser shows wrong URL
**Solution**: Verify command includes `cross-env TEST_ENV=stage`

### Credentials rejected
**Solution**: Check .env.stage has correct credentials

---

## ✅ Final Confirmation

Before running tests, confirm:

1. ✅ Running: `npm run auth:setup:stage`
2. ✅ Command includes: `cross-env TEST_ENV=stage`
3. ✅ Base URL in config: `https://staging.tahseel.gov.ae/ManagePortal`
4. ✅ Credentials: Mohamed.Said configured
5. ✅ Expected output: Shows "staging.tahseel.gov.ae"

---

**READY TO EXECUTE ON STAGE** ✅

```bash
npm run auth:setup:stage && \
cross-env TEST_ENV=stage npm test -- --profile revenue-tests --tags "@revenue and @automated"
```

This will run all revenue tests on the STAGE environment!
