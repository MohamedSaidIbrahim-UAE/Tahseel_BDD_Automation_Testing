Feature: Tahseel Account Deduct & Load Request Report
  As a loading center supervisor, I need a comprehensive list of all load and deduct requests,
  so that I can reconcile daily operations.

  Background:
    Given the user is logged in as "Finance Admin"
    And the load/deduct request workflow is active

  @positive @e2e
  Scenario: Mixed requests appear with correct status
    Given the following requests are created:
      | Request ID | Type   | Amount | Status    |
      | LD-001     | Load   | 1000   | Approved  |
      | LD-002     | Deduct | 500    | Pending   |
      | LD-003     | Load   | 2000   | Rejected  |
    When the user runs the "Tahseel Account Deduct & Load Request" report
    Then all three requests are listed with their statuses
    And the total approved load amount is 1000 AED

  @positive @filter
  Scenario: Filter by status "Pending"
    When the user filters by "Pending"
    Then only LD-002 appears

  @negative
  Scenario: No requests in period
    When selecting a date with no requests, "No requests found" is shown

  @negative @rbac
  Scenario: Money Loader user can view only their own requests
    Given the user is "Money Loader User ML-1"
    When the report is viewed, only requests created by ML-1 are displayed
