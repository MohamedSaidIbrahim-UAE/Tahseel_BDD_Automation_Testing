# Prioritized Module Implementation List

**Document Purpose**: Comprehensive prioritized list of all 204 modules for ordered implementation  
**Created**: June 23, 2026  
**Total Effort**: 534 hours (~12 weeks single developer, 6-7 weeks with 2 developers, 4-5 weeks with 3 developers)

---

## Implementation Overview

```
PRIORITY LEVELS:
P1 - Critical (immediate business value, foundation for others)
P2 - High    (high business value, parallel with P1)
P3 - Medium  (medium business value, after P1 complete)
P4 - Low     (lower priority, final phases)

COMPLEXITY:
Quick Win (1-2 hrs)
Standard  (3-5 hrs)
Complex   (6-12 hrs)
```

---

## PHASE 1: FOUNDATION & P1 MODULES (Week 1)

### Week 1 Tasks (20 hours)
- [ ] Setup code generation framework
- [ ] Create base templates (report, crud, transaction)
- [ ] Create ReportBasePage.ts
- [ ] Create CRUDBasePage.ts
- [ ] Setup MCP integration helpers
- [ ] Create step definition factory
- [ ] Validate templates with 3 sample modules

**Outcome**: Framework ready for scale-out

---

## PHASE 2: P1 QUICK WINS - REVENUE REPORTS (Weeks 2-3)

### Priority 1.1: Tax Reports (5 modules) - 5 hours
**Start**: Week 2, Day 1  
**Complexity**: Quick Win  
**Dependency**: Base report template ready

- [ ] Tax Report Tax Invoice
- [ ] Tax Report Transaction Details (by Revenue Entity)
- [ ] Tax Report Transaction Details (Standard)
- [ ] Tax Report Transaction Summary (by Revenue Entity)
- [ ] Tax Report Transaction Summary (Standard)

**Features**: Date range, Tax entity selector, Amount validation, Export  
**Test Focus**: Amount calculations, Tax rate application, Entity filtering

---

### Priority 1.2: Payment Methods Reports (11 modules) - 11 hours
**Start**: Week 2, Day 2  
**Complexity**: Quick Win (template-based)  
**Dependency**: Base report template ready

- [ ] Aggregated Transactions Report Paid by Credit Cards
- [ ] Cheque and Voucher Transactions Report
- [ ] Credit Card Summary By Merchant
- [ ] Detailed Cheques Report - Revenues
- [ ] Detailed Cheques Report
- [ ] Detailed Report of Transactions Paid by Credit Cards
- [ ] E-Voucher Status Inquire Report
- [ ] Payment Method Summary Report
- [ ] Payment Methods Detailed Report
- [ ] Summary Cheques Report

**Features**: Payment method filtering, Merchant selector, Amount aggregation, Export  
**Test Focus**: Payment type filtering, Merchant aggregation accuracy

---

### Priority 1.3: Revenue Reports - Financial (14 modules) - 14 hours
**Start**: Week 2, Day 4  
**Complexity**: Quick Win (template-based)  
**Dependency**: Base report template ready

- [ ] Detailed Report of POS Transactions by Revenue Source
- [ ] Detailed Transactions Report by Revenue Entity
- [ ] Etisalat Detailed Transactions from Digital Sharjah
- [ ] Placeholder Report arName enName
- [ ] Service List Report Government Fees Report
- [ ] Shared Fees Summary Sharjah Municipality and Service Centers
- [ ] Shared Revenues Report DTPS and Sharjah Municipality
- [ ] Shared Revenues Report Prevention and Safety Authority and SAND
- [ ] Shared Revenues Report SEDD and SCTDA
- [ ] Total Transactions Report by Revenue Entity
- [ ] Traffic Violations Report Vehicle and Drivers
- [ ] Transaction Deposits Detail Report
- [ ] Transaction Summary Income Report
- [ ] Transaction Summary Report Based on Income Receivable

**Features**: Entity selector, Revenue category filtering, Amount breakdown, Export  
**Test Focus**: Revenue entity filtering, Amount distribution accuracy  
**Note**: Shared Revenue modules (3) flagged for complex validation

