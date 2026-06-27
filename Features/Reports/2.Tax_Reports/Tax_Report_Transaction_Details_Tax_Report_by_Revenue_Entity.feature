Feature: Tax Report – Transaction Details Tax Report by Revenue Entity
  As a revenue entity accountant, I need a tax breakdown filtered by my own entity,
  so that I can verify the tax collected on behalf of my department.

  Background:
    Given the user is logged in as "Finance Admin"
    And the system has a 5% VAT rate
    And two entities "Civil Aviation" (standard) and "Entity-B" (tax-exempt) exist

  @positive @e2e
  Scenario: Detailed tax view per revenue entity after transactions
    Given the following transactions are posted:
      | Transaction | Entity    | Base Amount | VAT Rate |
      | TXN-201     | Civil Aviation  | 500         | 5%       |
      | TXN-202     | Civil Aviation  | 1500        | 5%       |
      | TXN-203     | Entity-B  | 2000        | 0%       |
    When the user generates the "Transaction Details Tax Report - Revenue" and selects "Civil Aviation" as the filter
    Then only TXN-201 and TXN-202 are displayed
    And the total VAT for Civil Aviation is 100.00 AED (5% of 2000)

  @positive @e2e
  Scenario: Switching entity filter updates the report instantly
    When the user changes the revenue entity filter from "Civil Aviation" to "Entity-B"
    Then the report reloads and shows only Entity-B transactions with zero VAT

  @negative @rbac
  Scenario: Entity-restricted user can only view their own entity
    Given the user is logged in as a restricted "Civil Aviation Accountant" with scope limited to Civil Aviation
    When the user opens the "Transaction Details Tax Report - Revenue"
    Then the entity filter is locked to "Civil Aviation" or shows only Civil Aviation data by default
    And attempting to manually change the filter parameter via URL returns access denied or no data

  @negative
  Scenario: Filtering by an entity with no transactions
    When the user filters by a newly created entity that has never processed a transaction
    Then the report displays "No data found" without errors
