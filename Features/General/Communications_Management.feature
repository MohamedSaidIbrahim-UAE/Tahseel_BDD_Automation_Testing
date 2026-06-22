Feature: Communications Management

  Background:
    Given the user is logged in as "Field Agent"

  @positive
  Scenario: Add a visit and create an issue
    When the user records a visit to "Customer X" with notes
    And creates an issue "ISSUE-001" from that visit with category "Technical"
    Then both appear in respective reports

  @positive
  Scenario: Issue lifecycle
    When the issue is assigned and status changed to "In Progress"
    And later resolved
    Then the issue tracking detail shows the full history

  @negative
  Scenario: Upload oversized attachment
    When attaching a file larger than the allowed limit, the system shows "File too large"
