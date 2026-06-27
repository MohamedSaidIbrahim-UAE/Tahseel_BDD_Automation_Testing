Feature: Etisalat Detailed Transactions from Digital Sharjah
  As an integration analyst, I need a detailed view of transactions originating from Etisalat via Digital Sharjah,
  so that I can reconcile telco-related fee collections.

  Background:
    Given the user is logged in as "Finance Admin"
    And the integration with Etisalat through Digital Sharjah is active

  @positive @e2e
  Scenario: Etisalat transaction appears correctly
    Given a batch of 5 Etisalat payment transactions totalling 1200.00 AED is received
    When the user runs the "Etisalat detailed transactions" report for that batch date
    Then all 5 transactions appear with the source "Etisalat – Digital Sharjah"
    And the total amount is 1200.00 AED

  @negative
  Scenario: No Etisalat transactions for the day
    When the user runs the report on a day with no Etisalat data
    Then "No Etisalat transactions found" is displayed
