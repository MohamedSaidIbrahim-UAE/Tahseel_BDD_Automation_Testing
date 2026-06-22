Feature: Summary SEDD Transactions Report
  As a SEDD manager, I need an aggregated summary of all SEDD transactions per period,
  so that I can quickly see the total collections.

  Background:
    Given the user is logged in as "Finance Admin"
    And SEDD transactions exist

  @positive @e2e
  Scenario: Aggregate SEDD transactions
    Given 40 SEDD transactions totalling 200000 AED this month
    When the user runs the "Summary SEDD Transactions Report" for this month
    Then the report shows total count = 40 and amount = 200000.00 AED

  @negative @rbac
  Scenario: Non‑SEDD user cannot access summary
    Given the user is "Other Entity Accountant"
    Then access is denied
