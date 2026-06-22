Feature: Summary GITFees Report for Smart Receipt
  As a smart receipt service manager, I need total GIT fees collected for printing smart receipts,
  so that I can invoice the service.

  Background:
    Given the user is logged in as "Finance Admin"
    And a smart receipt printing fee of 10 AED per receipt is configured

  @positive @e2e
  Scenario: Aggregated GIT fee report
    Given 30 smart receipts are printed today
    When the user runs the "Summary GITFees Report for smart Reciept" for today
    Then the report shows total GIT fees = 300.00 AED (30 × 10)

  @negative
  Scenario: No receipts printed
    When the report is run on a day with no prints, the total fee is 0.00 AED
