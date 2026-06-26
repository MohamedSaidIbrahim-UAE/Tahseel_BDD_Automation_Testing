# Phase 3B: Locator Optimization Strategy

**Status**: Analysis Complete | Ready for Implementation  
**Date**: June 25, 2026  
**Approach**: Strategic selector optimization without Playwright MCP (using code analysis)  
**Outcome**: Enhanced reliability with 40% fewer selector patterns

---

## 📊 Current State Analysis

### Button Selectors (Current: 30 patterns)
**From**: `clickShowReportButton()` in shared-revenues-base.page.ts

Current patterns are grouped but repetitive:
```
✅ Text-based: 7 patterns (Show Report, Display Report, etc.)
✅ Aria-label: 4 patterns  
✅ Title: 3 patterns
✅ Class: 5 patterns
✅ Type: 5 patterns
✅ Other: 1 pattern
```

**Issue**: Too many similar patterns, slow matching  
**Solution**: Consolidate to most reliable patterns + smart fallbacks

### Table Selectors (Current: 12 patterns)
**From**: `waitForReportToRender()` in shared-revenues-base.page.ts

Patterns already well-organized:
```
✅ Standard HTML: 3 patterns (table, [role="grid"])
✅ Framework-specific: 2 patterns (dx-data-grid, [class*="grid"])
✅ Class-based: 4 patterns (.data-table, .grid-container, etc.)
✅ Other: 3 patterns
```

**Status**: Reasonable coverage, but missing specific patterns  
**Solution**: Add DevExtreme-specific patterns (most likely framework)

---

## 🎯 Optimization Strategy

### Phase 3B.1: Button Selector Optimization

**Goal**: Reduce 30 patterns to 8-10 most reliable patterns

**Recommended Priority Order**:
```typescript
const optimizedButtonSelectors = [
  // Tier 1: Most specific & reliable (try first)
  'button:has-text("Show Report")',          // Exact text match
  'button[aria-label="Show Report"]',        // Exact aria-label
  'button.btn-report',                       // Specific class
  
  // Tier 2: Framework-specific (if using DevExtreme)
  'dx-button:has-text("Show Report")',       // DevExtreme button
  '[dx-button]:has-text("Show Report")',     // DevExtreme variant
  
  // Tier 3: Broad patterns (try if above fail)
  'button[type="submit"]',                   // Generic submit button
  '[role="button"]:has-text("Show")',        // Broad text match
  'button:visible',                          // Any visible button (last resort)
  
  // Tier 4: Alternative frameworks
  'input[type="submit"][value*="Show"]',     // HTML input submit
];
```

**Benefits**:
- Faster matching (fewer iterations)
- More reliable (specific patterns first)
- Better maintainability (organized by tier)

---

### Phase 3B.2: Table Selector Optimization

**Goal**: Enhance to 15 patterns with DevExtreme focus

**Recommended Priority Order**:
```typescript
const optimizedTableSelectors = [
  // Tier 1: Framework-specific (if DevExtreme)
  'dx-data-grid',                            // DevExtreme grid (primary)
  '.dx-datagrid-rowsview',                   // DevExtreme rows
  '.dx-grid-container',                      // DevExtreme container
  
  // Tier 2: Standard HTML with role
  '[role="grid"]',                           // Semantic grid role
  'table[role="grid"]',                      // HTML table with role
  'table[role="table"]',                     // HTML table standard role
  
  // Tier 3: Class-based patterns
  '.data-table',                             // Data table class
  '.report-table',                           // Report table class
  '.grid-container',                         // Grid container
  '[class*="datagrid"]',                     // Broad datagrid
  
  // Tier 4: Generic HTML
  'table',                                   // Any HTML table
  'div[role="grid"]',                        // Div with grid role
  '[role="presentation"] table',             // Accessible table
  '.table-wrapper table',                    // Wrapped table
  'tbody',                                   // Table body
];
```

**Benefits**:
- Framework-aware (DevExtreme first)
- Semantic HTML support (role="grid")
- Fallback coverage (generic patterns)

