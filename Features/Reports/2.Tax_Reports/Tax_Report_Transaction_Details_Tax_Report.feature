Feature: Tax Report – Transaction Details Tax Report
  As a finance auditor, I want to see a detailed breakdown of VAT on each transaction,
  so that I can reconcile tax amounts with the general ledger.

  Background:
    Given the user is logged in as "Finance Admin" with full tax report access
    And the system has a standard VAT rate of 5% configured for all taxable services
    And the service "SRV-100" is taxable
    And the service "SRV-200" is exempt from VAT
    And the entity "Entity-A" is a standard revenue entity
    And the entity "Entity-B" is tax-exempt

  @positive @e2e
  Scenario: Full lifecycle – taxable and exempt transactions reflected correctly
    # Posting transactions
    When the user posts a transaction "TXN-001" for service "SRV-100" via credit card with a base amount of 1000 AED
    And the user posts a transaction "TXN-002" for service "SRV-200" (exempt) via cheque with a base amount of 500 AED
    And the user posts a transaction "TXN-003" for service "SRV-100" via direct debit with a base amount of 2000 AED, but for tax-exempt entity "Entity-B"
    # Running the detail report
    Then the user generates the "Transaction Details Tax Report" for today's date
    And the report shows the following rows:
      | Transaction | Base Amount | VAT Rate | VAT Amount | Total Amount | Status       |
      | TXN-001     | 1000.00     | 5%       | 50.00      | 1050.00      | Taxable      |
      | TXN-002     | 500.00      | 0%       | 0.00       | 500.00       | Exempt       |
      | TXN-003     | 2000.00     | 0%       | 0.00       | 2000.00      | Exempt Entity|
    And the grand total VAT is 50.00 AED
    And the grand total amount (incl. VAT) is 3550.00 AED

  @positive @e2e @filter
  Scenario: Filter by payment method and verify tax detail
    Given the user posted a taxable credit card transaction and an exempt cheque transaction
    When the user filters the "Transaction Details Tax Report" by payment method "Credit Card"
    Then only the credit card transaction appears with its VAT breakdown

  @negative
  Scenario: No data for a future period
    When the user sets the report date filter to a future date
    And generates the report
    Then the system displays a clear "No data found" message

  @negative @rbac
  Scenario: Unauthorised role cannot access the detail tax report
    Given the user is logged in as a restricted "Collector" role
    When the user attempts to open the "Transaction Details Tax Report"
    Then the system returns an "Access Denied" message and no data is displayed
