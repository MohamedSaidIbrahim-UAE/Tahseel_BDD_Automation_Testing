Feature: Attendance Report in Period
  As an HR administrator, I need a detailed attendance log of all users for a specific period,
  so that I can monitor working hours, late arrivals, and early departures.

  Background:
    Given the user is logged in as "HR Admin" with access to system reports
    And the following employees are active in the system:
      | User ID | Name              | Department  |
      | EMP001  | Khalid Al‑Mansoori| Finance     |
      | EMP002  | Layla Al‑Zarouni  | Operations  |
      | EMP003  | Omar Al‑Blooshi   | IT          |
    And the standard working shift is 08:00 – 16:00 (Sunday – Thursday)
    And the attendance module records check‑in and check‑out actions

  @positive @e2e
  Scenario: Full lifecycle – employees check in/out and report reflects attendance
    When the following attendance events are recorded on 2026‑06‑10:
      | User ID | Check‑in | Check‑out | Status      |
      | EMP001  | 07:55    | 16:05     | Present     |
      | EMP002  | 08:10    | 15:55     | Late        |
      | EMP003  | (absent) | (absent)  | Absent      |
    And the user runs the "Attendance Report in Period" from 2026‑06‑10 to 2026‑06‑10
    Then the report displays three rows with:
      | Employee          | Check‑in | Check‑out | Status   | Hours  |
      | Khalid Al‑Mansoori| 07:55    | 16:05     | Present  | 8h 10m |
      | Layla Al‑Zarouni  | 08:10    | 15:55     | Late     | 7h 45m |
      | Omar Al‑Blooshi   | -        | -         | Absent   | 0      |
    And the total present count is 2, late count 1, absent count 1

  @positive @filter
  Scenario: Filter by department
    When the user filters the report by department "Finance"
    Then only Khalid Al‑Mansoori's record is displayed

  @positive @filter
  Scenario: Filter by status
    When the user filters by status "Absent"
    Then only Omar Al‑Blooshi appears

  @positive @e2e
  Scenario: Multiple check‑in/out in a day reflected correctly
    Given EMP001 checks in at 07:50, out at 12:00, in again at 13:00, out at 16:00
    When the report is generated for that day
    Then the report shows total working hours = 7h 10m and status "Present"

  @negative
  Scenario: No attendance records for the selected period
    When the user runs the report for a future date or holiday with no records
    Then the system displays "No attendance data found"

  @negative @rbac
  Scenario: Unauthorised role cannot view attendance data
    Given the user is logged in as "Regular Employee"
    When the user attempts to open the "Attendance Report"
    Then an "Access Denied" message is returned

  @negative @rbac
  Scenario: Department manager can only view own department
    Given the user is "Finance Manager" with scope restricted to Finance
    When the report is generated
    Then only Finance employees are listed; Operations and IT are hidden
