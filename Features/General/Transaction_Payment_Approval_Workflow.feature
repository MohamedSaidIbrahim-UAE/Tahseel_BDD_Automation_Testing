Feature: Transaction Payment Approval Workflow

  Background:
    Given the user is logged in as "Payment Initiator"

  @positive
  Scenario: Submit and approve payment request
    When the user creates a payment request for 10,000 AED
    And the designated approver approves it
    Then the payment is processed

  @negative
  Scenario: Reject payment request
    When the approver rejects with "Insufficient supporting documents"
    Then the request is returned with the rejection reason

  @negative
  Scenario: Request exceeds user's limit
    When a user tries to submit a payment above their approval limit, it is blocked
