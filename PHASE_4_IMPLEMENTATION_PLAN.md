# Phase 4: Implement Additional Tests - Comprehensive Implementation Plan

**Status**: 🚀 In Progress - Production-Grade Implementation  
**Date**: June 30, 2026  
**Goal**: Complete all shared revenues test implementations with production standards

---

## 📋 Phase 4 Objectives

### Primary Goal
Implement complete test coverage for all shared revenues report scenarios using:
- Robust locator infrastructure from Phase 3
- Production-grade date parsing utilities
- Comprehensive data setup and verification

### Scope
- **8 Scenarios** across 4 shared revenue report variants
- **5 Scenario Types**: Positive, Negative, RBAC, Split Verification, Export
- **Multiple Split Rules**: 50/50, 60/40, 70/30, 80/20
- **End-to-End Testing**: Data setup → Report generation → Verification

---

## 🎯 Scenarios to Implement

### Scenario 1: Full Cycle - Post & Verify Split (50/50)
**File**: `Shared_Revenues_Report_DTPS_and_Sharjah_Municipality.feature`  
**Type**: @positive @e2e @split  
**Status**: ⏳ Pending Implementation

```gherkin
Given the following transactions are posted under shared service on 2026-06-15:
  | Service | Amount | Entities |
  | Shared-Service-001 | 1000 | DTPS & Sharjah Municipality |
  | Shared-Service-001 | 500 | DTPS & Sharjah Municipality |
When the user runs the shared revenues report for "June 2026"
Then the report shows transaction split verification
And all transactions are split "50/50" between the two entities
And the splits sum to the total transaction amount for each transaction
And the total for the first entity is 750.00 AED
And the total for the second entity is 750.00 AED
And the grand total is 1500.00 AED
And the report can be exported to PDF
```

**Implementation Requirements**:
- [ ] Mock transaction data generation for date
- [ ] Report navigation and rendering
- [ ] Split ratio verification (50/50 = 750 + 750)
- [ ] Grand total calculation and validation
- [ ] PDF export capability check

### Scenario 2: Mid-Period Rule Change
**Type**: @positive @split  
**Status**: ⏳ Pending Implementation

**Implementation Requirements**:
- [ ] Date change tracking
- [ ] Before/after split ratio verification
- [ ] Report refresh with new rules
- [ ] Comparison logic for split differences

### Scenario 3: No Data Found
**Type**: @negative  
**Status**: ⏳ Pending Implementation

**Implementation Requirements**:
- [ ] Future date range selection
- [ ] Empty state detection
- [ ] "No data found" message verification
- [ ] Proper error handling

### Scenario 4: RBAC - Unauthorized Access
**Type**: @negative @rbac  
**Status**: ⏳ Pending Implementation

**Implementation Requirements**:
- [ ] User role-based authentication
- [ ] Access denial verification
- [ ] Error message display
- [ ] Proper permission checks

### Scenario 5: Export Functionality
**Type**: @positive @export  
**Status**: ⏳ Pending Implementation

**Implementation Requirements**:
- [ ] Excel export capability
- [ ] PDF export capability
- [ ] File format validation
- [ ] Data integrity in exports

### Additional Scenarios
- SEDD & SCTDA (60/40)
- Prevention & Safety Authority & SAND (70/30)
- Sharjah Municipality & Service Centers (80/20)

---

## 🏗️ Implementation Architecture

### 1. Shared Revenues Implementation Class
**File**: `src/steps/reports/shared-revenues-implementation.ts`

**Methods Required**:

#### Data Setup Methods
```typescript
// Setup transaction data
async setupTransactionsForDate(dateStr: string, transactions: any[]): Promise<void>

// Configure sharing rules
async setSharingRule(serviceName: string, splitRule: string): Promise<void>

// Update rule mid-period
async updateSharingRuleOnDate(dateStr: string, newSplitRule: string): Promise<void>

// Configure entities
async configureRevenueEntities(entityA: string, entityB: string): Promise<void>
```

#### Report Navigation Methods
```typescript
// Navigate to specific shared revenue report
async navigateToSharedRevenueReport(reportType: string): Promise<void>

// Apply date range filters
async applyDateRangeFilter(fromDate: string, toDate: string): Promise<void>

// Execute report
async generateReport(): Promise<void>
```

#### Verification Methods
```typescript
// Verify split ratios
async verifySplitRatio(expectedRatio: string): Promise<boolean>

// Verify entity totals
async verifyEntityTotal(entityName: string, expectedAmount: number): Promise<boolean>

// Verify grand total
async verifyGrandTotal(expectedTotal: number): Promise<boolean>

// Verify no data message
async verifyNoDataMessage(): Promise<boolean>

// Verify access denied
async verifyAccessDenied(): Promise<boolean>

// Verify mid-period rule change
async verifyMidPeriodRuleChange(changeDate: Date, beforePercent: number, afterPercent: number): Promise<boolean>
```

#### Export Methods
```typescript
// Export to Excel
async exportToExcel(): Promise<void>

// Export to PDF
async exportToPDF(): Promise<void>

// Verify export file
async verifyExportFile(format: 'xlsx' | 'pdf'): Promise<boolean>
```

### 2. Page Object Updates
**Files to Update**:
- `src/pages/reports/shared-revenues-base.page.ts`
- `src/pages/reports/shared-revenues-dtps-sharjah.page.ts`
- `src/pages/reports/shared-revenues-sedd-sctda.page.ts`
- `src/pages/reports/shared-revenues-safety-sand.page.ts`
- `src/pages/reports/shared-revenues-municipality-centers.page.ts`

**Changes**:
- Inherit from `ImprovedReportPageBase`
- Use `LocatorHelper` for element interaction
- Add split-verification-specific methods
- Implement export functionality

