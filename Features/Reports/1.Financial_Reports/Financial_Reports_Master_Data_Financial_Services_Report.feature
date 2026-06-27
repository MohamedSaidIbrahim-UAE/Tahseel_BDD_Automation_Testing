Feature: Financial Reports – Master Data (Financial Services Report)

  Background:
    Given the user is logged in as "Finance Admin" with full report access
    And the system is prepared with base configuration (entities, payment methods, banks)

  @positive @e2e
  Scenario: Full lifecycle of a financial service item and its reflection in the report
    When the user navigates to "ServiceRules" and creates a new service item "SRV-100" with a fee of 2.5%
    And the user posts a payment transaction using that service item via credit card for AED 1000
    And the user runs the "Financial Services Report" for today's date
    Then the report shows "SRV-100" as active
    And the transaction fee column shows "25.00 AED" for that service item
    And the total fees for all services is calculated correctly

  @negative @e2e
  Scenario: Deactivated service item should appear historically but not break totals
    Given an existing service item "SRV-200" with previous transactions
    When the user deactivates "SRV-200" via the service rules page
    And the user runs the "Financial Services Report" for a past period where it was active
    Then the report includes "SRV-200" with its historical transactions
    And the item status is shown as "Inactive"
    And the grand total still matches the sum of all active and inactive items for that period
