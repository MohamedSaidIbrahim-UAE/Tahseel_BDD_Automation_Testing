Feature: HelpDesk Inquiries

  Background:
    Given the user is logged in as "Support Agent"

  @positive
  Scenario Outline: Successful inquiry
    When the user searches for a valid "<Transaction Type>" by ID or card number
    Then the details are shown with correct amounts, dates, and status
    And sensitive fields like full card number are masked

    Examples:
      | Transaction Type |
      | Credit Card Transaction |
      | Refund Transaction |
      | Topup Transaction |
      | Deduct Transaction |
      | MPOS Transaction |
      | Upgrade Transaction |
      | Payment Link Transaction |

  @positive
  Scenario: Tickets Delivery inquiry
    When the user searches for a valid ticket booking reference
    Then the delivery status and details are displayed

  @positive
  Scenario: Daily deposit inquiry for business service centers
    When the user selects a center and date, deposits are listed

  @positive
  Scenario: Manage Safari Booking Dates
    When the user views the calendar, all open/close dates are shown correctly

  @negative
  Scenario: Inquiry with non-existent ID
    When the user searches with an invalid ID
    Then a "Not found" message is returned

  @negative
  Scenario: SQL injection attempt
    When the user enters "1' OR '1'='1" in the search field
    Then the system sanitises the input and returns no data, no error
