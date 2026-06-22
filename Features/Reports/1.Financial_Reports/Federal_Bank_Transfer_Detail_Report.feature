Feature: Federal Bank Transfer Detail Report

  Background:
    Given two federal entities "Entity-A" and "Entity-B" exist with bank accounts

  @positive @e2e
  Scenario: Filter transfers by entity
    Given a SIB transfer of AED 10,000 for "Entity-A" and AED 20,000 for "Entity-B" are processed
    When the user runs the "Fedral Bank Transfer Detail Report" and filters by "Entity-A"
    Then only the AED 10,000 transfer appears
    And the total matches the filter

  @negative @rbac
  Scenario: User from Entity-A cannot see Entity-B transfers
    Given the user is logged in as "Entity-A Restricted User"
    When the user runs the federal transfer report
    Then only Entity-A transfers are shown, even if the filter dropdown is manipulated
