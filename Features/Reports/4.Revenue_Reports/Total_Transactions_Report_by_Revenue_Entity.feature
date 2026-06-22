Feature: Total Transactions Report by Revenue Entity
  As a department head, I need an aggregated summary of transaction volumes and fees per revenue entity,
  so that I can monitor total revenues generated for each department.

  Background:
    Given the user is logged in as "Finance Admin"
    And revenue entities "Entity-A" and "Entity-B" exist
    # Note: Users are pre-authenticated via storageState.<env>.json
    # Revenue entities are master data that should exist in the test environment

  @revenue @automated @positive @e2e
  Scenario: Summary aggregation after multiple transactions
    Given the following transactions are posted for the month of June:
      | Entity   | Count | Total Amount |
      | Entity-A | 50    | 100000.00    |
      | Entity-B | 30    | 45000.00     |
    When the user runs the "Total Transactions report by revenue entity" for June 2026
    Then the report shows:
      | Revenue Entity | Transaction Count | Total Amount |
      | Entity-A       | 50                | 100000.00    |
      | Entity-B       | 30                | 45000.00     |
    And the grand total amount is 145000.00 AED

  @revenue @automated @negative
  Scenario: Entity with no transactions should not appear or show zero
    Given "Entity-C" exists but has no transactions
    When the report is generated
    Then "Entity-C" is either omitted or displayed with 0 count and 0.00 amount

  @revenue @automated @negative @rbac
  Scenario: Entity-limited user can only see their own summary
    Given the user is "Entity-A Restricted Accountant"
    When the user runs the summary report
    Then only Entity-A data appears, even if other entities have transactions
