Feature: Transaction Summary Income Report Based on Collecting Entities
  As a collection operations manager, I need a summary of incomes grouped by the collecting entity
  (e.g., Tasheel center, bank, online portal), so that I can evaluate channel performance.

  Background:
    Given the user is logged in as "Finance Admin"
    And collecting entities "Tasheel Center-1", "Tasheel Center-2", and "Online Portal" are defined

  @positive @e2e
  Scenario: Aggregate income by collecting entity
    Given the following transactions are collected via:
      | Tasheel Center-1: 5000.00 AED |
      | Tasheel Center-2: 3000.00 AED |
      | Online Portal:    2000.00 AED |
    When the user runs the "Transaction summary income report based on collecting entities"
    Then the report shows:
      | Collecting Entity  | Total Income |
      | Tasheel Center-1   | 5000.00      |
      | Tasheel Center-2   | 3000.00      |
      | Online Portal      | 2000.00      |
    And the grand total is 10000.00 AED

  @negative @rbac
  Scenario: Tasheel center manager can only view own center
    Given the user is the manager of "Tasheel Center-1"
    When the report is run, only "Tasheel Center-1" data appears
