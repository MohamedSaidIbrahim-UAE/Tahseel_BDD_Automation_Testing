Feature: Federal Bank Transfer Detail Report

  Background:
    Given two federal entities "Civil Aviation" and "Entity-B" exist with bank accounts

  @positive @e2e
  Scenario: Filter transfers by entity
    Given a SIB transfer of AED 10,000 for "Civil Aviation" and AED 20,000 for "Entity-B" are processed
    When the user runs the "Fedral Bank Transfer Detail Report" and filters by "Civil Aviation"
    Then only the AED 10,000 transfer appears
    And the total matches the filter

  @negative @rbac
  Scenario: User from Civil Aviation cannot see Entity-B transfers
    Given the user is logged in as "Civil Aviation Restricted User"
    When the user runs the federal transfer report
    Then only Civil Aviation transfers are shown, even if the filter dropdown is manipulated
