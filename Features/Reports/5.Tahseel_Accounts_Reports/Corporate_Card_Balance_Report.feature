Feature: Corporate Card Balance Report
  As a corporate account manager, I need a snapshot of the current balances of all corporate Tahseel cards,
  so that I can inform companies of their remaining funds.

  Background:
    Given the user is logged in as "Finance Admin"
    And corporate cards are issued to companies

  @positive @e2e
  Scenario: Report shows current balances
    Given corporate card "CORP-1001" for Company-A has a balance of 30000 AED
    And corporate card "CORP-1002" for Company-B has a balance of 15000 AED
    When the user runs the "Corporate Card Balance Report"
    Then the report displays:
      | Card Number | Company    | Balance |
      | CORP-1001   | Company-A  | 30000   |
      | CORP-1002   | Company-B  | 15000   |
    And the total corporate balance is 45000 AED

  @negative @rbac
  Scenario: Company user sees only their own card balance
    Given the user is "Company-A Admin"
    When the report is viewed, only "CORP-1001" appears
