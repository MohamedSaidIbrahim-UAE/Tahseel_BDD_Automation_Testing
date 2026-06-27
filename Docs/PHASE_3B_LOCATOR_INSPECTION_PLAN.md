# Phase 3B: Locator Inspection & Optimization

**Status**: ✅ Ready to Execute  
**Date**: June 25, 2026  
**Objective**: Use Playwright MCP to inspect, verify, and optimize report element selectors  
**Scope**: 2 page objects, 5 timeout failures to resolve

---

## 🎯 Phase 3B Objectives

### Primary Goal
Inspect actual UI elements in report pages and verify/optimize CSS selectors to eliminate 5 timeout failures.

### Success Criteria
- [ ] Navigate to shared revenues report successfully
- [ ] Navigate to total transactions report successfully
- [ ] Take screenshots for visual verification
- [ ] Inspect button element hierarchy
- [ ] Inspect table element hierarchy
- [ ] Identify actual working selectors
- [ ] Update page objects with optimized selectors
- [ ] Verify 0 timeout failures in test execution

---

## 📋 Target Files for Inspection

### File 1: Shared Revenues Report Base
**Location**: `src/pages/reports/shared-revenues-base.page.ts`

**Current Selectors to Verify**:
```typescript
// Report table (13 options currently)
'table[role="grid"]'
'table.report-table'
'dx-data-grid'
'[role="grid"]'
'table[class*="table"]'
// ... 8 more options

// Show Report button (31 options currently)
'button:has-text("Show Report")'
'button:has-text("Display Report")'
'button[aria-label*="Show"]'
// ... 28 more options
```

**Issues to Investigate**:
- Button clicks timing out
- Table not visible after button click
- Date input selectors not matching

### File 2: Total Transactions Report Page
**Location**: `src/pages/reports/total-transactions-revenue-entity.page.ts`

**Current Selectors to Verify**:
- Same button and table selectors
- Column-specific selectors
- Grand total row selector

**Issues to Investigate**:
- Button clicks not working
- Table rendering delays
- Column data extraction failures

---

## 🔍 Inspection Methodology

### Phase 3B.1: Initial Navigation & Screenshot
**Objective**: Verify pages load and capture UI state

**Steps**:
1. Navigate to shared revenues report page
2. Take screenshot showing initial state
3. Navigate to total transactions report page
4. Take screenshot showing initial state

**Expected Output**:
- Visual confirmation pages are accessible
- Screenshots for reference
- Initial page structure visible

### Phase 3B.2: Button Element Inspection
**Objective**: Find actual "Show Report" button selector

**Steps**:
1. Locate "Show Report" button in DOM
2. Inspect element hierarchy
3. Document actual CSS classes
4. Document actual aria-labels
5. Identify working selector patterns

**Data to Collect**:
- Button tag name (button, input, div, etc.)
- CSS classes applied
- aria-label values
- title attributes
- onclick handlers
- Parent container structure

### Phase 3B.3: Table Element Inspection
**Objective**: Find actual report table selector

**Steps**:
1. Click "Show Report" button
2. Wait for table to render
3. Inspect table element hierarchy
4. Document actual table structure
5. Identify column headers
6. Check for framework-specific attributes

**Data to Collect**:
- Table tag name
- CSS classes on table
- CSS classes on rows
- CSS classes on cells
- Table ID if present
- Data attributes
- Role attributes
- Framework indicators (DataGrid, dx-, etc.)

### Phase 3B.4: Date Input Inspection
**Objective**: Verify date input selectors work

**Steps**:
1. Inspect "From Date" input
2. Inspect "To Date" input
3. Test filling with date values
4. Verify form submission

**Data to Collect**:
- Input name attributes
- Input ID values
- Input placeholder text
- Input type (text, date, etc.)
- Parent form structure
- Date format expectations

### Phase 3B.5: Selector Validation
**Objective**: Test each selector pattern

**Steps**:
1. Test current 31 button selectors
2. Note which ones work
3. Test current 13 table selectors
4. Note which ones work
5. Identify gaps in coverage

**Output**:
- List of working selectors
- List of failed selectors
- Recommendations for new patterns

---

## 🛠️ Implementation Approach

### Using Playwright MCP Server

**Capability**: Navigate, inspect, capture elements using Playwright

**Key Tools Available**:
- `mcp_playwright_navigate()` - Navigate to URLs
- `mcp_playwright_take_screenshot()` - Capture page state
- `mcp_playwright_get_page_content()` - Get HTML structure
- `mcp_playwright_wait_for_selector()` - Wait for elements
- `mcp_playwright_click()` - Click elements
- `mcp_playwright_type()` - Enter text

### Inspection Sequence

```
1. Create new page via MCP
   ↓
2. Navigate to report URL
   ↓
3. Take initial screenshot
   ↓
4. Get page HTML content
   ↓
5. Parse HTML to find elements
   ↓
6. Document actual selectors
   ↓
7. Test selector patterns
   ↓
8. Update page objects
   ↓
9. Verify updated selectors work
   ↓
10. Test in actual scenarios
```

---

## 📊 Current Selector Coverage

### Show Report Button Selectors (31 options)

