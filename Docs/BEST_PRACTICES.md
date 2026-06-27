# Best Practices & Recommendations

## Code Organization

### 1. Directory Structure
```
src/
├── pages/           # Page Objects
│   ├── base.page.ts
│   ├── login.page.ts
│   └── reports/     # Group by module
│       └── total-transactions-revenue-entity.page.ts
├── steps/           # Step Definitions
│   ├── hooks.ts
│   ├── shared.steps.ts
│   └── reports/     # Group by feature
│       └── total-transactions-revenue-entity.steps.ts
├── models/          # Data Models & Interfaces
│   ├── user.model.ts
│   └── revenue-entity.model.ts
├── data/            # Test Data Factories
│   ├── test-data.factory.ts
│   └── report-test-data.factory.ts
├── utils/           # Helper Utilities
│   ├── auth.manager.ts
│   ├── wait.helper.ts
│   └── report-validator.ts
├── config/          # Configuration
│   └── config.ts
└── fixtures/        # Test Fixtures
    ├── browser.fixture.ts
    └── world.fixture.ts
```

### 2. Naming Conventions

**Files:**
- Page objects: `{feature}-page.ts` (e.g., `total-transactions-revenue-entity-page.ts`)
- Step definitions: `{feature}.steps.ts` (e.g., `total-transactions-revenue-entity.steps.ts`)
- Models: `{entity}.model.ts` (e.g., `revenue-entity.model.ts`)
- Utilities: `{purpose}.ts` (e.g., `report-validator.ts`)
- Factories: `{entity}-test-data.factory.ts` (e.g., `report-test-data.factory.ts`)

**Classes:**
- Pages: `{Feature}Page` (PascalCase, e.g., `TotalTransactionsRevenueEntityPage`)
- Factories: `{Entity}TestDataFactory` (e.g., `ReportTestDataFactory`)
- Utilities: `{Purpose}` (e.g., `ReportValidator`)

**Methods:**
- Actions: Verb + noun (e.g., `setFromDate()`, `selectRevenueEntity()`, `showReport()`)
- Getters: `get{Property}()` or `retrieve{Property}()` (e.g., `getTotalAmount()`)
- Verifiers: `verify{Condition}()` (e.g., `verifyEntityInReport()`)
- Validators: `validate{Rule}()` (e.g., `validateGrandTotal()`)

## Page Object Model Best Practices

### 1. Locators
✅ **DO:**
```typescript
// Use stable role-based selectors
readonly showReportButton = 'button:has-text("Show Report")';
readonly fromDateInput = 'input[aria-label*="From"]';

// Use data attributes where available
readonly reportTable = 'table[role="grid"]';

// Provide fallbacks
readonly entityFilterDropdown = 'div[aria-label*="Entity"], select[aria-label*="Entity"]';
```

❌ **DON'T:**
```typescript
// Don't use XPath
readonly button = '//button[@id="btn_123"]';

// Don't use fragile CSS
readonly cell = 'table tbody tr:nth-child(5) td:nth-child(3)';

// Don't hardcode IDs (auto-generated)
readonly input = '#dx-widget-12345-input';
```

### 2. Method Design
✅ **DO:**
```typescript
// Single responsibility
async setFromDate(date: string): Promise<void> {
  await this.fillFilterInput(this.fromDateInput, date);
}

// Clear method names
async showReport(): Promise<void> {
  await this.click(this.showReportButton);
  await this.wait.forNetworkIdle();
}

// Return meaningful data
async getAllReportData(): Promise<ReportRow[]> {
  // Implementation
}
```

❌ **DON'T:**
```typescript
// Don't combine actions
async applyFilterAndShowAndWait() {
  // Too much responsibility
}

// Don't return ambiguous types
async getData(): any {
  // Type safety lost
}

// Don't add assertions
async getTransactionCount(entity: string): Promise<number> {
  const count = ...;
  expect(count).toBeGreaterThan(0); // ❌ NO!
  return count;
}
```

### 3. Error Handling
✅ **DO:**
```typescript
async getTotalAmount(entityName: string): Promise<number> {
  const rows = this.page.locator(this.reportTable + ' tbody tr');
  const count = await rows.count();

  for (let i = 0; i < count; i++) {
    const entityCell = rows.nth(i).locator('td').first();
    const text = await entityCell.textContent();
    if (text?.trim() === entityName) {
      // Found entity, extract amount
      const amountCell = rows.nth(i).locator('td').nth(2);
      const amountText = await amountCell.textContent();
      return parseFloat(amountText?.replace(/[^0-9.]/g, '') || '0');
    }
  }
  
  return 0; // Default if not found
}
```

❌ **DON'T:**
```typescript
// Don't ignore errors
async getTotalAmount(entityName: string): Promise<number> {
  const row = this.page.locator(`text=${entityName}`).first(); // Fails if not found
  const amount = await row.locator('td:nth-child(3)').textContent();
  return parseFloat(amount);
}
```