---

### Priority 1.4: Loading Reports (10 modules) - 10 hours
**Start**: Week 3, Day 1  
**Complexity**: Quick Win (template-based)  
**Dependency**: Base report template ready

- [ ] Aggregated Loading Report of E Vouchers
- [ ] Daily Users Loading Report For Tasheel Centers
- [ ] Detailed Report for Loading using Al Thiqa Club Employee Card
- [ ] E-Voucher Loading Report
- [ ] Entities Deposits Summary Report
- [ ] General Money Loading Report
- [ ] Summary Loading Report
- [ ] Tahseel Account Load Details Report
- [ ] Total Service Charges for Loading Transactions
- [ ] Voucher Load Details Report

**Features**: Loading type filter, User/Entity selector, Amount tracking, Export  
**Test Focus**: Loading type filtering, Amount aggregation by center

---

### Priority 1.5: Refund Reports (7 modules) - 7 hours
**Start**: Week 3, Day 2  
**Complexity**: Quick Win (template-based)  
**Dependency**: Base report template ready

- [ ] Automatic Transaction Refund Report
- [ ] Detailed Refund Report
- [ ] Evoucher Refund Detailed Report
- [ ] Refund Loaded Balance Report on Tahseel Card
- [ ] Sharjah Islamic Bank Refund Report Detailed
- [ ] Sharjah Islamic Bank Refund Report in Period Summary

**Features**: Refund status filter, Amount tracking, Bank selector, Export  
**Test Focus**: Refund status progression, Amount accuracy

---

### Priority 1.6: Deposits Reports (8 modules) - 8 hours
**Start**: Week 3, Day 3  
**Complexity**: Quick Win (template-based)  
**Dependency**: Base report template ready

- [ ] Deposits Balance Summary Report
- [ ] Deposits Details Report
- [ ] Deposits Statement Report
- [ ] Detailed Deposit Retain Transactions
- [ ] Summary Deposit Retain Transactions
- [ ] Total Transactions Report by Deposit Entity
- [ ] Transaction Deposits Detail Report Receivable

**Features**: Deposit entity selector, Hold/Release status, Balance tracking, Export  
**Test Focus**: Balance calculations, Retain date validation

---

### Priority 1.7: Transaction Reports (17 modules) - 25 hours
**Start**: Week 3, Day 4  
**Complexity**: Quick Win (template-based)  
**Dependency**: Transaction report template ready

**Detailed Transaction Reports (8 modules)**:
- [ ] Detailed Transactions Report
- [ ] Detailed Transactions Report of SEDD According to Fees Entity Owner
- [ ] Detailed Report of Canceled Transactions by Revenue Entity
- [ ] Detailed Report of Canceled Transactions
- [ ] Detailed Report of Smart Receipt Services Fees
- [ ] Detailed SEDD Transactions Report
- [ ] Detailed Transactions Report of SEDD According to Fees Entity Owner
- [ ] Beah Paid Transaction Detailed Report
- [ ] Cheque Payment Details Report

**Summary Transaction Reports (5 modules)**:
- [ ] Summary Transactions Report
- [ ] Summary Transactions Report by Entity
- [ ] Summary SEDD Transactions Report
- [ ] Summary GITFees Report for Smart Receipt
- [ ] Aggregated Transactions Report of SEDD According to Fees Entity Owner

**Specialized Transaction Reports (4 modules)**:
- [ ] Transaction Audit
- [ ] E Voucher Report Transaction
- [ ] Esaad Card Application Transaction Report
- [ ] Recovered Wallet Transactions Report

**Features**: Transaction filtering, Drill-down, Reference tracking, Export  
**Test Focus**: Transaction status progression, Reference accuracy, Drill-down data consistency

---

### Phase 2 Summary
**Week 2-3 Total**: 80 hours  
**Modules**: 73 report modules  
**Quality Gate**: 95% pass rate on samples (5 per subpattern)  
**Output**: Production-ready revenue & transaction reports

---

## PHASE 3: P2 CRUD & GENERIC MODULES (Week 4-5)

