# Comprehensive Test Automation Framework - Design Document

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Test Execution Layer                     │
│                    (Cucumber.js + Playwright)               │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Step Definitions Layer (209 modules)            │
│          (Orchestrates page objects & assertions)            │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  Page Objects Layer (209 POMs) | Framework Utilities Layer   │
│  ├─ Base Page Class             ├─ Element Interactions     │
│  ├─ Module-Specific POMs        ├─ Assertion Helpers       │
│  ├─ Selector Strategies         ├─ Wait/Retry Utilities    │
│  └─ Navigation Helpers          └─ Data Generators         │
└──────────────────────────────────────────────────────────────┘
                              ▼
┌──────────────────────────────────────────────────────────────┐
│              Fixtures Layer (src/fixtures/)                  │
│  ├─ Generic Fixtures             ├─ Custom Fixtures        │
│  ├─ Authentication Fixtures      ├─ Data Factory Fixtures  │
│  ├─ Setup/Teardown Fixtures      └─ Module-Specific Setup  │
└──────────────────────────────────────────────────────────────┘
                              ▼
┌──────────────────────────────────────────────────────────────┐
│          Browser Automation & MCP Integration                │
│  ├─ Playwright Core               ├─ MCP Playwright Server  │
│  ├─ Browser Navigation            ├─ Dynamic Inspection    │
│  └─ Event Handling                └─ Selector Validation   │
└──────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
project-root/
├── Features/
│   ├── Login/
│   │   └── Login-Authentication.feature
│   ├── General/
│   │   ├── Module-1.feature
│   │   ├── Module-2.feature
│   │   └── ... (67 general features)
│   ├── Reports/
│   │   ├── 1.Financial_Reports/
│   │   │   ├── Financial-Module-1.feature
│   │   │   └── ... (12 categories with all modules)
│   │   └── ... (15 report categories)
│   └── [Other categories with complete 209 module coverage]
│
├── src/
│   ├── pages/
│   │   ├── base.page.ts                    # Base POM class
│   │   ├── login/
│   │   │   ├── login-authentication.page.ts
│   │   │   └── ... (1 per feature)
│   │   ├── general/
│   │   │   ├── module-1.page.ts
│   │   │   ├── module-2.page.ts
│   │   │   └── ... (67 general modules)
│   │   ├── reports/
│   │   │   ├── financial-reports/
│   │   │   │   ├── financial-module-1.page.ts
│   │   │   │   └── ... (all report modules)
│   │   │   └── ... (all report categories)
│   │   └── strategies/
│   │       ├── selector-strategies.ts      # Selector patterns
│   │       └── locator-builder.ts          # Dynamic selector building
│   │
│   ├── steps/
│   │   ├── shared/
│   │   │   ├── common-steps.ts             # Common step implementations
│   │   │   ├── navigation-steps.ts         # Navigation patterns
│   │   │   ├── assertion-steps.ts          # Validation patterns
│   │   │   └── data-setup-steps.ts         # Data preparation patterns
│   │   ├── login/
│   │   │   └── login-authentication.steps.ts
│   │   ├── general/
│   │   │   ├── module-1.steps.ts
│   │   │   ├── module-2.steps.ts
│   │   │   └── ... (67 general modules)
│   │   ├── reports/
│   │   │   ├── financial-reports/
│   │   │   │   ├── financial-module-1.steps.ts
│   │   │   │   └── ... (all report modules)
│   │   │   └── ... (all report categories)
│   │   └── step-factory.ts                 # Helper to reduce duplication
│   │
│   ├── fixtures/
│   │   ├── generic-fixtures.ts             # Existing generic fixtures
│   │   ├── custom-fixtures.ts              # Existing & new custom fixtures
│   │   ├── auth-fixtures.ts                # Authentication test data
│   │   ├── data-factory-fixtures.ts        # Data generation factories
│   │   ├── module-specific/
│   │   │   ├── module-1-fixtures.ts
│   │   │   ├── module-2-fixtures.ts
│   │   │   └── ... (module-specific setups)
│   │   └── cleanup-fixtures.ts             # Teardown & cleanup
│   │
│   ├── utils/
│   │   ├── element-interactions.ts         # Click, type, select, etc.
│   │   ├── assertion-helpers.ts            # Common assertions
│   │   ├── wait-strategies.ts              # Wait & retry logic
│   │   ├── data-generators.ts              # Test data generators
│   │   ├── mcp-inspector.ts                # MCP Playwright integration
│   │   └── selector-helpers.ts             # Selector utilities
│   │
│   ├── types/
│   │   ├── page-config.types.ts            # Page configuration types
│   │   ├── selector-config.types.ts        # Selector types
│   │   ├── test-data.types.ts              # Test data types
│   │   └── audit-types.ts                  # Types from page-audit-results.json
│   │
│   └── config/
│       ├── page-audit-config.ts            # Parsed page-audit-results.json
│       └── framework-config.ts             # Framework configuration
│
├── page-audit-results.json                  # Module metadata source
├── cucumber.js                              # Cucumber configuration
└── tsconfig.json                            # TypeScript configuration
```

## Core Components Design

### 1. Base Page Class

```typescript
// src/pages/base.page.ts
export class BasePage {
  // Common properties
  page: Page
  baseUrl: string
  moduleName: string
  
