Feature: System Settings

  Background:
    Given the user is logged in as "System Admin"

  @positive
  Scenario: Toggle feature off
    When the admin disables the "Cheques" feature
    Then the Cheques menu disappears for all users
    And attempting to create a cheque transaction is blocked

  @positive
  Scenario: Create custom role with limited scope
    When a new role "Entity-A Agent" is created with scope only for Entity-A
    And assigned to a user
    Then that user sees only Entity-A data across all modules

  @negative
  Scenario: Delete a scope that is assigned to users
    When the admin tries to delete a scope still in use
    Then the system warns "Scope is assigned to X users, cannot delete"
