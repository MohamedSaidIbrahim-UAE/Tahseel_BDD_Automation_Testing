Feature: Safari Tickets Summary Report
  As a finance manager, I need aggregated summary statistics of safari ticket sales per day or period,
  so that I can monitor daily revenue and visitor numbers.

  Background:
    Given the user is logged in as "Finance Admin"
    And the safari categories are Standard, Golden, Silver with prices as before
    And the booking date "2026-06-15" is open

  @positive @e2e
  Scenario: Full cycle – multiple bookings and summary report
    When the following bookings are made for "2026-06-15":
      | Category | Quantity | Total Price (AED) |
      | Standard | 10       | 1000.00            |
      | Golden   | 3        | 750.00             |
      | Silver   | 5        | 750.00             |
    And the user runs the "Safari Tickets Summary Report" for "2026-06-15"
    Then the report shows:
      | Date       | Total Tickets Sold | Total Revenue (AED) |
      | 2026-06-15 | 18                 | 2500.00              |
    And the breakdown by category is:
      | Category | Tickets Sold | Revenue (AED) |
      | Standard | 10           | 1000.00       |
      | Golden   | 3            | 750.00        |
      | Silver   | 5            | 750.00        |

  @positive @filter
  Scenario: Summary for a date range
    Given additional bookings on 2026-06-16: 5 Standard tickets (500 AED)
    When the user selects the range 2026-06-15 to 2026-06-16
    Then the report shows total tickets = 23 and total revenue = 3000.00 AED

  @negative
  Scenario: No tickets sold on the selected day
    When the user runs the summary for a closed park day
    Then the report displays "No tickets sold on this date" or totals are 0

  @negative @rbac
  Scenario: Unauthorised role cannot view summary
    Given the user is "Safari Gate Agent"
    Then access is denied

  @negative
  Scenario: Category with zero sales omitted or shown as zero
    Given on a particular day, no Golden tickets are sold
    When the summary is generated, the Golden row either shows 0 or is absent without errors
