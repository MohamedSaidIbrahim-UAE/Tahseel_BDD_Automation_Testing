Feature: Traffic Violations Report – Vehicle and Drivers Licensing Departments
  As a traffic department auditor, I need a detailed report of traffic violation payments,
  so that I can reconcile fine collections.

  Background:
    Given the user is logged in as "Finance Admin"
    And traffic violation services are configured

  @positive @e2e
  Scenario: Traffic fine payments detail
    Given three traffic fine payments of 500, 300, and 200 AED are processed
    When the user runs the "Traffic Violations Report"
    Then all three fines appear with violation numbers, amounts, and payment methods
    And the total collected is 1000.00 AED

  @negative @rbac
  Scenario: Only traffic department users can access
    Given the user is from a non-traffic entity
    When accessing the report, it is either empty or access is restricted
