Feature: Detailed Deposit Retain Transactions
  As a compliance officer, I need a detailed log of all deposit retentions (confiscations),
  so that I can review the justification and amounts for each case.

  Background:
    Given the user is logged in as "Finance Admin"
    And a deposit account "DEP-RET-01" belonging to Civil Aviation has a balance of 10000 AED
    And a retain reason "Violation of terms" is configured

  @positive @e2e
  Scenario: Full cycle – retain a deposit and verify detailed report
    When a retain of 2000 AED is applied to "DEP-RET-01" with reason "Violation of terms"
    And the retain is approved
    And the user runs the "Detailed Deposit Retain Transactions" report for today
    Then the report lists:
      | Account    | Retain Amount | Reason            | Status    |
      | DEP-RET-01 | 2000.00       | Violation of terms| Completed |
    And the remaining balance in "DEP-RET-01" is 8000 AED

  @positive @filter
  Scenario: Filter by reason
    When the user filters the report by reason "Violation of terms"
    Then only retains with that reason appear

  @negative
  Scenario: No retain transactions in period
    When the user selects a period with no retains
    Then "No retain transactions found" is displayed

  @negative @rbac
  Scenario: Non-compliance role cannot view
    Given the user is "Entity Accountant"
    Then access is denied