### Priority 2.1: Core CRUD Operations (28 modules) - 42 hours
**Start**: Week 4, Day 1  
**Complexity**: Standard (template-based with variants)  
**Dependency**: CRUD template ready

**User & Access Management (5 modules)**:
- [ ] User Management
- [ ] User Roles & Permissions
- [ ] Department Access Rules
- [ ] Service Rule Management
- [ ] Authorization Workflow

**Service & Entity Configuration (8 modules)**:
- [ ] Departments Management
- [ ] Service Centers Management
- [ ] Seller Management
- [ ] Merchant Configuration
- [ ] Bank Integration Settings
- [ ] Channel Configuration
- [ ] Entity Master Data
- [ ] Revenue Entity Setup

**System Configuration (7 modules)**:
- [ ] System Settings
- [ ] Topup Master Data
- [ ] Forms Management
- [ ] Workflow Management
- [ ] Business Rules
- [ ] Report Configuration
- [ ] Integration Settings

**Account & Transaction Management (8 modules)**:
- [ ] Tahseel Accounts Management
- [ ] Tahseel Card Requests & Management
- [ ] Account Transfer Requests
- [ ] Balance Adjustment Operations
- [ ] Transaction Reversal/Cancellation
- [ ] Refund Request Management
- [ ] Deposit Management
- [ ] Account Deactivation

**Features**: CRUD operations, Search/Filter, Bulk operations, Status management  
**Test Focus**: Add/Edit/Delete workflows, Validation rules, Status transitions

**Quality Gate**: 90% pass rate

---

### Phase 3 Summary
**Week 4-5 Total**: 42 hours  
**Modules**: 28 CRUD modules  
**Output**: Production-ready generic data management

---

## PHASE 4: P3 COMPLEX CUSTOM MODULES (Weeks 5-8)

### Priority 3.1: Shared Revenue Management (5 modules) - 46 hours
**Start**: Week 5, Day 1  
**Complexity**: Complex (custom patterns)  
**Dependencies**: SharedRevenueReportPage base class, Multi-entity validation utilities

- [x] **Shared Revenues Report DTPS and Sharjah Municipality** - 10 hours
  - Multi-entity selection, revenue split verification, date-based rule changes
  - Custom steps: setup entities, configure split, verify calculation

- [x] **Shared Revenues Report Prevention and Safety Authority and SAND** - 9 hours
  - Government/non-profit entity handling, special settlement rules
  - Custom validation: government compliance, settlement timing

- [x] **Shared Revenues Report SEDD and SCTDA** - 9 hours
  - Different entity types, separate settlement schedules
  - Custom: reconciliation cycle mapping

- [x] **Shared Fees Summary Sharjah Municipality and Service Centers** - 10 hours
  - Multiple service centers, fee allocation by location
  - Custom: geographic validation, allocation sum check

- [x] **Municipality Fees Share Report on Real Estate Directorate** - 8 hours
  - Transaction type-based split, property classification
  - Custom: property type validation, location-based fees

**Quality Gate**: 85% pass rate, manual QA of business logic  
**Documentation**: Business rule specifications for each module

---

### Priority 3.2: Financial Settlement (5 modules) - 56 hours
**Start**: Week 6, Day 1  
**Complexity**: Complex (custom patterns)  
**Dependencies**: BankSettlementReportPage base class, Reconciliation utilities

- [x] **Settlement Reports Mashreq Bank** - 12 hours
  - Multi-cycle settlement, bank-specific rules, fee deductions
  - Custom: cycle identification, fee calculation, bank reference validation

- [x] **Settlement Reports Sharjah Islamic Bank** - 11 hours
  - Islamic banking compliance, Sharia-compliant fees, Zakat calculation
  - Custom: Islamic fee calculation, riba compliance check

- [x] **Settlement Reports UAE Central Bank** - 12 hours
  - Regulatory reporting, daily settlements, audit trail
  - Custom: regulatory format validation, CB reconciliation

- [x] **Bank Transfer Detail Report** - 10 hours
  - Transfer status tracking, failure categorization, retry tracking
  - Custom: transfer state machine, failure reason validation

