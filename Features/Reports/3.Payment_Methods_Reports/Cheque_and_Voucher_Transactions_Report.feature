Feature: Cheque and Voucher Transactions Report (تتمة المعاملات)
  As a payment reconciliation specialist, I need a combined view of cheque and voucher transactions
  that are still pending or processed, so that I can ensure all instruments are accounted for.

  Background:
    Given the user is logged in as "Finance Admin"
    And cheques and e-vouchers are enabled

  @positive @e2e
  Scenario: Mixed cheque and voucher view
    Given the user posts:
      | Type    | Instrument ID | Amount | Status  |
      | Cheque  | CHQ-101       | 500    | Pending |
      | Voucher | EV-202        | 300    | Active  |
    When the user runs the "Cheque and Voucher Transactions" report
    Then both instruments appear in the combined list
    And the total pending/active amount is 800 AED

  @positive @filter
  Scenario: Filter by instrument type
    When the user selects type "Cheque"
    Then only cheque transactions appear

  @negative
  Scenario: No data for selected period
    When selecting a date range with no transactions
    Then a "No data" message is displayed
