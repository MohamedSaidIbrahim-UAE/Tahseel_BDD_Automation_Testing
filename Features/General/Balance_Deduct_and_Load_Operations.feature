Feature: Balance Deduct and Load Operations

  Background:
    Given the user is logged in as "Money Loader"
    And a Tahseel card "TC-100" has a balance of 500 AED

  @positive
  Scenario: Successful load
    When the user creates a load request of 200 AED for "TC-100" with reason "Top-up"
    And the request is approved
    Then the card balance becomes 700 AED

  @positive
  Scenario: Successful deduct
    When the user creates a deduct request of 100 AED with reason "Fee correction"
    And it is approved
    Then the balance becomes 600 AED

  @negative
  Scenario: Deduct exceeds balance
    When the user attempts a deduct of 600 AED
    Then the system rejects with "Insufficient balance"

  @negative
  Scenario: Load negative amount
    When the user enters -100 AED in a load request
    Then a validation error "Amount must be positive" is displayed

  @negative @rbac
  Scenario: Unauthorised load
    Given the user is a "Cardholder"
    Then the load/deduct menu is not visible
