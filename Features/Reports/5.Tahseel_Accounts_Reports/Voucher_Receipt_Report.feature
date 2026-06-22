Feature: Voucher Receipt Report
  As a cashier, I need a report of all voucher receipts (deposit slips) generated,
  so that I can verify cash/cheque deposits made against accounts.

  Background:
    Given the user is logged in as "Finance Admin"
    And the voucher receipt module is operational

  @positive @e2e
  Scenario: Voucher receipt generation and report
    When a deposit of 1500 AED is made into Tahseel Account "AC-6001" and a voucher receipt "VR-001" is generated
    And the user runs the "Voucher Receipt Report" for today
    Then the report displays:
      | Voucher No | Account | Amount | Date       |
      | VR-001     | AC-6001 | 1500   | 2026-06-10 |

  @negative
  Scenario: Voided receipts should appear as cancelled
    Given a voucher receipt "VR-002" is voided
    When the report includes voided items, "VR-002" shows status "Void" and does not affect totals
