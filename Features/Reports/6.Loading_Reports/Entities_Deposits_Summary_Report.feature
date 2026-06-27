Feature: Entities Deposits – Summary Report
  As a treasury analyst, I want a summary of bank deposits made by government entities,
  so that I can monitor entity funding activity.

  Background:
    Given the user is logged in as "Finance Admin"
    And entities "Civil Aviation" and "Entity-B" are configured to make deposits

  @positive @e2e
  Scenario: Multiple entity deposits aggregated
    Given Civil Aviation deposits 50000 AED on 2026-06-10
    And Entity-B deposits 30000 AED on 2026-06-10
    When the user runs the "Entities Deposits - Summary Report" for today
    Then the report shows:
      | Entity   | Deposit Amount |
      | Civil Aviation | 50000.00       |
      | Entity-B | 30000.00       |
    And the grand total deposit is 80000.00 AED

  @negative
  Scenario: No deposits for the day
    When the report is run for a day without any deposits
    Then "No deposits recorded" appears

  @negative @rbac
  Scenario: Entity‑restricted user only sees own entity deposits
    Given the user is "Civil Aviation Accountant"
    Then only Civil Aviation deposits are displayed
