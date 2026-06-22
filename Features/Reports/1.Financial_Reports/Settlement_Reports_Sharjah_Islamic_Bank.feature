Feature: Settlement Reports – Sharjah Islamic Bank

  @positive @e2e
  Scenario: SIB settlement full match
    Given a SIB settlement file containing 20 debit card transactions matching internal records exactly
    When the "Sharjah Islamic Bank Settlement Report" is generated
    Then all records show "Matched" and the total fee sum matches the internal service fee report

  @negative
  Scenario: SIB settlement file with extra record
    Given a SIB file that contains an extra transaction not in the internal system
    When the report is generated
    Then that transaction is flagged as "Unmatched – Bank Only" and does not affect internal totals
