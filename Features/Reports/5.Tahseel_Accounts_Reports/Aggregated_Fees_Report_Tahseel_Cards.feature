Feature: Aggregated Fees Report Tahseel Cards
  As a finance manager, I need the total fees collected from Tahseel card operations,
  so that I can assess the revenue from card services.

  Background:
    Given the user is logged in as "Finance Admin"
    And the card fee structure is: Load fee 1%, Deduct fee 2 AED flat

  @positive @e2e
  Scenario: Full cycle – multiple cards, fee calculation verification
    Given the following operations across two cards:
      | Card   | Operation | Amount | Fee       |
      | TC-301 | Load      | 1000   | 10 (1%)   |
      | TC-301 | Deduct    | 500    | 2 flat    |
      | TC-302 | Load      | 2000   | 20 (1%)   |
    When the user runs the "Aggregated fees Report Tahseel Cards" for the month
    Then the report shows:
      | Fee Type   | Count | Total Fee |
      | Load Fee   | 2     | 30.00     |
      | Deduct Fee | 1     | 2.00      |
    And the grand total fee is 32.00 AED

  @negative
  Scenario: No card transactions in period yields zero fees
    When the user selects a period with no card activity
    Then the report shows 0.00 AED total fees

  @negative @rbac
  Scenario: Non-finance role cannot access fee report
    Given the user is "Support Agent"
    Then access is denied
