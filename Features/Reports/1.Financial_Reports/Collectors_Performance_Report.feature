Feature: Collectors Performance Report

  Background:
    Given collector "Ali" and collector "Sara" are configured as direct payment collectors

  @positive @e2e
  Scenario: Performance metrics after transactions
    Given 5 transactions of AED 200 each are assigned to "Ali" on "2026-06-08"
    And 10 transactions of AED 100 each are assigned to "Sara" on the same day
    When the "Collectors performance report" is run for that date
    Then "Ali" shows 5 transactions and total AED 1000
    And "Sara" shows 10 transactions and total AED 1000
    And sorting by total collected works correctly

  @negative
  Scenario: Collector with no activity for the period
    Given "Ali" has no transactions for the selected date range
    When the report is generated
    Then either "Ali" does not appear or shows 0 transactions and 0.00 AED
