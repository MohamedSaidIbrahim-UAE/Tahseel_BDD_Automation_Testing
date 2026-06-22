Feature: Detailed SEDD Transactions Report
  As a SEDD (Sharjah Economic Development Department) auditor, I need all transactions belonging to SEDD,
  so that I can reconcile departmental revenues.

  Background:
    Given the user is logged in as "Finance Admin"
    And SEDD is set up as a revenue entity with code "SEDD"

  @positive @e2e
  Scenario: SEDD transactions only
    Given 5 SEDD transactions totalling 2500 AED and 3 non‑SEDD transactions are posted
    When the user runs the "Detailed SEDD Transactions Report"
    Then only the 5 SEDD transactions appear
    And the total is 2500.00 AED

  @negative @rbac
  Scenario: Non‑SEDD user cannot view
    Given the user is "Entity‑B Accountant"
    Then access is denied or data is empty