  // Constructor with page and context
  constructor(page: Page)
  
  // Navigation methods
  navigate(path: string): Promise<void>
  navigateToModule(): Promise<void>
  
  // Element interaction wrappers
  click(selector: string): Promise<void>
  type(selector: string, text: string): Promise<void>
  select(selector: string, value: string): Promise<void>
  
  // Assertion helpers
  assertElementVisible(selector: string): Promise<void>
  assertElementHasText(selector: string, text: string): Promise<void>
  assertPageTitle(title: string): Promise<void>
  
  // Wait strategies
  waitForElement(selector: string): Promise<void>
  waitForNavigation(): Promise<void>
  
  // Helper methods
  getElementText(selector: string): Promise<string>
  isElementVisible(selector: string): Promise<boolean>
  getElementCount(selector: string): Promise<number>
}
```

### 2. Module-Specific POM Class (Template)

```typescript
// src/pages/general/module-1.page.ts
export class Module1Page extends BasePage {
  // Selectors extracted from page-audit-results.json
  readonly selectors = {
    // Primary elements
    mainContainer: 'div[data-module="module-1"]',
    headerTitle: 'h1:has-text("Module 1")',
    
    // Form elements
    inputField: 'input[name="field-1"]',
    submitButton: 'button:has-text("Submit")',
    
    // Table/List elements
    dataTable: 'table[role="grid"]',
    tableRows: 'table[role="grid"] tbody tr',
    
    // Validation elements
    successMessage: '[role="status"]:has-text("Success")',
    errorMessage: '[role="alert"]',
  }
  
  // Module-specific methods
  async fillForm(data: FormData): Promise<void>
  async submitForm(): Promise<void>
  async validateSuccessMessage(): Promise<void>
  async validateTableData(expectedRows: any[]): Promise<void>
}
```

### 3. Step Definition Factory

```typescript
// src/steps/step-factory.ts
export class StepFactory {
  /**
   * Create standard step implementations to reduce duplication
   * Example: Generate navigation, form fill, assertion steps
   */
  
  static createNavigationStep(moduleName: string)
  static createFormFillingStep(moduleName: string, fields: string[])
  static createAssertionStep(moduleName: string, assertions: Assertion[])
  static createTableValidationStep(moduleName: string)
}
```

### 4. Selector Strategy Pattern

```typescript
// src/pages/strategies/selector-strategies.ts
export interface SelectorStrategy {
  findElement(selector: string): Promise<Locator>
  findElements(selector: string): Promise<Locator[]>
  validate(): Promise<boolean>
}

export class RoleBasedStrategy implements SelectorStrategy
export class TestIdStrategy implements SelectorStrategy
export class LabelBasedStrategy implements SelectorStrategy
export class CssStrategy implements SelectorStrategy

