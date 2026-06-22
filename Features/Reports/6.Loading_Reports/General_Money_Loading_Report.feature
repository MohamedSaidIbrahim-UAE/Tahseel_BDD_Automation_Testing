Feature: General Money Loading Report
  As a loading supervisor, I need a detailed log of all money loading operations across
  Tahseel accounts and cards, regardless of instrument.

  Background:
    Given the user is logged in as "Finance Admin"
    And Tahseel account "ACC-GL-01" and card "TC-GL-01" exist

  @positive @e2e
  Scenario: Mixed loading operations – accounts and cards
    When the user loads 2000 AED into account "ACC-GL-01" via bank deposit
    And loads 500 AED onto card "TC-GL-01" via direct top-up
    And the user runs the "General Money Loading Report" for today
    Then the report lists both operations:
      | Target       | Amount | Type      |
      | ACC-GL-01    | 2000   | Account   |
      | TC-GL-01     | 500    | Card      |
    And the total loaded amount is 2500.00 AED

  @positive @filter
  Scenario: Filter by loading method
    When the user filters by "Card"
    Then only the card load appears

  @negative
  Scenario: No loads in selected period
    When the user runs the report for a future date
    Then "No loading transactions found" is displayed

  @negative @rbac
  Scenario: Money Loader user can only view their own loads
    Given the user is "Money Loader ML-1" and performed the account load
    When the user views the report, only the load performed by ML-1 is shown