- [x] **Intensive Settlement Details Report** - 11 hours
  - Granular breakdown, deep drill-down, complex filtering
  - Custom: aggregation logic, drill-down accuracy

**Quality Gate**: 85% pass rate, domain expert review

---

### Priority 3.3: Card & Account Lifecycle (8 modules) - 56 hours
**Start**: Week 6, Day 4  
**Complexity**: Complex (state machines)  
**Dependencies**: CardLifecycleManagementPage, StateTransitionValidator

**Card Management (5 modules)** - 35 hours:
- [x] Tahseel Card Requests - 7 hours
- [x] Tahseel Card Management - 7 hours
- [x] Corporate Card Balance Report - 7 hours
- [x] Detailed Tahseel Card Report - 7 hours
- [x] Card Application Transaction Report - 7 hours

**Account Management (3 modules)** - 21 hours:
- [x] Tahseel Account Details - 7 hours
- [x] Account Deactivation - 7 hours
- [x] SFD Detailed Wallets Transactions Report - 7 hours

**Quality Gate**: 85% pass rate, state transition validation critical

---

### Priority 3.4: External System Integration (6 modules) - 50 hours
**Start**: Week 7, Day 2  
**Complexity**: Complex (data mapping)  
**Dependencies**: ExternalSystemIntegrationPage, DataMappingValidator

- [x] **Etisalat Detailed Transactions** - 8 hours
  - Service format mapping, reference validation, status translation
  
- [x] **Smart Receipt Services Fees Report** - 8 hours
  - Provider data mapping, fee extraction
  
- [x] **Beah Paid Transaction Report** - 8 hours
  - Payment processor data, authorization tracking
  
- [x] **E Voucher Report** - 9 hours
  - Voucher state machine, redemption tracking, balance validation
  
- [x] **SEDD Transaction Reports** - 9 hours
  - Economic classification mapping, category validation
  
- [x] **Recovered Wallet Transactions** - 8 hours
  - Wallet state machine, balance recovery validation

**Quality Gate**: 85% pass rate, integration accuracy critical, MCP validation of data

---

### Priority 3.5: Specialized Business Logic (12 modules) - 84 hours
**Start**: Week 7, Day 5  
**Complexity**: Complex (domain logic)  
**Dependencies**: Domain-specific page objects, BusinessWorkflowOrchestrator

**Cheque Management (2 modules)** - 13 hours:
- [x] Cheques Management - 7 hours
- [x] Detailed Cheques Report - 6 hours

**Refund Processing (3 modules)** - 17 hours:
- [x] Refund Processing workflow - 6 hours
- [x] Automatic Transaction Refund - 5 hours
- [x] Seller Refund Request - 6 hours

**Deposit Management (2 modules)** - 12 hours:
- [x] Deposit Hold/Release - 6 hours
- [x] Deposit Retain Transactions - 6 hours

**Authorization & Enrollment (3 modules)** - 23 hours:
- [x] Pre-Authorized Transactions for Book Publishers - 8 hours
- [x] Enrollment Authorization - 8 hours
- [x] Service Enrollment Process - 7 hours

**Transaction Operations (2 modules)** - 11 hours:
- [x] Transaction Cancellation - 6 hours
- [x] Balance Deduct and Load Operations - 5 hours

**Quality Gate**: 85% pass rate, complex business logic requires extra review

---

### Priority 3.6: Advanced Analytics & Dashboard (8 modules) - 48 hours
**Start**: Week 8, Day 3  
**Complexity**: Medium-Complex (chart interactions)  
**Dependencies**: DashboardAnalyticsPage, ChartValidator

- [x] Transactions Analysis Dashboard - 5 hours
- [x] Transactions Details Dashboard - 5 hours
- [x] Fee-free Transactions Analytics - 6 hours
- [x] Entity Services Analysis Dashboard - 6 hours
- [x] Merchant Transactions Dashboard - 6 hours
- [x] Transactions Map Dashboard - 6 hours
- [x] Collector Performance Dashboard - 5 hours
- [x] Revenue Analysis Dashboard - 5 hours

