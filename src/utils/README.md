# Framework Utilities Reference

This directory contains reusable utilities for all 209 test automation modules.

## Quick Start

### 1. Element Interactions

Interact with page elements reliably with built-in retry logic.

```typescript
import { ElementInteractions } from './element-interactions';

// Click with retry
await ElementInteractions.clickElement(page, selector);

// Type text (clears first by default)
await ElementInteractions.typeText(page, inputSelector, 'value');

// Select dropdown option
await ElementInteractions.selectOption(page, selector, 'Option Value');

// Check checkbox
await ElementInteractions.checkCheckbox(page, checkboxSelector);

// Get element text
const text = await ElementInteractions.getElementText(page, selector);

// Check visibility
const isVisible = await ElementInteractions.isElementVisible(page, selector);
```

**Key Methods**: 30+  
**Retry Logic**: Automatic  
**Timeout**: Configurable

---

### 2. Assertion Helpers

Make assertions with detailed error messages.

```typescript
import { AssertionHelpers } from './assertion-helpers';

// Assert visibility
await AssertionHelpers.assertElementVisible(page, selector);

// Assert text content
await AssertionHelpers.assertElementText(page, selector, 'Expected Text');

// Assert element is enabled
await AssertionHelpers.assertElementEnabled(page, selector);

// Assert table row exists
await AssertionHelpers.assertTableRowContains(page, tableSelector, 'Row Text');

// Assert form is valid (no errors)
await AssertionHelpers.assertFormValid(page);

// Assert validation error is displayed
await AssertionHelpers.assertValidationError(page, 'Error message');
```

**Key Methods**: 35+  
**Error Messages**: Detailed  
**Timeout Support**: Yes

---

### 3. Wait and Retry Utilities

Wait for conditions and retry operations with resilience.

```typescript
import { WaitAndRetry } from './wait-and-retry';

// Wait for element to appear
await WaitAndRetry.waitForElement(page, selector);

// Retry operation with exponential backoff
await WaitAndRetry.retry(async () => {
  // Some operation
}, 3, 1000, 2);

// Wait for condition to be true
await WaitAndRetry.waitForCondition(
  async () => someCondition,
  30000,
  3
);

// Wait for element text to appear
await WaitAndRetry.waitForElementText(page, selector, 'Text');

// Wait for input value to change
await WaitAndRetry.waitForInputValue(page, inputSelector, 'expectedValue');

// Wait for API response
const response = await WaitAndRetry.waitForResponse(page, /api\/users/);

// Poll until condition is true
await WaitAndRetry.poll(
  async () => condition,
  500,  // interval
  30000 // timeout
);
```

**Key Methods**: 20+  
**Retry Strategies**: Multiple  
**Backoff Support**: Exponential

---

### 4. Data Generators

Generate realistic test data.

```typescript
import { DataGenerators } from './data-generators';

// Simple generators
const email = DataGenerators.generateEmail();
const phone = DataGenerators.generatePhoneNumber('UAE');
const date = DataGenerators.generateDate(0, 'DD/MM/YYYY');
const name = DataGenerators.generateName('full');
const amount = DataGenerators.generateAmount(100, 10000);

// Reference numbers
const transactionId = DataGenerators.generateTransactionId();
const receiptNumber = DataGenerators.generateReceiptNumber();
const invoiceNumber = DataGenerators.generateInvoiceNumber();

// Complex generators
const dateRange = DataGenerators.generateDateRange(-30, 0);
const iban = DataGenerators.generateIBAN();
const creditCard = DataGenerators.generateCreditCardNumber();

// Object generators
const user = DataGenerators.generateUser();
// { email, firstName, lastName, phoneNumber, username, password, status, isActive }

const transaction = DataGenerators.generateTransaction();
// { transactionId, referenceNumber, amount, date, status, description, paymentMethod }

const report = DataGenerators.generateReport();
// { reportId, reportName, generatedDate, startDate, endDate, status, recordsCount, totalAmount }

// Full test data set
const testData = DataGenerators.generateTestDataSet();
// { user, transaction, report, entity, currentDate, dateRange }
```

