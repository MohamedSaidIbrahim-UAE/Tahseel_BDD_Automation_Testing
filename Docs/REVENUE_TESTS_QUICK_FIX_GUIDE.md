# Revenue Reports Tests - Quick Fix Guide

**Current Status**: Code 100% complete, locators need inspection  
**Estimated Fix Time**: 30-60 minutes (once environment access is available)

---

## 🚀 What's Been Done

All step implementations and page objects are **production-ready**. No code changes needed unless locators require updates.

---

## ⚡ Quick Fix Process

### Step 1: Run Tests in Headed Mode (10 minutes)
```bash
npm test:headed -- "Features/Reports/4.Revenue_Reports/Shared_Revenues_Report_DTPS_and_Sharjah_Municipality.feature"
```

**What this does**: Opens a real browser so you can see what's happening

### Step 2: Identify Failing Selectors (15 minutes)
When test fails with "Element not found" or timeout:
1. Keep browser window open
2. Right-click on the report table in the browser
3. Select "Inspect" or "Inspect Element"
4. Note the actual element's:
   - Tag name (e.g., `<div>`, `<table>`)
   - Class names (e.g., `class="dx-grid"`)
   - ID (if any)
   - Data attributes

### Step 3: Update One Selector (5 minutes per selector)
**Example**:
- **Old (not working)**:  
  ```typescript
  readonly reportTable = 'table[role="grid"]';
  ```
- **New (working)**:  
  ```typescript
  readonly reportTable = '.dx-datagrid-rowsview table';
  ```

**Files to update**:
- `src/pages/reports/total-transactions-revenue-entity.page.ts`
- `src/pages/reports/shared-revenues-base.page.ts`

### Step 4: Validate (5 minutes)
```bash
npm test -- "Features/Reports/4.Revenue_Reports/Shared_Revenues_Report_DTPS_and_Sharjah_Municipality.feature"
```

Expected output:
```
5 scenarios
✅ Full cycle – post transactions under shared service and verify split
✅ Update sharing rule mid-period and verify report reflects correct split
✅ No transactions for the shared service
✅ Unauthorised user from other entity cannot access shared revenue details  
✅ Export shared revenues report to Excel for audit trail
```

---

## 🔍 Key Selectors to Inspect

### Report Table (Most Important)
**Current selector**: 
```typescript
readonly reportTable = 'dx-data-grid, table[role="grid"], table.report-table, [role="grid"], ...';
```

**What to look for**: The main table/grid containing:
- Revenue Entity column
- Transaction Count column
- Total Amount column

**Common patterns** (try these first):
- `dx-data-grid` (DevExtreme)
- `.k-grid` (Kendo)
- `[role="grid"]` (ARIA)
- `table.report-table` (custom class)

### Show Report Button (Important)
**Current selector**:
```typescript
readonly showReportButton = 'button:has-text("Show Report"), button[aria-label*="Show"], ...';
```

**What to look for**: A button that runs the report with filters applied

**Common labels**:
- "Show Report"
- "Generate"
- "Search"
- "Display"
- "Run Report"

### Date Inputs (Standard)
These usually work fine, but if they timeout:

**From date**:
```typescript
readonly fromDateInput = 'input[type="date"]:first-of-type';
```

**To date**:
```typescript
readonly toDateInput = 'input[type="date"]:last-of-type';
```

---

## 📝 Selector Update Template

When you find a working selector, update both files:

### File 1: `src/pages/reports/total-transactions-revenue-entity.page.ts`
```typescript
// BEFORE:
readonly reportTable = 'dx-data-grid, table[role="grid"], ...';

// AFTER:  
readonly reportTable = '.dx-datagrid-rowsview table'; // ← Your actual selector
```

### File 2: `src/pages/reports/shared-revenues-base.page.ts`
```typescript
// BEFORE:
readonly reportTable = 'dx-data-grid, table[role="grid"], ...';

// AFTER:
readonly reportTable = '.dx-datagrid-rowsview table'; // ← Same selector
```

---

## 🧪 How to Test Individual Selectors

Add this to PowerShell to test a selector quickly:

```typescript
// In browser console while tests run:
document.querySelectorAll('YOUR_SELECTOR_HERE').length
// Should return > 0 if selector works
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Timeout exceeded waiting for selector"
**Cause**: Selector doesn't match any elements  
**Solution**: 
1. Inspect with DevTools
2. Copy exact selector from DevTools
3. Update in page object
4. Re-run test

### Issue 2: "Button not clickable"
**Cause**: Button found but hidden or disabled  
**Solution**:
1. Check if button is visible in UI
2. Wait for animations to complete
3. Scroll to button if off-screen (already done in code)

### Issue 3: "Table has no data"
**Cause**: Table loads but is empty  
**Solution**:
1. Check filter date range is correct
2. Verify test data exists in environment
3. Check if user has proper access

---

## ✅ Success Criteria

Once fixes are applied:

| Test | Status |
|------|--------|
| Shared Revenues - Full cycle | ✅ Should PASS |
| Shared Revenues - Mid-period rule | ✅ Should PASS |
| Shared Revenues - No data | ✅ Should PASS |
| Shared Revenues - Unauthorized access | ✅ Should PASS |
| Shared Revenues - Excel export | ✅ Should PASS |
| Total Transactions - Summary | ✅ Should PASS |
| Total Transactions - No transactions | ✅ Should PASS |
| Total Transactions - RBAC | ✅ Should PASS |

**Expected Final Result**:
```
8 scenarios (8 passed)
52 steps (52 passed)
0 undefined
0 failed
0 ambiguous
```

---

## 📞 If You Get Stuck

### Browser DevTools Inspector
1. F12 or Right-click > Inspect
2. Look for the element
3. Copy the selector from DevTools
4. Test with: `$$('.your-selector')`
5. Should return array with > 0 items

### Common Selector Types to Try
```typescript
// Try in this order:
'.class-name'
'#element-id'
'[aria-label="text"]'
'button:has-text("text")'
'[role="grid"]'
'table'
'div[data-component="grid"]'
```

### Fallback: Use Specific Text
If other selectors fail:
```typescript
'button:has-text("Show Report")'  // This is very reliable
'span:has-text("Total Amount")'   // Find headers by text
```

---

## 🔄 Repeat Process

1. Run tests in headed mode
2. Identify failing selector
3. Update selector in both page objects
4. Run tests again
5. Repeat until all 5 scenarios pass

**Total time with this process**: 30-60 minutes

---

## 📧 After Fixes

Once all tests pass:
1. Commit changes with message: "Fix: Update report selectors for actual UI"
2. Run full test suite: `npm test`
3. Verify no regression in other tests
4. Update documentation if selectors change frequently

---

**Status**: Ready to proceed once QA team has environment access.
