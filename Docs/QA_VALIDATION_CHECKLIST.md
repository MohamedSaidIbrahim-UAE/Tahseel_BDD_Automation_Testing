# QA Validation Checklist - Revenue Reports Tests

**Date**: June 29, 2026  
**For**: QA Team with Playwright Environment Access  
**Estimated Time**: 1-2 hours

---

## ✅ PRE-VALIDATION

- [ ] Read PLAYWRIGHT_INSPECTOR_GUIDE.md
- [ ] Confirm Playwright MCP access available
- [ ] Confirm Tahseel app access in test environment
- [ ] Confirm reports available in application

---

## 🔍 VALIDATION TASKS

### Task 1: Inspect Report Page Elements (30 minutes)

#### 1.1 Navigate to Shared Revenues Report
- [ ] Use `mcp_playwright_navigate` to: `/reports/shared-revenues`
- [ ] Take screenshot with `mcp_playwright_take_screenshot`
- [ ] Verify page loads (no errors visible)

#### 1.2 Inspect Report Grid/Table
- [ ] Use `mcp_playwright_get_page_content`
- [ ] Search HTML for: `dx-data-grid`, `table role="grid"`, `role="grid"`
- [ ] Document actual element found
- [ ] Note: We expect `dx-data-grid` (DevExtreme)

**Expected Finding**: `<dx-data-grid ...></dx-data-grid>`  
**If Different**: Document the actual element tag and attributes

#### 1.3 Inspect Show Report Button
- [ ] Search HTML for buttons with type="submit"
- [ ] Look for button text: "Show Report", "Display", "Search"
- [ ] Check aria-label and class attributes
- [ ] Document which selector would work best

**Expected Finding**: `<button type="submit">Show Report</button>` or similar  
**If Different**: Document the actual button structure

#### 1.4 Inspect Date Inputs
- [ ] Look for `<input type="date">` elements
- [ ] Check aria-label, placeholder, name, id attributes
- [ ] Verify there are at least 2 date inputs (From, To)
- [ ] Document exact attributes

**Expected Finding**: `<input type="date" aria-label="From Date">` (or similar)  
**If Different**: Document the actual input structure

#### 1.5 Inspect Filter Dropdowns
- [ ] Look for Entity and Service dropdowns
- [ ] Check for `<select>`, `<dx-select-box>`, or `<div role="combobox">`
- [ ] Document actual dropdown implementation

**Expected Finding**: `<dx-select-box aria-label="Entity">` (DevExtreme)  
**If Different**: Document the actual dropdown structure

---

### Task 2: Test Selector Functionality (20 minutes)

#### 2.1 Test Report Table Selector
```
Selector to Test: dx-data-grid
Method: mcp_playwright_get_text
Expected: No error, element found
```
- [ ] Execute and document result
- [ ] If PASS: Selector works ✅
- [ ] If FAIL: Try `table[role="grid"]`, `table`, then document

#### 2.2 Test Show Report Button Selector
```
Selector to Test: button[type="submit"]
Method: mcp_playwright_click
Expected: Button clicked successfully
```
- [ ] Execute and document result
- [ ] If PASS: Selector works ✅
- [ ] If FAIL: Try alternatives from guide, document which works

#### 2.3 Test From Date Selector
```
Selector to Test: input[type="date"]:first-of-type
Method: mcp_playwright_get_text
Expected: Element found
```
- [ ] Execute and document result
- [ ] If PASS: Selector works ✅
- [ ] If FAIL: Document actual date input selector found

#### 2.4 Test To Date Selector
```
Selector to Test: input[type="date"]:last-of-type
Method: mcp_playwright_get_text
Expected: Element found
```
- [ ] Execute and document result
- [ ] If PASS: Selector works ✅
- [ ] If FAIL: Document actual date input selector found

---

### Task 3: Run Test Suite (30 minutes)

#### 3.1 Execute Shared Revenues Tests
```bash
npm run test:reports -- shared-revenues
```
- [ ] Tests execute without hanging
- [ ] All 5 scenarios from Shared_Revenues_Report_DTPS_and_Sharjah_Municipality.feature
- [ ] Check for timeout errors (should be resolved)
- [ ] Document any failures

#### 3.2 Execute Total Transactions Tests
```bash
npm run test:reports -- total-transactions
```
- [ ] Tests execute without hanging
- [ ] Check for timeout errors (should be resolved)
- [ ] Document any failures

#### 3.3 Execute All Revenue Report Tests
```bash
npm run test:reports
```
- [ ] All 8 scenarios execute
- [ ] No more than 0 failures expected (all should pass)
- [ ] Document any failures with error messages

---

## 📊 RESULTS DOCUMENTATION

### Selector Validation Results

Use this table to document findings:

