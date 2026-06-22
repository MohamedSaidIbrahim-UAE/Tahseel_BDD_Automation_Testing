Feature: Tahseel Lost Cards Report
  As a card security administrator, I need a report of all lost/stolen cards and replacements,
  so that I can audit the process and prevent fraud.

  Background:
    Given the user is logged in as "Finance Admin"
    And Tahseel cards can be reported lost and replaced

  @positive @e2e
  Scenario: Full lifecycle – card loss, replacement, and report
    Given card "TC-5001" is active with balance 200 AED
    When the card is reported lost
    And a replacement card "TC-5002" is issued with the remaining balance transferred
    Then the user runs the "Tahseel Lost Cards Report" for today
    And the report lists:
      | Lost Card | Replacement | Balance Transferred | Status        |
      | TC-5001   | TC-5002     | 200.00             | Replaced      |

  @negative
  Scenario: No lost cards in the period
    When the user runs the report for a month with no lost cards
    Then "No lost cards reported" is displayed

  @negative @rbac
  Scenario: Customer support can view but not export lost card data
    Given the user is "Customer Support"
    When viewing the report, export button is either disabled or not visible
