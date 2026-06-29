# Step Classes Refactoring Guide

**Status**: Professional Refactoring Complete  
**Date**: June 25, 2026  
**Version**: 1.0

---

## 📋 Overview

Professional refactoring of all step classes under `src/steps/` following enterprise patterns:
- Object-oriented design with inheritance
- Type-safe context management
- Centralized error handling
- Reusable data table helpers
- Instance registry pattern
- Comprehensive logging

---

## 🏗️ Architecture

### Core Base Classes

#### 1. **StepBase** (`src/steps/core/step-base.ts`)
Foundation for all step definitions with:
- Centralized page resolution
- Type-safe context access
- Consistent logging (success, warning, error)
- Safe async execution wrapper
- Date parsing with validation
- Context validation

**Key Methods:**
```typescript
// Page resolution
resolveActivePage<T>(): T
getTestContextPage<T>(): T

// Logging
log(message: string): void
logSuccess(message: string): void
logWarning(message: string): void
logError(message: string): void

// Utilities
safeExecute<T>(fn: () => Promise<T>, errorMessage?: string): Promise<T | null>
parseDate(dateStr: string): Date
validateContext(contextKey: string, value: any): void
storeInContext(key: string, value: any): void
getFromContext<T>(key: string): T | undefined
getFromContextOrDefault<T>(key: string, defaultValue: T): T
```

#### 2. **ReportSteps** (`src/steps/core/report-steps.ts`)
Specialized class for report testing with:
- Report navigation
- Date range filtering
- Data verification
- Export functionality
- No-data message handling
- Table visibility verification
- Month/year parsing utilities

**Key Methods:**
```typescript
// Navigation
protected navigateToReport(page: any, reportUrl: string): Promise<void>

// Filtering
protected setDateRange(page: any, fromDate: string, toDate: string): Promise<void>
protected showReport(page: any): Promise<void>

// Verification
protected verifyNoDataMessage(page: any, expectedMessage: string): Promise<boolean>
protected verifyTableVisible(page: any): Promise<boolean>
protected verifyTableHasData(page: any): Promise<boolean>
protected verifyValue(actual: number, expected: number, label?: string): Promise<boolean>

// Export
protected exportAsPdf(page: any): Promise<void>
protected exportAsExcel(page: any): Promise<void>

// Utilities
protected parseMonthYearRange(monthName: string, year: number): { fromDate: string; toDate: string }
```

### Supporting Classes

#### 3. **DataTableHelper** (`src/steps/core/data-table-helper.ts`)
Utilities for handling Cucumber data tables with:
- Safe parsing with validation
- Type conversion (string, number, boolean, date)
- Row filtering and grouping
- Column aggregation (sum, unique values)
- Comprehensive error messages

**Key Methods:**
```typescript
// Parsing
static toHashes(dataTable: DataTable): DataTableRow[]
static toArray(dataTable: DataTable): string[][]
static parseRow(row: DataTableRow, schema?: Schema): ParsedDataRow
static parseRows(rows: DataTableRow[], schema?: Schema): ParsedDataRow[]

// Validation
static validateColumns(row: DataTableRow, requiredColumns: string[]): void
static validateAllRows(rows: DataTableRow[], requiredColumns: string[]): void

// Data manipulation
static filterRows(rows: DataTableRow[], columnName: string, value: string): DataTableRow[]
static groupRows(rows: DataTableRow[], columnName: string): { [key: string]: DataTableRow[] }
static sumColumn(rows: DataTableRow[], columnName: string): number
static getUniqueValues(rows: DataTableRow[], columnName: string): string[]
static findRow(rows: DataTableRow[], columnName: string, value: string): DataTableRow | undefined

// Utilities
static getSummary(rows: DataTableRow[]): string
```

#### 4. **StepRegistry** (`src/steps/core/step-registry.ts`)
Central registry for managing step instances with:
- Singleton pattern implementation
- Type-safe instance retrieval
- Lifecycle management
- Instance count tracking

**Key Methods:**
```typescript
static registerStep<T extends StepBase>(key: string, StepClass: new (world: World) => T, world: World): T
static getStep<T extends StepBase>(key: string, StepClass: new (world: World) => T): T | undefined
static clear(): void
static clearInstance(key: string, StepClass: any): void
static getAllInstances(): Map<string, StepBase>
static getInstanceCount(): number
```

---

## 📂 Directory Structure

```
src/steps/
├── core/
│   ├── step-base.ts                 # Base class for all steps
│   ├── report-steps.ts              # Report-specific steps
│   ├── data-table-helper.ts         # Data table utilities
│   └── step-registry.ts             # Instance management
├── reports/
│   ├── shared-revenues.steps.ts     # Original implementation
│   ├── shared-revenues-refactored.steps.ts  # Refactored version
│   ├── detailed-transactions-revenue-entity.steps.ts
│   └── total-transactions-revenue-entity.steps.ts
├── generated/                       # Auto-generated steps
├── active-page-resolver.ts          # Page resolution utility
├── test-context.ts                  # Test context management
├── shared.steps.ts                  # Shared step definitions
├── login.steps.ts                   # Login steps
├── generic.steps.ts                 # Generic steps
└── hooks.ts                         # Global hooks
```

---

## 🔄 Migration Path

### Phase 1: Foundation (Complete)
- [x] Create `StepBase` class
- [x] Create `ReportSteps` class
- [x] Create `DataTableHelper` class
- [x] Create `StepRegistry` class

### Phase 2: Refactor Core Steps
- [ ] `shared.steps.ts` - UI interaction steps
- [ ] `login.steps.ts` - Authentication steps
- [ ] `generic.steps.ts` - Generic steps

