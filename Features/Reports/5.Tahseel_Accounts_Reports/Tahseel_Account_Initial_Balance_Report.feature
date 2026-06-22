Feature: Tahseel Account Initial Balance Report
  As an implementation specialist, I need a report of the opening balances of all Tahseel accounts,
  so that I can ensure the system is correctly initialised.

  Background:
    Given the user is logged in as "Finance Admin"
    And Tahseel accounts can be created with or without initial balance

  @positive @e2e
  Scenario: Report reflects initial balances
    Given account "ACC-7001" is created with initial balance 5000 AED
    And account "ACC-7002" is created with initial balance 0 AED
    When the user runs the "Tahseel Account Initial Balance" report
    Then the report shows:
      | Account  | Initial Balance |
      | ACC-7001 | 5000.00         |
      | ACC-7002 | 0.00            |

  @negative
  Scenario: Updated initial balance (adjustment) is reflected
    Given the initial balance of "ACC-7001" is adjusted to 4500 AED
    When the report is generated, the new initial balance is 4500 AED
