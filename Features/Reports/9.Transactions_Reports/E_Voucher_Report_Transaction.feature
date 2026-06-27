Feature: E‑Voucher Report Transaction
  As an e‑voucher specialist, I need a detailed view of transactions paid with e‑vouchers,
  so that I can audit voucher usage.

  Background:
    Given the user is logged in as "Finance Admin"
    And e‑voucher "EV‑100" with value 500 AED exists

  @positive @e2e
  Scenario: E‑voucher payment appears in the report
    When a transaction of 500 AED is paid fully using "EV‑100"
    And the user runs the "E‑Voucher Report Transaction"
    Then the report lists the transaction with voucher ID, amount, and status "Redeemed"

  @positive @filter
  Scenario: Filter by voucher ID
    When the user filters by "EV‑100"
    Then only that transaction appears

  @negative
  Scenario: No e‑voucher transactions on a date
    When the date filter has no voucher usage, "No e‑voucher transactions" is displayed

  @negative @rbac
  Scenario: Unauthorised role
    Given the user is "Operator"
    Then access is denied