**Test Focus**: Chart data accuracy, drill-down correctness, time-series validation  
**Quality Gate**: 85% pass rate

---

### Phase 4 Summary
**Weeks 5-8 Total**: 340 hours  
**Modules**: 44 complex custom modules  
**Dependencies**: 6 base classes, 10+ utility classes  
**Output**: Production-ready complex business logic implementations

---

## PHASE 5: P4 REMAINING MODULES (Week 9-10)

### Priority 4.1: Login & Core Modules (8 modules) - 15 hours

**Already Implemented**:
- [x] Login-Authentication (existing feature & POM)
- [x] Dashboard/Home (existing feature & POM)

**New Implementations**:
- [ ] Business Intelligence Dashboards - multiple (covered in Phase 4)
- [ ] System Administration - 3 modules - 6 hours
- [ ] Reporting Dashboard - 2 modules - 5 hours
- [ ] Settings/Configuration - 2 modules - 4 hours

**Quality Gate**: 85% pass rate

---

### Priority 4.2: Low-Complexity View-Only Modules (38 modules) - 76-114 hours

**View-Only Modules** (20 modules) - 40 hours:
- [ ] Tahseel Account Details
- [ ] Inquire Electronic Receipt
- [ ] Device Delivery to Publishers
- [ ] Profile Management (view)
- [ ] Transaction History (view)
- [ ] Account Statement (view)
- [ ] Card Balance (view)
- [ ] And 12 more similar modules

**Features**: Display validation, Search, Filter, Export  
**Complexity**: Low (2-3 hours each)  
**Test Focus**: Data accuracy, layout consistency

---

### Priority 4.3: Legacy & Secondary Reports (15 modules) - 30 hours

**Legacy Report Modules** - 15 modules - 30 hours:
- [ ] Historical reports no longer actively used but still need tests
- [ ] Secondary views of existing data
- [ ] Archive/historical data reporting

**Complexity**: Standard (2 hours average)

---

### Phase 5 Summary
**Weeks 9-10 Total**: 121-159 hours  
**Modules**: 53 remaining modules  
**Complexity**: Low to standard  
**Output**: Complete 204-module framework

---

## PHASE 6: VALIDATION & OPTIMIZATION (Week 11)

### Validation Tasks (40 hours)

- [ ] Run complete test suite (all 204 modules)
- [ ] Performance profiling and optimization
- [ ] MCP selector validation (all modules)
- [ ] Flaky test elimination
- [ ] Load time optimization
- [ ] Parallel execution setup
- [ ] Final quality review
- [ ] Documentation review and updates

**Quality Gates**:
- ✅ 90%+ pass rate overall
- ✅ <2 minutes average per module test
- ✅ 0 flaky tests (stable pass/fail)
- ✅ All selectors validated via MCP
- ✅ Full documentation complete

---

## Timeline Summary

| Phase | Duration | Modules | Hours | Effort |
|-------|----------|---------|-------|--------|
| **1. Foundation** | Week 1 | - | 20 | Core setup |
| **2. P1 Quick Wins** | Weeks 2-3 | 73 | 80 | Report modules |
| **3. P2 CRUD** | Weeks 4-5 | 28 | 42 | Data management |
| **4. P3 Complex** | Weeks 5-8 | 44 | 340 | Custom logic |
| **5. P4 Remaining** | Weeks 9-10 | 53 | 121 | View-only, legacy |
| **6. Validation** | Week 11 | - | 40 | Testing, optimization |
| **TOTAL** | **11 weeks** | **204** | **534 hours** | **Full framework** |

---

## Developer Timeline Options

### Option A: Single Developer
- **Duration**: 12-14 weeks
- **Schedule**: Full-time, sequential phases
- **Risk**: High (bottleneck, no parallel work)
- **Cost**: 1 FTE

### Option B: 2 Developers (Recommended for MVP)
- **Duration**: 7-8 weeks
- **Schedule**: 
  - Dev A: Quick wins (P1) + Analytics (P3.6)
  - Dev B: CRUD (P2) + Complex modules (P3.1-3.5)