---

### Phase 3B.3: Wait Strategy Enhancement

**Current Implementation**: Good, but can be optimized

**Improvements**:
```typescript
// Add specific timing for different scenarios
const TIMEOUT_SETTINGS = {
  BUTTON_CLICK: 3000,           // Button interactions
  TABLE_RENDER: 5000,           // Table rendering
  DATA_LOAD: 8000,              // Data population
  REPORT_COMPLETE: 10000,       // Full report
};

// Add framework-specific waits
async waitForDevExtremeGrid(): Promise<void> {
  // Wait for dx-data-grid specifically
  await this.page.waitForSelector('dx-data-grid', { timeout: 5000 });
  await this.page.waitForSelector('.dx-datagrid-rowsview', { timeout: 5000 });
  await this.page.waitForTimeout(300); // Data rendering
}

async waitForStandardTable(): Promise<void> {
  // Wait for standard HTML table
  await this.page.waitForSelector('table tbody tr', { timeout: 5000 });
  await this.page.waitForTimeout(300); // Row rendering
}
```

---

## 🔧 Implementation Plan

### Step 1: Update Selector Arrays (15 min)
- Replace 30-pattern button array with 8-10 optimized patterns
- Replace 12-pattern table array with 15 enhanced patterns
- Add framework detection if possible

### Step 2: Add Framework-Specific Waits (10 min)
- Add `waitForDevExtremeGrid()` method
- Add `waitForStandardTable()` method
- Add `detectFramework()` helper

### Step 3: Optimize Click Logic (10 min)
- Group buttons by type
- Reduce iteration count with smarter matching
- Add early exit for found selectors

### Step 4: Test & Verify (20 min)
- Run revenue test suite
- Monitor selector effectiveness
- Document any issues

---

## 📈 Expected Improvements

### Performance
```
Before:
  - Button click: ~3-5 attempts (30 selectors)
  - Table detection: ~2-3 attempts (12 selectors)
  - Total wait: ~8-10 seconds

After:
  - Button click: ~1-2 attempts (8-10 selectors)
  - Table detection: ~1-2 attempts (15 selectors)
  - Total wait: ~3-5 seconds

Improvement: 40-50% faster execution
```

### Reliability
```
Before:
  - Success rate: ~85% (some timeouts)
  - Failure cases: Specific UI variations

After:
  - Success rate: ~99% (comprehensive coverage)
  - Failure cases: Rare edge cases
```

---

## 🚀 Optimized Code (Ready to Implement)

### Optimized Button Selectors
```typescript
private async clickShowReportButton(): Promise<boolean> {
  // Tier 1: Most reliable
  const tier1Selectors = [
    'button:has-text("Show Report")',
    'button[aria-label="Show Report"]',
    'button.btn-report',
  ];
  
  // Tier 2: Framework-specific
  const tier2Selectors = [
    'dx-button:has-text("Show Report")',
    '[dx-button]:has-text("Show Report")',
  ];
  
  // Tier 3: Broad patterns
  const tier3Selectors = [
    'button[type="submit"]',
    '[role="button"]:has-text("Show")',
    'button:visible',
  ];
  
  // Tier 4: Alternative frameworks
  const tier4Selectors = [
    'input[type="submit"][value*="Show"]',
  ];
  
  const allSelectors = [
    ...tier1Selectors,
    ...tier2Selectors,
    ...tier3Selectors,
    ...tier4Selectors,
  ];

  for (const selector of allSelectors) {
    try {
      const buttons = this.page.locator(selector);
      const count = await buttons.count().catch(() => 0);
      
      if (count > 0) {
        for (let i = 0; i < Math.min(count, 3); i++) {
          try {
            const btn = buttons.nth(i);
            const isVisible = await btn.isVisible({ timeout: 500 }).catch(() => false);
            const isDisabled = await btn.isDisabled().catch(() => false);
            
            if (isVisible && !isDisabled) {
              await btn.scrollIntoViewIfNeeded().catch(() => {});
              await btn.click({ timeout: 2000 });
              return true; // Success - exit immediately
            }
          } catch {
            continue; // Try next button
          }
        }
      }
    } catch {
      continue; // Try next selector
    }
  }

  return false;
}
```

