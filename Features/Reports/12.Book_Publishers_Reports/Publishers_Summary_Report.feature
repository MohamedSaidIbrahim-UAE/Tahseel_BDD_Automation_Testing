Feature: Publishers Summary Report
  As a publishing department manager, I need an aggregated summary of transaction volumes and amounts
  per publishing house, so that I can track each publisher's activity and revenue.

  Background:
    Given the user is logged in as "Finance Admin"
    And the following publishing houses are registered as entities:
      | Publisher Code | Name                      |
      | PUB-001        | Dar Al‑Kitab              |
      | PUB-002        | Sharjah Publishing House  |
      | PUB-003        | Emirates Books            |
    And all publishers are active
    And service "BK-SALE" (book sale) has a 5% fee

  @positive @e2e
  Scenario: Full lifecycle – create publishers, post transactions, and verify summary
    When the following book sale transactions are posted on 2026‑06‑10:
      | Transaction ID | Publisher | Amount (AED) |
      | TXN-P001       | PUB-001   | 1000.00      |
      | TXN-P002       | PUB-001   | 500.00       |
      | TXN-P003       | PUB-002   | 2000.00      |
    And the user runs the "Publishers Summary Report" for 2026‑06‑10
    Then the report shows:
      | Publisher               | Transaction Count | Total Amount |
      | Dar Al‑Kitab            | 2                 | 1500.00      |
      | Sharjah Publishing House| 1                 | 2000.00      |
      | Emirates Books          | 0                 | 0.00 (or omitted) |
    And the grand total for all publishers is 3500.00 AED

  @positive @filter
  Scenario: Filter summary by a specific publisher
    When the user filters the report by "Dar Al‑Kitab"
    Then only the row for PUB-001 is displayed with count 2 and amount 1500.00 AED

  @positive @filter
  Scenario: Filter by date range
    Given TXN-P001 was posted on 2026‑06‑09 and TXN-P002 on 2026‑06‑10
    When the user selects date range 2026‑06‑10 to 2026‑06‑10
    Then only TXN-P002 is counted for PUB-001

  @negative
  Scenario: No transactions for any publisher in the selected period
    When the user selects a future date with no activity
    Then the report displays "No publisher transactions found" or all rows show zeros

  @negative @rbac
  Scenario: Unauthorised role cannot view the summary
    Given the user is logged in as "Tasheel Operator"
    When the user attempts to open the "Publishers Summary Report"
    Then an "Access Denied" message is returned

  @negative @rbac
  Scenario: Publisher‑limited user only sees own data
    Given the user is "Dar Al‑Kitab Manager" with scope restricted to PUB-001
    When the user runs the summary report
    Then only the row for Dar Al‑Kitab appears, even if other publishers have data

  @negative
  Scenario: Deactivated publisher appears with zeroes or a note
    Given PUB-003 is deactivated today
    And PUB-003 had transactions yesterday
    When the user runs the summary report for the full week
    Then PUB-003 still shows its historical data but may be flagged as "Inactive"
