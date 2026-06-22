Feature: Business Intelligence Dashboards

  Background:
    Given the user is logged in as "BI Analyst" with full BI access
    And the BI data warehouse is synchronised with the operational database

  @positive
  Scenario Outline: Dashboard loads with correct data
    When the user opens "<Dashboard>"
    Then all charts and KPIs render without error
    And the total transaction count matches the count from the detailed transaction report for the same period
    And filters like date range and entity update the visuals correctly

    Examples:
      | Dashboard |
      | Transactions Analysis |
      | Transactions Details |
      | Exempt Transactions |
      | Entity Services Analysis |
      | Merchant Transactions |
      | Transactions Map |
      | Tahseel Accounts |
      | Tahseel Cards |

  @negative
  Scenario: No data for selected period
    When the user sets a future date range
    Then all widgets display "No data" or zeros

  @negative @rbac
  Scenario: Restricted user cannot access BI
    Given the user is an "Operator"
    When attempting to open any BI dashboard
    Then access is denied
