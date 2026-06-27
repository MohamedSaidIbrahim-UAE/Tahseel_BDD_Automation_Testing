Feature: Tahseel Card Transaction Details Reports
  As a customer service agent, I need an exhaustive list of all movements on a Tahseel card,
  including loads, deducts, fees, and reversals, so I can resolve disputes.

  Background:
    Given the user is logged in as "Finance Admin"
    And card "TC-9001" is active

  @positive @e2e
  Scenario: Comprehensive transaction history
    Given the following operations on "TC-9001":
      | Seq | Operation  | Amount | Fee |
      | 1   | Load       | 2000   | 0   |
      | 2   | Deduct     | 500    | 5   |
      | 3   | Reversal   | 500    | -5  |
    When the user runs the "Tahseel Card Transaction Details Reports" for "TC-9001"
    Then all three rows appear in chronological order with running balance correctly calculated
    And the final balance is 2000 - 500 - 5 + 500 + 5 = 2000 AED (assuming reversal returns fee)

  @negative
  Scenario: Card with no transactions
    When the report is run for a newly issued card with no activity
    Then "No transactions" is shown
