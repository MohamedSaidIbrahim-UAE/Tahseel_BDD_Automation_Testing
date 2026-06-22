Feature: Deposits Balance Summary Report
  As a treasury manager, I need a summary of the current balances of all deposit accounts
  per entity, so that I can quickly monitor available deposit funds.

  Background:
    Given the user is logged in as "Finance Admin"
    And deposit entity "Entity-A" and "Entity-B" exist
    And a deposit account "DEP-A1" is created for Entity-A with an initial deposit of 10000 AED
    And a deposit account "DEP-B1" is created for Entity-B with an initial deposit of 5000 AED

  @positive @e2e
  Scenario: Full cycle – deposit operations and balance summary
    When an additional deposit of 3000 AED is made into "DEP-A1"
    And a refund of 2000 AED is processed from "DEP-A1"
    And a retain (confiscation) of 1000 AED is posted against "DEP-B1"
    Then the user runs the "Deposits Balance Summary Report"
    And the report shows:
      | Entity   | Account  | Current Balance |
      | Entity-A | DEP-A1   | 11000.00        |
      | Entity-B | DEP-B1   | 4000.00         |
    And the total balance across all entities is 15000.00 AED

  @positive @filter
  Scenario: Filter by entity
    When the user filters the report by "Entity-A"
    Then only "DEP-A1" with its balance is displayed

  @negative
  Scenario: No deposit accounts exist
    Given all deposit accounts are closed
    When the report is run
    Then "No active deposit accounts" is displayed

  @negative @rbac
  Scenario: Unauthorised role denied access
    Given the user is logged in as "Tasheel Operator"
    When the user attempts to open the Deposits Balance Summary Report
    Then an "Access Denied" message is returned
