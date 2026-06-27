Feature: Smart Receipt and Mashreq Merchant Lookup

  Background:
    Given the user is logged in as "Support Agent"

  @positive
  Scenario: Smart receipt inquiry
    When the user searches for a valid receipt ID
    Then the receipt details (amount, date, status) are displayed

  @positive
  Scenario: Update Mashreq merchant
    When the admin updates the settlement account for merchant "MCC-1234"
    Then future settlements use the new account

  @negative
  Scenario: Invalid receipt ID
    When searching with "INVALID-ID", the system returns "Receipt not found"

  @negative
  Scenario: Invalid IBAN for merchant
    When the admin enters an invalid IBAN format, the system rejects with error
