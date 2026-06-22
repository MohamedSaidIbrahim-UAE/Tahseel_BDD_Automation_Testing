Feature: Deposits Statement Report
  As a deposit account holder, I want a chronological statement of all transactions
  on my deposit account, so that I can reconcile my records.

  Background:
    Given the user is logged in as "Finance Admin"
    And a deposit account "DEP-STMT-01" is opened for Entity-A with initial balance 0

  @positive @e2e
  Scenario: Full lifecycle – statement generation after multiple transactions
    Given an initial deposit of 5000 AED is made into "DEP-STMT-01" on 2026-06-10
    And an additional deposit of 3000 AED on 2026-06-11
    And a refund of 2000 AED on 2026-06-12
    And a retain (confiscation) of 1000 AED on 2026-06-13
    When the user runs the "Deposits Statement Report" for "DEP-STMT-01" from 2026-06-10 to 2026-06-13
    Then the report shows the following transactions in order:
      | Date       | Description        | Amount  | Balance |
      | 2026-06-10 | Initial Deposit    | 5000.00 | 5000.00 |
      | 2026-06-11 | Additional Deposit | 3000.00 | 8000.00 |
      | 2026-06-12 | Refund             | -2000.00| 6000.00 |
      | 2026-06-13 | Retain             | -1000.00| 5000.00 |
    And the closing balance is 5000.00 AED

  @positive @filter
  Scenario: Filter by date range
    When the user sets the range to 2026-06-11 to 2026-06-12
    Then only the deposit and refund on those dates appear

  @negative
  Scenario: Non-existent account number
    When the user enters an invalid account number "INVALID-DEP"
    Then "Account not found" is displayed

  @negative @rbac
  Scenario: Only authorised roles can view statements
    Given the user is "Customer Support"
    Then access is denied
