Feature: SFD Detailed Wallets Transactions Report
  As an SFD auditor, I need detailed transaction histories of all wallets linked to the central financial system,
  so that I can verify the flow of government funds.

  Background:
    Given the user is logged in as "Finance Admin"
    And SFD wallet "W-SFD-01" is linked to Civil Aviation

  @positive @e2e
  Scenario: Wallet transactions reflected in SFD report
    Given the wallet "W-SFD-01" receives a load of 10000 AED and then a deduct of 2000 AED
    When the user runs the "SFD Detailed Wallets Transactions Report" for "W-SFD-01"
    Then the two transactions are listed with SFD-specific references
    And the net balance change is +8000 AED

  @negative @rbac
  Scenario: Non-SFD user cannot view the report
    Given the user is "Civil Aviation Accountant" (not SFD)
    Then access is denied
