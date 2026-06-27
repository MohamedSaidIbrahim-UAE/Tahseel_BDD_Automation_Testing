Feature: Intensive Settlement Details Report

  @positive @e2e
  Scenario: Large settlement file with partial matches
    Given a settlement file with 5000 records containing 10 records with amount mismatch and 5 missing internally
    When the "Intensive Settlement Details Report" is generated
    Then all mismatches are listed with exact variance
    And all unmatched records are flagged appropriately
    And the report completes within 20 seconds

  @negative
  Scenario: Intensive settlement with entirely empty file
    Given an empty settlement file (only headers)
    When the report is run
    Then the system shows "No settlement data to display" without errors
