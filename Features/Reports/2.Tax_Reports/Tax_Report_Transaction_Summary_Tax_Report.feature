Feature: Tax Report – Transaction Summary Tax Report
  As a finance manager, I want an aggregated view of VAT collected per period,
  so that I can file VAT returns easily.

  Background:
    Given the user is logged in as "Finance Admin"
    And the system has a 5% VAT rate on all taxable services

  @positive @e2e
  Scenario: Aggregate VAT summary for a day with mixed transactions
    Given the following transactions are posted on "2026-06-09":
      | Transaction | Service   | Base Amount | VAT Rate | Entity    |
      | TXN-101     | SRV-100   | 1000        | 5%       | Civil Aviation  |
      | TXN-102     | SRV-100   | 2000        | 5%       | Civil Aviation  |
      | TXN-103     | SRV-200   | 500         | 0%       | Civil Aviation  |
    When the user generates the "Transaction Summary Tax Report" for "2026-06-09"
    Then the report shows:
      | Tax Rate | Number of Transactions | Total Base Amount | Total VAT |
      | 5%       | 2                      | 3000.00           | 150.00    |
      | 0%       | 1                      | 500.00            | 0.00      |
    And the overall total base amount is 3500.00 AED
    And the overall total VAT is 150.00 AED

  @positive @e2e
  Scenario: Summary over a date range with filter by payment method
    Given taxable transactions on consecutive days with credit card and cheque
    When the user selects date range "2026-06-01 to 2026-06-05" and filters by "Credit Card"
    Then the summary aggregates only credit card transactions for that period

  @negative
  Scenario: Summary with no taxable transactions returns zero VAT
    Given all transactions posted are for exempt services
    When the user generates the "Transaction Summary Tax Report"
    Then the report shows total VAT as 0.00 AED and a note "No taxable transactions in period"

  @negative @rbac
  Scenario: Non-finance role denied access to summary report
    Given the user is logged in as "Customer Support"
    When the user tries to view the summary report
    Then an "Access Denied" error is returned