| Element | Expected Selector | Actual Selector Found | Status | Notes |
|---------|------------------|----------------------|--------|-------|
| Report Grid | `dx-data-grid` | _______________ | ✅/❌ | |
| Show Button | `button[type="submit"]` | _______________ | ✅/❌ | |
| From Date | `input[type="date"]:first` | _______________ | ✅/❌ | |
| To Date | `input[type="date"]:last` | _______________ | ✅/❌ | |
| Entity Filter | `dx-select-box[aria-label*="Entity"]` | _______________ | ✅/❌ | |
| Service Filter | `dx-select-box[aria-label*="Service"]` | _______________ | ✅/❌ | |

### Test Execution Results

```
Total Scenarios: 8
Expected Status: 8/8 PASS (0 failures)

Actual Results:
- Shared Revenues (5 scenarios): ___/5 PASS
- Total Transactions (3 scenarios): ___/3 PASS
- Total: ___/8 PASS

Timeout Errors: _____ (should be 0)
Undefined Steps: _____ (should be 0)
Other Failures: _____ (should be 0)
```

### Selector Adjustments Made

```
If selectors needed adjustment, document below:

1. Element: _____________
   Original Selector: _____________
   Updated Selector: _____________
   Reason: _____________

2. Element: _____________
   Original Selector: _____________
   Updated Selector: _____________
   Reason: _____________
```

---

## ✅ SUCCESS CRITERIA

### Minimum Requirements
- [ ] 0 timeout errors
- [ ] 0 "Element not found" errors
- [ ] 0 ambiguous step errors
- [ ] All 8 scenarios execute

### Full Success
- [ ] 8/8 scenarios PASS
- [ ] 52/52 steps execute successfully
- [ ] 0 failures of any kind
- [ ] Report page loads correctly
- [ ] Data displays as expected

---

## 🆘 TROUBLESHOOTING

### If Tests Still Timeout

**Check**:
1. Is the report page actually loading?
2. Is there a loading spinner that doesn't disappear?
3. Is JavaScript throwing errors on the page?
4. Does the app require additional authentication?

**Action**:
- Use `mcp_playwright_take_screenshot` to see current state
- Check browser console for errors with `mcp_playwright_get_page_content`
- Wait longer and check if page eventually loads
- Verify test data exists in database

### If Selectors Don't Match

**Most Likely Reasons**:
1. DevExtreme version difference - grid looks different
2. Custom styling changes element structure
3. Different page implementation than expected

**Action**:
1. Use browser DevTools to inspect elements directly
2. Document exact HTML structure found
3. Search for common patterns: class names, data attributes
4. Report findings in selector adjustment section

### If Only Some Scenarios Fail

**Check**:
1. Which scenarios fail? (record scenario names)
2. Do they use same report page?
3. Common failure point?

**Action**:
1. Run each scenario individually
2. Compare passing vs failing test flows
3. Identify specific step that times out
4. Check if that step uses different selector

---

## 📝 FINAL REPORT

After completing validation, fill in:

**Summary**:
```
Date Tested: _______________
Tester Name: _______________
Environment: _______________
Test Duration: _______________ minutes

Results:
- Scenarios Passing: ___/8
- Selectors Working: ___/6
- No Timeout Errors: ✅/❌
- Overall Status: READY FOR PRODUCTION / NEEDS ADJUSTMENT
```

**Recommendations**:
```
If all tests pass, no changes needed.

If changes needed:
1. List each selector that needed adjustment
2. Provide the corrected selector
3. Explain why original didn't work
4. Estimate impact (high/medium/low risk)

New Selectors to Update:
- _______________
- _______________
- _______________
```

**Sign-Off**:
```
QA Tester: _________________ Date: _________
Approved By: _________________ Date: _________
```

---

## 📞 SUPPORT

If issues arise:

1. **Check Docs**
   - Read PLAYWRIGHT_INSPECTOR_GUIDE.md
   - Review REVENUE_TESTS_PHASE_3_COMPLETION.md

2. **Check Code**
   - Page objects: `src/pages/reports/*.page.ts`
   - Step implementations: `src/steps/reports/*.steps.ts`

3. **Common Selectors Reference**
   - DevExtreme grid: `dx-data-grid`
   - Submit button: `button[type="submit"]`
   - Date inputs: `input[type="date"]`
   - Data fields: `[data-field="..."]`

---

## 🎯 NEXT STEPS

**If ALL Tests Pass** ✅:
1. Update WORK_COMPLETED_SUMMARY.md with results
2. Mark Phase 3 as complete
3. Move to Phase 4: Full Integration Testing
4. Deploy to production after approval

**If Some Tests Fail** ⚠️:
1. Document failures in "Results Documentation"
2. Identify root cause (selector, app behavior, etc.)
3. Update selectors if needed
4. Re-run tests to verify fix
5. Report adjustments needed

**If Major Issues** ❌:
1. Contact development team
2. Share detailed findings
3. Attach screenshots
4. Provide specific error messages
5. Re-evaluate strategy if needed

---

**Duration**: 1-2 hours  
**Complexity**: Medium  
**Risk Level**: Low (read-only validation)  
**Status**: READY FOR QA EXECUTION

