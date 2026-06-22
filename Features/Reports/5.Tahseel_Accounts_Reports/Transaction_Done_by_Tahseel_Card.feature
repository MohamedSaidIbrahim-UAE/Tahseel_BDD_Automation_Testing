Feature: Transaction Done by Tahseel Card
  As a reconciliation analyst, I need a movement history for a specific Tahseel card,
  so that I can track all loads, deductions, and fees.

  Background:
    Given the user is logged in as "Finance Admin"
    And a Tahseel card "TC-2001" exists for Entity-A

  @positive @e2e
  Scenario: Full cycle – load, deduct, fee, and history report
    Given the card "TC-2001" has an initial load of 1000 AED
    When a deduct transaction of 300 AED is performed with a 5 AED service fee
    And the user runs the "Transaction Done by Tahseel Card" report for "TC-2001"
    Then the report lists:
      | Date       | Type   | Amount | Fee  | Balance |
      | 2026-06-10 | Load   | 1000   | 0    | 1000    |
      | 2026-06-10 | Deduct | -300   | 5    | 695     |
    And the final balance is 695.00 AED

  @negative
  Scenario: Report for non-existent card number
    When the user enters "TC-9999"
    Then "No transactions found for this card" is displayed

  @negative @rbac
  Scenario: Merchant user cannot view card transactions
    Given the user is "Merchant User"
    When accessing the report, access is denied
