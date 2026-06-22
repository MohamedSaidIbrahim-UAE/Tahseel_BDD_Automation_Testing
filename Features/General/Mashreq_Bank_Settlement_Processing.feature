Feature: Mashreq Bank Settlement Processing

  Background:
    Given the user is logged in as "Settlement Officer"

  @positive
  Scenario: Upload and process valid settlement file
    When the user uploads a Mashreq settlement file with 100 transactions
    Then the system displays a preview with match results
    And after confirmation, the settlement is posted

  @negative
  Scenario: Invalid file format
    When the user uploads a CSV file with wrong column order
    Then the system rejects with "Invalid file format: expected columns missing"

  @negative
  Scenario: Empty file
    When uploading an empty file, the system shows "File has no data"
