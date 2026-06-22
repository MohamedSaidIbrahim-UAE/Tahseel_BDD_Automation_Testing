Feature: Bank Transfers of Transaction Fees – Receipts

  @positive @e2e
  Scenario: Fee receipts aggregation
    Given two fee receipt bank transfers of AED 50 and AED 70 are posted against credit card fees
    When the user runs the "Bank transfers of transaction fees - receipts" report
    Then the total is AED 120.00
    And each receipt matches the original fee transaction reference

  @negative
  Scenario: Duplicate receipt entry handled gracefully
    Given a receipt with ID "RCP-001" already exists
    When an attempt is made to process a duplicate receipt with the same ID
    Then the report either flags the duplicate or the posting is rejected, preventing double counting
