Feature: Detailed Tahseel Card Report
  As a card management officer, I need a detailed list of all Tahseel cards with balances,
  so that I can support customer inquiries.

  Background:
    Given the user is logged in as "Finance Admin"
    And the Tahseel card inventory has pre-configured card types

  @positive @e2e
  Scenario: Full lifecycle – card creation, load, and detail report
    Given a new Tahseel card "TC-1001" is created for Entity-A with initial balance 0
    When the user loads 500 AED onto "TC-1001" via a load request
    And the user runs the "Detailed Tahseel Card Report" for card "TC-1001"
    Then the report shows:
      | Card Number | Entity   | Balance | Status |
      | TC-1001     | Entity-A | 500.00  | Active |

  @positive @filter
  Scenario: Filter by entity
    When the user filters the report by Entity-A
    Then only cards belonging to Entity-A are displayed

  @negative
  Scenario: Inactive or blocked card appears with correct status
    Given card "TC-1002" is blocked
    When the report is generated, "TC-1002" shows status "Blocked" and balance is visible

  @negative @rbac
  Scenario: Entity-limited user sees only their own entity cards
    Given the user is an "Entity-A Accountant"
    When the report is viewed, only Entity-A cards appear
