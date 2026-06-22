Feature: Detailed Refund Report
  As a refund operations manager, I need a comprehensive list of all refunded transactions,
  so that I can track refund volumes and reasons.

  Background:
    Given the user is logged in as "Finance Admin"
    And the refund workflow is active
    And the service "SRV-100" allows refunds
    And a paid transaction "TXN-REF-001" for AED 500 exists

  @positive @e2e
  Scenario: Full cycle – process a refund and verify it appears in the detailed report
    When the user submits a refund request for "TXN-REF-001" with reason "Customer request"
    And the refund is approved and processed
    And the user runs the "Detailed Refund Report" for today
    Then the report lists "TXN-REF-001" with:
      | Field               | Value                |
      | Original Amount     | 500.00               |
      | Refund Amount       | 500.00               |
      | Status              | Completed            |
      | Reason              | Customer request     |
    And the total refund amount for the day is 500.00 AED

  @positive @filter
  Scenario: Filter by refund status
    Given another refund request "TXN-REF-002" is still pending
    When the user filters the report by status "Pending"
    Then only "TXN-REF-002" appears

  @negative
  Scenario: No refunds in the selected period
    When the user selects a future date with no refund activity
    Then the report displays "No refund transactions found"

  @negative @rbac
  Scenario: Unauthorised role denied access
    Given the user is logged in as "Tasheel Operator"
    When the user attempts to open the Detailed Refund Report
    Then an "Access Denied" message is returned
