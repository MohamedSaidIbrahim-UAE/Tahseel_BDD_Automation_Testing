Feature: SFD Tahseel Card Detail Report
  As a central finance department (SFD) auditor, I need a detailed report of Tahseel card transactions
  linked to central financial operations, so that I can monitor government-wide collections.

  Background:
    Given the user is logged in as "Finance Admin"
    And the SFD integration is active
    And Tahseel cards are issued for SFD-tracked entities

  @positive @e2e
  Scenario: SFD-linked card transactions appear in the report
    Given a Tahseel card "TC-4001" is linked to an SFD entity
    And a load of 5000 AED and a deduct of 1000 AED are performed on "TC-4001"
    When the user runs the "SFD Tahseel Card Detail Report"
    Then the report shows the SFD-specific details, including entity code and SFD reference
    And the amounts are correctly aggregated

  @negative
  Scenario: Non-SFD card transactions are excluded
    Given a Tahseel card not linked to SFD has transactions
    When the SFD report is run, those transactions do not appear

  @negative @rbac
  Scenario: Only SFD-authorized roles can view
    Given the user is a "Regular Entity Accountant"
    When attempting to view the SFD report, access is denied
