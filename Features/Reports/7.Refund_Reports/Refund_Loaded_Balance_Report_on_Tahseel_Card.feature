Feature: Refund Loaded Balance Report on Tahseel Card
  As a card services officer, I need a report of refunds specifically for loaded balance
  returned from a Tahseel card, so that I can audit card balance reversals.

  Background:
    Given the user is logged in as "Finance Admin"
    And a Tahseel card "TC-REF-01" has a loaded balance of 1000 AED
    And refunds of loaded balances are permitted

  @positive @e2e
  Scenario: Refund of loaded balance and report verification
    When a refund request is made to return 400 AED from card "TC-REF-01"
    And the refund is processed successfully
    And the user runs the "Refund loaded balance report on Tahseel card" for today
    Then the report shows:
      | Card Number | Refund Amount | Remaining Balance | Reason          |
      | TC-REF-01   | 400.00        | 600.00            | Balance refund  |
    And the total refunded amount across all cards is 400.00 AED

  @negative
  Scenario: Attempt to refund more than loaded balance fails
    Given the card balance is 100 AED
    When a refund of 200 AED is requested
    Then the request is rejected with "Insufficient balance"
    And the report does not include this rejected request

  @negative @rbac
  Scenario: Only card management roles can view
    Given the user is "Money Loader User"
    Then access is denied
