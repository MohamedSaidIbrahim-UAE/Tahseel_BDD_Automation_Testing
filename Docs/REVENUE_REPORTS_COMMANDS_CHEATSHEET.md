# Revenue Reports Commands Cheat Sheet

**Quick Reference - One Page Summary**

---

## 🎯 **Essential Commands**

### **Quick Start**
```bash
npm run test:revenue:all           # All revenue reports (Stage)
npm run test:revenue:complete      # Auth setup + all tests
npm run test:revenue:quick         # Quick positive tests only
```

### **Single Report Tests**
```bash
npm run test:revenue:total-transactions
npm run test:revenue:detailed-transactions  
npm run test:revenue:shared-dtps           # 50/50 split test
```

---

## 📊 **By Category**

### **Report Types**
```bash
npm run test:revenue:summary       # Summary reports
npm run test:revenue:split         # Revenue splitting tests
npm run test:revenue:rbac          # Role-based access tests
npm run test:revenue:export        # Export functionality tests
```

### **Split Percentages**
```bash
npm run test:revenue:50-50         # 50/50 split (DTPS & Sharjah)
npm run test:revenue:60-40         # 60/40 split (SEDD & SCTDA)
npm run test:revenue:70-30         # 70/30 split (Safety & SAND)
npm run test:revenue:80-20         # 80/20 split (Municipality & Centers)
```

---

## 🌍 **Environments**

### **Stage (Recommended)**
```bash
npm run test:revenue:stage         # Headless
npm run test:revenue:stage:headed  # Headed (watch browser)
npm run test:revenue:stage:firefox # Firefox
npm run test:revenue:stage:webkit  # Webkit (Safari)
```

### **Local (Development)**
```bash
npm run test:revenue:local         # Headless
npm run test:revenue:local:headed  # Headed
npm run test:revenue:local:firefox # Firefox
npm run test:revenue:local:webkit  # Webkit
```

---

## ⚡ **Performance**

### **Parallel Execution**
```bash
npm run test:revenue:parallel      # 2 parallel threads
npm run test:revenue:parallel:4    # 4 parallel threads (fastest)
```

### **Cross-Browser**
```bash
npm run test:revenue:complete:cross-browser  # All browsers
```

---

## 🔍 **Debug & Dev**

### **Debugging**
```bash
npm run test:revenue:debug         # Playwright Inspector
npm run test:revenue:dry-run       # Check step definitions
npm run test:revenue:verbose       # Detailed output
```

### **Examples**
```bash
npm run test:revenue:example:split # Split verification example
npm run test:revenue:example:rbac  # RBAC example
npm run test:revenue:example:export # Export example
```

---

## 📈 **Reporting**

### **Generate Reports**
```bash
npm run test:revenue:report        # HTML + JSON reports
npm run test:revenue:report:allure # Allure-compatible results
```

---

## 🔧 **Authentication**

### **Setup Auth**
```bash
npm run auth:setup-stage           # Stage environment
npm run auth:setup:local           # Local environment
npm run auth:test:stage            # Test authentication
```

---

## 🚀 **Workflows**

### **Development Workflow**
```bash
npm run auth:setup-stage
npm run test:revenue:detailed-transactions
# If issues:
npm run test:revenue:stage:headed
```

### **QA Testing Workflow**
```bash
npm run test:revenue:complete
npm run test:revenue:report
```

### **Regression Testing**
```bash
npm run test:revenue:parallel:4
npm run test:revenue:report:allure
```

### **Cross-Browser Testing**
```bash
npm run test:revenue:complete:cross-browser
```

---

## 🏷️ **Tags Reference**

| Tag | Purpose | Example Commands |
|-----|---------|------------------|
| `@revenue` | All revenue tests | All commands |
| `@automated` | Phase 1-2 tests | All commands |
| `@split` | Revenue splitting | `test:revenue:split` |
| `@rbac` | Access control | `test:revenue:rbac` |
| `@export` | Export tests | `test:revenue:export` |
| `@e2e` | End-to-end | `test:revenue:summary` |
| `@positive` | Positive scenarios | `test:revenue:quick` |
| `@negative` | Error scenarios | `test:revenue:rbac` |

---

## ⚠️ **Troubleshooting**

### **Common Issues**
```bash
# Auth issues? Setup first:
npm run auth:setup-stage

# Browser issues? Try headed:
npm run test:revenue:stage:headed

# Slow? Use parallel:
npm run test:revenue:parallel:4

# Step definition issues?
npm run test:revenue:dry-run
```

### **Get Help**
```bash
# List all revenue commands
npm run | grep "revenue"

# View command details
cat package.json | grep -A2 "test:revenue:"
```

---

## 📁 **File Structure**

```
Features/Reports/4.Revenue_Reports/
├── ✅ Total_Transactions_Report_by_Revenue_Entity.feature
├── ✅ Detailed_Transactions_Report_by_Revenue_Entity.feature
├── ✅ Shared_Revenues_Report_DTPS_and_Sharjah_Municipality.feature
├── 🔄 Shared_Revenues_Report_SEDD_and_SCTDA.feature
├── 🔄 Shared_Revenues_Report_Prevention_and_Safety_Authority_and_SAND.feature
├── 🔄 Shared_Fees_Summary_Sharjah_Municipality_and_Service_Centers.feature
└── 8 other reports (Phase 3-4)
```

---

## ✅ **Best Practices**

1. **Always use `npm run test:revenue:complete`** - Full setup + tests
2. **For speed, use `npm run test:revenue:parallel:4`** - 4x faster
3. **For debugging, use `npm run test:revenue:stage:headed`** - Watch browser
4. **For CI/CD, use `npm run test:revenue:report:allure`** - Allure reports
5. **Cross-browser test with `npm run test:revenue:complete:cross-browser`**

---

## 🎉 **Quick Start Guide**

### **New User? Start Here:**
```bash
# 1. Setup authentication
npm run auth:setup-stage

# 2. Run quick test
npm run test:revenue:quick

# 3. Generate report
npm run test:revenue:report
```

### **Need Speed?**
```bash
npm run test:revenue:parallel:4    # 4x faster
```

### **Need Visibility?**
```bash
npm run test:revenue:stage:headed  # Watch browser
```

### **Need Reports?**
```bash
npm run test:revenue:report        # HTML reports
npm run test:revenue:report:allure # Allure reports
```

---

**Print this page and keep it handy!** 📄

---

**Version:** 1.0.0  
**Commands:** 25+ professionally organized  
**Framework:** Production Ready  
**Updated:** June 22, 2026

---

**Happy Testing!** 🚀
