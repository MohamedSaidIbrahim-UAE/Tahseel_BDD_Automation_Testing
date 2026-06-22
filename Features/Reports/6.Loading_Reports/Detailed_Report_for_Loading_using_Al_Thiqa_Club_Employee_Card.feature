Feature: Detailed Report for Loading using Al Thiqa Club Employee Card
  As a loyalty program administrator, I need to see all loading transactions that used
  an Al Thiqa Club employee card as the source of funds, so I can reconcile club disbursements.

  Background:
    Given the user is logged in as "Finance Admin"
    And Al Thiqa Club employee card "ATH-EMP-001" is issued with sufficient balance

  @positive @e2e
  Scenario: Load using employee card and verify report
    When a load of 1000 AED is performed onto Tahseel card "TC-123" using "ATH-EMP-001" as source
    And the user runs the "Detailed report for Loading using Al Thiqa Club employee card" for today
    Then the report shows:
      | Source Card    | Target Card | Amount |
      | ATH-EMP-001    | TC-123      | 1000.00|
    And the employee card's deducted amount is also recorded

  @negative
  Scenario: No loads using employee cards
    When the report is run on a date with no such loads
    Then "No Al Thiqa Club employee card loads found" is displayed

  @negative @rbac
  Scenario: Non‑club admin cannot access
    Given the user is "Regular Finance User"
    Then access is denied
