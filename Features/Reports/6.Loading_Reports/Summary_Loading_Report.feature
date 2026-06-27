Feature: Summary Loading Report
  As a finance executive, I want an aggregated summary of all loading activity per day,
  so that I can track daily fund inflows.

  Background:
    Given the user is logged in as "Finance Admin"

  @positive @e2e
  Scenario: Daily loading summary
    Given today's loads total 15000 AED from 30 separate load operations
    When the user runs the "Summary Loading Report" for today
    Then the report shows:
      | Date       | Number of Loads | Total Amount |
      | 2026-06-10 | 30              | 15000.00     |

  @positive @e2e
  Scenario: Multi‑day summary comparison
    Given loads on 2026-06-09 total 10000 AED and on 2026-06-10 total 5000 AED
    When the user runs the report for the range 06-09 to 06-10
    Then the table shows two rows, one per day, with correct amounts

  @negative @rbac
  Scenario: Collector cannot view summary
    Given the user is "Collector"
    Then access is denied
