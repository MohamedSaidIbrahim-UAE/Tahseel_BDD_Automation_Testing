Feature: Detailed Report of POS Transactions by Revenue Source
  As a POS operations analyst, I need a detailed report of all POS (point-of-sale) transactions
  broken down by revenue entity, so that I can audit terminal-level fee collections.

  Background:
    Given the user is logged in as "Finance Admin"
    And POS terminals "POS-101" and "POS-102" are registered to Civil Aviation and Entity-B respectively

  @positive @e2e
  Scenario: POS transaction detail
    Given the following POS transactions are processed:
      | Terminal | Amount | Entity   |
      | POS-101  | 500    | Civil Aviation |
      | POS-101  | 300    | Civil Aviation |
      | POS-102  | 700    | Entity-B |
    When the user runs the "Detailed Report of POS Transactions by Revenue Source"
    Then all three transactions appear with terminal IDs and revenue entities
    And the total for Civil Aviation is 800.00 AED and for Entity-B 700.00 AED

  @negative
  Scenario: POS terminal not mapped to any entity (orphan)
    Given a POS terminal "POS-999" with no entity mapping processes a transaction
    When the report is run, that transaction appears under "Unmapped" or is flagged for review
