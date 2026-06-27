Feature: E-Voucher Status Inquire Report
  As a support agent, I want to quickly check the status (active, used, expired, cancelled) of an e-voucher,
  so that I can assist customers and resolve disputes.

  Background:
    Given the user is logged in as "Finance Admin"
    And the e-voucher system is active

  @positive @e2e
  Scenario: Full lifecycle – voucher creation, usage, and status report
    Given a new e-voucher "EV-1001" is issued with value 200 AED on 2026-06-09
    When the user inquires the status of "EV-1001" in the "E-Voucher Status Inquire Report"
    Then the report shows status "Active" and full value 200 AED
    When the voucher is used to partially pay 150 AED for a transaction
    And the user inquires again
    Then the status is "Used" with remaining balance 50 AED
    When the voucher is then cancelled
    And the user inquires again
    Then the status is "Cancelled"

  @negative
  Scenario: Inquire non-existing voucher
    When the user searches for voucher "EV-9999"
    Then the system displays "Voucher not found"

  @negative @rbac
  Scenario: Only support and finance roles can access voucher inquiry
    Given the user is logged in as "Operator"
    When the user attempts to open the voucher inquiry report
    Then access is denied
