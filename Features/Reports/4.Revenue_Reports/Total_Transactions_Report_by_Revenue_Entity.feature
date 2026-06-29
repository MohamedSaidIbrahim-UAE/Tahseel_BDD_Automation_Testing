Feature: Total Transactions Report by Revenue Entity
  As a department head, I need an aggregated summary of transaction volumes and fees per revenue entity,
  so that I can monitor total revenues generated for each department.

  Background:
    Given the user is logged in as "Finance Admin"

  # ── Tag: @total-transactions-revenue isolates the Before hook so only
  #        this report's step definitions initialise their page object,
  #        keeping the test output clean for the business analyst.
  # ── Tag: @authenticated loads storageState.<env>.json into the browser context.

  @revenue @automated @authenticated @total-transactions-revenue @smoke
  Scenario: Report page loads via side-menu with default filters
    When the user navigates via side menu to "Total Transactions report by revenue entity"
    Then the report filter page should be displayed
    And the "Payment Method" filter should show "ALL"
    And all filter dropdowns should default to "ALL"

  @revenue @automated @authenticated @total-transactions-revenue @positive
  Scenario: Generate report for current year with all payment methods
    When the user navigates via side menu to "Total Transactions report by revenue entity"
    And the user selects "ALL" for every filter dropdown
    And the user sets the date range from the first day of the current year to today
    And the user clicks "Show Report"
    Then the report should load without errors
    And the report title should contain "Total Transactions"

  @revenue @automated @authenticated @total-transactions-revenue @negative
  Scenario: Report shows empty state for a future date range
    When the user navigates via side menu to "Total Transactions report by revenue entity"
    And the user selects a future date range
    And the user clicks "Show Report"
    Then the report should display an empty or no-data message

  @revenue @automated @authenticated @total-transactions-revenue @rbac @negative
  Scenario: Entity-limited user can only see their own entity summary
    Given the user is "Entity-A Restricted Accountant"
    When the user navigates via side menu to "Total Transactions report by revenue entity"
    And the user selects "ALL" for every filter dropdown
    And the user clicks "Show Report"
    Then only data for the user's assigned entity should appear
