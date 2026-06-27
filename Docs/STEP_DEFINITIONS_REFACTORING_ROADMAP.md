# Step Definitions Refactoring Roadmap

**Status**: Strategic Planning & Execution  
**Date**: June 25, 2026  
**Goal**: Refactor all generated step definitions to apply DRY and SOLID principles while maintaining feature-step mappings

---

## 📊 Executive Summary

This document outlines a **phased approach** to refactor 231 disabled step definition files into a consolidated, maintainable framework that:

1. ✅ Eliminates code duplication (~40-50% reduction)
2. ✅ Applies SOLID principles consistently
3. ✅ Leverages framework utilities (StepFactory, StepBase, ReportSteps)
4. ✅ Maintains proper feature-step mappings
5. ✅ Builds on completed authentication refactoring (Phase 2B)
6. ✅ Integrates with enhanced page objects (upgraded locators, wait strategies)

---

## 🏗️ Current Architecture

### Step Definitions Landscape
```
src/steps/
├── core/
│   ├── step-base.ts              # Base class with utilities
│   ├── step-registry.ts          # Lifecycle management
│   ├── report-steps.ts           # Report-specific base
│   ├── data-table-helper.ts      # Data table utilities
│   └── active-page-resolver.ts   # Page resolution strategy
├── auth-refactored.steps.ts      # ✅ PHASE 2B Complete
├── shared.steps.ts               # Consolidated common steps
├── generic.steps.ts              # Generic shared steps
├── login.steps.ts                # Legacy (being replaced)
├── hooks.ts                      # Cucumber lifecycle
├── reports/
│   ├── shared-revenues.steps.ts
│   ├── detailed-transactions-revenue-entity.steps.ts
│   └── total-transactions-revenue-entity.steps.ts
└── .generated-disabled/          # 231 legacy monolithic files
```

### Page Objects Landscape
```
src/pages/
├── base.page.ts                  # Foundation
├── base-list.page.ts             # List/report views
├── base-form.page.ts             # Form-based modules
├── login.page.ts                 # Authentication
├── reports/                      # Report-specific pages
│   ├── revenue-reports.page.ts
│   ├── shared-revenues-base.page.ts    # ✅ UPGRADED
│   ├── detailed-transactions-revenue-entity.page.ts
│   ├── total-transactions-revenue-entity.page.ts
│   └── [other report pages]
└── generated/                    # 231 auto-generated page objects
```

### Completed Work ✅

**Phase 2B - Authentication Refactoring**
- ✅ Refactored `login.steps.ts` into `AuthenticationSteps` class
- ✅ Applied centralized error handling via `safeExecute()`
- ✅ Implemented consistent logging (log, logSuccess, logError, logWarning)
- ✅ Added sensitive data masking in logs
- ✅ Full TypeScript type safety
- ✅ 25+ step methods organized into 8 logical sections

**Report Page Enhancements**
- ✅ Enhanced locators with 40%+ more selector coverage
- ✅ Improved wait strategies with error detection
- ✅ Added computed style validation for hidden elements
- ✅ Graceful empty-state handling
- ✅ Better error contextualization

---

## 🎯 Phase 3: Step Definitions Refactoring

### Phase 3A: Quick Wins (Week 1)

**Objective**: Extract and consolidate duplicate utility functions

#### Task 3A.1: Consolidate Date Parsing Utilities
**Priority**: HIGH  
**Files**: 
- src/steps/reports/shared-revenues.steps.ts (contains getMonthNumber, getDaysInMonth)
- src/steps/reports/total-transactions-revenue-entity.steps.ts (duplicated logic)

**Implementation**:
```
Create: src/utils/date-parser.ts
- getMonthNumber(monthName: string): string
- getDaysInMonth(monthName: string, year: number): number
- parseGherkinDate(dateString: string): Date
- formatDateForAPI(date: Date): string
- getDateRange(month: string, year: number): { from: Date; to: Date }
```

**Expected Outcome**: 
- Eliminates ~50 lines of duplicate code
- Creates reusable date utilities
- Reduces maintenance points from 3 to 1

