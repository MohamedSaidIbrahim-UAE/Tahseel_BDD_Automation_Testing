Feature: Publishers Detail Report
  As a publisher relations officer, I need a detailed line‑by‑line list of all transactions related to publishing houses,
  so that I can reconcile settlements with each publisher.

  Background:
    Given the user is logged in as "Finance Admin"
    And publishing houses PUB-001, PUB-002, PUB-003 are active
    And book sale service "BK-SALE" is available

  @positive @e2e
  Scenario: Full lifecycle – post transactions and view detailed report
    When the user posts the following transactions on 2026‑06‑10:
      | TXN ID   | Publisher | Amount | Payment Method | Book Fair Card Used? |
      | D-PUB-01 | PUB-001   | 500.00 | Cash           | No                   |
      | D-PUB-02 | PUB-001   | 300.00 | Card           | Yes (CARD-101)       |
      | D-PUB-03 | PUB-002   | 1200.00| Card           | No                   |
    And the user runs the "Publishers Detail Report" for 2026‑06‑10
    Then the report lists all three transactions with:
      | TXN ID   | Publisher Name          | Amount | Payment Method | Book Fair Card |
      | D-PUB-01 | Dar Al‑Kitab            | 500.00 | Cash           | N/A            |
      | D-PUB-02 | Dar Al‑Kitab            | 300.00 | Card           | CARD-101       |
      | D-PUB-03 | Sharjah Publishing House| 1200.00| Card           | N/A            |
    And the total amount for all publishers is 2000.00 AED

  @positive @filter
  Scenario: Filter by publisher
    When the user filters by "PUB-002"
    Then only D-PUB-03 is displayed

  @positive @filter
  Scenario: Filter by payment method
    When the user selects "Cash"
    Then only D-PUB-01 appears

  @positive @filter
  Scenario: Filter by book fair card usage
    When the user filters by "Used book fair card"
    Then only D-PUB-02 is shown

  @negative
  Scenario: No transactions in the selected period
    When the user selects a weekend with no book fair activity
    Then the report displays "No publisher transactions found"

  @negative @rbac
  Scenario: Unauthorised role denied
    Given the user is "Customer Support"
    When accessing the detail report, "Access Denied" is returned

  @negative @rbac
  Scenario: Publisher user sees only own transactions
    Given the user is "Emirates Books Accountant" (PUB-003)
    When the report is viewed, only transactions for PUB-003 appear

  @negative
  Scenario: Transaction with a deleted publisher still appears with original data
    Given a transaction for PUB-001 exists, and later the publisher is soft‑deleted
    When the user runs the detailed report for the historical date
    Then the transaction appears with PUB-001's name and a note "Publisher inactive"
