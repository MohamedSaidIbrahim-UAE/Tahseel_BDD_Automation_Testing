Feature: Dashboard

  Background:
    Given the user is logged in as "Finance Admin"
    And dashboard widgets include "Today's Transactions", "Pending Approvals", and "Monthly Revenue"

  @positive
  Scenario: Widgets load with correct data
    When the dashboard opens
    Then each widget displays data matching the underlying transaction records for the current user's scope
    And clicking "Today's Transactions" drills down to the detailed list

  @negative
  Scenario: Widget with no data
    When there are no transactions for the current day
    Then the widget shows "No data" or 0 values without breaking the layout

  @negative @rbac
  Scenario: Role-based widget visibility
    Given the user is a "Merchant User"
    Then the "Monthly Revenue" widget is either hidden or shows only the merchant's own data
