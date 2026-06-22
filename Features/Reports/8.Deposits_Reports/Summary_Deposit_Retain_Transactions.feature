Feature: Summary Deposit Retain Transactions
  As a finance manager, I want a summary of retained amounts grouped by entity and period,
  so that I can assess the financial impact of confiscations.

  Background:
    Given the user is logged in as "Finance Admin"
    And deposit accounts for Entity-A and Entity-B exist with sufficient balances

  @positive @e2e
  Scenario: Aggregate retain amounts per entity
    Given the following retains are processed:
      | Entity   | Amount | Date       |
      | Entity-A | 5000   | 2026-06-10 |
      | Entity-A | 3000   | 2026-06-11 |
      | Entity-B | 2000   | 2026-06-10 |
    When the user runs the "Summary Deposit Retain Transactions" report from 2026-06-10 to 2026-06-11
    Then the report shows:
      | Entity   | Total Retained |
      | Entity-A | 8000.00        |
      | Entity-B | 2000.00        |
    And the grand total retained is 10000.00 AED

  @negative
  Scenario: No retains in date range
    When the user selects a future date range
    Then the report displays "No retain data available"

  @negative @rbac
  Scenario: Unauthorised role cannot view summary
    Given the user is "Tasheel Center Manager"
    Then access is denied
