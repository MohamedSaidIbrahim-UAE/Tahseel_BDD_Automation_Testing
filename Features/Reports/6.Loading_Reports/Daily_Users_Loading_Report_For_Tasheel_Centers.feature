Feature: Daily Users Loading Report For Tasheel Centers
  As a Tasheel center supervisor, I need a daily breakdown of loading operations
  performed by each user (operator) at the centers, so I can measure staff productivity.

  Background:
    Given the user is logged in as "Finance Admin"
    And Tasheel center "Center-1" has users "User1" and "User2"

  @positive @e2e
  Scenario: Multiple users performing loads
    Given "User1" loads a total of 3000 AED today across 5 transactions
    And "User2" loads a total of 1500 AED today across 2 transactions
    When the user runs the "Daily Users Loading Report For Tasheel Centers" for today and center "Center-1"
    Then the report shows:
      | User  | Load Count | Total Loaded |
      | User1 | 5          | 3000.00      |
      | User2 | 2          | 1500.00      |
    And the center total is 4500.00 AED

  @positive @filter
  Scenario: Filter by specific user
    When the user filters the report by "User1"
    Then only User1's statistics are shown

  @negative
  Scenario: No loading activity at the center for the day
    When the report is run for a day with no loads
    Then "No activity recorded" appears for the center

  @negative @rbac
  Scenario: Center manager can only view their own center
    Given the user is "Center-1 Manager"
    When viewing the report, the center filter is locked to "Center-1" and only its data is shown
