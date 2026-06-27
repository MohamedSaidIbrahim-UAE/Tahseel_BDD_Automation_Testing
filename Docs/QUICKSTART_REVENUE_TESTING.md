# 🚀 Quick Start - Revenue Reports Testing

**Get started in 3 minutes**

---

## **Step 1: Setup Authentication** (1 minute)

```bash
npm run auth:setup-stage
```

✅ Sets up authentication for Stage environment

---

## **Step 2: Run Your First Test** (1 minute)

### Option A: Quick Test (Recommended for first-time)
```bash
npm run test:revenue:quick
```
✅ Runs positive E2E tests only (fastest)

### Option B: All Tests
```bash
npm run test:revenue:all
```
✅ Runs all 16 revenue scenarios

### Option C: Watch in Browser
```bash
npm run test:revenue:stage:headed
```
✅ Run tests with visible browser (for debugging)

---

## **Step 3: View Results** (1 minute)

```bash
npm run test:revenue:report
```

✅ Generates HTML + JSON reports in `/reports` folder

---

## 🎯 **Most Common Commands**

```bash
# Quick positive tests
npm run test:revenue:quick

# All revenue tests
npm run test:revenue:all

# Specific report
npm run test:revenue:total-transactions
npm run test:revenue:detailed-transactions
npm run test:revenue:shared-dtps

# With visible browser
npm run test:revenue:stage:headed

# Fast parallel (4x faster)
npm run test:revenue:parallel:4

# Generate reports
npm run test:revenue:report
```

---

## 📊 **By Category**

### **Summary Reports**
```bash
npm run test:revenue:summary
```

### **Revenue Splitting Tests**
```bash
npm run test:revenue:split
```

### **RBAC (Role-Based Access)**
```bash
npm run test:revenue:rbac
```

### **Export Tests**
```bash
npm run test:revenue:export
```

---

## 🌍 **By Environment**

### **Stage (Recommended)**
```bash
npm run test:revenue:stage              # Headless
npm run test:revenue:stage:headed       # Visible
npm run test:revenue:stage:firefox      # Firefox
npm run test:revenue:stage:webkit       # Webkit
```

### **Local (Development)**
```bash
npm run test:revenue:local              # Headless
npm run test:revenue:local:headed       # Visible
```

---

## 💡 **By Split Percentage**

```bash
npm run test:revenue:50-50              # DTPS & Sharjah
npm run test:revenue:60-40              # SEDD & SCTDA
npm run test:revenue:70-30              # Safety & SAND
npm run test:revenue:80-20              # Municipality & Centers
```

---

## 🧪 **Demo/Examples**

```bash
npm run test:revenue:example:split      # See split verification
npm run test:revenue:example:rbac       # See RBAC testing
npm run test:revenue:example:export     # See export validation
```

---

## ⚡ **Performance**

```bash
npm run test:revenue:parallel           # 2 threads
npm run test:revenue:parallel:4         # 4 threads (fastest)
```

---

## 🔍 **Debug & Development**

```bash
npm run test:revenue:debug              # Playwright Inspector
npm run test:revenue:verbose            # Detailed output
npm run test:revenue:dry-run            # Check steps only
```

---

## ✅ **Complete Workflows**

### **QA Testing**
```bash
# 1. Setup
npm run auth:setup-stage

# 2. Run all tests
npm run test:revenue:all

# 3. Generate reports
npm run test:revenue:report
```

### **Development**
```bash
# 1. Setup
npm run auth:setup-stage

# 2. Test single report with browser
npm run test:revenue:detailed-transactions
# OR headed:
npm run test:revenue:stage:headed

# 3. Check steps
npm run test:revenue:dry-run
```

### **Regression Testing**
```bash
# 1. Setup
npm run auth:setup-stage

# 2. Fast parallel testing
npm run test:revenue:parallel:4

# 3. Generate comprehensive reports
npm run test:revenue:report:allure
```

### **Cross-Browser Testing**
```bash
npm run test:revenue:complete:cross-browser
npm run test:revenue:report
```

---

## 📋 **All 35 Commands** (At a Glance)

