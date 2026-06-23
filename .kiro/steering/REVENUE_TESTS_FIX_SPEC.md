# Revenue Reports Tests - Fix Specification

**Status**: Production Grade Test Fix  
**Date**: June 22, 2026  
**Goal**: Fix all failing tests with real, reliable, production-grade implementations

---

## 📊 Current Test Status

```
8 scenarios total
5 FAILED - Timeouts & locator issues
3 UNDEFINED - Missing step implementations
52 steps total
5 FAILED - Element not found, timeout exceeded
```

---

## 🎯 Issues to Fix

### 1. **Undefined Steps** (5 instances)
Need to implement date-parsed step definitions:
- `Given the following transactions are posted under shared service on {date}:`
- `Given the sharing rule is updated on {date} to {splitRule}:`
- `Then the report reflects the updated sharing rule from {date} onwards`
- `Given the following transactions are posted for the month of June:` 
- `When the user runs the "Total Transactions report by revenue entity" for June 2026`

### 2. **Ambiguous Steps** (2 remaining)
- `the report displays {string}` - duplicate in detailed-transactions
- `the report can be exported to Excel` - duplicate in detailed-transactions

### 3. **Timeout Errors** (5 failures)
Root causes:
- Report table selectors don't match actual UI
- Locators: `'table[role="grid"], table.report-table, dx-data-grid'` not found
- Button selectors not matching UI
- Page taking too long to load

### 4. **Locator Issues**
Current selectors failing:
- Report table: `table[role="grid"], table.report-table, dx-data-grid`
- Show Report button: `button:has-text("Show Report"), button[aria-label*="Show"], button:has-text("Search")`
- Need inspection with Playwright MCP to find real selectors

---

## 🔧 Fix Strategy

### Phase 1: Consolidate Duplicates ✅
Remove remaining ambiguous steps from `shared-revenues.steps.ts`

### Phase 2: Implement Undefined Steps
Use date parsing to handle Gherkin date syntax:
```typescript
// Parse "2026-06-15" to proper date format
// Parse "June 2026" to date range
```

### Phase 3: Fix Locators (MCP)
Use Playwright MCP server to:
1. Navigate to report page
2. Inspect actual selectors
3. Update page objects with correct locators

### Phase 4: Implement Missing Steps
Create proper implementations for data setup and verification

---

## 📋 Detailed Fixes Required

### Fix 1: Remove Duplicate "the report displays"
**File**: `src/steps/reports/shared-revenues.steps.ts`  
**Action**: Delete lines defining `the report displays {string}`  
**Reason**: Identical step exists in `detailed-transactions-revenue-entity.steps.ts`

### Fix 2: Remove Duplicate "the report can be exported to Excel"  
**File**: `src/steps/reports/shared-revenues.steps.ts`  
**Action**: Delete lines defining export step  
**Reason**: Identical step exists in `detailed-transactions-revenue-entity.steps.ts`

### Fix 3: Implement Date-Parsed Steps
**File**: `src/steps/reports/shared-revenues.steps.ts`  
**Implementation**:
```typescript
Given('the following transactions are posted under shared service on {string}:', 
  async (dateStr: string, dataTable) => {
    const date = new Date(dateStr); // Parse "2026-06-15"
    // Setup test data for this date
  }
);
```

### Fix 4: Inspect Report Locators with MCP
**Action**: Use Playwright to navigate and find selectors
**Steps**:
1. Open report page
2. Take screenshot
3. Inspect element hierarchy
4. Find working selectors
5. Update page objects

### Fix 5: Update Page Object Selectors
**Files**:
- `src/pages/reports/shared-revenues-base.page.ts`
- `src/pages/reports/total-transactions-revenue-entity.page.ts`

**Changes**:
- Update report table selector
- Update button selectors
- Add better wait strategies

---

## 🚀 Implementation Priority

1. **HIGH** - Fix ambiguous steps (2 duplicates)
2. **HIGH** - Inspect & fix locators (5 timeout failures)
3. **MEDIUM** - Implement undefined date steps (5 steps)
4. **MEDIUM** - Add retry logic to waits
5. **LOW** - Enhance error messages

---

## ✅ Success Criteria

- [ ] 0 ambiguous steps
- [ ] All locators working
- [ ] All timeouts resolved
- [ ] All undefined steps implemented
- [ ] 8/8 scenarios passing
- [ ] 52/52 steps passing
- [ ] Production-grade reliability

---

## 🎯 Next Steps

1. Complete ambiguous step removal
2. Use Playwright MCP to inspect selectors
3. Update page objects with correct locators
4. Implement missing step definitions
5. Run full test suite validation

