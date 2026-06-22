Feature: Payment Methods Detailed Report
  As an auditor, I need a comprehensive detailed breakdown by payment method,
  so that I can trace each transaction's method, fee, and entity.

  Background:
    Given the user is logged in as "Finance Admin"
    And all payment methods (credit card, cheque, e-voucher, direct debit) are active

  @positive @e2e
  Scenario: Mixed payment transactions detailed listing
    Given the user posts:
      | Payment Method | Transaction ID | Amount |
      | Credit Card    | CC-D001        | 1000   |
      | Cheque         | CHQ-D001       | 2000   |
      | E-Voucher      | EV-D001        | 500    |
      | Direct Debit   | DD-D001        | 1500   |
    When the user runs the "Payment Methods Detailed Report"
    Then all four transactions appear, each with correct payment method label
    And the total amount is 5000.00

  @positive @filter
  Scenario: Filter by multiple payment methods
    When the user selects "Credit Card" and "Cheque"
    Then only those two methods are displayed

  @negative
  Scenario: Report with no data due to date filter
    When selecting a future date, "No data found" appears
