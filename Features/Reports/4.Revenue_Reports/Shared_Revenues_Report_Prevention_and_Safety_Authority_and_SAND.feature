Feature: Shared Revenues Report – Prevention and Safety Authority and SAND
  As a financial analyst, I need a report on joint revenues between the Prevention and Safety Authority and SAND,
  so that I can allocate the collected fees correctly.

  Background:
    Given the user is logged in as "Finance Admin"
    And the sharing rule for service "SRV-SAFE" is 70% Prevention & Safety, 30% SAND

  @positive @e2e
  Scenario: Transaction split verification
    When a transaction of 2000.00 AED is processed for "SRV-SAFE"
    Then the report shows Prevention & Safety share as 1400.00 and SAND share as 600.00

  @negative
  Scenario: Date range with no applicable transactions
    When the user runs the report for a period with no such transactions
    Then "No data found" is displayed