// src/pages/strategies/locator-builder.ts
export class LocatorBuilder {
  /**
   * Build selectors dynamically from page-audit-results.json data
   */
  buildSelectorFromAudit(moduleData: ModuleAuditData): string
  tryMultipleStrategies(element: AuditElement): string[]
}
```

### 5. Shared Steps Implementation

```typescript
// src/steps/shared/common-steps.ts
export class CommonSteps {
  @Given('the user navigates to the {string} module')
  async navigateToModule(moduleName: string) { }
  
  @When('the user fills the form with the following data:')
  async fillFormWithData(dataTable: DataTable) { }
  
  @Then('the {string} field should display {string}')
  async validateFieldValue(fieldName: string, expectedValue: string) { }
}

// src/steps/shared/navigation-steps.ts
export class NavigationSteps {
  @Given('the user is on the {string} page')
  async userIsOnPage(pageName: string) { }
  
  @When('the user clicks the {string} button')
  async userClicksButton(buttonName: string) { }
}

// src/steps/shared/assertion-steps.ts
export class AssertionSteps {
  @Then('the table should display {int} rows')
  async tableDisplaysRows(rowCount: number) { }
  
  @Then('the {string} message should be visible')
  async messageVisible(messageType: string) { }
}
```

### 6. Framework Utilities

```typescript
// src/utils/element-interactions.ts
export class ElementInteractions {
  static async clickElement(page: Page, selector: string)
  static async typeText(page: Page, selector: string, text: string)
  static async selectOption(page: Page, selector: string, value: string)
  static async checkCheckbox(page: Page, selector: string)
  static async uploadFile(page: Page, selector: string, filePath: string)
}

// src/utils/assertion-helpers.ts
export class AssertionHelpers {
  static async assertElementVisible(page: Page, selector: string)
  static async assertElementText(page: Page, selector: string, text: string)
  static async assertTableRowCount(page: Page, selector: string, count: number)
  static async assertValidationError(page: Page, fieldName: string)
}

// src/utils/wait-strategies.ts
export class WaitStrategies {
  static defaultTimeout = 5000
  static defaultRetries = 3
  
  static async waitWithRetry<T>(
    fn: () => Promise<T>,
    retries: number = 3,
    timeout: number = 5000
  ): Promise<T>
}

// src/utils/mcp-inspector.ts
export class MCPInspector {
  /**
   * Leverage Playwright MCP for dynamic inspection
   */
  static async inspectPageStructure(page: Page): Promise<PageStructure>
  static async findSelectorForElement(page: Page, elementName: string): Promise<string>
  static async validateSelector(page: Page, selector: string): Promise<boolean>
  static async getElementMetadata(page: Page, selector: string): Promise<ElementMetadata>
}
```

### 7. Fixtures Architecture

```typescript
// src/fixtures/generic-fixtures.ts
// Existing generic fixtures

// src/fixtures/custom-fixtures.ts
export const testDataFixtures = {
  createUser(): UserData { }
  createTransaction(): TransactionData { }
  createReport(): ReportData { }
}

// src/fixtures/auth-fixtures.ts
export const authFixtures = {
  authenticatedUser(): Promise<AuthToken> { }
  adminUser(): Promise<AuthToken> { }
  regularUser(): Promise<AuthToken> { }
}

// src/fixtures/data-factory-fixtures.ts
export class DataFactory {
  static createValidFormData(moduleName: string): FormData
  static createInvalidFormData(moduleName: string): FormData
  static createBoundaryFormData(moduleName: string): FormData
}

