# Playwright MCP Inspector Guide - Revenue Reports Selectors

**Purpose**: Use Playwright MCP to inspect actual UI elements and find correct selectors  
**Status**: Ready for QA team execution  
**Target**: Tahseel Revenue Reports Application

---

## 🎯 Inspection Tasks

### Task 1: Inspect Report Page Elements
**Objective**: Find actual selectors for report UI elements  
**Expected Time**: 20-30 minutes

#### Elements to Inspect:
1. **Report Data Grid/Table**
   - Current selector: `table[role="grid"], table.report-table, dx-data-grid`
   - Need to find: Actual table/grid element used by app
   - Look for: HTML tag, class names, role attributes, data attributes

2. **Show Report / Display Report Button**
   - Current selector: `button:has-text("Show Report"), button[aria-label*="Show"]`
   - Need to find: Actual button selector
   - Look for: Button text, aria-label, id, class, type

3. **Date Range Inputs (From/To)**
   - Current selector: `input[aria-label*="From"], input[placeholder*="From"]`
   - Need to find: Actual date input selectors
   - Look for: Input type, aria-label, placeholder, name, id

4. **Entity Filter Dropdown**
   - Current selector: `select[aria-label*="Entity"], div[role="combobox"][aria-label*="Entity"]`
   - Need to find: Actual dropdown selector
   - Look for: select/div tag, role, aria-label, class

5. **Service Filter Dropdown**
   - Current selector: Similar to entity filter
   - Need to find: Actual filter dropdown

---

## 📋 MCP Inspection Sequence

### Step 1: Navigate to Report Page
```
Use: mcp_playwright_navigate
URL: [Your Tahseel App URL]/reports/shared-revenues
or: [Your Tahseel App URL]/reports/detailed-transactions
Expected: Page loads with report filters and data table
```

### Step 2: Take Screenshot for Visual Reference
```
Use: mcp_playwright_take_screenshot
Expected: Screenshot showing full report page with UI elements
Action: Review to identify DOM structure
```

### Step 3: Get Page HTML Content
```
Use: mcp_playwright_get_page_content
Expected: Full page HTML structure
Action: Search for these identifiers:
- Element tags: <table>, <dx-data-grid>, <button>
- Class names: report, grid, table, button, filter
- IDs: containing "report", "grid", "filter"
- aria-labels: containing "Report", "Show", "Filter"
- data attributes: data-field, data-test, data-name
```

### Step 4: Inspect Individual Elements
```
Use: mcp_playwright_get_text
Selector: [Element selector you find]
Expected: Text content to confirm element purpose
```

### Step 5: Validate with Click Test (Optional)
```
Use: mcp_playwright_click
Selector: [Candidate button selector]
Expected: No error = selector is valid and clickable
```

---

## 🔍 What to Look For

### Report Grid/Table
- **HTML structure**:
  ```html
  <!-- DevExtreme (DxDataGrid) -->
  <dx-data-grid ...></dx-data-grid>
  
  <!-- Standard HTML Table -->
  <table role="grid">...</table>
  <table class="report-table">...</table>
  
  <!-- Custom Grid Component -->
  <div role="grid" class="custom-grid">...</div>
  ```

- **Identifying attributes**:
  - Check for `role="grid"`, `role="table"`
  - Check for class names with "grid", "table", "data", "report"
  - Check for data attributes like `data-component`, `data-widget`
  - Check for specific framework indicators (dx-, ag-, etc.)

### Report Display Button
- **Common patterns**:
  ```html
  <button>Show Report</button>
  <button aria-label="Show Report">Display</button>
  <button type="submit">Search</button>
  <dx-button>Show Report</dx-button>
  <input type="submit" value="Show Report">
  ```

- **Identifying attributes**:
  - Text content: "Show Report", "Display", "Generate", "Search"
  - aria-label: containing "Report", "Show", "Display"
  - type: "submit"
  - class: containing "btn", "button", "report"

### Date Inputs
- **Common patterns**:
  ```html
  <input type="date" aria-label="From Date">
  <input type="date" placeholder="From Date" name="fromDate">
  <input type="text" class="date-picker" id="fromDate">
  ```

- **Identifying attributes**:
  - type: "date" or "text"
  - aria-label or placeholder: containing "From", "To", "Date"
  - name: containing "from", "to", "date"
  - id: containing "from", "to", "date"

### Filter Dropdowns
- **Common patterns**:
  ```html
  <select aria-label="Entity">
  <div role="combobox" aria-label="Entity">
  <dx-select-box aria-label="Entity">
  ```

- **Identifying attributes**:
  - role: "combobox", "listbox"
  - aria-label: containing "Entity", "Service", "Filter"
  - type: for standard select
  - class: containing "select", "dropdown", "filter"

---

## 💾 Selector Collection Template

Use this template to document findings:

```markdown
## Element: Report Grid/Table
- **Tag**: [dx-data-grid | table | div | other]
- **Class**: [class names found]
- **ID**: [id found or N/A]
- **Role**: [role attribute]
- **Recommended Selector**: [single best selector or fallback chain]
- **MCP Test**: Click selector and verify success

## Element: Show Report Button
- **Tag**: [button | input | dx-button | other]
- **Text**: [button text]
- **aria-label**: [aria-label if present]
- **Class**: [class names]
- **ID**: [id if present]
- **Recommended Selector**: [single best selector]
- **MCP Test**: Click and verify page responds

## Element: From Date Input
- **Tag**: [input | div | other]
- **Type**: [type attribute]
- **aria-label/placeholder**: [label found]
- **Name/ID**: [name or id]
- **Recommended Selector**: [single best selector]

## Element: To Date Input
- (Same as From Date)

## Element: Entity Filter
- **Tag**: [select | div | dx-select-box]
- **aria-label**: [label found]
- **Class**: [class names]
- **Recommended Selector**: [single best selector]

## Element: Service Filter
- (Same as Entity Filter)
```

---

## 🚀 Instructions for QA Team

1. **Open the Tahseel application** in your test environment
2. **Navigate to Revenue Reports page** (Shared Revenues or Total Transactions)
3. **Use MCP tools** to inspect each element following the sequence above
4. **Document findings** using the template provided
5. **Test each selector** by attempting to click it via MCP
6. **Report results** with working selectors for each element

---

## ⚠️ Common Issues & Solutions

### Issue: "Element not found" errors
- **Cause**: Selector too specific or element hasn't rendered
- **Solution**: 
  - Check for dynamic element generation (use generic selectors first)
  - Ensure page loaded completely (check for loading spinners)
  - Look for shadow DOM (DevExtreme uses this)

### Issue: Multiple elements matching selector
- **Cause**: Selector matches multiple buttons/inputs
- **Solution**:
  - Use more specific attributes (aria-label, id, name)
  - Use position strategies (first, last, nth)
  - Combine selectors for uniqueness

### Issue: Element is visible but not clickable
- **Cause**: Element disabled, overlapped, or has no click handler
- **Solution**:
  - Check for `disabled` attribute
  - Check for opacity/visibility styles
  - Look for parent elements blocking clicks
  - Check for focus/tab requirements

### Issue: DevExtreme (DxDataGrid) specific
- **Cause**: DxDataGrid uses shadow DOM and dynamic rendering
- **Solution**:
  - Target the `dx-data-grid` web component directly
  - Use role="grid" for cells
  - Look for `.dx-datagrid-rowsview` for rows
  - Use `.dx-data-row` for individual rows

---

## 📊 Expected Output

After inspection, you should have:

| Element | Current Selector | Real Selector | Status |
|---------|------------------|---------------|--------|
| Report Grid | `table[role="grid"], table.report-table, dx-data-grid` | `dx-data-grid` OR `table.data-grid` | ✓ Found |
| Show Report Button | `button:has-text("Show Report")...` | `button[aria-label="Show Report"]` OR `input[type="submit"]` | ✓ Found |
| From Date | `input[aria-label*="From"]...` | `input[name="fromDate"]` OR `input#dateFrom` | ✓ Found |
| To Date | `input[aria-label*="To"]...` | `input[name="toDate"]` OR `input#dateTo` | ✓ Found |
| Entity Filter | `select[aria-label*="Entity"]...` | `dx-select-box[aria-label="Entity"]` | ✓ Found |
| Service Filter | `select[aria-label*="Service"]...` | `dx-select-box[aria-label="Service"]` | ✓ Found |

---

## 📝 Next Steps After Inspection

Once selectors are identified:

1. Update `src/pages/reports/shared-revenues-base.page.ts`
   - Replace multi-fallback selectors with single working selector
   - Keep 1-2 fallbacks for robustness
   - Remove non-matching selectors

2. Update `src/pages/reports/total-transactions-revenue-entity.page.ts`
   - Similar selector updates

3. Run tests to verify:
   - `npm run test:reports` or similar
   - Check for timeout errors (should be resolved)
   - Verify report data loads correctly

4. Commit changes with note of selectors found

---

## 🎓 Using MCP Tools Reference

### Get Page Content
```
Use: mcp_playwright_get_page_content
Returns: Full HTML of current page
Use for: Analyzing DOM structure
```

### Take Screenshot
```
Use: mcp_playwright_take_screenshot
Returns: Visual screenshot
Use for: Identifying UI layout
```

### Get Element Text
```
Use: mcp_playwright_get_text
Selector: "button:visible"
Returns: Text content
Use for: Verifying element purpose
```

### Click Element
```
Use: mcp_playwright_click
Selector: "button[aria-label='Show Report']"
Returns: Success/failure
Use for: Testing selector validity
```

### Navigate
```
Use: mcp_playwright_navigate
URL: "https://app.example.com/reports"
Returns: Success/failure
Use for: Going to report page
```

---

**Status**: Ready for QA team with Playwright MCP access  
**Estimated Time**: 30-60 minutes total inspection  
**Result**: Confirmed selectors for all 6 key report UI elements