**Key Methods**: 40+  
**Data Types**: Users, Transactions, Reports, Entities  
**Locales**: UAE support

---

### 5. Selector Helpers

Build resilient selectors with fallback strategies.

```typescript
import { SelectorHelpers } from './selector-helpers';

// Simple selectors
const buttonSelector = SelectorHelpers.byButtonText('Save');
const emailInput = SelectorHelpers.byLabel('Email Address');
const errorMsg = SelectorHelpers.errorMessage('This field is required');

// Complex selectors
const dataGridCell = SelectorHelpers.dataGridCell('John', 'Email');
const tableRow = SelectorHelpers.tableRow('Transaction 123');
const menuItem = SelectorHelpers.menuItem('Edit');
const modal = SelectorHelpers.modal('Confirm Action');

// Selector combinations
const combined = SelectorHelpers.combine(
  SelectorHelpers.byButtonText('Save'),
  SelectorHelpers.byTestId('save-btn')
);

// XPath (when needed)
const xpathSelector = SelectorHelpers.xpath(`//button[contains(text(), 'Save')]`);

// Fallback discovery
const variations = SelectorHelpers.getAllVariations('Submit', 'button');
// ['.byButtonText()', '.byTestId()', '.byAriaLabel()', ...]

const locator = await SelectorHelpers.getLocatorWithFallback(
  page,
  primarySelector,
  [fallbackSelector1, fallbackSelector2]
);
```

**Key Methods**: 50+  
**Selector Strategies**: Role, Label, TestID, XPath, Attribute  
**Fallback Support**: Automatic

---

## Integration Patterns

### Pattern 1: Form Filling

```typescript
async fillRegistrationForm(page: Page) {
  // Generate valid test data
  const user = DataGenerators.generateUser();

  // Find and interact with elements
  const emailInput = SelectorHelpers.byLabel('Email');
  await ElementInteractions.typeText(page, emailInput, user.email);

  const passwordInput = SelectorHelpers.byLabel('Password');
  await ElementInteractions.typeText(page, passwordInput, user.password);

  // Find checkbox with resilient selector
  const agreeCheckbox = SelectorHelpers.byLabel('I agree to terms');
  await ElementInteractions.checkCheckbox(page, agreeCheckbox);

  // Wait for button and click
  const submitButton = SelectorHelpers.byButtonText('Register');
  await WaitAndRetry.waitForElement(page, submitButton);
  await ElementInteractions.clickElement(page, submitButton);

  // Assert success
  const successMsg = SelectorHelpers.successMessage('Registration successful');
  await AssertionHelpers.assertElementVisible(page, successMsg);
}
```

### Pattern 2: Report Validation

```typescript
async validateReportData(page: Page) {
  // Generate expected data
  const reportData = DataGenerators.generateReport();

  // Assert table has expected rows
  await AssertionHelpers.assertTableRowCount(page, 'table', 10);

  // Assert data is visible
  const tableSelector = SelectorHelpers.dataGridCell(reportData.reportName, 'Status');
  await AssertionHelpers.assertElementVisible(page, tableSelector);

  // Assert amounts are correct
  const amountCell = SelectorHelpers.dataGridCell('Total', reportData.totalAmount.toString());
  await AssertionHelpers.assertElementText(page, amountCell, reportData.totalAmount.toString());
}
```

### Pattern 3: API Testing

```typescript
async submitFormAndValidateAPI(page: Page) {
  // Generate request data
  const transaction = DataGenerators.generateTransaction();

  // Fill form
  await ElementInteractions.typeText(page, '#amount', transaction.amount.toString());

  // Submit and wait for API response
  const submitBtn = SelectorHelpers.byButtonText('Submit');
  await ElementInteractions.clickElement(page, submitBtn);

  // Wait for specific API response
  const apiResponse = await WaitAndRetry.waitForResponseStatus(
    page,
    /api\/transactions/,
    200
  );

  // Validate response
  expect(apiResponse.transactionId).toBeDefined();
  expect(apiResponse.status).toBe('completed');
}
```

---

## Best Practices

### 1. Selectors
- ✅ Use role-based selectors (more resilient)
- ✅ Use test IDs when available
- ✅ Provide fallback selectors
- ❌ Don't rely on CSS selectors alone

### 2. Interactions
- ✅ Use `ElementInteractions` instead of page.click()
- ✅ Let utilities handle retries
- ✅ Validate element exists before interaction
- ❌ Don't add manual retry logic

### 3. Assertions
- ✅ Use `AssertionHelpers` for consistent error messages
- ✅ Include custom error messages for clarity
- ✅ Assert business logic, not just UI
- ❌ Don't use generic expect() statements

### 4. Test Data
- ✅ Use `DataGenerators` for realistic data
- ✅ Generate data locally (no API calls)
- ✅ Use appropriate locales (UAE formats)
- ❌ Don't use hardcoded test values

### 5. Waiting
- ✅ Use `WaitAndRetry` for resilience
- ✅ Use appropriate timeouts
- ✅ Wait for meaningful conditions
- ❌ Don't use arbitrary sleep/wait times

---

## Common Scenarios

### Wait for Element Then Click

```typescript
await WaitAndRetry.waitForElement(page, selector);
await ElementInteractions.clickElement(page, selector);

