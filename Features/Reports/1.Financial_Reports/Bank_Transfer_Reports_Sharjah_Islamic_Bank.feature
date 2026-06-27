Feature: Bank Transfer Reports – Sharjah Islamic Bank

  Background:
    Given the user is logged in as "Finance Admin"
    And the system is connected to the SIB staging gateway

  @positive @e2e
  Scenario: SIB transfer file processed and reflected in the single report
    Given a valid SIB transfer file "sib_transfer_20260608.csv" with 10 transfers totalling AED 50,000
    When the system processes the file for settlement date "2026-06-08"
    And the user opens the "Bank transfers of Sharjah Islamic Bank" report for that date
    Then the report lists all 10 transfers with masked account numbers (e.g., XXXX1234)
    And the total amount is exactly AED 50,000.00
    And no error or warning flags are present

  @positive @e2e
  Scenario: Aggregated general report sums transfers across multiple branches
    Given two SIB transfer files on different dates:
      | Date       | Branch | Total (AED) |
      | 2026-06-08 | Main   | 30,000      |
      | 2026-06-09 | Branch2| 20,000      |
    When the user opens the "Bank transfers of Sharjah Islamic Bank General" report for the period 2026-06-08 to 2026-06-09
    Then the report shows a total of AED 50,000
    And the breakdown by branch is correct

  @negative
  Scenario: Corrupt SIB file causes a graceful error
    Given a corrupt SIB file with missing end-of-file marker
    When the system attempts to process it
    Then the report for that date either shows an error notification or logs the failure
    And no corrupted data appears in the report
