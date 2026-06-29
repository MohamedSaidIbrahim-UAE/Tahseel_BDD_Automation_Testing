Feature: Detailed Cheques Report - Revenues
  As a revenue accountant, I need a detailed cheque report filtered to receipts only,
  so that I can reconcile cheques received against revenue targets.

  Background:
    Given the user is logged in as "Finance Admin"
    And cheques are enabled

  @positive @e2e
  Scenario: Revenue-specific cheque detail report
    Given the following cheque receipts are posted on 2026-06-09:
      | Cheque No | Amount | Revenue Entity |
      | CHQ-R01   | 3000   | Civil Aviation       |
      | CHQ-R02   | 2000   | Entity-B       |
    When the user runs the "Detailed Cheques Report - Revenues"
    Then only receipt cheques are listed
    And the total received amount is 5000.00
    And the report can be filtered by Revenue Entity "Civil Aviation", showing only CHQ-R01

  @negative
  Scenario: Excluding non-revenue cheques (payments)
    Given a cheque payment transaction (outgoing) exists
    When the user runs the revenue report
    Then the payment cheque is not included
