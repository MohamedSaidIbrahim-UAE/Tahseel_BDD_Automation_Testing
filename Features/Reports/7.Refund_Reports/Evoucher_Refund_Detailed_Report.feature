Feature: Evoucher Refund Detailed Report
  As an e-voucher auditor, I need a detailed report of e-vouchers that have been refunded,
  so that I can monitor voucher reversals and their impact.

  Background:
    Given the user is logged in as "Finance Admin"
    And an e-voucher "EV-REF-001" with value 200 AED was issued and fully used

  @positive @e2e
  Scenario: Full cycle – refund an e-voucher transaction and verify report
    When a refund of 200 AED is initiated for the transaction that used "EV-REF-001"
    And the refund is approved
    And the user runs the "Evoucher Refund Detailed Report" for today
    Then the report includes:
      | Voucher ID | Refund Amount | Transaction ID | Status    |
      | EV-REF-001 | 200.00        | TXN-EV-REF-01  | Completed |
    And the voucher status is updated to "Refunded"

  @positive @filter
  Scenario: Filter by voucher ID
    When the user filters the report by "EV-REF-001"
    Then only that voucher's refund appears

  @negative
  Scenario: Partially used voucher refund
    Given voucher "EV-REF-002" with value 100 AED was partially used (50 AED)
    When a refund for the remaining 50 AED is processed
    Then the report shows the refund amount as 50 AED and voucher status "Partially Refunded"

  @negative @rbac
  Scenario: Non-voucher admin cannot view report
    Given the user is "Customer Support"
    Then access is denied
