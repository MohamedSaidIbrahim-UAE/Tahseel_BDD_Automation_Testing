Feature: Cancelled Refund Requests View

  Background:
    Given the user is logged in as "Finance Admin"
    And there are refund requests in various statuses: completed, pending, and cancelled

  @positive
  Scenario: View only cancelled refund requests
    When the user navigates to "Cancelled refund requests"
    Then only refund requests with status "Cancelled" are displayed
    And each entry shows cancellation reason and date

  @negative
  Scenario: No cancelled requests
    When there are no cancelled refunds
    Then the list displays "No cancelled refund requests found"

  @negative @rbac
  Scenario: Unauthorised access
    Given the user is a "Collector"
    Then the page is inaccessible (403)
