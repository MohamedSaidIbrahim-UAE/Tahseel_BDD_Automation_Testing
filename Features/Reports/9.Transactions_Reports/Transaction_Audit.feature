Feature: Transaction Audit
  As an auditor, I need a full audit trail of a specific transaction,
  including all status changes and user actions.

  Background:
    Given the user is logged in as "Finance Admin"
    And a transaction "TXN‑AUD‑01" is created, paid, and later refunded

  @positive @e2e
  Scenario: Complete audit trail
    When the user runs the "Transaction Audit" report for "TXN‑AUD‑01"
    Then the report shows a chronological log:
      | Timestamp           | Action               | User          | Details        |
      | 2026‑06‑10 09:00    | Created              | System        | Pending        |
      | 2026‑06‑10 09:05    | Payment completed    | Collector A   | 500 AED        |
      | 2026‑06‑10 10:00    | Refund initiated     | Finance Admin | Reason: Error  |
      | 2026‑06‑10 10:30    | Refund completed     | System        | 500 AED        |

  @negative
  Scenario: Non‑existent transaction ID
    When the user enters "INVALID‑ID", "Transaction not found" is displayed
