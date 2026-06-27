Feature: Tahseel Account Load Details Report
  As a Tahseel account manager, I need a detailed history of loads into a specific Tahseel account,
  so that I can reconcile the account's funding.

  Background:
    Given the user is logged in as "Finance Admin"
    And Tahseel account "ACC-DET-01" for Civil Aviation exists with current balance 0

  @positive @e2e
  Scenario: Full cycle – two loads and report
    Given a load of 3000 AED is posted to "ACC-DET-01" via cheque deposit
    And a load of 2000 AED is posted via bank transfer
    When the user runs the "Tahseel Account Load Details Report" for "ACC-DET-01"
    Then the report lists both loads with date, amount, source, and running balance
    And the final balance is 5000.00 AED

  @positive @filter
  Scenario: Filter by date range reduces results
    When the user filters by a date range covering only the first load
    Then only the 3000 AED load is displayed

  @negative
  Scenario: Non‑existent account
    When the user enters account "INVALID-ACC"
    Then "No account found" is displayed

  @negative @rbac
  Scenario: Entity‑limited user sees only their own account loads
    Given the user is "Civil Aviation Accountant"
    When viewing the report, only loads for Civil Aviation accounts are visible
