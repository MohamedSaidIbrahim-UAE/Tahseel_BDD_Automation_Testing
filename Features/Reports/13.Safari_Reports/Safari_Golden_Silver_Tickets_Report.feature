Feature: Safari Golden & Silver Tickets Report
  As a premium services coordinator, I need a dedicated report showing bookings for Golden and Silver safari categories,
  so that I can manage VIP guest lists and prepare premium experiences.

  Background:
    Given the user is logged in as "Finance Admin"
    And the categories Golden and Silver are active (Standard is also active but should not appear)
    And a booking date "2026-06-20" is open

  @positive @e2e
  Scenario: Only Golden and Silver bookings appear
    When the following bookings are made for "2026-06-20":
      | Booking ID | Category | Quantity | Total Price (AED) |
      | G001       | Golden   | 2        | 500.00             |
      | G002       | Silver   | 1        | 150.00             |
      | G003       | Standard | 5        | 500.00             |
    And the user runs the "Safari Golden & Silver Tickets Report" for "2026-06-20"
    Then the report lists G001 and G002 with correct details
    And G003 (Standard) is excluded
    And the total for premium bookings is 650.00 AED

  @positive @filter
  Scenario: Filter by Golden category only
    When the user filters the report by "Golden"
    Then only G001 is displayed

  @positive @filter
  Scenario: Filter by Silver category only
    When the user filters by "Silver"
    Then only G002 is displayed

  @negative
  Scenario: No Golden or Silver bookings on the date
    When only Standard tickets are sold on 2026-06-20
    Then the report displays "No Golden or Silver bookings found"

  @negative @rbac
  Scenario: Unauthorised role cannot view premium report
    Given the user is "Standard Ticket Agent"
    When accessing the report, "Access Denied" is returned

  @negative @rbac
  Scenario: Finance assistant with restricted category access sees only allowed category
    Given the user is "Silver Coordinator" with permission only for Silver bookings
    When the report is viewed, only Silver bookings appear; Golden is hidden
