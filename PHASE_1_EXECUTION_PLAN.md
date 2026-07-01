# Phase 1: IMMEDIATE - Unblocks Testing
**Status**: In Progress
**Date**: July 1, 2026
**Goal**: Complete both tasks to unblock all 8 test scenarios

---

## Task 1: Remove Duplicate Steps ✅ (COMPLETED)

### Analysis Results

After thorough inspection of the codebase:

**Finding**: The duplicate steps are **NOT actually defined in shared-revenues.steps.ts**

**Evidence**:
- `src/steps/reports/shared-revenues.steps.ts` (lines 537-596):
  - Contains COMMENTS saying steps are inherited from `src/steps/shared.steps.ts`
  - No actual step definitions for export or display
  - Explicitly states: "No duplicate definitions needed here"

- `src/steps/reports/detailed-transactions-revenue-entity.steps.ts` (lines 64-67):
  - Contains NOTE confirming duplicates were already removed
  - Points to `src/steps/shared.steps.ts` as single source of truth

- `src/steps/shared.steps.ts` (lines 231, 253):
  - SINGLE definition of `Then('the report displays {string}'...)`
  - SINGLE definition of `Then('the report can be exported to Excel'...)`

**Conclusion**: ✅ **Task 1 is already complete**
- No ambiguous step duplicates exist in the codebase
- Steps are properly consolidated in shared.steps.ts
- Both feature files reference the shared steps correctly

**Action**: No code changes needed. Document this finding.

---

## Task 2: Fix Locators with Playwright MCP 🔧 (IN PROGRESS)

### Current State Analysis

#### A. Failing Test Symptoms (From Steering Rule)
```
5 FAILED scenarios
- Timeout errors (Element not found)
- Report table selectors not matching
- Show Report button not clickable
- Export button not responding
```

#### B. Current Locator Strategy (From Code Review)

**In `src/pages/report-page-base-improved.ts`:**

Report Table Locators (lines 27-47):
```typescript
protected reportTableConfig: LocatorConfig = {
  primary: 'dx-data-grid',
  fallbacks: [
    '.dx-data-grid', '.dx-datagrid', 'table[role="grid"]',
    'table.report-table', '[role="grid"]', 'div[role="grid"]',
    '.dxg-grid-wrapper', '.dxDataGrid', '[class*="dxDataGrid"]',
    // ... 6 more fallbacks
  ],
  timeout: 35000,
  waitForVisible: true,
  retry: 5,
};
```

Show Report Button Locators (lines 50-73):
```typescript
protected showReportButtonConfig: LocatorConfig = {
  primary: 'button[type="submit"]',
  fallbacks: [
    'button.dx-button-submit', 'button[class*="submit"]',
    'button[class*="primary"]', 'button[aria-label*="Show"]',
    'button:has-text("Show Report")', 'button:has-text("Search")',
    // ... 10+ more fallbacks
  ],
  timeout: 20000,
  waitForVisible: true,
  retry: 5,
};
```

#### C. Root Cause Analysis

**Potential Issues**:

1. **Language-Specific Selectors**: 
   - System is Arabic (RTL)
   - Button text may be in Arabic: "عرض التقرير" not "Show Report"
   - aria-labels may be Arabic
   - h:has-text() selector is case-sensitive and language-dependent

2. **DevExtreme Framework Complexity**:
   - dx-data-grid is dynamically rendered (DevExtreme component)
   - May not be immediately visible after clicking Show Report
   - Async rendering may require custom wait strategies
   - Report container may have different selector after rendering

3. **Report Container Structure**:
   - SSR (SQL Server Reporting Services) report may load in iframe
   - Report content may be in different window/tab (new-tab detection exists in code)
   - Async spinner wait (`#repViewer_AsyncWait_Wait`) indicates complex loading

4. **Selector Specificity**:
   - Current selectors may be too generic
   - May match wrong elements (e.g., other buttons on page)
   - Need more context/parent-specific selectors

---

### Implementation Plan

#### Phase 2A: Code-Based Inspection
**Without direct browser access**, analyze existing working implementations:

**Files to Review**:
1. `src/pages/reports/shared-revenues-base.page.ts` - Has working selectors
2. `src/pages/reports/report-viewer-base.page.ts` - Has SSR-specific logic
3. Test execution logs if available

#### Phase 2B: Locator Fixes Based on Code Analysis

**Fix 1: Arabic Language Support**