## Step Definition Best Practices

### 1. Step Structure
✅ **DO:**
```typescript
When('the user runs the {string} for {string}', async function (this: World, reportName: string, dateRange: string) {
  // Setup
  if (!reportPage) {
    throw new Error('Report page not initialized');
  }

  // Action
  await reportPage.navigateToReport();
  const [month, year] = dateRange.split(' ');
  const fromDate = `${year}-${getMonthNumber(month)}-01`;
  const toDate = `${year}-${getMonthNumber(month)}-${getDaysInMonth(month, parseInt(year))}`;
  
  await reportPage.setFromDate(fromDate);
  await reportPage.setToDate(toDate);
  await reportPage.showReport();

  // Logging
  this.addLog(`Report generated for ${dateRange}`);
});
```

❌ **DON'T:**
```typescript
// Don't hard-code data
When('the user runs the report', async function() {
  await reportPage.setFromDate('2026-06-01');
  await reportPage.setToDate('2026-06-30');
});

// Don't mix concerns
Then('data is {string}', async function(condition: string) {
  if (condition === 'valid') {
    // Too generic, unclear what's being validated
  }
});
```

### 2. Data Table Handling
✅ **DO:**
```typescript
Then('the report shows:', async function (this: World, dataTable: any) {
  const expectedData = dataTable.hashes().map((row: any) => ({
    entity: row['Revenue Entity'],
    count: parseInt(row['Transaction Count'], 10),
    amount: parseFloat(row['Total Amount'])
  }));

  await reportPage.verifyReportDataMatches(expectedData);
});
```

❌ **DON'T:**
```typescript
// Don't assume column order
Then('the report shows:', async function(dataTable: any) {
  const rows = dataTable.raw();
  const data = rows.map(r => ({
    entity: r[0],
    count: r[1],
    amount: r[2]
  }));
});
```

### 3. Error Messages
✅ **DO:**
```typescript
expect(actualGrandTotal).toBe(expectedGrandTotal);
this.addLog(`Verified grand total: ${actualGrandTotal} AED (expected: ${expectedGrandTotal})`);

// Throw meaningful error
throw new Error(`Entity ${expected.entity} not found. Available: ${available.join(', ')}`);
```

❌ **DON'T:**
```typescript
expect(actualGrandTotal).toBe(expectedGrandTotal); // Just assertion

// Generic error
throw new Error('Test failed');
```

## Test Data Best Practices

### 1. Test Data Organization
✅ **DO:**
```typescript
// Group by scenario/module
export const TEST_TRANSACTIONS = {
  JUNE_2026: {
    'Entity-A': { count: 50, amount: 100000.00 },
    'Entity-B': { count: 30, amount: 45000.00 }
  }
};

// Use factories for generation
class ReportTestDataFactory {
  static getJuneTransactions(): TransactionData[] {
    // Generate from constant
  }
}
```

❌ **DON'T:**
```typescript
// Hardcoded in steps
const data = [
  { entity: 'Entity-A', count: 50 },
  { entity: 'Entity-B', count: 30 }
];

// Magic numbers
const amount = 100000.00; // What is this?
```

### 2. Data Consistency
✅ **DO:**
```typescript
// Verify consistency
export class ReportTestDataFactory {
  static verifyDataConsistency(): boolean {
    const grandTotal = this.getGrandTotal();
    const calculated = this.calculateExpectedGrandTotal();
    
    const tolerance = 0.01;
    const difference = Math.abs(grandTotal.totalAmount - calculated);
    
    return difference <= tolerance;
  }
}
```

❌ **DON'T:**
```typescript
// Inconsistent data
export const GRAND_TOTAL = 150000.00; // Doesn't match sum
```

## Validation Best Practices

### 1. Validation Strategy
✅ **DO:**
```typescript
// Use dedicated validator
const result = ReportValidator.compareReportData(expected, actual);
ReportValidator.assertValid(result, 'Report data validation');

// Provide tolerance for decimals
const tolerance = 0.01; // AED precision
const difference = Math.abs(actual - expected);
expect(difference).toBeLessThanOrEqual(tolerance);
```

❌ **DON'T:**
```typescript
// Direct comparison with floats
expect(actual).toBe(expected); // Fails due to precision

// Generic assertions
expect(data).toBeTruthy();
```

### 2. Error Reporting
✅ **DO:**
```typescript
// Detailed error messages
throw new Error(
  `Grand total mismatch: calculated ${calculated}, ` +
  `expected ${expectedGrandTotal} (difference: ${difference})`
);
```

❌ **DON'T:**
```typescript
// Vague messages
throw new Error('Validation failed');
```

## Async/Await Best Practices

