# Step Refactoring - Quick Start Guide

Professional refactoring patterns for step classes. Copy & adapt for your use case.

---

## 🚀 Quick Templates

### Template 1: Simple Steps Class

```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { World } from '../../fixtures/world.fixture';
import { StepBase } from '../core/step-base';

class SimpleSteps extends StepBase {
  doSomething(value: string): void {
    try {
      this.log(`Performing action with: ${value}`);
      // Your implementation
      this.logSuccess('Action completed');
    } catch (error) {
      this.logError(`Action failed: ${error.message}`);
      throw error;
    }
  }
}

let steps: SimpleSteps;

Given('I setup {string}', async function(this: World, value: string) {
  steps = new SimpleSteps(this);
  steps.doSomething(value);
});
```

### Template 2: Report Steps Class

```typescript
import { When, Then } from '@cucumber/cucumber';
import { World } from '../../fixtures/world.fixture';
import { ReportSteps } from '../core/report-steps';
import { MyReportPage } from '../../pages/reports/my-report.page';
import { testContext } from '../test-context';

class MyReportSteps extends ReportSteps {
  private reportPage: MyReportPage | null = null;

  initialize(page: any): void {
    if (page && !this.reportPage) {
      this.reportPage = new MyReportPage(page);
      testContext.setPage(this.reportPage);
    }
  }

  private getReportPage(): MyReportPage {
    if (!this.reportPage) throw new Error('Report page not initialized');
    return this.reportPage;
  }

  async runReport(dateRange: string): Promise<void> {
    const [month, year] = dateRange.split(' ');
    const { fromDate, toDate } = this.parseMonthYearRange(month, parseInt(year));
    
    const page = this.getReportPage();
    await this.navigateToReport(page, page.reportUrl || '');
    await this.setDateRange(page, fromDate, toDate);
    await this.showReport(page);
    
    this.logSuccess(`Report executed for ${dateRange}`);
  }
}
```

### Template 3: Data Table Handling

```typescript
import { When } from '@cucumber/cucumber';
import { World } from '../../fixtures/world.fixture';
import { StepBase } from '../core/step-base';
import { DataTableHelper } from '../core/data-table-helper';
import { DataTable } from '@cucumber/cucumber';

class DataSteps extends StepBase {
  async setupUsers(dataTable: DataTable): Promise<void> {
    const rows = DataTableHelper.toHashes(dataTable);
    
    // Validate required columns
    DataTableHelper.validateAllRows(rows, ['Username', 'Email', 'Role']);
    
    // Parse with type conversion
    const users = DataTableHelper.parseRows(rows, {
      Username: 'string',
      Email: 'string',
      Role: 'string'
    });
    
    this.log(`Setting up ${users.length} users`);
    
    // Use helper methods
    const roles = DataTableHelper.getUniqueValues(rows, 'Role');
    this.log(`Roles: ${roles.join(', ')}`);
    
    // Store for later
    this.storeInContext('users', users);
    this.logSuccess(`${users.length} users configured`);
  }
}
```

---

## 📝 Common Patterns

### Pattern 1: Before/After Initialization

```typescript
class MySteps extends ReportSteps {
  private page: MyPage | null = null;

  initialize(page: any): void {
    if (page && !this.page) {
      this.page = new MyPage(page);
      testContext.setPage(this.page);
      this.log('Page initialized');
    }
  }

  reset(): void {
    this.page = null;
    this.log('Page reset');
  }
}

let steps: MySteps;

Before(function(this: World) {
  steps = new MySteps(this);
  if (this.page) steps.initialize(this.page);
});

After(function(this: World) {
  if (steps) steps.reset();
});
```

### Pattern 2: Context Management

```typescript
// Store data
this.storeInContext('userId', 123);
this.storeInContext('userData', { name: 'John', email: 'john@example.com' });

// Retrieve data
const userId = this.getFromContext<number>('userId');
const userData = this.getFromContext('userData');

// With default value
const status = this.getFromContextOrDefault<string>('status', 'pending');

// Validate context exists
this.validateContext('userId', userId);
```

### Pattern 3: Safe Async Execution

```typescript
// Automatic error handling
const result = await this.safeExecute(
  async () => {
    const data = await page.fetchData();
    return data.length;
  },
  'Failed to fetch data'
);

// Result is null on error, or the actual value
if (result !== null) {
  this.log(`Fetched ${result} items`);
}
```

