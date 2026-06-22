# Total Transactions Report by Revenue Entity - Implementation Guide

## Overview
This implementation provides a complete test automation framework for the **Total Transactions Report by Revenue Entity** feature in the Tahseel Manage Portal.

**Report URL:** `https://staging.tahseel.gov.ae/ManagePortal/report-show/115f9d66-7ccb-4d1b-be96-2e499583af0c`

## Architecture

### 1. Page Object Layer
**File:** `src/pages/reports/total-transactions-revenue-entity.page.ts`

**Extends:** `BaseListPage` → `BasePage`

**Responsibilities:**
- Navigate to report
- Set date filters (from/to)
- Select revenue entity filters
- Execute report filters
- Extract report data (entities, counts, amounts)
- Retrieve grand total
- Verify entity visibility/data
- Export functionality (PDF/Excel)
- Handle no-data states

**Key Methods:**
```typescript
navigateToReport()           // Open report page
setFromDate(date)            // Set from date filter
setToDate(date)              // Set to date filter
selectRevenueEntity(entity)  // Select entity filter
showReport()                 // Execute filters
getRevenueEntities()         // Get all entities in table
getTransactionCount(entity)  // Get count for entity
getTotalAmount(entity)       // Get amount for entity
getGrandTotalAmount()        // Get grand total
verifyEntityInReport(entity) // Check entity exists
verifyEntityHasZeroData()    // Check zero data
getAllReportData()           // Get all data as array
verifyReportDataMatches()    // Bulk data validation
exportAsPdf()                // Export report
exportAsExcel()              // Export report
```

### 2. Step Definition Layer
**File:** `src/steps/reports/total-transactions-revenue-entity.steps.ts`

**Pattern:** Given/When/Then steps per Gherkin syntax

**Step Categories:**

#### Given (Setup)
- `the user is logged in as "..."` - Confirm authentication
- `revenue entities "..." and "..." exist` - Verify master data
- `the following transactions are posted for the month of "..."` - Setup test data
- `"..." exists but has no transactions` - Define zero-transaction entity
- `the user is "..."` - Set user role for RBAC

#### When (Actions)
- `the user runs the "..." for "..."` - Execute report with date filter
- `the report is generated` - Generate report with current filters
- `the user runs the summary report` - Open report for RBAC test

#### Then (Assertions)
- `the report shows:` - Verify report data matches table
- `the grand total amount is {float} AED` - Verify grand total
- `"..." is either omitted or displayed with {int} count and {float} amount` - Entity zero-data validation
- `only Entity-A data appears, even if other entities have transactions` - RBAC validation
- `the report table is visible` - Display verification
- `no data message is displayed` - Empty state verification

### 3. Test Data Layer

**Models:** `src/models/revenue-entity.model.ts`
- `RevenueEntity` - Entity master data
- `TransactionData` - Transaction test data
- `ReportData` - Report row data
- `GrandTotal` - Aggregated totals

**Test Data Factory:** `src/data/report-test-data.factory.ts`
- `getRevenueEntities()` - All test entities
- `getJuneTransactions()` - Transaction test data
- `getExpectedReportData()` - Expected report output
- `getGrandTotal()` - Expected grand total
- `calculateExpectedGrandTotal()` - Validation helper

**Test Data:**
```typescript
Entity-A: 50 transactions, 100,000.00 AED
Entity-B: 30 transactions, 45,000.00 AED
Entity-C: 0 transactions, 0.00 AED
Grand Total: 80 transactions, 145,000.00 AED
```

### 4. Validation Layer
**File:** `src/utils/report-validator.ts`

**Validators:**
- `validateAmountFormat()` - Check number format
- `validateCountFormat()` - Check integer format
- `compareReportData()` - Compare expected vs actual
- `validateGrandTotal()` - Verify aggregation
- `validateTransactionCountTotal()` - Verify count sum
- `validateEntityAppearance()` - Check entity visibility
- `validateRBACRestriction()` - Verify authorized entities only
- `formatValidationError()` - Format error messages
- `assertValid()` - Throw on validation failure

## Test Scenarios

### Scenario 1: Summary Aggregation (@positive @e2e)
**Objective:** Verify correct aggregation of transactions per entity

**Flow:**
1. User is logged in as Finance Admin
2. Revenue entities exist
3. Setup transactions: Entity-A (50 tx, 100k), Entity-B (30 tx, 45k)
4. Run report for June 2026
5. Verify data matches
6. Verify grand total = 145,000.00 AED

**Assertions:**
- Entity-A: 50 transactions, 100,000.00 AED
- Entity-B: 30 transactions, 45,000.00 AED
- Grand Total: 145,000.00 AED

### Scenario 2: Zero Transaction Entity (@negative)
**Objective:** Verify handling of entities with no transactions

**Flow:**
1. Entity-C exists but has no transactions
2. Generate report
3. Verify Entity-C either omitted or shown with 0/0.00

