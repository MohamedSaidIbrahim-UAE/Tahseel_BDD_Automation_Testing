Feature: Recovered Wallet Transactions Report
  As a payment recovery officer, I need a list of wallet transactions that were completed
  after being paid via Tahseel account, so that I can reconcile recovered funds.

  Background:
    Given the user is logged in as "Finance Admin"
    And a Tahseel account "ACC‑REC‑01" exists with a pending transaction that was later completed

  @positive @e2e
  Scenario: Recovered wallet transaction appears
    Given a transaction "TXN‑REC‑01" was initially pending and then successfully completed via "ACC‑REC‑01"
    When the user runs the "Recoverd Wallet Transactions Report" for today
    Then "TXN‑REC‑01" is listed with status "Recovered" and the correct amount

  @negative
  Scenario: No recovered transactions
    When the report is run on a day with none, "No recovered transactions" is shown
