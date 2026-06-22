Feature: Shared Revenues Report – DTPS and Sharjah Municipality
  As a shared services analyst, I need a report showing the distribution of shared revenues between the
  Directorate of Town Planning and Survey (DTPS) and Sharjah Municipality,
  so that I can settle inter-departmental revenue shares with 50/50 split verification.

  Background:
    Given the user is logged in as "Finance Admin"
    And sharing rule for "Shared-Service-001" is "50/50"
    And the revenue entities "DTPS" and "Sharjah Municipality" are configured

  @positive @e2e @split @automated
  Scenario: Full cycle – post transactions under shared service and verify split
    Given the following transactions are posted under shared service on 2026-06-15:
      | Service             | Amount | Entities                    |
      | Shared-Service-001  | 1000   | DTPS & Sharjah Municipality |
      | Shared-Service-001  | 500    | DTPS & Sharjah Municipality |
    When the user runs the shared revenues report for "June 2026"
    Then the report shows transaction split verification
    And all transactions are split "50/50" between the two entities
    And the splits sum to the total transaction amount for each transaction
    And the total for the first entity is 750.00 AED
    And the total for the second entity is 750.00 AED
    And the grand total is 1500.00 AED
    And the report can be exported to PDF

  @positive @masterdata @split @automated
  Scenario: Update sharing rule mid-period and verify report reflects correct split
/50"
    And the sharing rule is updated on 2026-06-15 to "60/40"
    When the user applies a new sharing rule mid-period
    Then the report reflects the updated sharing rule from 2026-06-15 onwards
    And transactions before 2026-06-15 use 50/50 split
    And transactions from 2026-06-15 onwards use 60/40 split

  @negative @automated
  Scenario: No transactions for the shared service
    Given transaction date range has no applicable transactions
    When the user runs thly 2026"
   Then the report can be exported to Excel
    And the report can be exported to PDF
    Then the report displays "No data found"

  @negative @rbac @automated
  Scenario: Unauthorised user from other entity cannot access shared revenue details
    Given the user is logged in as "Entity-C Restricted User"
    When the user runs the shared revenues report for "June 2026"
    Then the user cannot access shared revenue details

  @positive @export @automated
  Scenario: Export shared revenues report to Excel for audit trail
    When the user runs the shared revenues report for "June 2026"
 