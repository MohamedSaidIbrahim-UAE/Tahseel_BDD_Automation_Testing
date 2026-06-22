Feature: Permanent Permission Report
  As a port operations manager, I need a detailed list of all permanent truck permits,
  so that I can monitor long‑term access rights and manage renewals.

  Background:
    Given the user is logged in as "Ports Admin"
    And the ports PORT-01 (Port Khalid) and PORT-02 (Hamriyah Free Zone) exist
    And the truck companies CMP-001 (Al-Futtaim Logistics) and CMP-002 (Emirates Transport) exist
    And permanent permits are valid for one year with an annual fee of 5000 AED
    And the current date is 2026-06-10

  @positive @e2e
  Scenario: Full lifecycle – issue permanent permits and verify report
    When the following permanent permits are issued today:
      | Permit ID | Truck Plate | Company      | Port     | Valid From  | Valid Until |
      | PERM-001  | A 11111     | CMP-001      | PORT-01  | 2026-06-10  | 2027-06-10  |
      | PERM-002  | B 22222     | CMP-002      | PORT-02  | 2026-06-10  | 2027-06-10  |
    And the user runs the "Permanent permission report" for today
    Then the report lists both permits with status "Active", valid from/to, plate numbers, companies, and ports
    And the total number of active permanent permits is 2

  @positive @filter
  Scenario: Filter by port
    When the user filters by PORT-02
    Then only PERM-002 is displayed

  @positive @filter
  Scenario: Filter by company
    When the user filters by "Al-Futtaim Logistics"
    Then only PERM-001 is shown

  @positive @e2e
  Scenario: Permit renewal reflected correctly
    Given PERM-001 expires and a renewal is processed extending validity to 2028-06-10
    When the report is run after the renewal
    Then PERM-001 shows the new validity end date and status "Active"

  @negative
  Scenario: Expired permanent permit shows "Expired" status
    Given PERM-001 has passed its valid until date
    When the report is run
    Then PERM-001 appears with status "Expired"

  @negative
  Scenario: No permanent permits on a given date
    When the user runs the report for a date before any permits were issued
    Then "No permanent permits found" is displayed

  @negative @rbac
  Scenario: Unauthorised role cannot view permanent permit report
    Given the user is "Port Security Guard"
    Then access is denied

  @negative @rbac
  Scenario: Company user only sees own permanent permits
    Given the user is "Emirates Transport Admin"
    When the report is generated, only PERM-002 appears
