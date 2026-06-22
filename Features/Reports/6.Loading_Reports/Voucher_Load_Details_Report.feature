Feature: Voucher Load Details Report
  As a voucher auditor, I need a detailed list of individual e‑voucher loading transactions,
  so that I can trace exactly which vouchers were loaded, when, and by whom.

  Background:
    Given the user is logged in as "Finance Admin"
    And e‑voucher batch "BATCH-DET" with vouchers EV‑001 to EV‑010 exists

  @positive @e2e
  Scenario: Load specific vouchers and view details
    When the user loads vouchers EV‑001, EV‑002, EV‑003 today with values 50, 50, 100 AED
    And the user runs the "Voucher Load Details Report" for today
    Then the report shows:
      | Voucher | Value | Status |
      | EV‑001  | 50    | Active |
      | EV‑002  | 50    | Active |
      | EV‑003  | 100   | Active |
    And the total loaded value is 200.00 AED

  @negative
  Scenario: Partially loaded batch: some vouchers remain unloaded
    Given a batch of 5 vouchers, only 2 are loaded
    When the report is run, only the loaded vouchers appear

  @negative @rbac
  Scenario: Only voucher management role can view
    Given the user is "Tasheel Center Manager"
    Then access is denied
