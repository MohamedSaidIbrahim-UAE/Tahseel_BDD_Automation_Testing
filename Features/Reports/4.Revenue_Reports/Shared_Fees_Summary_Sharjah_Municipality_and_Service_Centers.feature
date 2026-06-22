Feature: Shared Fees Summary – Sharjah Municipality and Service Centers
  As a municipality finance officer, I need a summary of shared fees between Sharjah Municipality
  and Tasheel centers, so that I can calculate the service center’s commission.

  Background:
    Given the user is logged in as "Finance Admin"
    And the sharing rule between Sharjah Municipality and service centers is 80% Municipality, 20% Center for specific services

  @positive @e2e
  Scenario: Verify shared fee summary
    Given a total of 20000.00 AED is collected at service centers for shared services
    When the user runs the "Total shared fees between Sharjah Municipality and service centers" report
    Then the Municipality share is 16000.00 AED and the service centers share is 4000.00 AED

  @negative @rbac
  Scenario: Center manager can only see their center’s share
    Given the user is a "Service Center Manager" for Center-1
    When the report is generated, only Center-1’s share is displayed
