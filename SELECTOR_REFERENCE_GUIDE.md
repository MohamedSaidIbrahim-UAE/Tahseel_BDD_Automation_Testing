# Selector Reference Guide
## Report Automation POM - DevExtreme & Stage Environment

Quick reference for all updated selectors and their fallback patterns.

---

## Date Picker Selectors

### Primary (DevExtreme)
```typescript
// From Date
"dx-date-box:first-of-type input[type='text']"
"input[placeholder*='From']"
"input[aria-label*='From']"

// To Date
"dx-date-box:last-of-type input[type='text']"
"input[placeholder*='To']"
"input[aria-label*='To']"
```

### Usage
```typescript
readonly fromDateInput = 
  'dx-date-box:first-of-type input, input[type="date"]:first-of-type, input[aria-label*="From"], input[placeholder*="From"]';
readonly toDateInput = 
  'dx-date-box:last-of-type input, input[type="date"]:last-of-type, input[aria-label*="To"], input[placeholder*="To"]';
```

---

## Button Selectors

### Show Report / Submit / Search
```typescript
readonly showReportButton = 
  'button[type="submit"], button.dx-button-submit, button[aria-label*="Show"], button[aria-label*="Report"], button:has-text("Show Report"), button:has-text("View Report"), button:has-text("Search"), input[type="submit"]';
```

### Clear / Reset
```typescript
readonly clearFilterButton = 
  'button:has-text("Clear"), button:has-text("Reset"), button[aria-label*="Clear"], button[aria-label*="Reset"]';
```

---

## Table / Grid Selectors

### Container
```typescript
readonly reportTable = 
  'dx-data-grid, .dx-datagrid, .dx-datagrid-rowsview, [role="grid"], table[role="grid"], table.report-table';
```

### Columns (Data-Field Based)
```typescript
// Revenue Entity
readonly revenueEntityColumn = 
  '[data-field="revenueEntity"], [data-field="entity"], .dx-col-revenueEntity';

// Transaction Count
readonly transactionCountColumn = 
  '[data-field="count"], [data-field="transactionCount"], .dx-col-count';

// Total Amount
readonly totalAmountColumn = 
  '[data-field="amount"], [data-field="totalAmount"], .dx-col-amount';
```

### Summary Rows
```typescript
// Grand Total Row
readonly grandTotalRow = 
  '.dx-row-group-footer, .dx-group-footer, .dx-row-total, tr:has-text("Grand Total"), tr[class*="grand-total"]';

// Grand Total Amount Value
readonly grandTotalAmount = 
  '.dx-datagrid-group-footer [data-field="amount"], .dx-row-total [data-field="amount"], span:has-text("Grand Total") ~ span';
```

---

## Dropdown / Select Selectors

### DevExtreme Select Box
```typescript
readonly entityFilterDropdown = 
  'dx-select-box[aria-label*="Entity"], select[name*="entity"], select[aria-label*="Entity"], div[role="combobox"][aria-label*="Entity"]';
```

### Tag Box (Multiple Selection)
```typescript
readonly tagBoxXPath = 'dx-tag-box';
```

### Option Items
```typescript
"div[class*='list-item-content'], div[role='option']"
```

---

## Status / Empty State Selectors

### No Data
```typescript
readonly noDataMessage = 
  '.dx-empty-row, span:has-text("No data"), span:has-text("No records"), .empty-state, .no-records-message';
```

### Loading Spinner
```typescript
readonly loadingSpinner = 
  '.dx-loadindicator, .dx-loadpanel, [class*="spinner"], [class*="loading"]';
```

---

## Export / Action Selectors

### PDF
```typescript
readonly exportPdfOption = 
  'button:has-text("PDF"), span:has-text("PDF")';
```

### Excel
```typescript
readonly exportExcelOption = 
  'button:has-text("Excel"), span:has-text("Excel")';
```

---

## Selection Strategy

### Priority (First Match Wins)

1. **DevExtreme Specific**
   - Positional: `dx-date-box:first-of-type`, `:last-of-type`
   - Data-driven: `[data-field="name"]`
   - Class-based: `.dx-datagrid`, `.dx-col-name`

2. **Standard HTML + Accessibility**
   - Aria labels: `[aria-label*="text"]`
   - Placeholders: `[placeholder*="text"]`
   - Input types: `input[type="date"]`

3. **User-Facing (Fragile)**
   - Text content: `:has-text("text")`
   - Element text: `span:has-text()`