- **Risk**: Medium (some dependencies)
- **Cost**: 2 FTE

### Option C: 3 Developers (Aggressive)
- **Duration**: 5-6 weeks
- **Schedule**: 
  - Dev A: Quick wins (P1) + CRUD (P2)
  - Dev B: Complex modules (P3.1-3.5)
  - Dev C: Remaining modules (P4) + Validation (P6)
- **Risk**: Low (parallel work, minimal dependencies)
- **Cost**: 3 FTE

---

## Dependency Flow

```
Week 1: Foundation
  ↓ (enables all Phase 2 work)
Week 2-3: P1 Reports (parallel with Foundation end)
  ↓ (validates template approach)
Week 4-5: P2 CRUD (can start in parallel with P1 Week 3)
  ↓ (consolidates patterns)
Week 5-8: P3 Complex (depends on phase 1-2 completion)
  ├─ P3.1 Shared Revenue (Week 5-6)
  ├─ P3.2 Settlement (Week 6-7, parallel with 3.1)
  ├─ P3.3 Card/Account (Week 6-7, parallel with 3.1-3.2)
  ├─ P3.4 Integration (Week 7-8, parallel with 3.3)
  ├─ P3.5 Business Logic (Week 7-8, parallel with 3.4)
  └─ P3.6 Analytics (Week 8, can start in week 7 if ready)
  ↓
Week 9-10: P4 Remaining (low priority, minimal dependencies)
  ↓
Week 11: Validation & Optimization
```

---

## Quality Checkpoints

### Checkpoint 1: End of Phase 2 (Week 3)
- [ ] 73 report modules tested
- [ ] Template approach validated
- [ ] 95%+ pass rate on samples
- [ ] No blocking issues identified

**Go/No-Go Decision**: Proceed with phases 3-4

---

### Checkpoint 2: End of Phase 3 (Week 5)
- [ ] 28 CRUD modules tested
- [ ] Complex module base classes created
- [ ] 90%+ pass rate
- [ ] Architecture sound for phase 4

**Go/No-Go Decision**: Proceed with detailed complex modules

---

### Checkpoint 3: Mid Phase 4 (Week 7)
- [ ] First 20 complex modules complete
- [ ] 85%+ pass rate
- [ ] No architectural issues
- [ ] Performance acceptable

**Go/No-Go Decision**: Proceed with remaining complex modules

---

### Checkpoint 4: End of Phase 5 (Week 10)
- [ ] All 204 modules have features/POMs/steps
- [ ] 80%+ pass rate
- [ ] Blockers identified for phase 6

**Go/No-Go Decision**: Proceed to validation & optimization

---

### Final Checkpoint: End of Phase 6 (Week 11)
- [ ] 90%+ pass rate overall
- [ ] 0 flaky tests
- [ ] All performance targets met
- [ ] Full documentation complete

**Go/No-Go Decision**: Ready for production deployment

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Template doesn't scale | Medium | High | Validate early with samples |
| Selector changes | High | Medium | Use MCP validation, multi-strategy |
| Complex module delays | Medium | High | Start early, expert involvement |
| Performance issues | Medium | High | Optimize in phase 6, parallel execution |
| Scope creep | Low | Medium | Strict prioritization, no unplanned modules |

---

## Success Metrics

✅ **Coverage**: 204/204 modules (100%)  
✅ **Quality**: 90%+ pass rate  
✅ **Performance**: <2 min avg per module  
✅ **Reliability**: 0 flaky tests  
✅ **Maintainability**: DRY code, clear patterns  
✅ **Documentation**: Complete with examples  
✅ **Timeline**: Within 11 weeks (3 devs)  

---

## Conclusion

This prioritized list provides a clear, achievable roadmap for implementing comprehensive test automation for all 204 modules. By following the phased approach with strategic prioritization, teams can deliver production-quality automation incrementally while validating patterns at key checkpoints.

**Recommended Start Date**: Immediately after foundation setup completes  
**Estimated Delivery**: 6-7 weeks with 2 developers (MVP + optimization)

