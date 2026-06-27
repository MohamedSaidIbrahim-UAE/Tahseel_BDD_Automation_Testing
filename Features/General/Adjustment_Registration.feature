Feature: Adjustment Registration

  Background:
    Given the user is logged in as "Adjustment Officer"
    And a Tahseel account "ACC-ADJ-01" with balance 1000 AED

  @positive
  Scenario: Create and approve a positive adjustment
    When the user creates an adjustment request of +200 AED for "ACC-ADJ-01" with reason "Correction"
    And it is approved
    Then the account balance becomes 1200 AED

  @negative
  Scenario: Adjustment with zero amount
    When the user attempts to submit an adjustment of 0 AED
    Then the system rejects with "Amount must be non-zero"

  @negative
  Scenario: Unauthorised adjustment
    Given the user is a "Regular User"
    Then the adjustment menu is not available
