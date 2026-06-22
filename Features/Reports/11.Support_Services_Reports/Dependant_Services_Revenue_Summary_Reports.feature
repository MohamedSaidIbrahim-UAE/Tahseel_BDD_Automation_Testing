Feature: Dependant Services Revenue Summary Reports
  As a support services manager, I need an aggregated summary of revenue collected from dependant services
  (e.g., express processing, SMS notification, certificate attestation) per period, so that I can evaluate the
  financial contribution of add‑on services.

  Background:
    Given the user is logged in as "Finance Admin"
    And the system has the following dependant services configured with fees:
      | Dependant Service | Fee (AED) | Applies to Service |
      | EXPRESS           | 30.00     | SRV-100            |
      | SMS_NOTIFY        | 5.00      | SRV-100, SRV-200   |
      | ATTESTATION       | 50.00     | SRV-300            |
    And all dependant services are active

  @positive @e2e
  Scenario: Full lifecycle – post transactions with dependant services and verify summary
    When the following transactions are posted on 2026‑06‑10:
      | TXN ID | Main Service | Dependant Services Selected       | Main Amount (excl. dependant fees) |
      | T001   | SRV-100      | EXPRESS, SMS_NOTIFY               | 200.00                              |
      | T002   | SRV-200      | SMS_NOTIFY                        | 100.00                              |
      | T003   | SRV-300      | ATTESTATION                       | 500.00                              |
      | T004   | SRV-100      | (none)                            | 150.00                              |
    And the user runs the "Dependant services revenue summary reports" for 2026‑06‑10
    Then the report shows the following aggregated data:
      | Dependant Service | Usage Count | Total Revenue (AED) |
      | EXPRESS           | 1           | 30.00                |
      | SMS_NOTIFY        | 2           | 10.00                |
      | ATTESTATION       | 1           | 50.00                |
    And the grand total dependant services revenue is 90.00 AED
    And the total number of dependant service selections is 4

  @positive @filter
  Scenario: Filter summary by a specific dependant service
    When the user filters the report by dependant service "SMS_NOTIFY"
    Then only the row for SMS_NOTIFY is displayed, showing count = 2 and revenue = 10.00 AED

  @positive @filter
  Scenario: Filter summary by date range
    Given T001 and T002 were posted on 2026‑06‑10, and T003 on 2026‑06‑11
    When the user selects the date range 2026‑06‑10 to 2026‑06‑10
    Then only the dependant services from T001 and T002 are aggregated, excluding T003

  @negative
  Scenario: No dependant services used in the period
    When the user selects a period where all transactions did not include any dependant services
    Then the report displays "No dependant services revenue found" or all totals show 0.00

  @negative
  Scenario: Dependant service deactivated after transaction should still show historical revenue
    Given dependant service "EXPRESS" was deactivated on 2026‑06‑15
    And a transaction using EXPRESS occurred on 2026‑06‑10
    When the user runs the summary report for the range covering 2026‑06‑10
    Then the EXPRESS row still appears with its historical revenue, possibly flagged as "Inactive"

  @negative @rbac
  Scenario: Unauthorised role cannot access the summary report
    Given the user is logged in as "Tasheel Operator"
    When the user attempts to open the "Dependant services revenue summary reports"
    Then an "Access Denied" message is returned

  @negative @rbac
  Scenario: Entity‑restricted user only sees data for their own entity
    Given Entity‑A and Entity‑B exist, and dependant services are entity‑agnostic
    And the user is "Entity‑A Accountant" with access limited to Entity‑A
    When the user runs the summary report
    Then only dependant service selections linked to Entity‑A transactions are counted
