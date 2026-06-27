Feature: Transaction Fees For All Payment Methods

  Background:
    Given the user is logged in as "Finance Admin"
    And the service fee rules are configured: credit card 2.5%, direct debit 1%, cheque 0%

  @positive @e2e
  Scenario: Verify fees calculation across multiple payment methods
    Given the user posts three transactions:
      | Service   | Payment Method | Amount (AED) |
      | SRV-100   | Credit Card    | 1000         |
      | SRV-100   | Direct Debit   | 500          |
      | SRV-100   | Cheque         | 2000         |
    When the user runs the "Transaction Fees For All Payment Methods" report for today
    Then the report displays:
      | Payment Method | Total Fee (AED) |
      | Credit Card    | 25.00           |
      | Direct Debit   | 5.00            |
      | Cheque         | 0.00            |
    And the grand total fee is 30.00 AED

  @negative
  Scenario: No data for future date returns clear message
    When the user sets the report date filter to a future date with no transactions
    Then the system displays "No data found" and no totals are shown

  @negative @rbac
  Scenario: Unauthorised role cannot view fee report
    Given the user is logged in as a restricted "Collector"
    When the user attempts to open the "Transaction Fees For All Payment Methods" report
    Then an "Access Denied" message is displayed
