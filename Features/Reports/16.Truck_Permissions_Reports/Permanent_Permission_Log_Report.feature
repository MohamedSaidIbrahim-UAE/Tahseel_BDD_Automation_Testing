Feature: Permanent Permission Log Report
  As a compliance officer, I need an audit trail of all status changes (suspension, activation) for permanent
  truck permits, so that I can review enforcement actions and history.

  Background:
    Given the user is logged in as "Ports Admin" with full access to the log report
    And a permanent permit "PERM-001" exists for truck A 11111 (CMP-001, PORT-01) and is currently "Active"
    And the permit was activated on 2026-06-10
    And the current date is 2026-06-12

  @positive @e2e
  Scenario: Full lifecycle – suspend and reactivate permit, verify log
    When the permit PERM-001 is suspended on 2026-06-11 with reason "Safety violation"
    And the permit is reactivated on 2026-06-12 with reason "Violation resolved"
    And the user runs the "Permanent permission Log report" for PERM-001
    Then the report shows a chronological log:
      | Date       | Action       | Reason                | User        |
      | 2026-06-10 | Activated    | Initial issuance      | Ports Admin |
      | 2026-06-11 | Suspended    | Safety violation      | Officer A   |
      | 2026-06-12 | Activated    | Violation resolved    | Officer B   |
    And the current status after the last action is "Active"

  @positive @filter
  Scenario: Filter by action type
    When the user filters the log by action "Suspended"
    Then only the suspension entry is displayed

  @positive @filter
  Scenario: Filter by date range
    When the user selects range 2026-06-11 to 2026-06-11
    Then only the suspension entry (2026-06-11) appears

  @negative
  Scenario: No log entries for a newly created permit with no status changes
    Given a fresh permit PERM-003 is issued today and never suspended
    When the user views the log for PERM-003
    Then the report shows only the initial activation entry (if logged) or a message "No status changes recorded"

  @negative
  Scenario: Invalid permit ID
    When the user enters a non‑existent permit "INVALID-000"
    Then the report displays "Permit not found"

  @negative @rbac
  Scenario: Unauthorised role cannot view permit log
    Given the user is "Truck Company Admin"
    Then access is denied (log is limited to port authority users)

  @negative @rbac
  Scenario: Enforcement officer can only view log, not export
    Given the user is "Enforcement Officer" with read‑only access
    When viewing the log, the export button is disabled or not visible
