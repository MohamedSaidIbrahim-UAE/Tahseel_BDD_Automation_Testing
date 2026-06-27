Feature: Service List Report (Government Fees Report)
  As a service configuration analyst, I want a list of all government services with their fees,
  so that I can ensure the fee schedule is up to date and properly published.

  Background:
    Given the user is logged in as "Finance Admin"
    And the system has a master list of services with fees

  @positive @e2e
  Scenario: Verify service list reflects current master data
    When the user adds a new service "SRV-NEW" with fee 150.00 AED
    And updates the fee of "SRV-100" from 100.00 to 120.00 AED
    Then the user runs the "Service List Report"
    And the report includes "SRV-NEW" with fee 150.00 AED
    And the fee for "SRV-100" is shown as 120.00 AED
    And all active services are listed

  @negative
  Scenario: Service that was deactivated does not appear in active list
    Given service "SRV-OLD" is deactivated
    When the user runs the active services report
    Then "SRV-OLD" is not displayed

  @negative @rbac
  Scenario: Non-admin role cannot view service fee list
    Given the user is "Support Agent"
    When accessing the service list report
    Then access is denied