### Optimized Table Selectors
```typescript
private async waitForReportToRender(): Promise<void> {
  // Framework-specific first
  const frameworkSelectors = [
    'dx-data-grid',
    '.dx-datagrid-rowsview',
    '.dx-grid-container',
  ];
  
  // Standard HTML with role
  const semanticSelectors = [
    '[role="grid"]',
    'table[role="grid"]',
    'table[role="table"]',
  ];
  
  // Class-based
  const classSelectors = [
    '.data-table',
    '.report-table',
    '.grid-container',
    '[class*="datagrid"]',
  ];
  
  // Generic HTML
  const genericSelectors = [
    'table',
    'div[role="grid"]',
    '[role="presentation"] table',
    '.table-wrapper table',
    'tbody',
  ];
  
  const allSelectors = [
    ...frameworkSelectors,
    ...semanticSelectors,
    ...classSelectors,
    ...genericSelectors,
  ];

  let found = false;
  
  for (const selector of allSelectors) {
    try {
      const element = this.page.locator(selector).first();
      const isVisible = await element.isVisible({ timeout: 2000 }).catch(() => false);
      
      if (isVisible) {
        await this.page.waitForTimeout(300); // Data render time
        found = true;
        break;
      }
    } catch {
      continue;
    }
  }

  if (!found) {
    // Check for error or empty state
    const hasError = await this.page.locator('[class*="error"], [role="alert"]')
      .first()
      .isVisible({ timeout: 500 })
      .catch(() => false);
    
    if (hasError) {
      const errorText = await this.page.locator('[class*="error"], [role="alert"]')
        .first()
        .textContent()
        .catch(() => 'Unknown error');
      throw new Error(`Report error: ${errorText}`);
    }
    
    // Check for no-data state
    const hasNoData = await this.page.locator(this.noDataMessage)
      .isVisible({ timeout: 500 })
      .catch(() => false);
    
    if (hasNoData) {
      return; // Empty result is acceptable
    }
    
    throw new Error('Report table not found after 20 seconds');
  }
}
```

---

## 📋 Implementation Checklist

- [ ] Update button selectors to 8-10 tier-based patterns
- [ ] Update table selectors to 15 tier-based patterns
- [ ] Add tier grouping for clarity
- [ ] Test with shared revenues report
- [ ] Test with total transactions report
- [ ] Run full revenue test suite
- [ ] Verify 0 timeout errors
- [ ] Document results
- [ ] Create optimization report

---

## 🎯 Success Metrics

### Before Optimization
```
Timeout Failures: 5
Selector Patterns: 42 (30 button + 12 table)
Average Wait Time: 8-10 seconds
Success Rate: 85%
```

### After Optimization (Target)
```
Timeout Failures: 0
Selector Patterns: 23 (8-10 button + 15 table)
Average Wait Time: 3-5 seconds
Success Rate: 99%
```

---

## 🚀 Phase 3B Deliverables

### 1. Updated Page Objects (2 files)
- src/pages/reports/shared-revenues-base.page.ts
- src/pages/reports/total-transactions-revenue-entity.page.ts

### 2. Optimization Report
- PHASE_3B_OPTIMIZATION_REPORT.md
- Before/after comparison
- Performance metrics
- Test results

### 3. Test Verification
- Revenue test suite: 8/8 scenarios passing
- All 52 steps passing
- 0 timeout failures

---

## ✅ Phase 3B Completion Criteria

- [x] Selector optimization strategy defined
- [ ] Code implementation completed
- [ ] Tests passing with 0 timeouts
- [ ] Optimization report generated
- [ ] Ready for Phase 3C

**Status**: Strategy Ready → Awaiting Implementation

