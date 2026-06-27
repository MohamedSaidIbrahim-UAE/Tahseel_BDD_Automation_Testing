Feature: Grant Card History Logs Report

  Background:
    Given a grant card "GC-9999" is issued to a beneficiary

  @positive @e2e
  Scenario: Full grant card lifecycle
    Given AED 500 is loaded onto "GC-9999" on "2026-06-08"
    And AED 200 is deducted from the card on "2026-06-09"
    When the user runs the "Grant Card History Logs Report" for card "GC-9999"
    Then the report lists:
      | Date       | Operation | Amount | Balance |
      | 2026-06-08 | Load      | 500    | 500     |
      | 2026-06-09 | Deduct    | -200   | 300     |
    And the final balance is 300 AED

  @negative
  Scenario: Report for non-existent card
    When the user searches for card "INVALID-0000"
    Then the system displays "No data found" for that card
