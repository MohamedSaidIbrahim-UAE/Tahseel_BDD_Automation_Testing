Feature: Detailed Transactions Report by Revenue Entity
  As a revenue accountant, I want a detailed list of transactions with their assigned revenue entity,
  so that I can verify the distribution of fees to the correct government department.

  Background:
    Given the user is logged in as "Finance Admin"
    And the revenue entities "Entity-A" and "Entity-B" are configured
    And services "SRV-100" and "SRV-200" are mapped to revenue entity "Entity-A"
    And service "SRV-300" is mapped to revenue entity "Entity-B"

  @positive @e2e
  Scenario: Full cycle – post transactions and verify detailed report
    When the user posts the following transactions on 2026-06-09:
      | Transaction | Service  | Amount (AED) | Payment Method |
      | TXN-001     | SRV-100  | 1000.00      | Credit Card    |
      | TXN-002     | SRV-200  | 500.00       | Cheque         |
      | TXN-003     | SRV-300  | 2000.00      | Direct Debit   |
    And the user runs the "Detailed Transactions report by revenue entity" for today
    Then the report shows all three transactions with correct revenue entity mapping
    And the total amount for "Entity-A" is 1500.00 AED
    And the total amount for "Entity-B" is 2000.00 AED
    And the grand total is 3500.00 AED

  @positive @filter
  Scenario: Filter report by revenue entity
    When the user filters by "Entity-A"
    Then only TXN-001 and TXN-002 are displayed
    And the total amount shown is 1500.00 AED

  @negative
  Scenario: No data for future date
    When the user selects a date range with no transactions
    Then the report displays "No data found"

  @negative @rbac
  Scenario: Unauthorised role access denied
    Given the user is logged in as "Collector"
    When the user attempts to open the detailed revenue entity report
    Then an "Access Denied" message is shown
