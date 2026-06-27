# Quick Reference Guide

## Test Execution Commands

```bash
# Setup authentication (one time)
npm run auth:setup-stage

# Run all report tests
npm run test Features/Reports/4.Revenue_Reports/Total_Transactions_Report_by_Revenue_Entity.feature

# Run specific tag
npm run test -- --tags "@positive"           # Positive scenario
npm run test -- --tags "@negative"           # Negative scenarios
npm run test -- --tags "@rbac"               # RBAC scenario
npm run test -- --tags "@e2e"                # End-to-end test

# Run specific scenario
npm run test -- --name "Summary aggregation"

# Dry run (syntax check)
npm run test -- --dry-run

# Generate reports
npm run report:generate
```

## Page Object Methods Quick Reference

### Navigation & Filters
```typescript
navigateToReport()              // Open report page
setFromDate(date: string)       // Set from date filter (YYYY-MM-DD)
setToDate(date: string)         // Set to date filter (YYYY-MM-DD)
selectRevenueEntity(entity)     // Select entity from dropdown
showReport()                    // Apply filters and show report
clearFilters()                  // Clear all filters
```

### Data Extraction
```typescript
getRevenueEntities()            // Get all entities in report
getTransactionCount(entity)     // Get transaction count for entity
getTotalAmount(entity)          // Get total amount for entity
getGrandTotalAmount()           // Get grand total amount
getAllReportData()              // Get all data as array of objects
```

### Validation
```typescript
verifyReportTableVisible()      // Check if report table visible
verifyEntityInReport(entity)    // Check if entity exists in report
verifyEntityHasZeroData(entity) // Check if entity has 0/0.00
isReportEmpty()                 // Check if report is empty
verifyReportDataMatches(data)   // Compare data with expected
```

### Export
```typescript
exportAsPdf()                   // Export report as PDF
exportAsExcel()                 // Export report as Excel
```

## Step Definitions Quick Reference

### Given Steps (Setup)
```gherkin
Given the user is logged in as "Finance Admin"
Given revenue entities "Entity-A" and "Entity-B" exist
Given the following transactions are posted for the month of "June":
Given "Entity-C" exists but has no transactions
Given the user is "Entity-A Restricted Accountant"
```

### When Steps (Actions)
```gherkin
When the user runs the "Total Transactions report by revenue entity" for "June 2026"
When the report is generated
When the user runs the summary report
```

### Then Steps (Assertions)
```gherkin
Then the report shows:
    | Revenue Entity | Transaction Count | Total Amount |
    | Entity-A       | 50                | 100000.00    |
Then the grand total amount is 145000.00 AED
Then "Entity-C" is either omitted or displayed with 0 count and 0.00 amount
Then only Entity-A data appears, even if other entities have transactions
Then the report shows the following data:
Then the report table is visible
Then no data message is displayed
```

## Test Data Quick Reference

### Test Entities
```typescript
Entity-A: 50 transactions, 100,000.00 AED
Entity-B: 30 transactions, 45,000.00 AED
Entity-C: 0 transactions, 0.00 AED
Grand Total: 80 transactions, 145,000.00 AED
```

### Date Format
```typescript
From Date: 2026-06-01
To Date:   2026-06-30
Month:     June
Year:      2026
```

### Get Test Data
```typescript
import { ReportTestDataFactory } from './src/data/report-test-data.factory';

const entities = ReportTestDataFactory.getRevenueEntities();
const transactions = ReportTestDataFactory.getJuneTransactions();
const expected = ReportTestDataFactory.getExpectedReportData();
const grandTotal = ReportTestDataFactory.getGrandTotal();
```

## Validators Quick Reference

```typescript
import { ReportValidator } from './src/utils/report-validator';

// Validate amount format
const isValid = ReportValidator.validateAmountFormat('100000.00');

// Validate count format
const isValid = ReportValidator.validateCountFormat('50');

// Compare data
const result = ReportValidator.compareReportData(expected, actual);

// Validate grand total
const result = ReportValidator.validateGrandTotal(data, expectedTotal);

// Validate RBAC
const result = ReportValidator.validateRBACRestriction(data, allowedEntities);

// Assert valid
ReportValidator.assertValid(result, 'context message');

// Format error
const message = ReportValidator.formatValidationError(result);
```

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Test timeout | Slow network | Increase timeout in config.ts |
| Locator not found | UI changed | Update selector in page object |
| Data mismatch | Test data outdated | Update factory constants |
| RBAC fails | Wrong user scope | Check user role in staging |
| Export fails | Dialog not rendered | Add wait for dialog |

