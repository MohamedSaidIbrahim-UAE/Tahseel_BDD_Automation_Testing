Feature: Issue Tracking Detail Report
  As a help desk supervisor, I need a detailed log of all reported issues (البلاغات) with their
  categories, statuses, and attachments, so that I can monitor resolution performance.

  Background:
    Given the user is logged in as "Finance Admin"
    And the issue management module is active
    And the following issue categories are configured via "Issues Category Management":
      | Category Code | Category Name (EN)       | Category Name (AR)     |
      | TECH          | Technical Issue          | مشكلة تقنية            |
      | BILLING       | Billing Dispute          | نزاع فاتورة            |
      | OTHER         | Other                    | أخرى                   |
    And the following attachment types are allowed via "Issues Attachments Management":
      | Attachment Type |
      | Screenshot      |
      | Document        |
      | Photo           |
    And the following support agents are active: "Agent‑A", "Agent‑B"

  @positive @e2e
  Scenario: Full lifecycle – create issues, update workflows, and generate detail report
    When the following issues are created via "add Issue" on 2026‑06‑10:
      | Issue ID | Category | Description              | Attachments        | Created By   |
      | ISS‑001  | TECH     | System crashes on login  | Screenshot (1)     | Customer X   |
      | ISS‑002  | BILLING  | Overcharged 50 AED       | Document (1)       | Customer Y   |
      | ISS‑003  | OTHER    | General inquiry          | (none)             | Customer Z   |
    And ISS‑001 is assigned to Agent‑A and status changed to "In Progress"
    And ISS‑002 is assigned to Agent‑B and status changed to "Waiting Action"
    And ISS‑003 remains "Open"
    And the user runs the "Issue tracking detail report" for 2026‑06‑10
    Then the report displays all three issues with:
      | Issue ID | Category | Status         | Assigned To | Attachments Count |
      | ISS‑001  | TECH     | In Progress     | Agent‑A     | 1                 |
      | ISS‑002  | BILLING  | Waiting Action  | Agent‑B     | 1                 |
      | ISS‑003  | OTHER    | Open            | Unassigned  | 0                 |
    And the total issue count for the day is 3

  @positive @filter
  Scenario: Filter by status
    When the user filters the report by status "Open"
    Then only ISS‑003 is shown

  @positive @filter
  Scenario: Filter by category
    When the user filters by category "TECH"
    Then only ISS‑001 appears

  @positive @filter
  Scenario: Filter by assigned agent
    When the user filters by agent "Agent‑B"
    Then only ISS‑002 is displayed

  @positive @e2e
  Scenario: Issue resolution reflected in report
    Given ISS‑001 is resolved and status changed to "Closed"
    When the report is run again including today
    Then ISS‑001 shows status "Closed"

  @negative
  Scenario: No issues for the selected date
    When the user runs the report for a holiday with no reported issues
    Then the system displays "No issues found"

  @negative @rbac
  Scenario: Unauthorised role cannot view issue details
    Given the user is logged in as "Visitor Agent"
    When the user attempts to open the "Issue tracking detail report"
    Then an "Access Denied" message is shown

  @negative @rbac
  Scenario: Support agent can only see own issues
    Given the user is "Agent‑A"
    When the user runs the report
    Then only ISS‑001 is visible, ISS‑002 and ISS‑003 are hidden

  @negative
  Scenario: Issue with deleted category still appears with original data
    Given category "OTHER" is later deactivated
    And ISS‑003 was created under that category
    When the report is run for the historical date
    Then ISS‑003 still appears with category "OTHER (Inactive)" and does not cause errors
