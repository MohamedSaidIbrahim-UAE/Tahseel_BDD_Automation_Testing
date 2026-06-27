Feature: Seller Refund Request

  Background:
    Given the user is logged in as "Seller Support"

  @positive
  Scenario: Create and process seller refund
    When a seller refund request for 500 AED is submitted with reason "Goods returned"
    And approved
    Then the seller's deposit account is debited by 500 AED

  @negative
  Scenario: Exceed seller's deposit balance
    When the refund amount exceeds the available deposit, the system rejects