✅ **DO:**
```typescript
// Use async/await consistently
async setFromDate(date: string): Promise<void> {
  await this.fillFilterInput(this.fromDateInput, date);
}

// Handle Promise properly
try {
  await reportPage.showReport();
} catch (error) {
  this.addLog(`Report generation failed: ${error.message}`);
  throw error;
}
```

❌ **DON'T:**
```typescript
// Mix Promise patterns
async setFromDate(date: string) {
  return this.fillFilterInput(this.fromDateInput, date);
}

// Forget await
setFromDate(date).then(...); // Better: await
```

## Logging Best Practices

✅ **DO:**
```typescript
// Log meaningful actions
this.addLog(`Report generated for ${dateRange}`);
this.addLog(`Verified entity ${entity}: count=${count}, amount=${amount}`);

// Use structured logging
this.addLog(`[ACTION] Set from date to: ${fromDate}`);
this.addLog(`[ASSERTION] Grand total verified: ${actualTotal} AED`);
```

❌ **DON'T:**
```typescript
// Verbose logging
this.addLog('Starting test');
this.addLog('In method');

// Unclear logging
this.addLog('Done');
```

## Performance Best Practices

### 1. Waits
✅ **DO:**
```typescript
// Use explicit waits
await this.wait.forElement(this.reportTable);
await this.wait.forNetworkIdle();

// Use reasonable timeouts
await this.wait.forElement(selector, { timeout: 10000 });
```

❌ **DON'T:**
```typescript
// Hardcoded waits
await new Promise(r => setTimeout(r, 5000));

// No waits
await this.page.click(selector);
```

### 2. Data Fetching
✅ **DO:**
```typescript
// Cache locators
const rows = this.page.locator(`${this.reportTable} tbody tr`);
const count = await rows.count(); // Single query

// Limit iteration
for (let i = 0; i < Math.min(count, 100); i++) {
  // Process
}
```

❌ **DON'T:**
```typescript
// Redundant queries
for (let i = 0; i < count; i++) {
  const rows = this.page.locator(...); // Repeated
  const row = rows.nth(i);
}
```

## Security Best Practices

✅ **DO:**
```typescript
// Use environment variables
const storageStateFile = `storageState.${process.env.TEST_ENV}.json`;

// Don't log sensitive data
this.addLog(`User logged in`); // Not: `User: ${username}`

// Validate inputs
if (!entityName || typeof entityName !== 'string') {
  throw new Error('Invalid entity name');
}
```

❌ **DON'T:**
```typescript
// Hardcode credentials
const token = 'super-secret-token';

// Log sensitive data
this.addLog(`Password: ${password}`);

// Skip validation
const entity = userInput; // Directly used
```

## Documentation Best Practices

✅ **DO:**
```typescript
/**
 * Get transaction count for a specific revenue entity
 * 
 * @param entityName - The name of the revenue entity (e.g., 'Entity-A')
 * @returns The count of transactions for the entity, or 0 if not found
 * @throws Error if table is not visible
 */
async getTransactionCount(entityName: string): Promise<number> {
  // Implementation
}
```

❌ **DON'T:**
```typescript
// No documentation
async getTransactionCount(entityName: string): Promise<number> {
  // Implementation
}

// Unclear documentation
// Gets count
async getCount(e: string): Promise<number> {
  // Implementation
}
```

## Testing Best Practices

### 1. Test Isolation
✅ **DO:**
```typescript
// Each test is independent
Before(() => {
  // Fresh setup per scenario
});

After(() => {
  // Clean up resources
});
```

❌ **DON'T:**
```typescript
// Tests depend on execution order
// Scenario 1 creates data for Scenario 2
```

### 2. Assertion Strategy
✅ **DO:**
```typescript
// One logical assertion per Then step
Then('the grand total amount is {float} AED', async function(expected: number) {
  const actual = await reportPage.getGrandTotalAmount();
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(0.01);
});
```

❌ **DON'T:**
```typescript
// Multiple unrelated assertions
Then('the report is correct', async function() {
  const data = await reportPage.getAllReportData();
  expect(data.length).toBeGreaterThan(0);
  expect(data[0].count).toBeGreaterThan(0);
  expect(data[0].amount).toBeGreaterThan(0);
  // Too many assertions
});
```

## Maintenance Best Practices

### 1. Keep Tests Updated
- Review UI changes monthly
- Update locators proactively
- Monitor execution trends
- Update test data with new rules

### 2. Monitor Quality Metrics
- Track test execution time
- Monitor flaky scenarios
- Review error patterns
- Measure coverage

### 3. Refactoring
- Extract common patterns to base classes
- Remove duplicate code
- Update documentation
- Add comments for complex logic

---

**Remember:** Test code is production code. Apply the same standards of clarity, maintainability, and quality to your tests as you do to the application code.