### 3. Utility Enhancements
**Files to Create/Update**:
- `src/utils/split-calculation.utility.ts` - Split ratio calculations
- `src/utils/export-validation.utility.ts` - Export file validation
- `src/utils/date-parser.ts` - Already exists, use as-is

---

## 📊 Data Setup Strategy

### Transaction Data Generation
```typescript
interface TransactionData {
  date: Date;
  service: string;
  amount: number;
  entities: string[];
  splitRatio: { [key: string]: number };
}

// Examples:
// 1000 AED @ 50/50 = 500 + 500
// 1500 AED @ 60/40 = 900 + 600
// 2000 AED @ 70/30 = 1400 + 600
// 3000 AED @ 80/20 = 2400 + 600
```

### Mock Data Layer
Mock transaction posting to enable:
- Consistent test data
- Repeatable test execution
- No external dependencies
- Deterministic verification

---

## 🔄 Implementation Flow

### Step 1: Setup Phase
```
1. Login as appropriate user role
2. Configure revenue entities
3. Set sharing rules
4. Setup transaction data
5. Navigate to report
```

### Step 2: Execution Phase
```
1. Apply date range filters
2. Apply entity filters (if needed)
3. Generate report
4. Wait for report rendering
5. Verify no errors
```

### Step 3: Verification Phase
```
1. Extract report data
2. Calculate expected results
3. Compare actual vs expected
4. Verify all conditions met
5. Test export if applicable
```

### Step 4: Cleanup Phase
```
1. Clear filters
2. Close any popups
3. Reset state
4. Log results
```

---

## ✅ Implementation Checklist

### Phase 4.1: Foundation
- [ ] Create `shared-revenues-implementation.ts`
- [ ] Implement all data setup methods
- [ ] Implement all navigation methods
- [ ] Add to shared-revenues.steps.ts bindings

### Phase 4.2: Verification
- [ ] Implement all verification methods
- [ ] Add split calculation utility
- [ ] Test with mock data
- [ ] Validate calculations

### Phase 4.3: Page Objects
- [ ] Update all shared revenue page objects
- [ ] Inherit from ImprovedReportPageBase
- [ ] Add split-specific methods
- [ ] Test locators with @locator-inspect tag

### Phase 4.4: Export & Advanced
- [ ] Implement export methods
- [ ] Create export validation utility
- [ ] Test file generation
- [ ] Validate file integrity

### Phase 4.5: Testing
- [ ] Run all 8 scenarios
- [ ] Verify all pass
- [ ] Check cross-browser compatibility
- [ ] Performance testing (< 30s per scenario)

### Phase 4.6: Documentation
- [ ] Create implementation guide
- [ ] Document data structures
- [ ] Add troubleshooting guide
- [ ] Create example usage

---

## 🎯 Split Ratio Calculations Reference

### 50/50 Split (DTPS & Sharjah Municipality)
```
Total: 1500 AED
Entity A (50%): 750 AED
Entity B (50%): 750 AED
```

### 60/40 Split (SEDD & SCTDA)
```
Total: 1500 AED
Entity A (60%): 900 AED
Entity B (40%): 600 AED
```

### 70/30 Split (Prevention & Safety Authority & SAND)
```
Total: 1500 AED
Entity A (70%): 1050 AED
Entity B (30%): 450 AED
```

### 80/20 Split (Sharjah Municipality & Service Centers)
```
Total: 1500 AED
Entity A (80%): 1200 AED
Entity B (20%): 300 AED
```

---

## 🔐 RBAC Test Scenarios

### Authorized Users
- Finance Admin (Full access)
- Entity A Manager (Own entity only)
- Entity B Manager (Own entity only)

### Unauthorized Users
- Entity C Restricted User (No access)
- Collector (No access to revenue reports)
- Public User (No access)

---

## 📈 Success Metrics

### Test Coverage
- [ ] 100% scenario coverage (8/8 passing)
- [ ] 100% step coverage (52/52 implemented)
- [ ] 0 flaky tests
- [ ] < 2% failure rate

### Performance
- [ ] < 30 seconds per scenario
- [ ] < 2 seconds per report render
- [ ] < 5 seconds for data setup

### Reliability
- [ ] 0 timeout errors
- [ ] 0 locator failures
- [ ] 0 assertion errors
- [ ] Cross-browser compatible

---

## 📚 References & Dependencies

### Utilities
- `src/utils/date-parser.ts` - Date parsing
- `src/utils/locator-inspector.utility.ts` - Locator validation
- `src/pages/base-page-locator-helper.ts` - Element interaction
- `src/pages/report-page-base-improved.ts` - Report base class

### Test Data
- Transaction amounts: 500, 1000, 1500, 2000+ AED
- Date ranges: June 2026, future dates
- User roles: Admin, Manager, Restricted, Collector

### Report Pages
- `src/pages/reports/shared-revenues-dtps-sharjah.page.ts`
- `src/pages/reports/shared-revenues-sedd-sctda.page.ts`
- `src/pages/reports/shared-revenues-safety-sand.page.ts`
- `src/pages/reports/shared-revenues-municipality-centers.page.ts`

---

## 🚀 Next Steps

1. **Start Phase 4.1**: Create implementation file with data setup methods
2. **Add to Steps**: Bind implementation methods in steps file
3. **Test Setup**: Run scenarios to validate data setup
4. **Add Verification**: Implement all verification methods
5. **Complete Page Objects**: Update all page objects
6. **Full Test Run**: Execute all 8 scenarios
7. **Production Ready**: Deploy to production

---

**Phase 4 Status**: Starting Implementation  
**Estimated Duration**: 2-3 hours  
**Production-Grade Standards**: Applied throughout  
**Documentation**: Comprehensive and detailed
