Feature: IBAN Registration

  Background:
    Given the user is logged in as "IBAN Officer"

  @positive
  Scenario: Register a new IBAN
    When the user submits a request with valid IBAN "AE070331234567890123456" for Civil Aviation
    And the request is approved
    Then the IBAN is linked to the entity and appears in the "IBAN Registration Requests" list

  @negative
  Scenario: Invalid IBAN format
    When the user submits "1234"
    Then the system rejects with "Invalid IBAN format"

  @negative
  Scenario: Duplicate IBAN
    When submitting an already registered IBAN, the system rejects with "IBAN already exists"
