Feature: Topup Master Data

  Background:
    Given the user is logged in as "Topup Admin"

  @positive
  Scenario: Create client, station, and location
    When the user creates a new client "Telecom Co"
    And adds a station "Station 1" under it
    And adds a location "Kiosk A" under that station with coordinates
    Then the entire hierarchy is visible in the respective lists

  @negative
  Scenario: Delete station with transactions
    When trying to delete a station that has processed top‑up transactions
    Then the system prevents deletion with "Station has transactions, cannot delete"

  @negative
  Scenario: Invalid coordinates
    When entering out‑of‑range latitude, the system rejects