4. **Generic Fallback**
   - Role attribute: `[role="grid"]`, `[role="combobox"]`
   - Tag selectors: `button`, `input`, `select`

---

## Implementation Examples

### Setting a Date

```typescript
// Method: fillDatePicker (in BaseListPage)
async fillDatePicker(inputSelector: string, value: string): Promise<void> {
  const input = this.page.locator(inputSelector).first();
  await input.waitFor({ state: 'visible', timeout: config.timeout });
  await input.clear();
  await input.fill(value);
  await input.press('Tab');
}

// Usage
await this.fillDatePicker(this.fromDateInput, '01/06/2026');
```

### Selecting a Dropdown

```typescript
async selectFilterDropdown(inputSelector: string, value: string): Promise<void> {
  const input = this.page.locator(inputSelector).first();
  await input.waitFor({ state: 'visible', timeout: config.timeout });
  await input.click();
  
  const option = this.page
    .locator("div[class*='list-item-content'], div[role='option']")
    .filter({ hasText: new RegExp(`^${value}$`, 'i') })
    .first();
  
  await option.waitFor({ state: 'visible', timeout: config.timeout });
  await option.click();
}

// Usage
await this.selectFilterDropdown(this.entityFilterDropdown, 'Revenue Transactions');
```

### Clicking Show Report

```typescript
async showReport(): Promise<void> {
  const button = this.page.locator(this.showReportButton).first();
  await button.waitFor({ state: 'visible', timeout: config.timeout });
  await button.click();
  
  // Wait for report to load
  await this.page.waitForTimeout(2000);
}
```

### Getting Table Data

```typescript
async getGrandTotal(): Promise<number> {
  const cell = this.page.locator(this.grandTotalAmount).first();
  const text = await cell.textContent();
  return parseFloat(text?.replace(/[^0-9.]/g, '') || '0');
}
```

---

## Common Issues & Solutions

### Problem: Date picker not found
**Solution**: Try multiple selectors in order
```typescript
'dx-date-box:first-of-type input, input[placeholder*="From"], input[aria-label*="From"]'
```

### Problem: Button click not working
**Solution**: Wait for visibility and add timeout
```typescript
await button.waitFor({ state: 'visible', timeout: 10000 });
await button.click({ timeout: 5000 });
```

### Problem: Table column not found
**Solution**: Use data-field priority
```typescript
'[data-field="amount"]' // First try
'[data-field="totalAmount"]' // Fallback
'.dx-col-amount' // DevExtreme class
'td:has-text("Total Amount")' // Last resort
```

### Problem: Dropdown option not visible
**Solution**: Verify click opened the dropdown
```typescript
await input.click();
await this.page.waitForTimeout(500); // Let dropdown open
const option = this.page.locator('div[role="option"]:has-text("Value")').first();
await option.click();
```

---

## Stage Environment Specifics

**Base URL**: `https://staging.tahseel.gov.ae/ManagePortal`

**Common Issues on Stage**:
- Longer load times → Use increased timeout (45-60 seconds)
- Arabic RTL layout → Selectors still work, just positioned right-to-left
- DevExtreme may render differently → Use data-field selectors (most reliable)

**Timeouts in .env.stage**:
```
NAVIGATION_TIMEOUT=60000
ACTION_TIMEOUT=30000
WAIT_FOR_TIMEOUT=45000
```

---

## Files Using These Selectors

| File | Purpose | Updated |
|------|---------|---------|
| `src/pages/reports/report-automation-pages.ts` | All 11 report pages | ✅ June 30, 2026 |
| `src/pages/reports/shared-revenues-base.page.ts` | Shared revenue reports | ✅ June 30, 2026 |
| `src/pages/reports/total-transactions-revenue-entity.page.ts` | Total transactions report | ✅ June 30, 2026 |
| `src/pages/base-list.page.ts` | Generic list page methods | ✅ Existing |
| `src/pages/base.page.ts` | Base Playwright methods | ✅ Existing |

---

## Testing Selectors

To test selectors locally:

```bash
# Headed mode (see browser)
npm run test:report-automation:headed

# With debug flag (interactive debugging)
PWDEBUG=1 npm run test:report-automation:headed

# Specific scenario
npm run testA

# Full suite
npm run test:report-automation
```

---

**Last Updated**: June 30, 2026  
**Version**: 1.0  
**Status**: Production Ready
