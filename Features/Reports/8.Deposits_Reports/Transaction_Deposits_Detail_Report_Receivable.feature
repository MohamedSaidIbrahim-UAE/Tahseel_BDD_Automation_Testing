Feature: Transaction Deposits Detail Report (Receivable)
  As a receivable clerk, I need a detailed listing of all deposit inflows (receipts) per entity,
  so that I can match them against expected payments.

  Background:
    Given the user is logged in as "Finance Admin"
    And deposit account "DEP-REC-01" for Civil Aviation is open

  @positive @e2e
  Scenario: Deposit receipt listing
    Given the following deposit receipts are recorded:
      | Deposit ID | Amount | Entity   | Date       |
      | D100       | 5000   | Civil Aviation | 2026-06-10 |
      | D101       | 3000   | Entity-B | 2026-06-10 |
    When the user runs the "Transaction deposits detail Report (receivable)" for today
    Then the report shows both receipts with correct amounts, dates, and entities
    And the total deposits for the day are 8000.00 AED

  @positive @filter
  Scenario: Filter by entity
    When the user filters by Civil Aviation
    Then only D100 is displayed

  @negative
  Scenario: No receipts on a non-business day
    When the report is run for a holiday with no deposits
    Then "No deposit receipts found" is displayed

  @negative @rbac
  Scenario: Collector role cannot see full deposit details
    Given the user is "Collector"
    Then access is denied
