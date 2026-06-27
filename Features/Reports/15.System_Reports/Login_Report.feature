Feature: Login Report
  As a security administrator, I need a log of all login attempts (successful and failed),
  so that I can detect unauthorized access attempts and monitor user activity.

  Background:
    Given the user is logged in as "Security Admin" with full system report access
    And the following users exist:
      | User ID   | Name              | Role          | Account Status |
      | SEC001    | Ahmed Al‑Ali      | Finance Admin | Active         |
      | SEC002    | Fatima Al‑Zar     | Operator      | Active         |
      | SEC003    | HackerBot         | (disabled)    | Locked         |
    And the system logs all login attempts with timestamp, IP address, and result

  @positive @e2e
  Scenario: Full lifecycle – successful and failed logins appear in the report
    When the following login attempts occur on 2026‑06‑10:
      | Timestamp           | User ID | IP Address      | Result    |
      | 2026‑06‑10 08:00:00 | SEC001  | 10.0.0.1        | Success   |
      | 2026‑06‑10 08:05:00 | SEC002  | 192.168.1.100   | Success   |
      | 2026‑06‑10 09:00:00 | SEC003  | 203.0.113.45    | Failed (Locked) |
      | 2026‑06‑10 09:10:00 | SEC002  | 192.168.1.100   | Failed (Wrong password) |
    And the user runs the "Login Report" for 2026‑06‑10
    Then the report shows all four attempts with:
      | User         | IP Address      | Result              |
      | Ahmed Al‑Ali | 10.0.0.1        | Success             |
      | Fatima Al‑Zar| 192.168.1.100   | Success             |
      | HackerBot    | 203.0.113.45    | Failed (Locked)     |
      | Fatima Al‑Zar| 192.168.1.100   | Failed (Wrong pass) |
    And the summary shows total attempts = 4, successful = 2, failed = 2

  @positive @filter
  Scenario: Filter by result
    When the user filters the report by "Failed"
    Then only the two failed attempts are displayed

  @positive @filter
  Scenario: Filter by user
    When the user filters by "Fatima Al‑Zar"
    Then only Fatima's two attempts (one success, one failed) are shown

  @positive @filter
  Scenario: Filter by IP address
    When the user filters by IP "203.0.113.45"
    Then only the failed attempt from HackerBot appears

  @negative
  Scenario: No login attempts in the selected period
    When the user runs the report for a future date
    Then the report displays "No login attempts found"

  @negative @rbac
  Scenario: Non‑admin user cannot view login report
    Given the user is logged in as "Regular User"
    When the user attempts to open the "Login Report"
    Then an "Access Denied" message is returned

  @negative @rbac
  Scenario: Department admin can only see own department's login attempts
    Given the user is "Finance Department Admin" and only Finance users are in scope
    When the report is generated
    Then only Ahmed Al‑Ali's attempts (Finance) appear; Fatima's and HackerBot's are hidden

  @negative
  Scenario: Report can handle high volume without crash
    Given 1000 login attempts are recorded within one hour
    When the user runs the report for that hour
    Then the report loads within an acceptable time and paginates correctly