// Or combined
await ElementInteractions.clickElement(page, selector); // Waits by default
```

### Fill Multiple Fields

```typescript
const fields = {
  email: { selector: SelectorHelpers.byLabel('Email'), value: user.email },
  phone: { selector: SelectorHelpers.byLabel('Phone'), value: user.phone },
  name: { selector: SelectorHelpers.byLabel('Name'), value: user.name }
};

for (const [key, { selector, value }] of Object.entries(fields)) {
  await ElementInteractions.typeText(page, selector, value);
}
```

### Validate Multiple Assertions

```typescript
const assertions = [
  () => AssertionHelpers.assertElementVisible(page, '#success'),
  () => AssertionHelpers.assertElementText(page, '#message', 'Saved'),
  () => AssertionHelpers.assertTableRowCount(page, 'table', 5)
];

await Promise.all(assertions.map(fn => fn()));
```

### Retry on Temporary Failure

```typescript
await WaitAndRetry.retryWithBackoff(
  async () => {
    const selector = SelectorHelpers.byButtonText('Save');
    await ElementInteractions.clickElement(page, selector);
    await AssertionHelpers.assertElementHidden(page, selector);
  },
  5 // max retries with exponential backoff
);
```

---

## Troubleshooting

### Element Not Found

```typescript
// Try fallback selectors
const fallbacks = SelectorHelpers.getAllVariations('Save', 'button');
const locator = await SelectorHelpers.findWithFallback(page, fallbacks);
```

### Timeout Issues

```typescript
// Check if element exists first
const exists = await ElementInteractions.elementExists(page, selector);
if (!exists) {
  // Element might be in different state
  const variations = SelectorHelpers.getAllVariations('Save');
}

// Increase timeout if needed
await WaitAndRetry.waitForElement(page, selector, 60000); // 60s timeout
```

### Flaky Tests

```typescript
// Use retry with exponential backoff
await WaitAndRetry.retry(
  async () => {
    // Your flaky operation
  },
  5,    // retries
  1000, // initial delay
  2     // exponential multiplier
);
```

---

## File Reference

| Utility | Purpose | Methods | File |
|---------|---------|---------|------|
| ElementInteractions | Click, type, get properties | 30+ | element-interactions.ts |
| AssertionHelpers | Validate state and content | 35+ | assertion-helpers.ts |
| WaitAndRetry | Wait and retry operations | 20+ | wait-and-retry.ts |
| DataGenerators | Generate test data | 40+ | data-generators.ts |
| SelectorHelpers | Build resilient selectors | 50+ | selector-helpers.ts |

---

## Support

For issues or questions:
1. Check inline code documentation (JSDoc comments)
2. Review usage examples in this README
3. Check integration patterns section
4. See troubleshooting section

---

**Last Updated**: June 23, 2026  
**Framework Version**: 2.0  
**Modules Covered**: 209  
**Status**: Production Ready
