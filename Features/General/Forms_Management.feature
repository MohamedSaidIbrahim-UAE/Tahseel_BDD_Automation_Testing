Feature: Forms Management

  Background:
    Given the user is logged in as "Forms Admin"
    And the system allows form creation with fields of type text, number, date, and dropdown

  @positive
  Scenario: Create and publish a form
    When the user creates a form "Service Application" with fields "Name (text, mandatory)", "Age (number, optional)"
    And publishes the form
    Then the form appears in the list of active forms
    And can be used when initiating a new service request

  @negative
  Scenario: Submit form with missing mandatory field
    When a user fills the form but leaves "Name" empty
    Then the system shows validation error "Name is required"
    And the form is not submitted

  @negative
  Scenario: Attempt to delete a form already used in transactions
    Given form "Service Application" has been used in at least one transaction
    When the admin tries to delete it
    Then the system prevents deletion and shows "Form is in use, cannot be deleted"
