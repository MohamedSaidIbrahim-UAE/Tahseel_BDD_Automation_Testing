Feature: Workflow Management

  Background:
    Given the user is logged in as "Workflow Admin"
    And the system supports creating approval workflows for refunds, payments, adjustments, and pre-auth transactions

  @positive
  Scenario: Create a 2-step refund approval workflow
    When the user defines a workflow with steps: "Supervisor" then "Manager"
    And assigns specific users/roles to each step
    Then the workflow is saved and becomes available for new refund requests

  @positive
  Scenario: Transaction follows workflow correctly
    Given an active refund workflow as above
    When a refund request is submitted
    Then it enters "Pending Supervisor" status
    When the Supervisor approves
    Then it moves to "Pending Manager"
    When the Manager approves
    Then it becomes "Approved" and the refund is processed

  @negative
  Scenario: Rejection returns request
    When the Supervisor rejects the request with reason "Insufficient documentation"
    Then the request returns to the initiator with status "Rejected" and reason visible

  @negative
  Scenario: Modify workflow after transactions are in progress
    Given a refund request is in "Pending Supervisor" using Workflow V1
    When the admin updates the workflow to V2 (3 steps)
    Then the existing request continues with V1 until completion; new requests use V2

  @negative @rbac
  Scenario: Unauthorised user cannot edit workflows
    Given the user is a "Regular Agent"
    Then workflow configuration pages are inaccessible
