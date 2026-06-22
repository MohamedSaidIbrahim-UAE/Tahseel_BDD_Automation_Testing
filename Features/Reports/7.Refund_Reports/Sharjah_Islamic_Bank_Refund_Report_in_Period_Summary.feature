Feature: Sharjah Islamic Bank Refund Report in Period (Summary)
  As a finance manager, I need a summarised view of SIB refunds over a custom period,
  so that I can assess total refund outflows through SIB.

  Background:
    Given the user is logged in as "Finance Admin"
    And SIB refunds exist on 2026-06-09 (3000 AED) and 2026-06-10 (1500 AED)

  @positive @e2e
  Scenario: Aggregate SIB refunds over a date range
    When the user runs the "Sharjah islamic bank refund report in period" for 2026-06-09 to 2026-06-10
    Then the report shows:
      | Date       | Total Refunded |
      | 2026-06-09 | 3000.00        |
      | 2026-06-10 | 1500.00        |
    And the grand total is 4500.00 AED

  @positive @filter
  Scenario: Filter by specific date
    When the user sets the period to only 2026-06-09
    Then only the 3000.00 AED entry appears

  @negative
  Scenario: No SIB refunds in period
    When the user selects a period with no SIB refund activity
    Then "No SIB refunds found" is displayed

  @negative @rbac
  Scenario: Unauthorised user cannot access summary
    Given the user is "Entity Accountant"
    Then access is denied
