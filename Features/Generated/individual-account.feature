Feature: Individual Account - Emirate ID Management
  
  As a user
  I want to interact with the Individual Account module
  So that I can manage individual accounts and emirate IDs

  Background:
    Given the user is authenticated
    And the user navigates to the "Individual Account" module

  Scenario: Load module page successfully
    When the user opens the module
    Then the module page should load
    And the page title should display "Individual Account"
    And all main elements should be visible

  Scenario: Submit form with valid data
    Given the form is open
    When the user fills account form with valid data
    And the user submits the form
    Then the success message should be displayed
    And the form should close

  Scenario: View data in table
    Given the module page is loaded
    When the user views the data table
    Then the table should display valid records
    And the table should contain at least one row

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

  Scenario: Handle boundary values correctly
    Given the form is open
    When the user enters boundary value data
    Then the data should be processed successfully
    And the result should be valid
