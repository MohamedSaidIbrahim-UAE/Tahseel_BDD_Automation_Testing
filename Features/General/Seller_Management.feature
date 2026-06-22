Feature: Seller Management

  Background:
    Given the user is logged in as "Seller Admin"

  @positive
  Scenario: Create seller type and seller
    When the user creates a seller type "Retail"
    And creates a seller "Best Books" under that type
    Then the seller can be used in transactions

  @negative
  Scenario: Delete seller with transaction history
    When trying to delete a seller that has transactions, the system prevents it
