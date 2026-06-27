Feature: Exhibitions and Events Management

  Background:
    Given the user is logged in as "Event Coordinator"

  @positive
  Scenario: Register a publishing house and allocate device
    When the user creates a publishing house "Dar Al-Kitab"
    And allocates POS device "DEV-01" to it for the "Sharjah Book Fair"
    And records delivery
    Then the device appears in "Book Publisher Devices" with status "Delivered"

  @negative
  Scenario: Allocate already assigned device
    When trying to allocate "DEV-01" to another publisher while still assigned
    Then the system warns "Device already assigned"
