# Python to TypeScript Migration - Technical Implementation Checklist

**Date:** June 26, 2026  
**Owner:** SDET Team  
**Progress:** 0% (Starting)

---

## PHASE 1: Fix Current Issues (Sprint 1 - Week 1-2)

### A. Remove Ambiguous Step Duplicates

**File:** `src/steps/reports/shared-revenues.steps.ts`

- [ ] **Identify duplicate "the report displays {string}"**
  - Search for: `the report displays`
  - Confirm exists in `detailed-transactions-revenue-entity.steps.ts`
  - Line numbers to delete: TBD
  
- [ ] **Remove duplicate "the report can be exported to Excel"**
  - Search for: `the report can be exported to Excel`
  - Confirm exists in `detailed-transactions-revenue-entity.steps.ts`
  - Line numbers to delete: TBD

- [ ] **Delete identified step definitions**
  - Use `editCode` tool with `delete_node` operation
  - Verify no breaking changes in feature files

- [ ] **Run regression test**
  - Execute: `npm run test:reports -- shared-revenues.feature`
  - Confirm all remaining steps still pass
  - No new failures introduced

- [ ] **Documentation**
  - Update CHANGELOG.md
  - Document consolidation to shared.steps.ts

---

### B. Update Locators Using Playwright MCP

**Affected Files:**
- `src/pages/reports/shared-revenues-base.page.ts`
- `src/pages/reports/total-transactions-revenue-entity.page.ts`
- `src/pages/reports/credit-card-report.page.ts`
- `src/pages/reports/transaction-fees.page.ts`

**For Each Page Object:**

#### Report Table Selector
```typescript
// CURRENT (FAILING):
await page.locator('table[role="grid"], table.report-table, dx-data-grid')

// ACTION: Use Playwright MCP
- [ ] Navigate to report page
- [ ] Take screenshot to locate table
- [ ] Inspect element with browser dev tools
- [ ] Identify actual CSS classes/attributes
- [ ] Update selector (e.g., '.dx-datagrid' or 'div.report-content table')
- [ ] Test selector with page.locator()
- [ ] Document actual structure
```

#### Show Report Button
```typescript
// CURRENT (FAILING):
await page.locator('button:has-text("Show Report"), button[aria-label*="Show"]')

// ACTION:
- [ ] Navigate to report page
- [ ] Locate submit button in form
- [ ] Inspect button attributes
- [ ] Try alternate selectors:
  - button id attribute
  - aria-label exact match
  - data-* attributes
  - parent form structure
- [ ] Confirm click action works
- [ ] Test with and without scrolling
```

#### Date Input Selectors
```typescript
// CURRENT:
//input[@type='text']

// ACTION:
- [ ] Check if date inputs have ID attributes
- [ ] Check for name attributes
- [ ] Check for aria-label or placeholder
- [ ] Test with dx-date-box wrapper
- [ ] Verify input accepts "dd/mm/yyyy" format
- [ ] Test clearing and re-filling
```

#### Export Button
```typescript
// ACTION:
- [ ] Find export/download button
- [ ] Check ID, aria-label, data-* attributes
- [ ] Verify button is visible before clicking
- [ ] Confirm click opens export menu
- [ ] Locate Excel export option
```

#### Dropdown Elements
```typescript
// ACTION:
- [ ] Test dx-select-box dropdown
- [ ] Find container element (dx-dropdowneditor-button)
- [ ] Verify option appears after click
- [ ] Test visibility condition
- [ ] Confirm selection persists
```

**MCP Task Template:**
```typescript
// 1. Navigate to report
await playwright_navigate('https://tahseel.gov.ae/ManagePortal/report-show/[UUID]');

// 2. Take screenshot
await playwright_take_screenshot();

// 3. Inspect with page.locator() to find elements
// Test multiple selectors:
const table = page.locator('.dx-data-grid');
const button = page.locator('button[data-action="show-report"]');

// 4. Document findings
```

**Validation Checklist for Each Selector:**
- [ ] Element found consistently (not intermittent)
- [ ] Element is visible/interactive
- [ ] Element responds to expected actions
- [ ] Works across multiple report pages
- [ ] Handles dynamic content loading
- [ ] Fails gracefully with clear error messages

---

### C. Implement Undefined Steps

**File:** `src/steps/reports/shared-revenues.steps.ts`

#### Step 1: `Given the following transactions are posted under shared service on {string}:`

```typescript
// CURRENT: Partially defined but no-op
// IMPLEMENTATION NEEDED:

Given('the following transactions are posted under shared service on {string}:', async function (
  this: World,
  dateStr: string,
  dataTable: DataTable
) {
  // Task 1: Parse date string
  const transactionDate = parseGherkinDate(dateStr); // "2026-06-15" → Date(2026, 5, 15)
  
  // Task 2: Validate date is in past
  expect(transactionDate).toBeLessThanOrEqual(new Date());
  
  // Task 3: Extract transaction data
  const transactions = dataTable.hashes(); // Array of {Service, Amount, Entities}
  
  // Task 4: Setup test data (API call or UI navigation)
  for (const txn of transactions) {
    await testDataService.createTransaction({
      date: transactionDate,
      service: txn.Service,
      amount: parseFloat(txn.Amount),
      entities: txn.Entities.split(',').map(e => e.trim())
    });
  }
  
  // Task 5: Store in context for later verification
  this.testData.transactionDate = transactionDate;
  this.testData.transactions = transactions;
  this.addLog(`✅ Created ${transactions.length} transactions for ${dateStr}`);
});
```

**Validation:**
- [ ] Date parsing handles multiple formats (dd/mm/yyyy, ISO, text date)
- [ ] Date validation rejects future dates
- [ ] Transaction data extracted correctly from DataTable
- [ ] API/UI call creates actual test data
- [ ] Data stored in context for verification steps
- [ ] Error handling for invalid inputs

#### Step 2: `Given the sharing rule is updated on {string} to {string}:`

```typescript
Given('the sharing rule is updated on {string} to {string}:', async function (
  this: World,
  dateStr: string,
  newSplitRule: string
) {
  // Parse: dateStr = "2026-06-15", splitRule = "60/40"
  const changeDate = parseGherkinDate(dateStr);
  const [percentage1, percentage2] = newSplitRule.split('/').map(Number);
  
  // Validate split percentages
  expect(percentage1 + percentage2)