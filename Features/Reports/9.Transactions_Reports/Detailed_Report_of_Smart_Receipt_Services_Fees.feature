Feature: Detailed Report of Smart Receipt Services Fees
  As a receipt auditor, I need a detailed breakdown of fees per smart receipt,
  so that I can verify individual charges.

  Background:
    Given the user is logged in as "Finance Admin"
    And a smart receipt fee of 10 AED per receipt is active

  @positive @e2e
  Scenario: Detailed fee listing
    Given 3 smart receipts "SR‑001", "SR‑002", "SR‑003" are printed today
    When the user runs the "Detailed Report of Smart Reciept Services Fees"
    Then each receipt is listed with a fee of 10.00 AED and the total is 30.00 AED

  @negative
  Scenario: Receipt with zero fee (exempt)
    Given a receipt printed for a fee‑exempt service
    Then the report shows fee 0.00 AED and does not break totals
