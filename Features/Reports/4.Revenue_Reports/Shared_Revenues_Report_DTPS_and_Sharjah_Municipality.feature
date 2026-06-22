Feature: Shared Revenues Report – DTPS and Sharjah Municipality
  As a shared services analyst, I need a report showing the distribution of shared revenues between the
  Directorate of Town Planning and Survey (DTPS) and Sharjah Municipality,
  so that I can settle inter-departmental revenue shares.

  Background:
    Given the user is logged in as "Finance Admin"
    And the shared revenue rule between "DTPS" and "Sharjah Municipality" is set to 50% each for service "SRV-SH1"
    And the rule applies for transactions from 2026-01-01

  @positive @e2e
  Scenario: Full cycle – post transactions under shared service and verify split
    When the user posts two transactions for service "SRV-SH1" totalling 10000.00 AED
    And the user runs the "Shared revenues between DTPS and Sharjah Municipality" report for today
    Then the report displays:
      | Revenue Entity         | Total Amount | Share % | Share Amount |
      | DTPS                   | 10000.00     | 50%     | 5000.00      |
      | Sharjah Municipality   | 10000.00     | 50%     | 5000.00      |
    And the grand total is 10000.00 AED

  @positive @masterdata
  Scenario: Update sharing rule mid-period and verify report reflects correct split
    Given the sharing rule for service "SRV-SH1" changes to 70% DTPS and 30% Municipality from 2026-06-15
    When transactions are posted before and after the change date
    And the report is generated for the entire month of June
    Then the report correctly applies the old rule for transactions before 06-15 and new rule for those after
    And the share amounts are calculated accordingly

  @negative
  Scenario: No transactions for the shared service
    When the user runs the report for a period with no transactions for service "SRV-SH1"
    Then the report displays "No shared revenue transactions found"

  @negative @rbac
  Scenario: Unauthorised user from other entity cannot access shared revenue details
    Given the user is from "Entity-B" with no DTPS/Municipality scope
    When the user tries to open the report
    Then access is denied
