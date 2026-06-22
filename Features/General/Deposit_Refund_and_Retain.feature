Feature: Deposit Refund and Retain

  Background:
    Given the user is logged in as "Deposit Manager"
    And a deposit account "DEP-01" has a balance of 1000 AED

  @positive
  Scenario: Refund deposit partially
    When the user creates a refund request of 300 AED
    And the request is approved
    Then the account balance becomes 700 AED

  @positive
  Scenario: Retain deposit (confiscation)
    When the user creates a retain request of 200 AED with reason "Breach of terms"
    And it is approved
    Then the balance becomes 500 AED

  @negative
  Scenario: Refund exceeds balance
    When attempting to refund 1200 AED
    Then the system rejects with "Insufficient deposit balance"

  @negative
  Scenario: Stuck refund inquiry
    When a refund fails at the bank, it appears in "Stuck Refund Requests" with the error detail