| Category | Command | What It Does |
|----------|---------|--------------|
| **Single Reports** | `test:revenue:total-transactions` | Test total transactions only |
| | `test:revenue:detailed-transactions` | Test detailed transactions |
| | `test:revenue:shared-dtps` | Test DTPS report |
| **Categories** | `test:revenue:all` | All revenue reports |
| | `test:revenue:summary` | Summary reports only |
| | `test:revenue:split` | Revenue split tests |
| | `test:revenue:rbac` | Access control tests |
| | `test:revenue:export` | Export tests |
| **Splits** | `test:revenue:50-50` | 50/50 tests |
| | `test:revenue:60-40` | 60/40 tests |
| | `test:revenue:70-30` | 70/30 tests |
| | `test:revenue:80-20` | 80/20 tests |
| **Stage** | `test:revenue:stage` | Headless |
| | `test:revenue:stage:headed` | With browser |
| | `test:revenue:stage:firefox` | Firefox |
| | `test:revenue:stage:webkit` | Webkit |
| **Local** | `test:revenue:local` | Headless |
| | `test:revenue:local:headed` | With browser |
| **Performance** | `test:revenue:parallel` | 2 threads |
| | `test:revenue:parallel:4` | 4 threads |
| **Debug** | `test:revenue:debug` | Inspector mode |
| | `test:revenue:verbose` | Detailed output |
| | `test:revenue:dry-run` | Check only |
| **Suites** | `test:revenue:complete` | Auth + all tests |
| | `test:revenue:complete:headed` | Auth + headed |
| | `test:revenue:complete:cross-browser` | All browsers |
| **Reports** | `test:revenue:report` | HTML + JSON |
| | `test:revenue:report:allure` | Allure format |
| **Examples** | `test:revenue:example:split` | Split demo |
| | `test:revenue:example:rbac` | RBAC demo |
| | `test:revenue:example:export` | Export demo |
| **Quick** | `test:revenue:quick` | Positive only |
| | `test:revenue:quick:headed` | Positive + visible |

---

## 🎯 **Copy-Paste Ready**

### **For QA**
```bash
npm run auth:setup-stage && npm run test:revenue:complete && npm run test:revenue:report
```

### **For Developer**
```bash
npm run auth:setup-stage && npm run test:revenue:stage:headed
```

### **For Regression**
```bash
npm run auth:setup-stage && npm run test:revenue:parallel:4 && npm run test:revenue:report
```

### **For Demo**
```bash
npm run test:revenue:example:split
npm run test:revenue:example:rbac
npm run test:revenue:example:export
```

---

## ❓ **Troubleshooting**

| Issue | Solution |
|-------|----------|
| Command not found | Make sure you're in project root directory |
| Auth fails | Try: `npm run auth:test:stage` |
| Browser issues | Try: `npm run test:revenue:stage:headed` |
| Tests hang | Use: `npm run test:revenue:parallel:4` (faster) |
| Need help | See: `REVENUE_REPORTS_QUICK_REFERENCE.md` |

---

## 📖 **Documentation**

- **Quick Ref:** `REVENUE_REPORTS_QUICK_REFERENCE.md` (1 page)
- **Complete Guide:** `REVENUE_REPORTS_TEST_COMMANDS_GUIDE.md` (detailed)
- **Cheat Sheet:** `REVENUE_REPORTS_COMMANDS_CHEATSHEET.md` (printable)
- **Commands:** `NPM_COMMANDS_DEPLOYMENT_GUIDE.md` (technical)

---

## ✅ **Verification**

```bash
# Check if commands are installed
npm run | Select-String "revenue"

# Test package.json validity
node -e "require('./package.json'); console.log('✅ Valid')"

# List all revenue commands
npm run 2>&1 | Select-String "test:revenue"
```

---

## 🎉 **Ready? Let's Go!**

### **First Test (Copy & Paste)**
```bash
npm run auth:setup-stage
npm run test:revenue:quick
npm run test:revenue:report
```

---

**🚀 You're all set! Happy testing!**

**Version:** 1.0.0  
**Framework:** Production Ready  
**Commands:** 35 available  
**Status:** ✅ Ready to execute

---

**Need quick help?**
```bash
npm run test:revenue:help
```

**Check all commands:**
```bash
npm run | Select-String "revenue"
```

---

**Questions? See the comprehensive guides in the documentation folder.**

✨ **Enjoy your automated testing!** ✨
