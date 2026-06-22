Feature: Transaction Cancellation

  Background:
    Given the user is logged in as "Finance Officer"
    And a transaction "TXN-001" with status "Completed" exists

  @positive
  Scenario: Cancel a transaction
    When the user creates a cancellation request for "TXN-001" with reason "Customer request"
    And it is approved
    Then the transaction status changes to "Cancelled"
    And a refund process is initiated if applicable

  @negative
  Scenario: Cancel an already cancelled transaction
    When trying to cancel a transaction that is already "Cancelled"
    Then the system prevents it with "Transaction already cancelled"

  @negative
  Scenario: Unauthorised cancellation
    Given the user is a "Read-only Agent"
    Then the cancel menu is not accessible
