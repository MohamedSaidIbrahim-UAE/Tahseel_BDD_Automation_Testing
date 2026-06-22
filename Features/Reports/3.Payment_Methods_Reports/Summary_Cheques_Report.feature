Feature: Summary Cheques Report
  As a financial controller, I want a high-level summary of cheque transactions per period,
  so that I can quickly assess cheque usage and totals.

  Background:
    Given the user is logged in as "Finance Admin" with full report access
    And cheque payment method is enabled in the system
    And the following cheque master data is configured:
      | Cheque Number | Bank           | Entity    |
      | CHQ-001       | Bank A         | Entity-A  |
      | CHQ-002       | Bank B         | Entity-A  |
      | CHQ-003       | Bank A         | Entity-B  |

  @positive @e2e
  Scenario: Full cycle – post cheque transactions and verify summary
    When the user posts the following cheque transactions on 2026-06-09:
      | Service  | Cheque No | Amount (AED) | Entity   |
      | SRV-100  | CHQ-001   | 1000.00      | Entity-A |
      | SRV-200  | CHQ-002   | 2000.00      | Entity-A |
      | SRV-100  | CHQ-003   | 500.00       | Entity-B |
    And the user runs the "Summary Cheques Report" for 2026-06-09
    Then the report shows:
      | Metric                  | Value       |
      | Total Cheque Count      | 3           |
      | Total Amount            | 3500.00     |
      | Total By Entity-A       | 3000.00     |
      | Total By Entity-B       | 500.00      |
    And the report can be exported to PDF and Excel

  @positive @filter
  Scenario: Filter summary by entity
    When the user filters the "Summary Cheques Report" by "Entity-A"
    Then the report shows 2 cheques totalling 3000.00 AED

  @negative
  Scenario: No cheque data for a future date
    When the user sets the date to a future date with no transactions
    Then the report displays "No data found"

  @negative @rbac
  Scenario: Unauthorised role denied access
    Given the user is logged in as "Collector"
    When the user attempts to open the summary cheques report
    Then an "Access Denied" message is returned
