Feature: Detailed Transactions Report of SEDD According to Fees Entity Owner
  As a SEDD finance officer, I need a detailed transaction list broken down by the entity that owns the fee,
  so that I can track which department actually receives the fee within SEDD.

  Background:
    Given the user is logged in as "Finance Admin"
    And SEDD has sub‑entities "SEDD‑Licensing" and "SEDD‑Inspection" as fee owners

  @positive @e2e
  Scenario: Detailed view per fee owner
    Given transactions with fees going to "SEDD‑Licensing" and "SEDD‑Inspection" are posted
    When the user runs the "Detailed transactions report of SEDD According to the Fees entity owner" and filters by "SEDD‑Licensing"
    Then only transactions with that fee owner appear
    And the fee amounts are correctly attributed

  @negative @rbac
  Scenario: Non‑SEDD role cannot view
    Given the user is "General Accountant"
    Then access is denied
