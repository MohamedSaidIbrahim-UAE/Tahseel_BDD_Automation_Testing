Feature: Deposits Details Report
  As a deposit operations officer, I need a detailed listing of all deposit accounts
  with their balances, entity affiliation, and status, so I can support audits.

  Background:
    Given the user is logged in as "Finance Admin"
    And deposit accounts "DEP-D1" (Civil Aviation, Active, balance 20000) and "DEP-D2" (Entity-B, Active, balance 15000) exist

  @positive @e2e
  Scenario: Detailed account listing
    When the user runs the "Deposits Details Report"
    Then the report lists both accounts with:
      | Account  | Entity   | Balance | Status  |
      | DEP-D1   | Civil Aviation | 20000   | Active  |
      | DEP-D2   | Entity-B | 15000   | Active  |
    And the grand total balance is 35000 AED

  @positive @filter
  Scenario: Filter by status
    Given account "DEP-D3" is inactive
    When the user filters by "Active"
    Then inactive accounts are excluded

  @negative
  Scenario: No accounts matching filter
    When the user filters by a non-existent entity
    Then "No records found" is displayed

  @negative @rbac
  Scenario: Entity-restricted user only sees own entity accounts
    Given the user is "Civil Aviation Accountant"
    When the report is viewed, only Civil Aviation accounts appear
