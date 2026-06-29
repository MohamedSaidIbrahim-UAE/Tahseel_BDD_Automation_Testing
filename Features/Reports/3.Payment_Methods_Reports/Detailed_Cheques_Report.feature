Feature: Detailed Cheques Report
  As a reconciliation officer, I need a detailed list of all cheque transactions with statuses,
  so that I can trace individual payments and identify pending deposits.

  Background:
    Given the user is logged in as "Finance Admin"
    And cheques are enabled

  @positive @e2e
  Scenario: Full lifecycle – from posting to details and status updates
    Given a cheque transaction "CHQ-D001" is posted with amount 1500.00 AED
    When the user navigates to "Detailed Cheques Report" and selects today's date
    Then the report displays row "CHQ-D001" with:
      | Field            | Value         |
      | Amount           | 1500.00       |
      | Status           | Pending       |
      | Bank             | Bank A        |
    And the cheque status changes to "Cleared" after manual clearing
    When the user re-runs the report
    Then the status for "CHQ-D001" is updated to "Cleared"

  @positive @export
  Scenario: Export detailed list to Excel
    When the report is exported to Excel
    Then all columns including cheque date, amount, status, entity are included

  @negative
  Scenario: Search by non-existing cheque number
    When the user enters a cheque number "INVALID-999"
    Then the system shows "No matching records found"

  @negative @rbac
  Scenario: Entity-limited user can only see own cheques
    Given the user is an "Civil Aviation Accountant"
    When the user runs the detailed cheques report
    Then only cheques for Civil Aviation appear, even if other entities have data