// src/fixtures/cleanup-fixtures.ts
export const cleanupFixtures = {
  afterEachTest(): Promise<void> { }
  clearTestData(): Promise<void> { }
  resetSession(): Promise<void> { }
}
```

## Feature File Template

```gherkin
# Features/General/Module-Name.feature
Feature: Module Name - [Description from page-audit-results.json]
  As a user
  I want to interact with the Module Name
  So that I can [business value]

  Background:
    Given the user is authenticated
    And the user navigates to the "Module Name" module

  # POSITIVE SCENARIOS
  Scenario: Successfully complete primary workflow
    When the user performs action
    And the user fills the form with valid data
    Then the module should display success message
    And the module should update correctly

  Scenario: Validate form with valid inputs
    When the user enters valid data in all required fields
    Then all fields should be marked as valid
    And the submit button should be enabled

  # NEGATIVE SCENARIOS
  Scenario: Display validation error for invalid input
    When the user enters invalid data in the field
    Then the field should display error message
    And the submit button should be disabled

  Scenario: Handle missing required fields
    When the user tries to submit without required fields
    Then the module should display validation errors
    And the form should remain open

  # EDGE CASES
  Scenario: Handle boundary value inputs
    When the user enters boundary value data
    Then the module should process correctly
    And the result should be valid
```

## Implementation Strategy

### Phase 1: Audit Current State
1. Review all existing .feature files
2. Document existing POM patterns
3. List all current fixtures
4. Identify reusable code patterns

### Phase 2: Parse page-audit-results.json
1. Load and validate JSON structure
2. Extract module metadata (names, elements, interactions)
3. Map modules to existing features
4. Identify missing 209-count modules

### Phase 3: Framework Foundation
1. Create base page class with common utilities
2. Implement shared steps (navigation, form filling, assertions)
3. Create framework utilities (element interactions, assertions)
4. Set up selector strategy pattern

### Phase 4: Code Generation
1. Create templates for POM classes
2. Create templates for step definitions
3. Generate all 209 feature files
4. Generate all 209 POM classes
5. Generate step definitions for each module

### Phase 5: Integration & Testing
1. Integrate with existing fixtures
2. Verify MCP integration for selector validation
3. Test each module with sample scenarios
4. Optimize and refine

## Correctness Properties

### Property 1: Module Navigation Correctness
**Description**: Every module must be navigable and the correct page should load  
**Property**: `navigateToModule(moduleName) → pageLoaded(moduleName)`  
**Test**: Navigate to each of 209 modules and verify correct page loaded

### Property 2: Form Validation Consistency
**Description**: All forms should validate inputs consistently  
**Property**: `fillForm(invalidData) → validationErrorsDisplayed(allFields)`  
**Test**: Submit forms with invalid data and verify all validations trigger

### Property 3: Selector Reliability
**Description**: All selectors should reliably find and interact with elements  
**Property**: `findElement(selector) → elementFound(selector) ∀ validSelectors`  
**Test**: Validate all selectors work consistently across multiple runs

### Property 4: Data Isolation
**Description**: Test data should not leak between test runs  
**Property**: `runTest(T1) → cleanup() → runTest(T2) → noDataFromT1InT2`  
**Test**: Run tests sequentially and verify no data leakage

### Property 5: Error Handling Consistency
**Description**: All error scenarios should display appropriate messages  
**Property**: `triggerError(scenario) → errorMessageDisplayed(scenario)`  
**Test**: Trigger various errors and verify correct messages display

## Testing Framework Integration

- **Test Runner**: Cucumber.js with Playwright
- **Configuration**: cucumber.js (existing)
- **Hooks**: Before/After for setup/cleanup
- **Tags**: @positive, @negative, @smoke, @critical
- **Reporting**: Allure with detailed screenshots/videos

## Success Criteria

1. All 209 feature files created with positive + negative scenarios
2. All 209 POM classes generated following base class pattern
3. All step definitions implemented and passing
4. Framework utilities and fixtures comprehensive and reusable
5. All tests pass consistently
6. MCP integration working for selector validation
7. Full documentation with examples
8. Code follows DRY principles and modular architecture

## Timeline Estimate

- **Audit & Analysis**: 2 days
- **Framework Foundation**: 3 days
- **Code Generation**: 4 days
- **Integration & Testing**: 3 days
- **Optimization & Documentation**: 2 days
- **Total**: 14-16 days

