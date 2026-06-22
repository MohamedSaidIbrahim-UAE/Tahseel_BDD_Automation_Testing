Feature: Summary Transactions Report
  As a department head, I need aggregated transaction counts and totals per period,
  so that I can monitor volume trends.

  Background:
    Given the user is logged in as "Finance Admin"
    And the system is ready with services and entities

  @positive @e2e
  Scenario: Full cycle – multiple transactions and summary
    Given 20 transactions totalling 100000 AED across various services and entities are posted today
    When the user runs the "Summary Transactions Report" for today
    Then the report shows total count = 20 and total amount = 100000.00 AED
    And the breakdown by hour/entity is accurate

  @positive @filter
  Scenario: Summary filtered by entity
    When filtered by "Entity‑A", only its count and total are shown

  @negative
  Scenario: No transactions in period
    When selecting a weekend with no activity, "No data" is displayed

  @negative @rbac
  Scenario: Unauthorised role cannot view
    Given the user is "Customer Support"
    Then access is denied
