Feature: Visits Report
  As a customer relations manager, I need a detailed log of all visits recorded by field agents,
  so that I can track on‑site interactions and follow‑up actions.

  Background:
    Given the user is logged in as "Finance Admin"
    And the "Visits" module is active
    And the following field agents exist:
      | Agent Name     |
      | Ahmed Al‑Ali   |
      | Fatima Al‑Zar  |
    And the following visit types are configured:
      | Visit Type        |
      | Customer Support  |
      | Installation      |
      | Maintenance       |

  @positive @e2e
  Scenario: Full lifecycle – add visits and verify report
    When the following visits are recorded via "add Visit" on 2026‑06‑10:
      | Visit ID | Visitor Name   | Agent          | Type             | Date       | Notes                     |
      | V001     | Ali & Sons Co. | Ahmed Al‑Ali   | Customer Support | 2026‑06‑10 | Routine check‑in          |
      | V002     | Burj Ltd.      | Fatima Al‑Zar  | Installation     | 2026‑06‑10 | New equipment setup       |
      | V003     | City Gov Dept  | Ahmed Al‑Ali   | Maintenance      | 2026‑06‑10 | Scheduled maintenance     |
    And the user runs the "Visits Report" for 2026‑06‑10
    Then the report lists all three visits with correct visitor names, agents, types, and notes
    And the total number of visits for the day is 3

  @positive @filter
  Scenario: Filter by agent
    When the user filters the report by agent "Ahmed Al‑Ali"
    Then only V001 and V003 are displayed

  @positive @filter
  Scenario: Filter by visit type
    When the user filters by type "Installation"
    Then only V002 is displayed

  @positive @filter
  Scenario: Filter by date range
    Given an additional visit V004 on 2026‑06‑11
    When the user selects the date range 2026‑06‑10 to 2026‑06‑10
    Then V004 is excluded

  @negative
  Scenario: No visits on a holiday
    When the user runs the report for a date with no recorded visits
    Then the report displays "No visits found"

  @negative @rbac
  Scenario: Unauthorised role cannot view visits report
    Given the user is logged in as "Customer Support Agent" (no report permission)
    When the user attempts to open the "Visits Report"
    Then an "Access Denied" message is returned

  @negative @rbac
  Scenario: Field agent can only see own visits
    Given the user is "Fatima Al‑Zar" (field agent)
    When the user runs the Visits Report
    Then only visits assigned to Fatima Al‑Zar are shown (i.e., V002)
