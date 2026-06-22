Feature: Settlement Reports – UAE Central Bank

  @positive @e2e
  Scenario: Central Bank settlement compliance
    Given a Central Bank standard settlement file for a monthly period
    When the "UAE central bank settlement report" is run
    Then the report contains all mandatory fields: Transaction Count, Total Value, Fee Breakdown, Date
    And the report matches the external file totals

  @negative
  Scenario: Central Bank settlement with missing mandatory column
    Given a Central Bank file missing the "transaction_date" column
    When attempting to generate the report
    Then the system rejects the file and displays "Invalid file format: missing transaction_date"
