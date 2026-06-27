Feature: Automatic Transaction Refund Report
  As a system administrator, I need a detailed report of refunds triggered automatically
  (e.g., due to policy, system errors, or duplicate payments), so that I can audit automated processes.

  Background:
    Given the user is logged in as "Finance Admin"
    And automatic refund rules are configured:
      | Rule ID | Condition                     | Action         |
      | AUTO-1  | Duplicate payment detected    | Auto-refund    |
      | AUTO-2  | Transaction timeout > 30 min  | Auto-refund    |

  @positive @e2e
  Scenario: Duplicate payment triggers auto-refund and report
    Given a successful payment "TXN-AUTO-01" for 300 AED
    And a duplicate payment "TXN-AUTO-02" for the same order and amount is detected
    When the system automatically refunds "TXN-AUTO-02" using rule "AUTO-1"
    And the user runs the "Automatic Transaction Refund Report" for today
    Then the report includes:
      | Transaction ID | Refund Amount | Trigger Rule | Status    |
      | TXN-AUTO-02    | 300.00        | AUTO-1       | Completed |
    And the reason is "Duplicate payment auto-refund"

  @positive @e2e
  Scenario: Timeout auto-refund
    Given a transaction "TXN-AUTO-03" for 150 AED is pending for 40 minutes
    When the timeout rule "AUTO-2" is executed
    Then the transaction is automatically refunded
    And the report reflects this auto-refund with rule "AUTO-2"

  @negative
  Scenario: Auto-refund fails due to insufficient funds
    Given an auto-refund is triggered but the source account has insufficient balance
    Then the report shows status "Failed" with reason "Insufficient balance"

  @negative @rbac
  Scenario: Only system auditor role can view auto-refund report
    Given the user is "Regular Finance User"
    Then access is denied
