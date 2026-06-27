Feature: Esaad Card Application Transaction Report
  As a loyalty program administrator, I need a report of all transactions related to Esaad card applications,
  so that I can reconcile application fees and card issuance.

  Background:
    Given the user is logged in as "Finance Admin"
    And Esaad card application service "ES‑APPLY" with a fee of 50 AED exists

  @positive @e2e
  Scenario: Application transactions listed
    Given 10 Esaad card applications are submitted and paid today
    When the user runs the "Esaad card application transaction report"
    Then all 10 transactions appear with application IDs, applicant details, and fee 50.00 AED each
    And total collected is 500.00 AED

  @negative
  Scenario: No applications in period
    Then "No application transactions" is displayed