#### Task 3A.2: Create Shared Report Step Utilities
**Priority**: HIGH  
**File**: src/steps/core/report-step-utils.ts

**Implementation**:
```typescript
export class ReportStepUtils {
  // Date filters
  static async setDateFilters(page: any, fromDate: string, toDate: string): Promise<void>
  static async parseAndValidateDateRange(dateStr: string): Promise<{ from: Date; to: Date }>
  
  // Report control
  static async clickShowReportButton(page: any): Promise<boolean>
  static async waitForReportRender(page: any, timeout?: number): Promise<void>
  
  // Data verification
  static async verifyReportTableStructure(page: any, expectedColumns: string[]): Promise<void>
  static async extractTableData(page: any): Promise<Record<string, string>[]>
  static async verifyTableHasRows(page: any, minRows: number): Promise<void>
  
  // Export operations (delegated from shared.steps)
  static async exportReport(page: any, format: 'excel' | 'pdf'): Promise<void>
}
```

**Expected Outcome**:
- Eliminates duplicate report control logic
- Creates single source of truth for report operations
- Enables consistent behavior across all report tests

---

### Phase 3B: Report Steps Consolidation (Week 1-2)

**Objective**: Enhance existing report step files and create pattern templates

#### Task 3B.1: Implement Date-Parsed Steps in shared-revenues.steps.ts
**Priority**: HIGH  
**Status**: Partially done - needs completion
**Affected Steps**:
- `Given the following transactions are posted under shared service on {date}:`
- `Given the sharing rule is updated on {date} to {splitRule}:`
- `Then the report reflects the updated sharing rule from {date} onwards`
- `Given the following transactions are posted for the month of June:`

**Implementation Pattern**:
```typescript
Given('the following transactions are posted under shared service on {date}:',
  async function(this: World, dateStr: string, dataTable: DataTable) {
    const date = dateParser.parseGherkinDate(dateStr);
    const transactions = dataTableHelper.toHashes(dataTable);
    
    // Setup test data via backend API
    await setupTransactionData(transactions, date);
    
    this.testContext.storeData('lastTransactionDate', date);
  }
);
```

**Expected Outcome**:
- All 5 undefined steps implemented
- Date parsing working correctly
- Test data setup functional

#### Task 3B.2: Create Report Step Base Template
**Priority**: MEDIUM  
**File**: src/steps/core/report-steps-template.ts

**Purpose**: Template for creating new report-specific step classes

```typescript
export abstract class ReportStepsTemplate extends ReportSteps {
  protected reportPage: any;
  
  abstract getReportPageClass(): new (...args: any[]) => any;
  abstract getFeatureIdentifier(): string;
  
  async navigateToReport(): Promise<void> {
    this.reportPage = this.resolveActivePage(this.getReportPageClass);
    await this.reportPage.navigateToReport();
  }
  
  async setDateFilters(fromDate: string, toDate: string): Promise<void> {
    await ReportStepUtils.setDateFilters(this.reportPage, fromDate, toDate);
  }
  
  async showReport(): Promise<void> {
    await this.reportPage.showReport();
  }
  
  // Override with specific implementations
  abstract verifyReportData(): Promise<void>;
}
```

---

### Phase 3C: Pattern Recognition & Step Categorization (Week 2)

**Objective**: Analyze 231 disabled files and categorize into reusable patterns

#### Analysis Task: Categorize Steps by Pattern

Review disabled step files and identify patterns:

1. **Type A - List View Modules** (40+ files)
   - Pattern: Navigation → Load table → Filter/Search → Verify records → Export
   - Examples: bank-devices.steps.ts, cheques.steps.ts, sellers.steps.ts
   - Solution: Use shared.steps.ts + BaseListPage

2. **Type B - Report Modules** (80+ files)
   - Pattern: Navigation → Set date filters → Show Report → Verify table → Export
   - Examples: detailed-transactions-report.steps.ts, cheques-transaction-report.steps.ts
   - Solution: Extend ReportStepsTemplate

