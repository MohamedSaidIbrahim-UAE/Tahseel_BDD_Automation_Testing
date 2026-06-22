Feature: Payment Method Summary Report
  As a finance executive, I want an aggregated summary of transaction volumes and fees by payment method,
  so that I can track payment method usage trends.

  Background:
    Given the user is logged in as "Finance Admin"

  @positive @e2e
  Scenario: Summary aggregation across all methods
    Given the following transactions are posted:
      | Payment Method | Count | Total Volume |
      | Credit Card    | 20    | 50000.00     |
      | Cheque         | 10    | 30000.00     |
      | E-Voucher      | 15    | 10000.00     |
    When the user runs the "Payment Method Summary Report"
    Then the report displays:
      | Payment Method | Transaction Count | Total Volume |
      | Credit Card    | 20                | 50000.00     |
      | Cheque         | 10                | 30000.00     |
      | E-Voucher      | 15                | 10000.00     |
    And the grand total volume is 90000.00

  @negative @rbac
  Scenario: Collector role cannot access summary report
    Given the user is logged in as "Collector"
    Then access is denied
