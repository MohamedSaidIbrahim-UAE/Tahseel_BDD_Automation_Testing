Feature: Payment Card Statistic Report
  As a Tahseel operations manager, I need a statistical overview of issued and active cards,
  so that I can monitor card issuance trends.

  Background:
    Given the user is logged in as "Finance Admin"
    And the Tahseel card module is active

  @positive @e2e
  Scenario: Full lifecycle – issue cards and check statistics
    When the user issues 5 new Tahseel cards today for Entity-A
    And the user issues 3 cards for Entity-B
    And activates 4 of the Entity-A cards
    Then the user runs the "Payment Card Statistic Report" for today
    And the report shows:
      | Entity   | Issued | Active | Inactive |
      | Entity-A | 5      | 4      | 1        |
      | Entity-B | 3      | 0      | 3        |

  @negative
  Scenario: No cards issued yet
    When the user runs the report on a date before any card issuance
    Then the report displays "No card statistics available" or zeroes

  @negative @rbac
  Scenario: Unauthorised role cannot view card statistics
    Given the user is logged in as "Collector"
    When the user attempts to open the report
    Then an "Access Denied" message is returned
