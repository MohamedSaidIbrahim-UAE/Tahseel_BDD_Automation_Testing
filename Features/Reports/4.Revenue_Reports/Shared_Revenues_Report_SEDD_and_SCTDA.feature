Feature: Shared Revenues Report – SEDD and SCTDA
  As a revenue sharing coordinator, I need a report on shared revenues between
  Sharjah Economic Development Department (SEDD) and Sharjah Commerce & Tourism Development Authority (SCTDA).

  Background:
    Given the user is logged in as "Finance Admin"
    And the shared revenue rule for service "SRV-TOUR" is SEDD 60% and SCTDA 40%

  @positive @e2e
  Scenario: Full cycle transaction and sharing verification
    When a transaction of 5000.00 AED is posted for service "SRV-TOUR"
    Then the "Shared revenues between SEDD and SCTDA" report shows:
      | Entity | Share % | Share Amount |
      | SEDD   | 60%     | 3000.00      |
      | SCTDA  | 40%     | 2000.00      |

  @negative
  Scenario: Report with mixed services where only one is shared
    Given a transaction for a non-shared service is posted alongside the shared one
    When the report is generated
    Then the non-shared transaction is excluded from the shared revenue calculations