### Pattern 4: Date Parsing

```typescript
// ISO date format (YYYY-MM-DD)
const date = this.parseDate('2026-06-15');
this.log(`Parsed date: ${date.toISOString()}`);

// Month/Year parsing
const { fromDate, toDate } = this.parseMonthYearRange('June', 2026);
this.log(`June 2026: ${fromDate} to ${toDate}`);

// With error handling
try {
  const date = this.parseDate('invalid-date');
} catch (error) {
  this.logError(error.message); // "Invalid date format..."
}
```

### Pattern 5: Verification with Values

```typescript
// Verify numeric value
await this.verifyValue(actualAmount, expectedAmount, 'Total Amount');

// Inside method
const actualTotal = await page.getTotal();
await this.verifyValue(actualTotal, 1500.00, 'Transaction Total');
```

---

## 🎯 Migration Checklist

For each step file:

```
[ ] Import base class: import { StepBase } from '../core/step-base'
[ ] Create step class: class MySteps extends StepBase { }
[ ] Create instance variable: let steps: MySteps
[ ] Add Before hook for initialization
[ ] Add After hook for cleanup
[ ] Convert step functions to class methods
[ ] Replace this.addLog() with this.log()
[ ] Replace resolveActivePage() with this.resolveActivePage()
[ ] Add error handling with try-catch
[ ] Use this.logSuccess() for success messages
[ ] Use this.logError() for errors
[ ] Store context with this.storeInContext()
[ ] Retrieve context with this.getFromContext()
[ ] Add JSDoc comments
[ ] Test with `npm test`
```

---

## 🔍 Error Handling Examples

### Before: Manual error handling

```typescript
When('I do something', async function(this: World) {
  try {
    const page = resolveActivePage(this);
    await page.doSomething();
    this.addLog('Done');
  } catch (error) {
    this.addLog(`Error: ${error.message}`);
    throw error;
  }
});
```

### After: Using StepBase

```typescript
class MySteps extends StepBase {
  async doSomething(): Promise<void> {
    const page = this.resolveActivePage();
    await this.safeExecute(
      () => page.doSomething(),
      'Failed to perform action'
    );
    this.logSuccess('Action completed');
  }
}

When('I do something', async function(this: World) {
  const steps = new MySteps(this);
  await steps.doSomething();
});
```

---

## 📊 Logging Examples

```typescript
// Different log levels
this.log('Starting report generation...');              // Info
this.logSuccess('Report generated');                    // Success ✅
this.logWarning('Report is taking longer than usual');  // Warning ⚠️
this.logError('Failed to generate report');             // Error ❌

// With context
this.log(`Processing user: ${userId}`);
this.log(`Total amount: ${amount} AED`);
this.logSuccess(`Added ${count} items to cart`);
```

---

## ✅ Testing Your Refactored Steps

```bash
# Run specific feature
npm test -- Features/MyFeature.feature

# Run specific tags
npm test -- --tags @revenue

# Run with report
npm test -- --format json:report.json
```

---

## 🐛 Troubleshooting

### Issue: "Report page not initialized"
**Solution**: Ensure Before hook calls `steps.initialize(this.page)`

### Issue: Context value is undefined
**Solution**: Use `getFromContextOrDefault()` with a fallback value

### Issue: Date parsing fails
**Solution**: Use ISO format (YYYY-MM-DD). Example: `2026-06-15`

### Issue: Data table validation error
**Solution**: Check column names match exactly (case-sensitive)

### Issue: "Active page instance not set"
**Solution**: Call `testContext.setPage(pageInstance)` in initialize method

---

## 💡 Pro Tips

1. **Always validate inputs** at method entry
2. **Use meaningful variable names** for clarity
3. **Store important data in context** for later steps
4. **Log entry and exit** of important operations
5. **Group related steps** in single class
6. **Reuse helper methods** from base classes
7. **Add JSDoc** to all public methods
8. **Test error cases** during development

---

## 📚 Related Files

- `STEP_REFACTORING_GUIDE.md` - Complete refactoring architecture
- `src/steps/core/step-base.ts` - Base class reference
- `src/steps/core/report-steps.ts` - Report-specific methods
- `src/steps/core/data-table-helper.ts` - Data table utilities
- `src/steps/reports/shared-revenues-refactored.steps.ts` - Full example

