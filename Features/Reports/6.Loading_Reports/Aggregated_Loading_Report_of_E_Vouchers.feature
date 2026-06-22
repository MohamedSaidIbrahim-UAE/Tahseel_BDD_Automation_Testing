Feature: Aggregated Loading Report of E‑Vouchers
  As a finance manager, I need an aggregated summary of e‑voucher loading by period,
  so that I can quickly see total voucher value loaded.

  Background:
    Given the user is logged in as "Finance Admin"
    And e‑voucher module is active

  @positive @e2e
  Scenario: Aggregated totals for multiple batches
    Given the following e‑voucher batches are loaded today:
      | Batch     | Vouchers | Value per Voucher | Total Value |
      | BATCH-201 | 50       | 20                | 1000.00     |
      | BATCH-202 | 200      | 10                | 2000.00     |
    When the user runs the "Aggregated Loading Report of E‑Vouchers" for today
    Then the report shows:
      | Total Vouchers | Total Value |
      | 250            | 3000.00     |
    And the breakdown per batch is correct

  @negative
  Scenario: No loading data in period yields zero totals
    When the report is run for a date with no activity
    Then total vouchers = 0 and total value = 0.00

  @negative @rbac
  Scenario: Restricted role denied
    Given the user is "Customer Support"
    Then access is denied
