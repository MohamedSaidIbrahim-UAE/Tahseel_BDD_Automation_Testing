Feature: Sharjah Islamic Bank Refund Report (Detailed)
  As a bank reconciliation specialist, I need a detailed list of refunds processed through
  Sharjah Islamic Bank (SIB), so that I can match them with the bank's records.

  Background:
    Given the user is logged in as "Finance Admin"
    And SIB is configured as a refund channel
    And a paid transaction "TXN-SIB-REF-01" for 750 AED via SIB exists

  @positive @e2e
  Scenario: Full cycle – SIB refund processing and detailed report
    When a refund of 750 AED for "TXN-SIB-REF-01" is initiated and routed to SIB
    And the refund is successfully processed by the bank
    And the user runs the "Sharjah islamic bank refund report" for today
    Then the report lists:
      | Transaction ID    | Amount | Bank Ref Number | Status    |
      | TXN-SIB-REF-01    | 750.00 | SIB-12345       | Completed |
    And the total SIB refund amount for the day is 750.00 AED

  @negative
  Scenario: Refund failed at bank returns error
    Given a refund sent to SIB fails due to incorrect account details
    When the user runs the detailed SIB refund report
    Then the refund appears with status "Failed" and an error description

  @negative @rbac
  Scenario: Only bank operations role can access
    Given the user is "Regular Finance User" without bank permissions
    Then access is denied
