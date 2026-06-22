Feature: Pre-Authorized Transactions for Book Publishers

  Background:
    Given the user is logged in as "Book Fair Finance"

  @positive
  Scenario: Create and complete a pre-auth
    When a pre-auth of 2000 AED is created for granted card "GF-CARD-01"
    And later the transaction is completed
    Then the card balance is reduced accordingly and the transaction appears in reports

  @negative
  Scenario: Pre-auth expiration
    When a pre-auth is not completed within the allowed time, it expires and the hold is released
