Feature: Municipality Fees Share Report on Real Estate Registration Directorate Transactions
  As a Sharjah Municipality accountant, I need the share of municipality fees from real‑estate registration transactions,
  so that I can claim the correct amount from the registration directorate.

  Background:
    Given the user is logged in as "Finance Admin"
    And a rule exists: for real‑estate registration, Municipality share is 30% of the service fee

  @positive @e2e
  Scenario: Municipality fee share calculation
    Given 10 real‑estate registration transactions with total service fees of 10000 AED
    When the user runs the "Municipality Fees Share Report on Real Estate Registration"
    Then the report shows Municipality share = 3000.00 AED (30% of 10000)

  @negative
  Scenario: No real‑estate transactions in period
    When the report is run for a period without such transactions, "No data" is displayed
