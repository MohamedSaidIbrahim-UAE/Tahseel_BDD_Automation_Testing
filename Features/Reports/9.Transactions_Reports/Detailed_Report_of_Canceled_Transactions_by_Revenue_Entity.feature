Feature: Detailed Report of Canceled Transactions by Revenue Entity
  As a revenue entity accountant, I need canceled transactions filtered by my revenue entity,
  so that I can assess revenue reversals specific to my department.

  Background:
    Given the user is logged in as "Finance Admin"
    And revenue entities "Entity‑A" and "Entity‑B" exist

  @positive @e2e
  Scenario: Canceled transactions for a specific revenue entity
    Given "Entity‑A" has 2 canceled transactions totalling 1000 AED, and "Entity‑B" has 1 canceled for 500 AED
    When the user runs the "Detailed report of canceled transactions by revenue" and filters by "Entity‑A"
    Then only the two Entity‑A cancellations are shown with total 1000 AED

  @negative @rbac
  Scenario: Entity‑restricted user sees only own cancellations
    Given the user is "Entity‑A Accountant"
    Then only Entity‑A cancellations are visible
