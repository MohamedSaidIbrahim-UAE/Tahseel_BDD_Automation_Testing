Feature: Detailed Transactions Report
  As a finance officer, I need a line‑by‑line list of all transactions with full details,
  so that I can audit every financial movement.

  Background:
    Given the user is logged in as "Finance Admin"
    And the system has service "SRV‑100" (fee 50 AED) and service "SRV‑200" (fee 0 AED)
    And entity "Entity‑A" and "Entity‑B" are configured

  @positive @e2e
  Scenario: Full lifecycle – post transactions and verify detailed report
    When the user posts the following transactions on 2026‑06‑10:
      | TXN ID | Service  | Entity   | Amount | Payment Method |
      | T001   | SRV‑100  | Entity‑A | 500    | Credit Card    |
      | T002   | SRV‑200  | Entity‑B | 1000   | Cheque         |
    And the user runs the "Detailed Transactions Report" for today
    Then the report lists both transactions with service names, entities, amounts, payment methods, and statuses
    And the grand total amount is 1500.00 AED

  @positive @filter
  Scenario: Filter by payment method
    When the user filters by "Credit Card"
    Then only T001 is displayed

  @negative
  Scenario: No transactions for a future date
    When the user selects a future date
    Then the report shows "No data found"

  @negative @rbac
  Scenario: Unauthorised role denied
    Given the user is "Collector"
    When accessing the report, "Access Denied" is returned