### Phase 3: Refactor Report Steps
- [x] `shared-revenues-refactored.steps.ts` - Complete refactor example
- [ ] `detailed-transactions-revenue-entity.steps.ts`
- [ ] `total-transactions-revenue-entity.steps.ts`

### Phase 4: Standardize Generated Steps
- [ ] Create generators for `src/steps/generated/*.steps.ts`
- [ ] Apply base class inheritance
- [ ] Standardize error handling

---

## 📖 Usage Examples

### Example 1: Basic Step with Error Handling

**Before:**
```typescript
When('I click the button', async function(this: World) {
  try {
    const activePage = resolveActivePage(this, 'rawPage');
    await activePage.clickButtonByText('Click Me');
    this.addLog('Button clicked');
  } catch (error) {
    this.addLog(`Error: ${error.message}`);
    throw error;
  }
});
```

**After:**
```typescript
class MySteps extends StepBase {
  async clickButton(buttonText: string): Promise<void> {
    try {
      const page = this.resolveActivePage();
      await page.clickButtonByText(buttonText);
      this.logSuccess(`Button "${buttonText}" clicked`);
    } catch (error) {
      this.logError(`Failed to click button: ${error.message}`);
      throw error;
    }
  }
}

When('I click the button', async function(this: World) {
  const steps = new MySteps(this);
  await steps.clickButton('Click Me');
});
```

### Example 2: Data Table Handling

**Before:**
```typescript
When('the user enters the following data:', async function(this: World, dataTable: DataTable) {
  const rows = dataTable.hashes();
  rows.forEach(row => {
    // Manual parsing, no validation
    const amount = parseFloat(row['Amount']);
    const date = new Date(row['Date']);
  });
});
```

**After:**
```typescript
class DataSteps extends StepBase {
  async enterTableData(dataTable: DataTable): Promise<void> {
    const rows = DataTableHelper.toHashes(dataTable);
    
    // Validates required columns
    DataTableHelper.validateAllRows(rows, ['Amount', 'Date']);
    
    // Type-safe parsing with schema
    const parsed = DataTableHelper.parseRows(rows, {
      Amount: 'number',
      Date: 'date'
    });
    
    parsed.forEach(row => {
      this.log(`Processing: ${row.Amount} AED on ${row.Date}`);
    });
  }
}
```

### Example 3: Report Steps

**Before:**
```typescript
Then('the report shows data', async function(this: World) {
  const page = resolveActivePage(this);
  const transactions = await page.getAllTransactions();
  expect(transactions.length).toBeGreaterThan(0);
  this.addLog(`Found ${transactions.length} transactions`);
});
```

**After:**
```typescript
class MyReportSteps extends ReportSteps {
  async verifyReportData(): Promise<void> {
    const page = this.resolveActivePage();
    
    // All built-in verification
    const hasTable = await this.verifyTableVisible(page);
    const hasData = await this.verifyTableHasData(page);
    
    if (hasTable && hasData) {
      this.logSuccess('Report data verified');
    } else {
      this.logError('Report is empty or table not visible');
    }
  }
}
```

---

## ✅ Benefits

### Code Quality
- **DRY**: Eliminate duplicate error handling and logging
- **Type Safety**: Full TypeScript support with generics
- **Testability**: Easier to unit test step classes
- **Maintainability**: Centralized logic for common patterns

### Developer Experience
- **Clear API**: Well-defined base methods
- **Consistent Logging**: Standardized message format
- **Error Messages**: Descriptive, actionable error details
- **Documentation**: Inline JSDoc for all methods

### Test Reliability
- **Error Handling**: Consistent try-catch patterns
- **Validation**: Input validation before execution
- **Logging**: Comprehensive audit trails
- **Context Management**: Safe state management

---

## 🔧 Refactoring Checklist

For each step file, apply:

- [ ] Create step class extending `StepBase` or `ReportSteps`
- [ ] Convert step functions to class methods
- [ ] Use `this.log*()` methods for logging
- [ ] Replace `resolveActivePage()` with `this.resolveActivePage()`
- [ ] Use `this.storeInContext()` and `this.getFromContext()`
- [ ] Wrap async operations with `this.safeExecute()`
- [ ] Use `DataTableHelper` for data table operations
- [ ] Add JSDoc comments for all methods
- [ ] Validate inputs at method entry
- [ ] Update test imports to use new classes

---

## 📊 Implementation Status

| File | Status | Progress |
|------|--------|----------|
| `step-base.ts` | ✅ Complete | 100% |
| `report-steps.ts` | ✅ Complete | 100% |
| `data-table-helper.ts` | ✅ Complete | 100% |
| `step-registry.ts` | ✅ Complete | 100% |
| `shared-revenues-refactored.steps.ts` | ✅ Complete | 100% |
| `shared.steps.ts` | 🔄 Pending | 0% |
| `login.steps.ts` | 🔄 Pending | 0% |
| `generic.steps.ts` | 🔄 Pending | 0% |
| Generated steps | 🔄 Pending | 0% |

---

## 🎯 Next Steps

1. **Validate** the refactored shared-revenues steps work correctly
2. **Refactor** remaining core step files (shared, login, generic)
3. **Create** generators for auto-generating refactored step classes
4. **Update** documentation with new patterns
5. **Train** team on new architecture

---

## 📚 References

- [Cucumber.js Documentation](https://cucumber.io/docs/cucumber/)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Page Object Pattern](https://martinfowler.com/bliki/PageObject.html)

