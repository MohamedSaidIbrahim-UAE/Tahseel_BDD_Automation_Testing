Feature: Transaction Deposits Detail Report
  As a bank reconciliation officer, I need a detailed report of deposits made against transaction fees,
  so that I can match bank statements to internal records.

  Background:
    Given the user is logged in as "Finance Admin"
    And deposit transactions are enabled

  @positive @e2e
  Scenario: Detailed deposit listing
    Given two deposit entries for Civil Aviation: 1000 AED via Bank X, and 500 AED via Bank Y
    When the user runs the "Transaction deposits detail Report"
    Then both deposits are listed with bank details, amounts, and entity references
    And the total deposit amount is 1500.00 AED

  @negative
  Scenario: Deposit report with date filter yields no results
    When selecting a future date, "No deposits found" is shown
