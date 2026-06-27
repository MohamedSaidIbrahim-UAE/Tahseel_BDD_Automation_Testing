Feature: Settlement Reports – Mashreq Bank

  Background:
    Given the user is logged in as "Finance Admin"
    And Mashreq settlement integration is active on staging

  @positive @e2e
  Scenario: Full match settlement report
    Given internal transaction records for 15 credit card payments totalling AED 75,000 on "2026-06-08"
    And a Mashreq settlement file is uploaded with exactly the same 15 transactions
    When the user runs the "Mashreq Settle Report" for "2026-06-08"
    Then all 15 transactions are marked as "Matched"
    And the reconciliation difference is 0.00 AED

  @positive @e2e
  Scenario: Settlement period report aggregates correctly
    Given settlement batches on "2026-06-08" and "2026-06-09" with totals AED 10,000 and AED 20,000
    When the user runs the "Mashreq bank settlement report in period" from 2026-06-08 to 2026-06-09
    Then the report shows totals AED 10,000 and AED 20,000 per day and a grand total of AED 30,000

  @negative
  Scenario: Mismatch handling in settlement
    Given internal transaction of AED 500 exists
    And the Mashreq file contains the same transaction but with amount AED 499.99
    When the settlement report is generated
    Then the row is flagged as "Mismatch" and the variance of -0.01 AED is highlighted
