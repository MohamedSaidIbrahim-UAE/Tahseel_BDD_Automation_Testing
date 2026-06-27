Feature: Departments and Service Rules Management

  Background:
    Given the user is logged in as "Master Data Admin"

  @positive
  Scenario: Create department and assign to entity
    When the user creates department "Finance" under Civil Aviation
    Then it appears in the hierarchy and can be assigned to users

  @positive
  Scenario: Update service rule fee
    When the user changes the fee of service "SRV-100" from 50 to 75 AED
    Then new transactions use the new fee; historical transactions remain unchanged

  @negative
  Scenario: Delete department with active users
    When the user tries to delete "Finance" that still has users
    Then the system prevents deletion with message "Department has assigned users"

  @negative
  Scenario: Negative fee
    When the user attempts to set a negative fee for a service
    Then the system rejects with "Fee cannot be negative"
