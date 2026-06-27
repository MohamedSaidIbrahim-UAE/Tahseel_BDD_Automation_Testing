Feature: Bank Devices Management

  Background:
    Given the user is logged in as "Device Manager"

  @positive
  Scenario: Register and assign a bank device
    When the user adds a new device "POS-999" and assigns it to merchant "MCC-1234"
    Then the device appears in the merchant's device list

  @negative
  Scenario: Assign device already in use
    When trying to assign an already assigned device, the system alerts "Device already assigned"
