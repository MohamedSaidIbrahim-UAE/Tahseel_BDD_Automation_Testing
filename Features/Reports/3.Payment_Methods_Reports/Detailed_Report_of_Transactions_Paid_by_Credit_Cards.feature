Feature: Detailed Report of Transactions Paid by Credit Cards
  As a payment operations analyst, I need a detailed line-by-line view of credit card payments,
  so that I can audit MCCs, amounts, and merchant activity.

  Background:
    Given the user is logged in as "Finance Admin"
    And credit card merchant "MCC-1234" is configured for Civil Aviation
    And credit card merchant "MCC-5678" is configured for Entity-B

  @positive @e2e
  Scenario: Full cycle – credit card transaction posting and detailed report
    When the user posts the following credit card transactions:
      | Transaction | Merchant | Amount (AED) | Entity   |
      | CC-001      | MCC-1234 | 250.00       | Civil Aviation |
      | CC-002      | MCC-1234 | 350.00       | Civil Aviation |
      | CC-003      | MCC-5678 | 120.00       | Entity-B |
    Then the user runs the "Detailed Credit Card Transactions Report"
    And the report lists all three transactions with correct merchant IDs and amounts
    And the total for MCC-1234 is 600.00 AED

  @positive @filter
  Scenario: Filter by merchant ID
    When the user filters by merchant "MCC-1234"
    Then only CC-001 and CC-002 appear

  @negative
  Scenario: Credit card report with no transactions
    When selecting a date with no credit card activity
    Then the report shows "No data found" and total is 0.00

  @negative @rbac
  Scenario: Merchant user accessing global credit card details
    Given the user is a "Merchant User" with access limited to their own merchant
    When the user runs the detailed credit card report
    Then only transactions for their own merchant appear; others are excluded
