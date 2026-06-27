Feature: Dependant Services Revenue Detailed Reports
  As a revenue auditor, I need a detailed transaction‑level report of all dependant service fees collected,
  so that I can trace exactly which main transaction incurred each dependant fee.

  Background:
    Given the user is logged in as "Finance Admin"
    And the following dependant services are configured:
      | Dependant Service | Fee (AED) | Applies to Service |
      | EXPRESS           | 30.00     | SRV-100            |
      | SMS_NOTIFY        | 5.00      | SRV-100, SRV-200   |
      | ATTESTATION       | 50.00     | SRV-300            |
    And the services are active

  @positive @e2e
  Scenario: Full lifecycle – post transactions and view detailed listing
    When the user posts the following transactions today:
      | TXN ID | Main Service | Dependant Services | Main Amount | Total incl. Fees |
      | D001   | SRV-100      | EXPRESS, SMS_NOTIFY| 200.00      | 235.00           |
      | D002   | SRV-200      | SMS_NOTIFY         | 100.00      | 105.00           |
      | D003   | SRV-300      | ATTESTATION        | 500.00      | 550.00           |
    And the user runs the "Dependant services revenue detailed reports" for today
    Then the report lists a row for each dependant service occurrence:
      | TXN ID | Main Service | Dependant Service | Fee (AED) |
      | D001   | SRV-100      | EXPRESS           | 30.00     |
      | D001   | SRV-100      | SMS_NOTIFY        | 5.00      |
      | D002   | SRV-200      | SMS_NOTIFY        | 5.00      |
      | D003   | SRV-300      | ATTESTATION       | 50.00     |
    And the total fee sum is 90.00 AED
    And the report can be sorted by transaction ID, service, or fee

  @positive @filter
  Scenario: Filter detailed report by dependant service
    When the user filters by "SMS_NOTIFY"
    Then only the two rows with SMS_NOTIFY are displayed (D001 and D002) and the total fee is 10.00 AED

  @positive @filter
  Scenario: Filter by main transaction ID
    When the user filters by transaction "D001"
    Then only the two dependant service rows for D001 are shown

  @negative
  Scenario: No dependant service usage in the selected period
    When the user selects a date range with transactions that did not use any dependant services
    Then the report displays "No dependant service transactions found"

  @negative
  Scenario: Transaction with a dependant service that was later removed from the catalogue
    Given a dependant service "OLD_SERVICE" was used in a past transaction and then deleted from master data
    When the user runs the detailed report for that past date
    Then the transaction still appears with "OLD_SERVICE" clearly marked as "Historical/Deleted" without crashing

  @negative @rbac
  Scenario: Unauthorised role cannot access detailed report
    Given the user is logged in as "Customer Support"
    When the user attempts to open the "Dependant services revenue detailed reports"
    Then an "Access Denied" message is shown

  @negative @rbac
  Scenario: Entity‑limited user can only see their entity's dependant service transactions
    Given Entity‑A and Entity‑B exist, and transactions for both entities are posted with dependant services
    And the user is "Entity‑B Accountant"
    When the user runs the detailed report
    Then only rows belonging to Entity‑B transactions are visible