**Assertions:**
- Entity-C is not displayed OR
- Entity-C displayed with count=0, amount=0.00

### Scenario 3: Entity-Limited User (@negative @rbac)
**Objective:** Verify RBAC - entity-scoped user sees only their entity

**Flow:**
1. User is "Entity-A Restricted Accountant"
2. Run summary report
3. Verify only Entity-A visible

**Assertions:**
- Only Entity-A data appears in report
- Entity-B and Entity-C are hidden
- Even if they have transactions

## Framework Integration

### Authentication
- Uses `storageState.stage.json` loaded by `BrowserFixture`
- User is pre-authenticated before test execution
- No login steps required
- Automatic re-login on session expiry

### Hooks
- `Before`: Initialize page objects, setup test context
- `After`: Capture screenshot on failure, attach logs
- Dashboard mocks disabled for report tests

### Context Management
- `World` object stores page instance
- `testContext` singleton tracks active page
- `ActivePageResolver` resolves page for step execution

## Running Tests

### Execute All Scenarios
```bash
npm run test:reports
```

### Execute Specific Tag
```bash
npm run test -- --tags "@positive"
npm run test -- --tags "@rbac"
npm run test -- --tags "@e2e"
```

### Execute Specific Scenario
```bash
npm run test -- Features/Reports/4.Revenue_Reports/Total_Transactions_Report_by_Revenue_Entity.feature
```

### Setup Authentication (Stage)
```bash
npm run auth:setup-stage
```

### View Report
```bash
Reports are generated at:
- test-results/cucumber-report.html
- allure-results/
- test-results/screenshots/ (on failure)
```

## Locator Strategy

All locators follow priority order:

1. **getByRole()** - Accessible name (button, input roles)
2. **getByLabel()** - Form labels
3. **getByPlaceholder()** - Input placeholders
4. **getByTestId()** - data-testid attributes
5. **getByText()** - Text content (last resort)

**Avoided:**
- XPath expressions
- nth-child selectors
- Auto-generated IDs
- Fragile CSS selectors

## Error Handling

### Common Issues

**Issue:** "Report table not visible"
- **Cause:** Filters not applied, network delay
- **Fix:** Ensure `showReport()` called, wait for network idle

**Issue:** "Entity not found in report"
- **Cause:** Data mismatch, entity filtered out
- **Fix:** Verify test data exists, check user RBAC scope

**Issue:** "Grand total mismatch"
- **Cause:** Rounding error, data incomplete
- **Fix:** Use tolerance in validation (0.01 AED), verify all rows loaded

### Debugging
```typescript
// Enable logging
this.addLog('Custom message');

// Take screenshot
await this.page?.screenshot({ path: 'debug.png' });

// Print report data
const data = await reportPage.getAllReportData();
console.log(JSON.stringify(data, null, 2));
```

## Extensibility

### Adding New Report
1. Create `src/pages/reports/{report-name}.page.ts` extending `BaseListPage`
2. Create `src/steps/reports/{report-name}.steps.ts` with Given/When/Then steps
3. Add to feature file in `Features/Reports/`
4. Reuse existing validators and test data patterns

### Adding New Scenario
1. Add scenario to feature file
2. Implement corresponding Given/When/Then steps
3. Update test data factory if needed
4. Update validator if new rules

### Adding New Validation
1. Extend `ReportValidator` class
2. Add validation method
3. Call from step definitions or page objects
4. Use `assertValid()` for error throwing

## Code Quality

### Standards Applied
- TypeScript strict mode
- Async/await patterns
- Error handling with try/catch
- Clear method names (action-based)
- No assertions in page objects
- DRY principle (reuse base classes)
- Comprehensive logging

### Linting
```bash
npm run lint
npm run lint:fix
```

### Testing
```bash
npm run test
npm run test -- --dry-run  # Validate syntax
```

## Performance Considerations

- Pagination: Limited row fetching for large datasets
- Network waits: Uses `waitForNetworkIdle()`
- Timeouts: Configurable via `config.timeout`
- Retry logic: Built-in via `WaitHelper`

## Security

- No hardcoded credentials
- Authentication via storageState
- No sensitive data logged
- HTTPS only for staging/production
- API calls use auth tokens

## Maintenance

### Regular Updates
- Review locators if UI changes
- Update test data if business rules change
- Validate grand total calculation formula
- Check entity RBAC rules

### Monitoring
- Run tests daily
- Monitor flaky scenarios
- Track test execution time
- Review error logs

## References

- Feature File: `Features/Reports/4.Revenue_Reports/Total_Transactions_Report_by_Revenue_Entity.feature`
- Page Object: `src/pages/reports/total-transactions-revenue-entity.page.ts`
- Step Definitions: `src/steps/reports/total-transactions-revenue-entity.steps.ts`
- Test Data: `src/data/report-test-data.factory.ts`
- Models: `src/models/revenue-entity.model.ts`
- Validator: `src/utils/report-validator.ts`
