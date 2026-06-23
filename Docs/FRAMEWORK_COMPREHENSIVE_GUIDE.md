# Comprehensive Test Automation Framework - Developer Guide

**Framework Version**: 2.0  
**Status**: Production Ready  
**Coverage**: 209 Modules  
**Last Updated**: June 23, 2026

---

## Table of Contents

1. [Framework Overview](#framework-overview)
2. [Architecture](#architecture)
3. [Quick Start](#quick-start)
4. [Code Generation](#code-generation)
5. [Base Classes](#base-classes)
6. [Selector Strategies](#selector-strategies)
7. [POM Development](#pom-development)
8. [Step Definitions](#step-definitions)
9. [Fixtures & Test Data](#fixtures--test-data)
10. [MCP Integration](#mcp-integration)
11. [Best Practices](#best-practices)
12. [Troubleshooting](#troubleshooting)

---

## Framework Overview

This comprehensive test automation framework provides:

- **209-Module Coverage**: Systematic testing for all application modules
- **Code Generation**: Automated creation of features, POMs, and steps
- **Modular Architecture**: Reusable base classes and shared utilities
- **Resilient Selectors**: Strategy pattern for element location with fallback
- **MCP Integration**: Dynamic page inspection and selector validation
- **Production Grade**: Authentication, retry logic, error recovery built-in

### Key Technologies

- **Playwright**: Browser automation
- **Cucumber.js**: BDD test execution
- **TypeScript**: Type-safe test code
- **MCP Playwright**: Dynamic page inspection

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│         Feature Files (209 modules)                 │
│    Gherkin scenarios with positive/negative cases   │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│        Step Definitions (209 modules)               │
│   Implements Gherkin steps, orchestrates POMs       │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│    Page Object Models (209 POMs)                    │
│  Extends BasePage/BaseListPage, provides selectors  │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│     Framework Layer                                 │
│  ├─ BasePage (40+ shared methods)                   │
│  ├─ Utilities (element interactions, waits, etc.)   │
│  ├─ Selector Strategies (role, testid, label)      │
│  └─ MCP Inspector (dynamic inspection)              │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│     Playwright + Playwright MCP                     │
└─────────────────────────────────────────────────────┘
```

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Generate Code for a Module

```bash
# Generate all 209 modules
npx ts-node src/generators/code-generator-cli.ts --generate all

# Generate specific category
npx ts-node src/generators/code-generator-cli.ts --generate all --category General

# Generate specific module
npx ts-node src/generators/code-generator-cli.ts --module "User Management"
```

### 3. Run Tests

```bash
# Run all tests
npm test

# Run specific feature
npm test -- Features/General/User-Management.feature

# Run with specific browser
npm run test:chromium
npm run test:firefox
npm run test:webkit
```

### 4. View Test Results

```bash
# Generate Allure report
npm run report:generate

# Open Allure report
npm run report:open
```

---

## Code Generation

The code generator creates three artifacts per module:

### Feature Files
- **Location**: `Features/{category}/{module-name}.feature`
- **Contains**: Positive, negative, and edge case scenarios
- **Auto-generated**: Positive workflows, form validation, table interactions

### POM Classes
- **Location**: `src/pages/{category}/{module-name}.page.ts`
- **Contains**: Selectors, helper methods, element interactions
- **Extends**: `BasePage` or `BaseListPage`
- **Auto-generated**: From audit data selectors and element metadata

### Step Definitions
- **Location**: `src/steps/{category}/{module-name}.steps.ts`
- **Contains**: Gherkin step implementations
- **Integrates**: With POM methods and shared utilities
- **Auto-generated**: Based on feature file steps and module capabilities

### Generation Example

```typescript
// Before generation
// page-audit-results.json contains module metadata

// Run generation
npx ts-node src/generators/code-generator-cli.ts --module "User Management"

// After generation
// ✓ Features/General/User-Management.feature
// ✓ src/pages/general/user-management.page.ts
// ✓ src/steps/general/user-management.steps.ts
```

---

## Base Classes

### BasePage

The foundation class for all page objects. Provides 40+ methods for common interactions.

```typescript
import { BasePage } from '../base.page';

export class MyModulePage extends BasePage {
  readonly selectors = {
    mainContainer: '[data-module="my-module"]',
    submitButton: 'button:has-text("Submit")',
    errorMessage: '[role="alert"]',
  };

  async submitForm(): Promise<void> {
    await this.click(this.selectors.submitButton);
    await this.expectElementVisible(this.selectors.errorMessage);
  }
}
```

**Common Methods**:

```typescript
// Navigation
await page.navigateToUrl(url)
await page.navigate(page, url, timeout)

// Element Interaction
await page.click(selector)
await page.fill(selector, value)
await page.getText(selector)
await page.isVisible(selector)

// Assertions
await page.expectElementVisible(selector)
await page.expectText(selector, text)
await page.verifyValidationError(message)

// Waits
await page.waitForSelector(selector)
await page.waitForNavigation()

// Table/List
await page.verifyTableVisible()
await page.verifyTableHasRecords()
await page.searchFor(term)
```

### BaseListPage

Extends `BasePage` for pages with list/table data.

```typescript
import { BaseListPage } from '../base-list.page';

export class ReportPage extends BaseListPage {
  // Inherits all BasePage methods plus:
  async verifyPagerVisible(): Promise<void> { }
  async selectPageSize(size: string): Promise<void> { }
  async verifyColumnHidden(name: string): Promise<void> { }
  async toggleColumnInChooser(name: string): Promise<void> { }
}
```

---

## Selector Strategies

The framework uses a strategy pattern for resilient element location with fallback.

### Strategy Types

```typescript
// 1. Test ID (Most reliable)
[data-testid="element-id"]

// 2. Role-based (Accessible)
[role="button"]
getByRole('button')

// 3. Label-based (Form fields)
[aria-label="Field Name"]
getByLabel('Field Name')

// 4. Text-based (Content matching)
:has-text("Button Text")
getByText('Button Text')

// 5. CSS Selectors (Fallback)
button.primary-action

// 6. XPath (Last resort)
xpath=//button[@class="action"]
```

### LocatorBuilder Usage

```typescript
import { LocatorBuilder } from '../strategies/selector-strategies';

const builder = new LocatorBuilder();

// Try multiple strategies with fallback
const element = await builder.findElementWithFallback(page, {
  testId: 'submit-button',
  role: 'button',
  text: 'Submit',
  css: 'button.primary',
});

// Validate selector exists
const isValid = await builder.validateSelectorWithFallback(page, {
  testId: 'submit-button',
  role: 'button',
});
```

---

## POM Development

### Structure

```typescript
export class ModuleNamePage extends BasePage {
  // 1. Selectors
  readonly selectors = { /* ... */ };

  // 2. Constructor
  constructor(page: Page) { super(page); }

  // 3. Navigation
  async navigateToModule(): Promise<void> { }

  // 4. Element Getters
  get submitButton(): Locator { }

  // 5. User Interactions
  async fillForm(data: any): Promise<void> { }
  async submitForm(): Promise<void> { }

  // 6. Assertions
  async verifyModuleLoaded(): Promise<void> { }
  async verifyValidationError(msg: string): Promise<void> { }

  // 7. Helpers
  private async waitForModuleReady(): Promise<void> { }
}
```

### Best Practices

1. **Logical Selector Organization**: Group by component type
2. **Descriptive Names**: Use clear, intention-revealing names
3. **Error Handling**: Use wait strategies with retry logic
4. **No Test Logic**: Keep assertions minimal in POM
5. **Reuse Methods**: Create helper methods for common workflows

### Example POM

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

export class UserManagementPage extends BasePage {
  readonly selectors = {
    container: '[data-module="user-management"]',
    addButton: 'button:has-text("Add User")',
    searchInput: 'input[placeholder="Search users"]',
    userTable: 'table[role="grid"]',
    userRows: 'table[role="grid"] tbody tr',
    nameField: 'input[name="name"]',
    emailField: 'input[name="email"]',
    roleDropdown: '[aria-label="Role"]',
    saveButton: 'button:has-text("Save")',
    deleteButton: 'button:has-text("Delete")',
    successMessage: '[role="status"]:has-text("Success")',
  };

  async navigateToModule(): Promise<void> {
    await this.waitForSelector(this.selectors.container);
  }

  async clickAddUser(): Promise<void> {
    await this.click(this.selectors.addButton);
    await this.page.waitForLoadState('networkidle');
  }

  async fillUserForm(user: { name: string; email: string; role: string }): Promise<void> {
    await this.fill(this.selectors.nameField, user.name);
    await this.fill(this.selectors.emailField, user.email);
    const roleDropdown = new DxDropdownHelper(this.page);
    await roleDropdown.selectOptionByLabel('Role', user.role);
  }

  async saveUser(): Promise<void> {
    await this.click(this.selectors.saveButton);
    await this.waitForSelector(this.selectors.successMessage);
  }

  async searchUsers(searchTerm: string): Promise<void> {
    await this.fill(this.selectors.searchInput, searchTerm);
    await this.page.waitForLoadState('networkidle');
  }

  async verifyUserInTable(userName: string): Promise<void> {
    const userRow = this.page.locator(`${this.selectors.userRows}:has-text("${userName}")`);
    await this.expectElementVisible(`${this.selectors.userRows}:has-text("${userName}")`);
  }

  async deleteUser(userName: string): Promise<void> {
    const row = this.page.locator(`${this.selectors.userRows}:has-text("${userName}")`);
    await row.locator(this.selectors.deleteButton).click();
  }
}
```

---

## Step Definitions

### Structure

```typescript
import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { World } from '../../fixtures/world.fixture';
import { ModuleNamePage } from '../../pages/category/module-name.page';

function getModulePage(world: World): ModuleNamePage {
  return new ModuleNamePage(world.page);
}

Given('the user is on the {string} page', async function (this: World, pageName: string) {
  const page = getModulePage(this);
  await page.navigateToModule();
});

When('the user fills the form with the following data:', async function (this: World, dataTable: DataTable) {
  const page = getModulePage(this);
  const data = dataTable.rowsHash();
  await page.fillUserForm(data);
});

Then('the user should see a success message', async function (this: World) {
  const page = getModulePage(this);
  await page.page.waitForSelector('[role="status"]:has-text("Success")');
});
```

### Data Table Handling

```typescript
// Single row data
When('the user fills the form with the following data:', async function (this: World, dataTable: DataTable) {
  const data = dataTable.rowsHash();
  // { name: 'John', email: 'john@example.com' }
});

// Multiple rows
When('the user creates users:', async function (this: World, dataTable: DataTable) {
  const rows = dataTable.hashes();
  // [
  //   { name: 'John', email: 'john@example.com' },
  //   { name: 'Jane', email: 'jane@example.com' }
  // ]
});
```

---

## Fixtures & Test Data

### Using Fixtures

```typescript
// In World fixture
export class World extends IWorldOptions {
  page!: Page;
  testData: TestData = {
    users: [],
    transactions: [],
  };

  addLog(message: string): void {
    // Logging implementation
  }
}

// In step definitions
Given('test data is prepared', function (this: World) {
  this.testData.users = [
    { name: 'John', email: 'john@test.com' },
    { name: 'Jane', email: 'jane@test.com' },
  ];
});
```

### Data Factories

```typescript
import { DataFactory } from '../fixtures/data-factory-fixtures';

const validUser = DataFactory.createValidFormData('User Management');
// { name: 'Valid Name', email: 'valid@example.com', role: 'Admin' }

const invalidUser = DataFactory.createInvalidFormData('User Management');
// { name: '', email: 'invalid', role: null }

const boundaryUser = DataFactory.createBoundaryFormData('User Management');
// { name: '...very long name...', email: '...', role: '' }
```

---

## MCP Integration

### Page Inspection

```typescript
import { MCPInspector } from '../utils/mcp-inspector';

// Inspect page structure
const structure = await MCPInspector.inspectPageStructure(page);
console.log(structure);
// {
//   title: "User Management",
//   url: "https://...",
//   elementCount: 25,
//   interactiveElements: [...],
//   formElements: [...],
//   tableElements: [...],
//   buttonElements: [...]
// }
```

### Selector Validation

```typescript
// Validate selector exists
const result = await MCPInspector.validateSelector(page, 'button:has-text("Save")');
console.log(result);
// {
//   valid: true,
//   elementFound: true,
//   elementCount: 1,
//   firstElementText: "Save",
//   xpath: "/html/body/div/button",
//   fallbackSelectors: [...]
// }

// Find selector for element
const selector = await MCPInspector.findSelectorForElement(page, 'Submit');
// "button:has-text(\"Submit\")"
```

### Element Metadata

```typescript
// Get detailed element info
const metadata = await MCPInspector.getElementMetadata(page, 'button:has-text("Save")');
console.log(metadata);
// {
//   tagName: "button",
//   className: "btn-primary",
//   testId: "save-button",
//   ariaLabel: "Save Form",
//   role: "button",
//   text: "Save",
//   visible: true,
//   enabled: true,
//   xpath: "/...",
//   css: "#save-button"
// }
```

---

## Best Practices

### 1. Selector Strategy

```typescript
// ✅ Good: Multiple selectors with fallback
const selectors = {
  testId: '[data-testid="submit"]',
  role: '[role="button"]',
  text: 'button:has-text("Submit")',
};

// ❌ Bad: Single brittle selector
const selector = 'body > div:nth-child(3) > button:nth-child(5)';
```

### 2. Wait Strategies

```typescript
// ✅ Good: Explicit waits with retry
await this.waitForSelector(selector, 30000);
await this.page.waitForLoadState('networkidle');

// ❌ Bad: Fixed delays
await this.page.waitForTimeout(5000);
```

### 3. Error Messages

```typescript
// ✅ Good: Descriptive error context
throw new Error(`Failed to find user "${userName}" in table after searching`);

// ❌ Bad: Generic errors
throw new Error('Element not found');
```

### 4. Test Data

```typescript
// ✅ Good: Use fixtures and factories
const user = DataFactory.createValidFormData('User Management');

// ❌ Bad: Hardcoded test data
const user = { name: 'John', email: 'john@test.com' };
```

### 5. POM Organization

```typescript
// ✅ Good: Logical grouping
readonly selectors = {
  // Navigation
  sidebarLink: '...',
  // Form
  nameInput: '...',
  // Table
  dataTable: '...',
  // Actions
  saveButton: '...',
};

// ❌ Bad: Random ordering
readonly selectors = {
  saveButton: '...',
  nameInput: '...',
  dataTable: '...',
  sidebarLink: '...',
};
```

---

## Troubleshooting

### Issue: Selector Not Found

**Solution**: Use MCP Inspector to validate

```typescript
const result = await MCPInspector.validateSelector(page, selector);
if (!result.valid) {
  const metadata = await MCPInspector.getElementMetadata(page, selector);
  console.log('Element metadata:', metadata);
  // Use fallback selectors
}
```

### Issue: Test Timeout

**Solution**: Add proper waits

```typescript
// ✅ Good
await page.waitForLoadState('networkidle');
await this.waitForSelector(selector);

// ❌ Bad
// Missing wait for page load
```

### Issue: Element Stale Reference

**Solution**: Use locators, not elements

```typescript
// ✅ Good: Locators are dynamic
const button = page.locator('button:has-text("Save")');
await button.click();

// ❌ Bad: ElementHandle becomes stale
const button = await page.$('button:has-text("Save")');
await button.click(); // May fail after page update
```

### Issue: Authentication Failures

**Solution**: Use auth fixtures

```typescript
// In fixtures
const authToken = await authFixtures.authenticatedUser();
// Automatically handles login and session state
```

### Issue: Flaky Tests

**Solution**: Use retry logic

```typescript
import { WaitStrategies } from '../utils/wait-strategies';

await WaitStrategies.waitWithRetry(
  async () => {
    await this.click(selector);
  },
  3,  // retries
  5000  // timeout
);
```

---

## Summary

This comprehensive framework provides:

✅ **209-module coverage** through systematic code generation  
✅ **Production-grade reliability** with auth, retry, and error recovery  
✅ **Resilient selectors** using strategy pattern with fallback  
✅ **MCP integration** for dynamic inspection and validation  
✅ **Modular architecture** for easy maintenance and scaling  
✅ **Developer-friendly** with clear patterns and utilities  

For questions or contributions, refer to the main README and API documentation.