**Text-Based** (7):
- button:has-text("Show Report")
- button:has-text("Display Report")
- button:has-text("Generate Report")
- button:has-text("View Report")
- button:has-text("Search")
- button:has-text("Find")
- button:has-text("Apply")

**Aria-Label Based** (7):
- button[aria-label*="Show"]
- button[aria-label*="Report"]
- button[aria-label*="Display"]
- button[aria-label*="Generate"]
- button[aria-label*="Search"]
- button[aria-label*="Find"]
- button[aria-label*="Apply"]

**Title & Class Based** (8):
- button[title*="Show"]
- button[title*="Report"]
- button[title*="Display"]
- button.btn-report
- button.search-button
- button.show-report-button
- button.report-button
- .action-button button

**Type & Role Based** (9):
- button[type="submit"]
- button[type="button"].btn-primary
- [role="button"]:has-text("Show Report")
- input[type="submit"]
- input[type="submit"][value*="Show"]
- input[type="submit"][value*="Report"]
- input[type="button"]
- input[type="button"][value*="Show"]
- input[type="button"][value*="Report"]

**Issue**: Coverage might have gaps depending on actual UI implementation

---

## 🎯 Expected Discoveries

### Likely Button Implementations
Based on common UI frameworks:
- DevExtreme: `button[aria-label="Show Report"]`
- Material UI: `button.MuiButton-root[aria-label*="show"]`
- Bootstrap: `button.btn.btn-primary`
- HTML native: `input[type="submit"][value="Show Report"]`
- Custom: `div.custom-button[role="button"]`

### Likely Table Implementations
Based on common UI frameworks:
- DevExtreme DataGrid: `dx-data-grid`
- AG Grid: `.ag-root`, `.ag-center-cols-clipper`
- Material Table: `table role="grid"`
- HTML native: `table tbody tr`
- Virtual scrolling: `div[role="grid"]`

---

## 📝 Documentation Approach

### Screenshot Analysis
1. Take screenshots at each stage
2. Document element locations
3. Note any visual issues
4. Record timing information

### Selector Verification Report
**For Each Selector**:
- Selector pattern
- Success rate (works / times tried)
- Performance (wait time)
- Notes/observations

### Recommendations
**For Each Page Object**:
- Working selector patterns
- Recommended primary selector
- Recommended fallback selectors
- Timing adjustments needed

---

## 🔄 Update Process

### When Selectors Are Verified

**For Report Button** in `shared-revenues-base.page.ts`:
```typescript
// Before (31 patterns)
const buttonSelectors = [
  'button:has-text("Show Report")',
  'button:has-text("Display Report")',
  // ... 29 more
];

// After (optimized based on inspection)
const buttonSelectors = [
  'dx-toolbar button[command="show"]',  // Primary (if DevExtreme)
  'button.btn-report',                   // Fallback 1
  'button:has-text("Show Report")',      // Fallback 2
  // ... refined list
];
```

### For Table Elements:
```typescript
// Before
const tableSelectors = [
  'table[role="grid"]',
  'dx-data-grid',
  // ... 11 more
];

// After (optimized)
const tableSelectors = [
  'dx-data-grid',                        // Primary
  '.dx-datagrid-rowsview',               // Alt 1
  'div[role="grid"]',                    // Alt 2
  // ... refined list
];
```

---

## ⏱️ Timing Optimization

### Current Wait Strategies
- Basic visibility check: 30 seconds timeout
- Generic retry: Every 500ms

### Optimized Strategies
Based on inspection, we'll implement:
- Framework-specific waits (e.g., dx-data-grid ready)
- Element-specific timeouts (button vs table)
- Progressive waits (quick check → slower check)

---

## 🎓 Expected Learnings

### About Report Pages
1. Which UI framework is used (DevExtreme, Material, AG Grid, etc.)
2. Button naming and structure conventions
3. Table rendering patterns
4. Date input implementations
5. Loading states and indicators

### About Selectors
1. Which patterns work reliably
2. Which patterns fail consistently
3. Performance characteristics
4. Timing requirements
5. Environmental variations

### For Future Modules
Patterns discovered will inform how we refactor the 231 disabled step files

---

## 📋 Phase 3B Checklist

- [ ] Create MCP-based inspection script
- [ ] Navigate to shared revenues report
- [ ] Take initial screenshot
- [ ] Inspect button element
- [ ] Document button selectors
- [ ] Navigate to total transactions report
- [ ] Take screenshot
- [ ] Inspect button element
- [ ] Inspect table element
- [ ] Document table selectors
- [ ] Test selector patterns
- [ ] Update shared-revenues-base.page.ts
- [ ] Update total-transactions-revenue-entity.page.ts
- [ ] Verify 0 TypeScript errors
- [ ] Test in actual scenarios
- [ ] Document findings
- [ ] Create optimization report

---

## 🚀 Next Steps

1. **Immediate**: Set up Playwright MCP inspection
2. **Short-term**: Complete all inspections and analysis
3. **Medium-term**: Update page objects with findings
4. **Verification**: Run revenue test suite
5. **Documentation**: Create Phase 3B completion report

---

## 📞 Phase 3B Execution Strategy

This phase is **hands-on inspection work** that will:
- Verify current selector effectiveness
- Identify optimization opportunities
- Eliminate timeout failures
- Provide foundation for full framework migration

**Status**: ✅ Ready to Begin