## File Locations

| File | Purpose |
|------|---------|
| `src/pages/reports/total-transactions-revenue-entity.page.ts` | Page object |
| `src/steps/reports/total-transactions-revenue-entity.steps.ts` | Step definitions |
| `src/models/revenue-entity.model.ts` | Data models |
| `src/data/report-test-data.factory.ts` | Test data factory |
| `src/utils/report-validator.ts` | Validation utilities |
| `Features/Reports/4.Revenue_Reports/Total_Transactions_Report_by_Revenue_Entity.feature` | Feature file |
| `storageState.stage.json` | Authentication state |

## Configuration

### Timeout Configuration
```typescript
// src/config/config.ts
export const config = {
  timeout: 30000,  // 30 seconds
  retries: 3,
  headless: false
};
```

### Environment Variables
```bash
TEST_ENV=stage              # Test environment
BROWSER=chromium           # Browser type
DEBUG=pw:api              # Enable Playwright debugging
SLOW_MO=1000              # Slow motion (ms)
```

## Debugging Tips

### Enable Detailed Logging
```typescript
// In step definitions
this.addLog('Custom log message');
this.addLog(`Data: ${JSON.stringify(data, null, 2)}`);
```

### Take Screenshot
```typescript
await this.page?.screenshot({ path: 'debug.png' });
```

### Print Report Data
```typescript
const data = await reportPage.getAllReportData();
console.log(JSON.stringify(data, null, 2));
```

### Slow Motion
```bash
SLOW_MO=1000 npm run test  # 1 second delay between actions
```

### Debug Mode
```bash
npx playwright test --debug
```

## Best Practices Checklist

- ✅ Always use `await` with async operations
- ✅ Use `this.addLog()` instead of `console.log()`
- ✅ Use tolerance (0.01) for floating-point comparisons
- ✅ Wait for network idle after filter changes
- ✅ Check element visibility before clicking
- ✅ Use stable locators (role, label, placeholder)
- ✅ Handle errors gracefully
- ✅ Document complex logic with comments
- ✅ Keep test data consistent
- ✅ Use factory pattern for test data

## Performance Targets

| Scenario | Target | Status |
|----------|--------|--------|
| Positive | < 60 sec | ✅ |
| Negative | < 40 sec | ✅ |
| RBAC | < 50 sec | ✅ |
| Full Suite | < 150 sec | ✅ |

## Report Types

```bash
# HTML Report
test-results/cucumber-report.html

# Allure Report
allure-results/

# Screenshots (on failure)
test-results/screenshots/

# Trace (if enabled)
test-results/trace.zip
```

## Security Reminders

- ⚠️ Never hardcode credentials
- ⚠️ Never log sensitive data
- ⚠️ Always use HTTPS
- ⚠️ Validate all inputs
- ⚠️ Never commit auth tokens
- ⚠️ Use environment variables
- ⚠️ Review access logs
- ⚠️ Keep dependencies updated

## Quick Troubleshooting

```bash
# Clear cache
rm -rf node_modules
npm install

# Rebuild TypeScript
npm run build

# Check syntax
npm run lint

# Run single scenario
npm run test -- --name "Summary"

# See help
npm run test -- --help
```

## Key Concepts

### Page Object Model
- Page = Web page or modal
- Methods = Actions on page
- Locators = Element identifiers

### BDD (Behavior Driven Development)
- Feature = User story
- Scenario = Test case
- Steps = Executable steps

### Async/Await
- Always `await` async operations
- Use `.then()` only for special cases
- Never skip `await`

## Resources

- Documentation: See `IMPLEMENTATION_GUIDE.md`
- Architecture: See `FRAMEWORK_SUMMARY.md`
- Best Practices: See `BEST_PRACTICES.md`
- Checklist: See `IMPLEMENTATION_CHECKLIST.md`
- Deliverables: See `DELIVERABLES.md`

---

**Version:** 1.0.0  
**Last Updated:** June 22, 2026  
**Status:** Production Ready
