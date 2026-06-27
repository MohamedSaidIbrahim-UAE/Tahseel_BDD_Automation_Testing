Feature: Total Service Charges for Loading Transactions
  As a fee analyst, I need an aggregated report of all service fees collected during loading,
  so that I can verify the fee revenue from loading operations.

  Background:
    Given the user is logged in as "Finance Admin"
    And loading fee rules: e‑voucher load fee 0%, account load fee 0%, card load fee 1%

  @positive @e2e
  Scenario: Calculate total service charges across all loading types
    Given the following loads today:
      | Instrument     | Load Amount | Fee   |
      | E‑Voucher      | 5000        | 0.00  |
      | Tahseel Account| 10000       | 0.00  |
      | Tahseel Card   | 2000        | 20.00 |
    When the user runs the "Total service charges for loading Transactions" report for today
    Then the total service charges sum to 20.00 AED
    And the breakdown per instrument is accurate

  @negative
  Scenario: No loads, zero fees
    When the report is run for a period with no loads
    Then total charges = 0.00 AED

  @negative @rbac
  Scenario: Only finance roles can view fee reports
    Given the user is "Load Operator"
    Then access is denied