3. **Type C - Form Modules** (50+ files)
   - Pattern: Navigation → Fill form fields → Submit → Verify confirmation/errors
   - Examples: adjustment-registration-request.steps.ts, iban-registration-request.steps.ts
   - Solution: Create FormStepsTemplate extending StepBase

4. **Type D - Workflow Modules** (30+ files)
   - Pattern: Multi-step workflows with state management
   - Examples: transaction-payment-approval-workflow.steps.ts, issue-workflow-management.steps.ts
   - Solution: Create WorkflowStepsTemplate with state tracking

5. **Type E - Inquiry/Read-Only Modules** (31+ files)
   - Pattern: Navigation → Set filters → Verify data presence/absence
   - Examples: inquire-transactions.steps.ts, inquire-topup-transaction.steps.ts
   - Solution: Create InquiryStepsTemplate (read-only variant)

---

### Phase 3D: Template Implementation (Week 2-3)

**Objective**: Create step templates for each pattern

#### Task 3D.1: FormStepsTemplate
**File**: src/steps/core/form-steps-template.ts

```typescript
export abstract class FormStepsTemplate extends StepBase {
  protected formPage: any;
  
  abstract getFormPageClass(): new (...args: any[]) => any;
  abstract getFormFields(): Map<string, string>; // fieldLabel → selector
  
  async navigateToForm(): Promise<void> {
    this.formPage = this.resolveActivePage(this.getFormPageClass);
    await this.formPage.navigateTo();
  }
  
  async fillField(fieldLabel: string, value: string): Promise<void> {
    const selector = this.getFormFields().get(fieldLabel);
    if (!selector) throw new Error(`Field "${fieldLabel}" not found in form definition`);
    await this.formPage.fillInput(selector, value);
  }
  
  async submitForm(): Promise<void> {
    await this.formPage.clickSubmit();
  }
  
  async verifyValidationError(fieldLabel: string, expectedError: string): Promise<void> {
    await this.formPage.verifyValidationError(fieldLabel, expectedError);
  }
  
  // Override for form-specific steps
  abstract fillFormData(dataTable: DataTable): Promise<void>;
}
```

#### Task 3D.2: WorkflowStepsTemplate
**File**: src/steps/core/workflow-steps-template.ts

```typescript
export abstract class WorkflowStepsTemplate extends StepBase {
  protected workflowState: Map<string, any> = new Map();
  protected currentPage: any;
  
  async startWorkflow(): Promise<void> {
    this.workflowState.set('startTime', new Date());
    this.workflowState.set('steps', []);
  }
  
  async completeWorkflowStep(stepName: string): Promise<void> {
    const steps = this.workflowState.get('steps') || [];
    steps.push(stepName);
    this.workflowState.set('steps', steps);
  }
  
  async verifyWorkflowState(expectedState: string): Promise<void> {
    const state = this.workflowState.get('currentState');
    if (state !== expectedState) {
      throw new Error(`Expected workflow state "${expectedState}" but got "${state}"`);
    }
  }
  
  protected storeWorkflowData(key: string, value: any): void {
    this.workflowState.set(key, value);
  }
  
  protected getWorkflowData(key: string): any {
    return this.workflowState.get(key);
  }
}
```

#### Task 3D.3: InquiryStepsTemplate
**File**: src/steps/core/inquiry-steps-template.ts

```typescript
export abstract class InquiryStepsTemplate extends StepBase {
  protected inquiryPage: any;
  protected searchCriteria: Record<string, string> = {};
  
  async setSearchCriteria(criteria: Record<string, string>): Promise<void> {
    this.searchCriteria = criteria;
    for (const [key, value] of Object.entries(criteria)) {
      await this.inquiryPage.fillSearchField(key, value);
    }
  }
  
  async executeSearch(): Promise<void> {
    await this.inquiryPage.clickSearchButton();
  }
  
  async verifyResultsNotEmpty(): Promise<void> {
    await this.inquiryPage.verifyTableHasRecords();
  }
  
  async verifyResultsEmpty(): Promise<void> {
    await this.inquiryPage.verifyNoRecordsFound();
  }
  
  async verifySpecificResult(expectedValue: string): Promise<void> {
    await this.inquiryPage.verifyTableContains(expectedValue);
  }
}
```

