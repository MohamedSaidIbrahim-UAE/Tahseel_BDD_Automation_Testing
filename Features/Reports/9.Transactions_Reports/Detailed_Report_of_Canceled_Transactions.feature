Feature: Detailed Report of Canceled Transactions
  As a risk analyst, I need a detailed list of all canceled transactions,
  so that I can monitor cancellation patterns and potential fraud.

  Background:
    Given the user is logged in as "Finance Admin"
    And a transaction "TXN‑CAN‑01" for 500 AED was successfully paid and then cancelled

  @positive @e2e
  Scenario: Canceled transaction appears in detail
    When the user cancels "TXN‑CAN‑01" with reason "Customer request"
    And runs the "Detailed report of canceled transactions" for today
    Then the report lists "TXN‑CAN‑01" with original amount 500 AED, cancellation reason, and status "Canceled"

  @positive @filter
  Scenario: Filter by cancellation reason
    When the user filters by "Customer request", only that cancellation appears

  @negative
  Scenario: No cancellations in period
    Then the report displays "No canceled transactions"

  @negative @rbac
  Scenario: Unauthorised role denied
    Given the user is "Support Agent"
    Then access is denied
