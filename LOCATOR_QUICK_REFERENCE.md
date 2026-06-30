# Locator Quick Reference Guide

**Quick lookup for locator selection and debugging.**

---

## 🚀 Quick Start

### Enable Locator Inspection
```gherkin
@locator-inspect
Scenario: My test scenario
```

### Use Improved Report Page Base
```typescript
import { ImprovedReportPageBase } from '../report-page-base-improved';

export class MyPage extends ImprovedReportPageBase {
  // Automatically get all production-grade locator methods
}
```

### Use LocatorHelper for Custom Elements
```typescript
const config: LocatorConfig = {
  primary: '[data-testid="element"]',
  fallbacks: ['#elementId', '.element-class'],
  timeout: 15000,
  retry: 3,
};

await this.locatorHelper.safeClick(config);
```

---

## 🎯 Selector Priority Quick Reference

| Priority | Selector Type | Example | Reliability |
|----------|---------------|---------|-------------|
| 1 ⭐⭐⭐⭐⭐ | data-testid | `[data-testid="btn"]` | Highest |
| 2 ⭐⭐⭐⭐ | ARIA Label | `[aria-label="Click"]` | Very High |
| 3 ⭐⭐⭐⭐ | ARIA Role | `[role="button"]` | Very High |
| 4 ⭐⭐⭐ | Input Name | `input[name="field"]` | High |
| 5 ⭐⭐⭐ | Input ID | `#fieldId` | High |
| 6 ⭐⭐ | Position + Type | `input:first-of-type` | Medium |
| 7 ⭐ | CSS Class | `.button-class` | Medium |
| 0 ❌ | Text Content | `button:has-text("Click")` | Low |

---

## 📚 Common Selector Patterns

### Buttons
```typescript
// Good (in order of preference)
'button[type="submit"]'
'button[aria-label="Submit"]'
'button[data-testid="submitBtn"]'

// Avoid
'button:has-text("Submit")'  // Only as last fallback
```

### Date Inputs
```typescript
// Good
'input[type="date"]:first-of-type'
'dx-date-box input[aria-label="From Date"]'
'input[name="fromDate"]'

// Avoid
'input[placeholder="Start Date"]'
```

### Dropdowns/Select Boxes
```typescript
// Good
'dx-select-box[aria-label="Entity"]'
'select[aria-label="Entity"]'
'[role="combobox"]'

// Avoid
'div:has-text("Select Entity")'
```

### Tables/Grids
```typescript
// Good
'dx-data-grid'
'[role="grid"]'
'table[role="grid"]'

// Avoid
'.table-container'
'table.report'
```

### Data Cells
```typescript
// Good - in row/column context
'[role="gridcell"]'
'[role="row"] [role="gridcell"]'
'tr:nth-child(2) td:nth-child(3)'

// Avoid
'span:has-text("$1000")'
'.cell-value'
```

---

## 🔧 Configuration Templates

### Report Filter Element
```typescript
protected entityFilterConfig: LocatorConfig = {
  primary: 'dx-select-box[aria-label*="Entity"]',
  fallbacks: [
    'select[aria-label*="Entity"]',
    '[role="combobox"][aria-label*="Entity"]',
  ],
  timeout: 15000,
  retry: 2,
};
```

### Action Button
```typescript
protected exportButtonConfig: LocatorConfig = {
  primary: 'button[aria-label="Export"]',
  fallbacks: [
    'button:has-text("Export")',
    'button[title*="Export"]',
  ],
  timeout: 10000,
  retry: 2,
};
```

### Slow-Loading Report Table
```typescript
protected reportTableConfig: LocatorConfig = {
  primary: 'dx-data-grid',
  fallbacks: [
    '[role="grid"]',
    'table[role="grid"]',
    '.dx-datagrid',
  ],
  timeout: 30000,  // Generous for reports
  waitForVisible: true,
  retry: 3,
};
```

---

## ⏱️ Timeout Guidelines

```typescript
// Immediate elements
timeout: 5000,  // Buttons, text, visible DOM

// Standard interactions
timeout: 10000,  // Dropdowns, inputs, modals

// Page elements
timeout: 15000,  // Forms, widgets, filters

// Reports
timeout: 30000,  // Tables, complex grids

// Slow operations
timeout: 45000,  // Page load, exports
```