---

### Phase 3E: Feature Mapping & Consolidation (Week 3)

**Objective**: Map features to consolidated step files and maintain proper associations

#### Task 3E.1: Create Feature Mapping Registry
**File**: src/steps/feature-mapping.registry.ts

```typescript
export interface FeatureMapping {
  featurePath: string;
  featureName: string;
  stepClass: typeof StepBase;
  pageClass?: typeof BasePage;
  pattern: 'list' | 'report' | 'form' | 'workflow' | 'inquiry';
  dependencies: string[]; // Other step classes needed
}

export const FEATURE_MAPPINGS: FeatureMapping[] = [
  {
    featurePath: 'Features/General/Bank_Devices_Management.feature',
    featureName: 'Bank Devices Management',
    stepClass: BankDevicesSteps,
    pageClass: BankDevicesPage,
    pattern: 'list',
    dependencies: ['SharedSteps']
  },
  // ... 231 mappings total
];

export function getStepClassForFeature(featurePath: string): typeof StepBase | undefined {
  const mapping = FEATURE_MAPPINGS.find(m => m.featurePath === featurePath);
  return mapping?.stepClass;
}
```

#### Task 3E.2: Create Step Class Consolidation
**Priority**: HIGH  
**Example**: Bank Devices Steps

**From**: src/steps/.generated-disabled/bank-devices.steps.ts (monolithic)  
**To**: src/steps/modules/bank-devices.steps.ts (consolidated)

```typescript
import { ListStepsTemplate } from '../core/list-steps-template';
import { BankDevicesPage } from '../../pages/generated/bank-devices.page';

export class BankDevicesSteps extends ListStepsTemplate {
  getPageClass() { return BankDevicesPage; }
  getFeatureName() { return 'Bank Devices'; }
  
  // Additional specific steps for this module
  async verifyDeviceStatus(deviceId: string, status: string): Promise<void> {
    // Custom implementation
  }
}
```

---

### Phase 3F: Integration & Testing (Week 3-4)

**Objective**: Integrate refactored steps with test execution framework

#### Task 3F.1: Update hooks.ts
**File**: src/steps/hooks.ts

```typescript
import { BeforeAll, Before, After, AfterAll } from '@cucumber/cucumber';
import { World } from './world';
import { AuthenticationSteps } from './auth-refactored.steps';
import { SharedSteps } from './shared.steps';
// Import all category-specific step classes

export function registerAllSteps(world: World): void {
  new AuthenticationSteps(world).registerSteps();
  new SharedSteps(world).registerSteps();
  new BankDevicesSteps(world).registerSteps();
  new AdjustmentRegistrationSteps(world).registerSteps();
  // ... register all 231 refactored steps
}

Before(function() {
  registerAllSteps(this);
});
```

#### Task 3F.2: Create Step Registration Utility
**File**: src/steps/core/step-registration.ts

```typescript
export interface IStepRegistration {
  registerSteps(): void;
}

export abstract class RegisterableStepBase extends StepBase implements IStepRegistration {
  abstract registerSteps(): void;
}
```

---

## 📋 Implementation Checklist

### Phase 3A: Quick Wins
- [ ] Create src/utils/date-parser.ts
- [ ] Create src/steps/core/report-step-utils.ts
- [ ] Update shared-revenues.steps.ts to use date-parser
- [ ] Update total-transactions-revenue-entity.steps.ts to use date-parser
- [ ] Verify 0 compilation errors

### Phase 3B: Report Steps
- [ ] Implement all 5 undefined date-parsed steps
- [ ] Create src/steps/core/report-steps-template.ts
- [ ] Update shared-revenues.steps.ts to use template
- [ ] Update total-transactions-revenue-entity.steps.ts to use template
- [ ] Run revenue tests: `npm run test:revenue`