Current Problem:
- `button:has-text("Show Report")` won't match Arabic buttons

Solution:
```typescript
// Update showReportButtonConfig to support both languages
protected showReportButtonConfig: LocatorConfig = {
  primary: 'button[type="submit"]:not(:disabled)',
  fallbacks: [
    // English selectors
    'button:has-text("Show Report")',
    'button:has-text("View Report")',
    // Arabic selectors
    'button:has-text("عرض التقرير")',
    'button:has-text("عرض")',
    // Generic selectors (most important)
    'button[class*="submit"]:visible',
    'button[class*="primary"]:visible',
    '[role="button"][class*="submit"]',
    // Position-based (last resort)
    'button:nth-of-type(1)',
  ],
  timeout: 25000,
  waitForVisible: true,
  retry: 5,
};
```

**Fix 2: DevExtreme Report Table Detection**

Current Problem:
- `dx-data-grid` may not be the actual report table
- Report rendering is async and happens in SSR viewer

Solution:
```typescript
// Better wait strategy for SSR report loading
async waitForReportContent(): Promise<void> {
  // 1. Wait for async spinner to disappear
  try {
    await this.page.waitForSelector(
      '#repViewer_AsyncWait_Wait',
      { state: 'hidden', timeout: 30000 }
    );
  } catch {
    // Spinner may not exist or already gone
    console.log('Async spinner not found or already hidden');
  }

  // 2. Wait for report content container
  const reportContentSelectors = [
    '#VisibleReportContentrepViewer_ctl13', // SSR-specific
    '[id*="reportContent"]',
    '[id*="ReportContent"]',
    '[role="region"][aria-label*="report"]',
    '[class*="report-viewer"]',
    '[class*="report-content"]',
    'div[id^="repViewer"]', // Any SSR viewer div
  ];

  let found = false;
  for (const selector of reportContentSelectors) {
    try {
      await this.page.waitForSelector(selector, { 
        timeout: 5000,
        state: 'visible'
      });
      console.log(`Found report content: ${selector}`);
      found = true;
      break;
    } catch {
      // Try next selector
    }
  }

  if (!found) {
    throw new Error('Could not find report content after 30s');
  }
}
```

**Fix 3: Export Button Locator**

Current Problem:
- Export button may have Arabic text or different class names
- May not be immediately visible after report renders

Solution:
```typescript
protected exportButtonConfig: LocatorConfig = {
  primary: 'button[title*="Export"]',
  fallbacks: [
    // Look for export icon
    'button[class*="export"]',
    'button[aria-label*="Export"]',
    'button[aria-label*="تصدير"]', // Arabic
    // In SSR viewer
    '#repViewer_ctl09_ctl04_ctl00_ButtonLink',
    '[id*="ExportButton"]',
    // Text-based (English + Arabic)
    'a:has-text("Excel")',
    'a:has-text("PDF")',
    'a:has-text("إكسل")',
    'a:has-text("بي دي إف")',
  ],
  timeout: 15000,
  waitForVisible: true,
  retry: 3,
};
```

**Fix 4: Add Better Wait Strategy for New Tab**

From `ReportViewerBasePage`, there's code for new-tab detection:
```typescript
// Enhance new-tab wait with better timeout
private async waitForNewTabReport(maxWaitMs = 45000): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitMs) {
    // Check if async spinner is gone
    const spinnerVisible = await this.page.locator(
      '#repViewer_AsyncWait_Wait'
    ).isVisible().catch(() => false);

    if (!spinnerVisible) {
      // Wait a bit more for content to render
      await this.page.waitForTimeout(2000);
      return;
    }

    await this.page.waitForTimeout(500);
  }

  throw new Error(
    `Report did not finish loading within ${maxWaitMs}ms`
  );
}
```

---

### Implementation Sequence

1. **Update `ReportViewerBasePage`** with enhanced report content detection
2. **Update `ImprovedReportPageBase`** with Arabic language support
3. **Add language-aware selectors** to all button/text locators
4. **Add SSR-specific wait strategies**
5. **Test against staging environment** (once browser access available)

---

## Summary

| Task | Status | Evidence | Action |
|------|--------|----------|--------|
| **Task 1: Remove Duplicates** | ✅ Complete | Already removed; comments confirm | Document findings |
| **Task 2: Fix Locators** | 🔧 In Progress | Code analysis complete; solutions ready | Implement fixes in step 2 |

**Next Step**: Implement locator fixes in Phase 2

