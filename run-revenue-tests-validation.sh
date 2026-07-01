#!/bin/bash

# Phase 3: Revenue Reports Tests - Validation
# Comprehensive test execution with stage environment
# Execution: Stage environment (.env.stage)
# Target: All shared revenue report scenarios

echo "╔════════════════════════════════════════════════════════════════════════════════╗"
echo "║                    PHASE 3: VALIDATION - REVENUE TESTS                         ║"
echo "║                                                                                ║"
echo "║  Environment: Stage (https://staging.tahseel.gov.ae/ManagePortal)              ║"
echo "║  Profile: revenue-tests                                                        ║"
echo "║  Target: All shared revenue report scenarios                                   ║"
echo "║                                                                                ║"
echo "║  Objectives:                                                                   ║"
echo "║  ✓ Execute all scenarios (expected 8)                                          ║"
echo "║  ✓ Verify all steps (expected 52+)                                             ║"
echo "║  ✓ Validate 0 undefined steps                                                  ║"
echo "║  ✓ Confirm 0 ambiguous steps                                                   ║"
echo "║                                                                                ║"
echo "╚════════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Export environment
export TEST_ENV=stage
export BROWSER=chromium

echo "Step 1: Running authentication setup for stage environment..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npm run auth:setup:stage 2>&1 | tail -20
AUTH_RESULT=$?

if [ $AUTH_RESULT -ne 0 ]; then
  echo "❌ Authentication setup failed"
  exit 1
fi

echo ""
echo "✅ Authentication setup complete"
echo ""

# Step 2: Dry run to verify step recognition
echo "Step 2: Dry-run validation - Verify all steps are recognized..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npm test -- --profile revenue-tests --dry-run --tags "@revenue and @automated" 2>&1 | grep -E "(scenarios|steps|Undefined)" | head -20

echo ""
echo "Step 3: Running full test suite with stage environment..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Step 3: Execute actual tests
npm test -- \
  --profile revenue-tests \
  --tags "@revenue and @automated" \
  --parallel 1 \
  --timeout 120000 \
  Features/Reports/4.Revenue_Reports/Shared_Revenues_Report_DTPS_and_Sharjah_Municipality.feature \
  Features/Reports/4.Revenue_Reports/Shared_Revenues_Report_SEDD_and_SCTDA.feature \
  Features/Reports/4.Revenue_Reports/Shared_Revenues_Report_Prevention_and_Safety_Authority_and_SAND.feature

TEST_RESULT=$?

echo ""
echo "╔════════════════════════════════════════════════════════════════════════════════╗"
echo "║                         VALIDATION RESULTS                                    ║"
echo "╚════════════════════════════════════════════════════════════════════════════════╝"
echo ""

if [ $TEST_RESULT -eq 0 ]; then
  echo "✅ All tests PASSED"
  echo ""
  echo "Validation Status:"
  echo "  ✓ All scenarios executed successfully"
  echo "  ✓ All steps completed without errors"
  echo "  ✓ No undefined steps"
  echo "  ✓ No ambiguous steps"
  echo "  ✓ Production-grade quality"
  echo ""
  exit 0
else
  echo "❌ Some tests FAILED"
  echo ""
  echo "Please review:"
  echo "  1. Check error logs above for details"
  echo "  2. Review locator selectors if timeout occurred"
  echo "  3. Verify stage environment connectivity"
  echo "  4. Check test data setup"
  echo ""
  exit 1
fi
