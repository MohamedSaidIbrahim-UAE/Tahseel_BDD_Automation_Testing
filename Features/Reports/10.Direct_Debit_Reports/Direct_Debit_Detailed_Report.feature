Feature: Direct Debit Detailed Report
  As a reconciliation officer, I need a line‑by‑line detailed report of all direct debit transactions,
  so that I can verify individual deductions and their statuses.

  Background:
    Given the user is logged in as "Finance Admin"
    And direct debit payment method is active
    And a direct debit mandate for account "DD‑ACC‑101" (Entity‑A, Bank A) is active
    And service "SRV‑300" has a direct debit fee of 2% (minimum 5 AED)
    And service "SRV‑400" has no direct debit fee

  @positive @e2e
  Scenario: Full lifecycle – post transactions and view detailed listing
    When the user posts the following direct debit transactions on 2026‑06‑10:
      | Transaction ID | Account     | Service  | Amount (AED) |
      | DDD‑001        | DD‑ACC‑101  | SRV‑300  | 1000.00      |
      | DDD‑002        | DD‑ACC‑101  | SRV‑400  | 500.00       |
    And the user runs the "Direct Dept Detailed Report" for 2026‑06‑10
    Then the report lists both transactions with:
      | Transaction ID | Account     | Service  | Amount | Fee  | Status    |
      | DDD‑001        | DD‑ACC‑101  | SRV‑300  | 1000.00| 20.00| Completed |
      | DDD‑002        | DD‑ACC‑101  | SRV‑400  | 500.00 | 0.00 | Completed |
    And the total fee for all transactions is 20.00 AED

  @positive @filter
  Scenario: Filter by account number
    When the user filters the report by account "DD‑ACC‑101"
    Then only transactions for that account are displayed

  @positive @filter
  Scenario: Filter by date range
    When the user sets the date range from 2026‑06‑09 to 2026‑06‑10
    And only DDD‑001 was posted on 2026‑06‑10 (yesterday none)
    Then the report shows only DDD‑001

  @positive @filter
  Scenario: Filter by status
    Given a direct debit transaction "DDD‑003" with status "Pending"
    When the user filters by "Pending"
    Then only "DDD‑003" appears

  @positive @e2e
  Scenario: Transaction status lifecycle reflected in report
    Given a direct debit transaction "DDD‑004" is initiated and is in "Pending" status
    When the user runs the detailed report, it shows status "Pending"
    When the transaction is later cleared and status becomes "Completed"
    And the user re‑runs the report
    Then the status for "DDD‑004" is updated to "Completed"

  @negative
  Scenario: Non‑existent account filter returns no results
    When the user filters by a non‑existent account number "INVALID‑DD‑ACC"
    Then the report displays "No matching transactions found"

  @negative
  Scenario: Failed direct debit appears with correct status and error reason
    Given a direct debit transaction "DDD‑005" for 2000 AED failed due to "Insufficient funds"
    When the user runs the detailed report
    Then "DDD‑005" is listed with status "Failed" and reason "Insufficient funds"
    And the amount is not included in the completed totals

  @negative @rbac
  Scenario: Unauthorised role cannot access detailed report
    Given the user is logged in as "Customer Support"
    When the user attempts to open the "Direct Dept Detailed Report"
    Then an "Access Denied" message is returned

  @negative @rbac
  Scenario: Entity‑restricted user only sees their own entity's detailed transactions
    Given the user is logged in as "Entity‑A Accountant"
    When the user runs the detailed report
    Then only transactions for Entity‑A accounts appear; any Entity‑B transactions are hidden

  @negative
  Scenario: Report with no data for the selected period
    When the user selects a date range with no direct debit activity
    Then the system displays "No direct debit transactions found"

  @negative
  Scenario: Direct debit with zero amount (adjustment) appears correctly
    Given a direct debit transaction "DDD‑006" with amount 0.00 AED exists (e.g., fee adjustment)
    When the user runs the detailed report
    Then "DDD‑006" appears with amount 0.00 and fee 0.00, and does not break totals
