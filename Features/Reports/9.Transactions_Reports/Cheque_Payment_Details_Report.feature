Feature: Cheque Payment Details Report
  As a cheque processing officer, I need detailed information on every cheque payment,
  so that I can manage clearing and follow up on bounced cheques.

  Background:
    Given the user is logged in as "Finance Admin"
    And cheque payment method is active

  @positive @e2e
  Scenario: Cheque payment details
    Given a cheque payment "CHQ‑D‑100" with cheque number "123456", bank "Bank A", amount 2000 AED
    When the user runs the "Cheque Payment Details Report"
    Then the report shows the cheque details including cheque number, bank, amount, and clearing status

  @positive @filter
  Scenario: Filter by cheque number
    When filtered by "123456", only that cheque appears

  @negative
  Scenario: No cheque payments
    When there are no cheque payments, "No cheque payments found" is shown
