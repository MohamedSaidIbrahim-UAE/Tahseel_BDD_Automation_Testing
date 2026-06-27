Feature: Tahseel Accounts Management

  Background:
    Given the user is logged in as "Account Manager"

  @positive
  Scenario: Create company account with initial balance
    When the user creates a company account for "Company X" with initial balance 5000 AED
    Then the account appears in the accounts list

  @positive
  Scenario: Block an account
    When the user blocks the account
    Then no further transactions can be performed on it

  @negative
  Scenario: Close account with non-zero balance
    When attempting to close an account with remaining balance 100 AED
    Then the system forces a refund or transfer before closure
