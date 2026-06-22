Feature: E-Voucher Loading Report
  As a voucher operations officer, I want a detailed report of e‑vouchers loaded and activated,
  so that I can track voucher issuance.

  Background:
    Given the user is logged in as "Finance Admin"
    And the e‑voucher module is active
    And an e‑voucher batch "BATCH-100" with 100 vouchers of 50 AED each exists

  @positive @e2e
  Scenario: Full cycle – load a voucher batch and verify report
    When the user loads (activates) all 100 vouchers from "BATCH-100" today
    And the user runs the "E‑Voucher Loading Report" for today
    Then the report shows:
      | Batch     | Vouchers Loaded | Total Value |
      | BATCH-100 | 100             | 5000.00     |
    And the report detail lists each voucher ID with status "Active"

  @positive @filter
  Scenario: Filter by batch number
    When the user filters the report by "BATCH-100"
    Then only vouchers from that batch are displayed

  @negative
  Scenario: No vouchers loaded on a given day
    When the user runs the report for a date with no loading activity
    Then the report displays "No loading data found"

  @negative @rbac
  Scenario: Unauthorised role cannot access
    Given the user is logged in as "Tasheel Operator"
    When the user attempts to open the E‑Voucher Loading Report
    Then an "Access Denied" message is returned
