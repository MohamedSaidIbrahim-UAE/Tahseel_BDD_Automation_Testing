Feature: Beah Paid Transaction Detailed Report
  As an environmental studies auditor, I need a detailed report of all transactions paid for Beah services,
  so that I can verify environmental fee collections.

  Background:
    Given the user is logged in as "Finance Admin"
    And Beah environmental service "BEAH‑001" is configured with a fee of 100 AED

  @positive @e2e
  Scenario: Beah transactions detailed report
    Given 5 Beah transactions are paid today, total 500 AED
    When the user runs the "Beah paid transaction detailed report"
    Then the report lists all 5 transactions with service code "BEAH‑001", amount, and payer details
    And the total amount is 500.00 AED

  @negative
  Scenario: No Beah transactions in period
    Then "No Beah transactions" is displayed
