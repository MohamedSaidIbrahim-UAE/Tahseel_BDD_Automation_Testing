Feature: Aggregated Transactions Report Paid by Credit Cards
  As a finance manager, I need aggregated credit card transaction data per entity/merchant,
  so that I can monitor volume and fees over time.

  Background:
    Given the user is logged in as "Finance Admin"
    And merchant MCC-1234 and MCC-5678 exist

  @positive @e2e
  Scenario: Aggregation of credit card transactions
    Given the following credit card transactions are posted:
      | Merchant | Count | Total Amount |
      | MCC-1234 | 10    | 5000.00      |
      | MCC-5678 | 5     | 2000.00      |
    When the user runs the "Aggregated Credit Card Transactions Report"
    Then the report shows:
      | Merchant | Transaction Count | Total Amount |
      | MCC-1234 | 10                | 5000.00      |
      | MCC-5678 | 5                 | 2000.00      |
    And the grand total count is 15 and total amount is 7000.00

  @negative
  Scenario: Aggregation with voided transactions excluded
    Given a transaction that was later voided
    When the aggregated report is run
    Then voided transactions are excluded from the totals
