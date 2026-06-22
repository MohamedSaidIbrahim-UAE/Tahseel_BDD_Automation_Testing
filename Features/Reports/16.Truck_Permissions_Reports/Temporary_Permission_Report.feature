Feature: Temporary Permission Report
  As a ports authority officer, I need a detailed report of all temporary truck entry permits,
  so that I can track short‑term access, validity, and compliance.

  Background:
    Given the user is logged in as "Ports Admin" with full report access
    And the following ports are configured in the system:
      | Port Code | Port Name           |
      | PORT-01   | Port Khalid         |
      | PORT-02   | Hamriyah Free Zone  |
    And the following truck companies are registered:
      | Company Code | Company Name       |
      | CMP-001      | Al-Futtaim Logistics|
      | CMP-002      | Emirates Transport  |
    And temporary permit rules allow a maximum validity of 14 days with a fee of 100 AED per day
    And the current date is 2026-06-10

  @positive @e2e
  Scenario: Full lifecycle – issue temporary permits and verify report
    When the following temporary permits are issued today:
      | Permit ID | Truck Plate | Company      | Port     | Valid From  | Valid Until |
      | TEMP-001  | A 12345     | CMP-001      | PORT-01  | 2026-06-10  | 2026-06-12  |
      | TEMP-002  | B 67890     | CMP-002      | PORT-02  | 2026-06-10  | 2026-06-11  |
    And the user runs the "Temporary permission report" for 2026-06-10
    Then the report lists both permits with correct plate numbers, companies, ports, and validity dates
    And the total number of active temporary permits is 2

  @positive @filter
  Scenario: Filter by port
    When the user filters the report by port "PORT-01"
    Then only TEMP-001 is displayed

  @positive @filter
  Scenario: Filter by company
    When the user filters by company "Emirates Transport"
    Then only TEMP-002 is displayed

  @positive @filter
  Scenario: Filter by validity date range
    Given an additional permit TEMP-003 valid from 2026-06-15 to 2026-06-20
    When the user filters by validity from 2026-06-10 to 2026-06-12
    Then TEMP-003 is excluded

  @negative
  Scenario: Expired temporary permit shows status correctly
    Given TEMP-001's validity ended yesterday
    When the report is run for today
    Then TEMP-001 appears with status "Expired" and is not counted as active

  @negative
  Scenario: No temporary permits on a holiday
    When the user runs the report for a date with no issued permits
    Then the report displays "No temporary permits found"

  @negative @rbac
  Scenario: Unauthorised role cannot view temporary permit report
    Given the user is logged in as "Truck Driver"
    When the user attempts to open the "Temporary permission report"
    Then an "Access Denied" message is returned

  @negative @rbac
  Scenario: Company user only sees own permits
    Given the user is "Al-Futtaim Logistics Admin" with scope limited to CMP-001
    When the report is viewed, only TEMP-001 (CMP-001) is shown
