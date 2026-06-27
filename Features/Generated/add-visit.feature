Feature: Add Visit - Add Visit
  As a user
  I want to interact with the Add Visit module
  So that I can manage and track add visit

  Background:
    Given the user is authenticated
    And the user navigates to the "Add Visit" module
  # POSITIVE SCENARIOS

  Scenario: Load module page successfully
    When the user opens the module
    Then the module page should load
    And the page title should display "Add Visit"
    And all main elements should be visible
  # NEGATIVE SCENARIOS

  Scenario: Display validation error for invalid input
    Given the form is open
    When the user enters invalid data in a required field
    Then the validation error should be displayed
    And the form should not submit

  Scenario: Prevent submission with missing required fields
    Given the form is open
    When the user tries to submit without filling required fields
    Then the validation errors should be displayed
    And the form should remain open

  Scenario: Handle duplicate entry gracefully
    Given the module page is loaded
    When the user attempts to create a duplicate entry
    Then an appropriate error message should be displayed
    And the duplicate entry should not be created
  # EDGE CASES

  Scenario: Handle boundary values correctly
    Given the form is open
    When the user enters boundary value data
    Then the data should be processed successfully
    And the result should be valid
