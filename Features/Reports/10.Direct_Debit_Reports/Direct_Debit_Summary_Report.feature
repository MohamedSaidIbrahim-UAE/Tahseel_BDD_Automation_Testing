Feature: Direct Debit Summary Report
  As a treasury analyst, I need an aggregated summary of direct debit transactions per period,
  so that I can monitor the total volume and fees of direct debit collections.

  Background:
    Given the user is logged in as "Finance Admin"
    And the direct debit payment method is enabled
    And a direct debit mandate is active for account "DD‑ACC‑001" (Bank X, Entity‑A)
    And another direct debit mandate is active for account "DD‑ACC‑002" (Bank Y, Entity‑B)
    And service "SRV‑100" has a direct debit fee of 1% (minimum 0 AED)
    And service "SRV‑200" has no direct debit fee

  @positive @e2e
  Scenario: Full lifecycle – post multiple direct debit transactions and verify summary
    When the user posts the following direct debit transactions on 2026‑06‑10:
      | Transaction ID | Account     | Service  | Amount (AED) |
      | DD‑001         | DD‑ACC‑001  | SRV‑100  | 1000.00      |
      | DD‑002         | DD‑ACC‑001  | SRV‑200  | 500.00       |
      | DD‑003         | DD‑ACC‑002  | SRV‑100  | 2000.00      |
    And the user runs the "Direct Dept Summary Report" for 2026‑06‑10
    Then the report shows:
      | Metric               | Value      |
      | Total Count          | 3          |
      | Total Amount         | 3500.00    |
      | Total Direct Debit Fees | 30.00   |
      | Count for Entity‑A   | 2          |
      | Amount for Entity‑A  | 1500.00    |
      | Count for Entity‑B   | 1          |
      | Amount for Entity‑B  | 2000.00    |

  @positive @filter
  Scenario: Filter summary by entity
    When the user filters the report by "Entity‑A"
    Then the report shows 2 transactions, total amount 1500.00 AED, and total fee 10.00 AED (1% of 1000)

  @positive @e2e
  Scenario: Zero fee when all transactions are fee‑exempt
    Given the user posts only SRV‑200 transactions (no fee)
    When the user runs the summary report
    Then the total direct debit fees is 0.00 AED

  @negative
  Scenario: No direct debit transactions in the selected period
    When the user selects a future date range with no activity
    And runs the report
    Then the system displays "No direct debit transactions found"

  @negative
  Scenario: Direct debit with failed status excluded from summary
    Given a direct debit transaction "DD‑004" with status "Failed"
    When the user runs the summary report
    Then "DD‑004" is not counted in total count or amount
    And a separate line or note shows "Failed transactions: 1" (if applicable)

  @negative @rbac
  Scenario: Unauthorised role cannot view the summary report
    Given the user is logged in as "Tasheel Operator"
    When the user attempts to open the "Direct Dept Summary Report"
    Then an "Access Denied" message is returned

  @negative @rbac
  Scenario: Entity‑restricted user sees only own entity's summary
    Given the user is logged in as "Entity‑A Accountant" with scope limited to Entity‑A
    When the user runs the summary report
    Then only transactions for Entity‑A appear, even if Entity‑B has data