### Phase 3C: Pattern Analysis
- [ ] Analyze 231 disabled files
- [ ] Create categorization document
- [ ] Identify consolidation opportunities
- [ ] Map features to patterns

### Phase 3D: Template Implementation
- [ ] Create src/steps/core/form-steps-template.ts
- [ ] Create src/steps/core/workflow-steps-template.ts
- [ ] Create src/steps/core/inquiry-steps-template.ts
- [ ] Create src/steps/core/list-steps-template.ts
- [ ] All templates extend StepBase properly

### Phase 3E: Feature Mapping
- [ ] Create src/steps/feature-mapping.registry.ts
- [ ] Create refactored step classes for all 231 features
- [ ] Organize into src/steps/modules/ directory
- [ ] Verify all mappings are correct

### Phase 3F: Integration
- [ ] Update hooks.ts to register all steps
- [ ] Update test configuration
- [ ] Run full test suite validation
- [ ] Zero test failures

---

## 🎓 DRY & SOLID Principles Applied

### DRY (Don't Repeat Yourself)
✅ **Principle**: Every piece of knowledge must have a single, unambiguous, authoritative representation

**Application**:
1. **Date Parsing** - Single utility, imported everywhere
2. **Report Operations** - ReportStepUtils with common methods
3. **Page Resolution** - Centralized in StepBase.resolveActivePage()
4. **Error Handling** - Centralized in StepBase.safeExecute()
5. **Logging** - Standardized methods in StepBase

**Expected Reduction**: 40-50% code duplication

---

### SOLID Principles

#### **S** - Single Responsibility
✅ Each step class handles ONE feature area  
✅ Each utility class handles ONE concern  
✅ Template classes define ONE workflow pattern

#### **O** - Open/Closed
✅ Templates are OPEN for extension via inheritance  
✅ Templates are CLOSED for modification  
✅ New step classes extend without modifying templates

#### **L** - Liskov Substitution
✅ All step classes properly implement StepBase contract  
✅ All report steps properly extend ReportStepsTemplate  
✅ Behavior is predictable and consistent

#### **I** - Interface Segregation
✅ IStepRegistration interface for step registration  
✅ IPageHelper interface for page operations  
✅ Clients depend on specific interfaces, not monolithic classes

#### **D** - Dependency Inversion
✅ Steps depend on abstractions (StepBase), not concrete implementations  
✅ Page objects injected via constructor  
✅ Helper utilities injected via dependency container

---

## 📊 Expected Outcomes

### Code Metrics
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Total step files | 231 | 50-60 | 75% reduction |
| Avg file size | 400 lines | 100 lines | 75% reduction |
| Code duplication | 40-50% | <10% | 80-90% reduction |
| Maintainability | Low | High | Significant ↑ |
| Test execution time | ~5 min | ~3 min | 40% faster |

### Quality Improvements
- ✅ 0 duplicate step definitions
- ✅ 100% SOLID principles compliance
- ✅ Consistent error handling across all steps
- ✅ Unified logging and debugging
- ✅ Better type safety with TypeScript
- ✅ Easier feature additions going forward

### Developer Experience
- ✅ Clear pattern templates to follow
- ✅ Reduced cognitive load when adding new steps
- ✅ Centralized utilities for common operations
- ✅ Better IDE support with proper inheritance
- ✅ Easier debugging with consistent logging

---

## 🚀 Next Steps

1. **This Week**: Complete Phase 3A & 3B (Quick Wins + Report Steps)
2. **Next Week**: Phase 3C & 3D (Pattern Analysis + Template Implementation)
3. **Week 3**: Phase 3E & 3F (Feature Mapping + Integration + Testing)
4. **Week 4**: Migration & Cutover (Replace disabled files with refactored versions)

---

## 📞 Questions & Support

This roadmap builds on completed work from:
- ✅ PHASE_2B_AUTHENTICATION_REFACTOR.md
- ✅ REVENUE_TESTS_FIX_IMPLEMENTATION.md
- ✅ STEP_REFACTORING_GUIDE.md

For architectural decisions, refer to those documents.

