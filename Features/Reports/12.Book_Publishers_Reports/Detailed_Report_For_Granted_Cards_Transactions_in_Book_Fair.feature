Feature: Detailed Report For Granted Cards Transactions in Book Fair
  As a book fair administrator, I need a report that specifically lists all transactions
  made using granted book fair cards, so that I can track card usage and remaining balances.

  Background:
    Given the user is logged in as "Finance Admin"
    And the following publishing houses are registered and active: PUB-001, PUB-002
    And a book fair event "Sharjah International Book Fair 2026" is configured
    And granted book fair cards "GF-CARD-01" (for PUB-001) and "GF-CARD-02" (for PUB-002) are issued
    And each card is loaded with a pre‑authorised balance of 10,000 AED

  @positive @e2e
  Scenario: Full lifecycle – issue cards, perform transactions, and view granted card report
    When the following transactions are completed using the granted cards on 2026‑06‑10:
      | Transaction ID | Publisher | Card Used    | Amount | Book Fair       |
      | GF-TXN-01      | PUB-001   | GF-CARD-01   | 3500.00| Sharjah Fair    |
      | GF-TXN-02      | PUB-001   | GF-CARD-01   | 1500.00| Sharjah Fair    |
      | GF-TXN-03      | PUB-002   | GF-CARD-02   | 2000.00| Sharjah Fair    |
      | GF-TXN-04      | PUB-001   | (other)      | 500.00 | Sharjah Fair    |
    And the user runs the "Detailed Report For Granted Cards Transactions in Book Fair" for the Sharjah Fair
    Then the report lists only the three transactions made with granted cards (GF-TXN-01, 02, 03)
    And each row includes the card number, publisher, amount, and remaining card balance after the transaction
    And the total granted card spend is 7000.00 AED
    And GF-TXN-04 (non‑granted card) is excluded

  @positive @filter
  Scenario: Filter by a specific granted card
    When the user filters by card "GF-CARD-01"
    Then only GF-TXN-01 and GF-TXN-02 are displayed

  @positive @filter
  Scenario: Filter by publisher within the report
    When the user filters by "PUB-002"
    Then only GF-TXN-03 is shown

  @negative
  Scenario: No granted card transactions for the selected book fair
    When the user runs the report for a book fair where no granted cards were used
    Then the system displays "No granted card transactions found for this book fair"

  @negative
  Scenario: Expired card transactions are flagged
    Given GF-CARD-01 expires on 2026‑06‑09
    And a transaction attempted on 2026‑06‑10 should be rejected (outside test scope)
    But if a historical transaction exists before expiry, it still appears normally

  @negative @rbac
  Scenario: Publisher user can only see their own granted card transactions
    Given the user is "Dar Al‑Kitab Manager" (PUB-001)
    When the user views the report
    Then only transactions from GF-CARD-01 are shown, GF-CARD-02 is hidden

  @negative @rbac
  Scenario: Book fair coordinator without finance role cannot access
    Given the user is "Event Coordinator"
    When attempting to open the report
    Then "Access Denied" is returned
