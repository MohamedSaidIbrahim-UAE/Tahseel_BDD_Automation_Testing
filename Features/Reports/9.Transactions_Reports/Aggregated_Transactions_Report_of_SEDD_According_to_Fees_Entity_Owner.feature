Feature: Aggregated Transactions Report of SEDD According to Fees Entity Owner
  As a SEDD revenue manager, I want an aggregated summary of transactions grouped by fee owner,
  so that I can evaluate each sub‑department's revenue.

  Background:
    Given the user is logged in as "Finance Admin"
    And SEDD sub‑entities exist

  @positive @e2e
  Scenario: Aggregated per fee owner
    Given total fees collected for "SEDD‑Licensing" is 5000 AED and for "SEDD‑Inspection" 3000 AED
    When the user runs the "Aggregated transactions report of SEDD According to the Fees entity owner"
    Then the report shows the two rows with correct totals and a grand total of 8000 AED

  @negative
  Scenario: Sub‑entity with no transactions omitted
    Then "SEDD‑Others" does not appear or shows 0
