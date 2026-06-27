Feature: Packaging Fund Electronic Receipt Inquiry

  Background:
    Given the user is logged in as "Packaging Fund Officer"

  @positive
  Scenario: Valid receipt inquiry
    When the user searches by receipt number "PKG-123"
    Then receipt details with voucher status are displayed

  @negative
  Scenario: Invalid receipt
    When searching for "INVALID-000", the system returns "Receipt not found"
