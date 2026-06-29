Feature: Transaction Summary Report Based on Income (Receivable)
  As a receivable accountant, I need a summary of all incoming transactions by revenue entity,
  so that I can reconcile expected vs actual receipts.

  Background:
    Given the user is logged in as "Finance Admin"
    And revenue entities are configured

  @positive @e2e
  Scenario: Summary of receivables
    Given the following transactions are posted as receivables:
      | Civil Aviation: 3000.00 AED |
      | Entity-B: 2000.00 AED |
    When the user runs the "Transaction Summary Report Based on Income (receivable)"
    Then the report aggregates the totals per entity and shows a grand total of 5000.00 AED

  @negative @rbac
  Scenario: Collector can see only their collected entity data
    Given the user is a "Collector" for Civil Aviation only
    When running the report, only Civil Aviation receivables appear