---

## 🐛 Debugging Failed Locators

### Step 1: Check Console Output
```
❌ Show Report Button: NOT FOUND
   Suggestions: button[type="submit"], button.dx-button-submit
✓ Report Table: FOUND (1 element(s), type: dx-data-grid)
```

### Step 2: Open HTML Report
```bash
open locator-inspection-reports/scenario-name.html
```

### Step 3: Use Playwright Inspector
```bash
PWDEBUG=1 npm run test:revenue:50-50
```

Then in inspector:
```javascript
// Test selector
locator('button[type="submit"]')

// Try alternatives
locator('button[aria-label*="Show"]')
locator('button:has-text("Show Report")')
```

### Step 4: Update Configuration
```typescript
// Found that 'button.custom-submit' works best
primarySelector: 'button.custom-submit',
fallbacks: [
  'button[type="submit"]',  // Original
  'button[aria-label*="Show"]',
]
```

---

## ✅ Do's & Don'ts

### ✅ DO
- Use multiple fallback selectors
- Test selectors in Playwright inspector
- Use ARIA attributes
- Add adequate timeouts
- Include retry logic
- Document why you chose each selector

### ❌ DON'T
- Rely on single selector
- Use text-based matching as primary
- Use XPath selectors
- Use hardcoded positions
- Assume selectors work forever
- Ignore timeout failures

---

## 🎯 Common Issues & Solutions

### Issue: Element Not Found
**Solution**: Add fallback selectors
```typescript
// Before (fails often)
primary: 'button:has-text("Show Report")'

// After (resilient)
primary: 'button[type="submit"]',
fallbacks: ['button[aria-label*="Show"]', 'button:has-text("Show Report")']
```

### Issue: Timeout Waiting for Element
**Solution**: Increase timeout
```typescript
// Before (too short for reports)
timeout: 5000

// After (adequate for reports)
timeout: 30000
```

### Issue: Element is Disabled
**Solution**: Wait for it to be enabled or check state
```typescript
await this.page.locator('button').first().waitFor({ 
  state: 'enabled', 
  timeout: 10000 
});
```

### Issue: Element Not Visible
**Solution**: Scroll and wait
```typescript
const element = await this.locatorHelper.findElement(config);
await element.first().scrollIntoViewIfNeeded();
await element.first().waitFor({ state: 'visible', timeout: 10000 });
```

---

## 📊 Report Table Helpers

### Get Row Count
```typescript
const rowCount = await this.getTableRowCount();
```

### Get Cell Value
```typescript
const value = await this.getTableCellValue(rowIndex, columnIndex);
```

### Wait for Table
```typescript
await this.waitForReportTable();
```

### Check No Data
```typescript
const isEmpty = await this.isNoDataVisible();
```

---

## 🔄 Advanced Usage

### Execute with Retry
```typescript
await this.locatorHelper.executeWithRetry(
  async () => {
    // Your action here
    await this.page.click('button');
  },
  {
    maxAttempts: 3,
    delayMs: 500,
    backoffMultiplier: 1.5,
    description: 'Click button',
  }
);
```

### Wait for Any Selector
```typescript
const locator = await this.locatorHelper.waitForAny([
  { primary: 'button.primary' },
  { primary: 'button.secondary' },
  { primary: 'div.error' },
]);
```

### Wait for All Selectors
```typescript
const [form, buttons] = await this.locatorHelper.waitForAll([
  { primary: 'form' },
  { primary: 'button' },
]);
```

---

## 📞 Support

**Questions?** Check:
1. `src/config/locator-strategy.config.ts` - Strategy guide
2. `Docs/PHASE_3_LOCATOR_FIX_IMPLEMENTATION.md` - Full documentation
3. Run with `@locator-inspect` tag for automatic analysis
4. Use `PWDEBUG=1` for interactive debugging

---

**Last Updated**: June 30, 2026  
**Format**: Production-Grade Locator Strategy  
**Status**: Ready for Production Use
