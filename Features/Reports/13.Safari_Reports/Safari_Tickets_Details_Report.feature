Feature: Safari Tickets Details Report
  As a safari park operations manager, I need a detailed list of every safari ticket booking,
  so that I can trace individual reservations, payments, and visitor details.

  Background:
    Given the user is logged in as "Finance Admin"
    And the safari ticketing module is active
    And the following ticket categories are configured:
      | Category | Price (AED) |
      | Standard | 100.00      |
      | Golden   | 250.00      |
      | Silver   | 150.00      |
    And a valid booking date "2026-06-15" is open for reservations

  @positive @e2e
  Scenario: Full lifecycle – create bookings and view detailed report
    When the following safari bookings are made for "2026-06-15":
      | Booking ID | Visitor Name      | Category | Quantity | Total Price (AED) |
      | B001       | Ahmed Al-Hosani    | Standard | 2        | 200.00             |
      | B002       | Sara Al-Mansouri   | Golden   | 1        | 250.00             |
      | B003       | Mohammed Al-Balooshi| Silver   | 4        | 600.00             |
    And the user runs the "Safari Tickets Details Report" for "2026-06-15"
    Then the report displays all three bookings with correct visitor names, categories, quantities, and total prices
    And the grand total price for the day is 1050.00 AED

  @positive @filter
  Scenario: Filter by category
    When the user filters the report by category "Silver"
    Then only booking B003 is displayed with total 600.00 AED

  @positive @filter
  Scenario: Filter by booking date range
    Given additional bookings exist on 2026-06-16
    When the user selects the range 2026-06-15 to 2026-06-15
    Then only bookings for that single day are shown

  @negative
  Scenario: No bookings for the selected date
    When the user selects a future date with no bookings
    Then the report displays "No safari bookings found"

  @negative @rbac
  Scenario: Unauthorised role cannot access details
    Given the user is logged in as "Safari Park Gate Agent"
    When the user attempts to open the "Safari Tickets Details Report"
    Then an "Access Denied" message is returned

  @negative
  Scenario: Booking with cancelled status appears correctly
    Given a booking B004 (Standard, 1 ticket) was cancelled
    When the report is run for its date
    Then B004 appears with status "Cancelled" and total price of 0.00 or the original amount but clearly marked as cancelled
