Feature: Total Transactions Report by Deposit Entity
  As a deposit controller, I need an aggregated summary of all transactions (deposits, refunds, retains)
  grouped by the deposit-holding entity, so that I can track per-entity activity.

  Background:
    Given the user is logged in as "Finance Admin"
    And deposit entities "Entity-A" and "Entity-B" are active
    And deposit accounts exist for both entities

  @positive @e2e
  Scenario: Mixed transactions summarised per entity
    Given the following transactions are posted:
      | Entity   | Type    | Amount |
      | Entity-A | Deposit | 10000  |
      | Entity-A | Refund  | 2000   |
      | Entity-A | Retain  | 1000   |
      | Entity-B | Deposit | 5000   |
    When the user runs the "Total Transactions report by deposit entity" for the period
    Then the report displays:
      | Entity   | Total Deposits | Total Refunds | Total Retains | Net Amount |
      | Entity-A | 10000.00       | 2000.00       | 1000.00       | 7000.00    |
      | Entity-B | 5000.00        | 0.00          | 0.00          | 5000.00    |
    And the grand net total is 12000.00 AED

  @negative
  Scenario: No transactions for a specific entity shows zeroes
    Given Entity-C exists but has no transactions
    When the report is run, Entity-C either shows all zeros or is omitted without errors

  @negative @rbac
  Scenario: Entity-restricted user sees only own entity totals
    Given the user is "Entity-A Accountant"
    Then only the row for Entity-A appears
