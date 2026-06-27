Feature: Cheques Management

  Background:
    Given the user is logged in as "Cheque Clerk"

  @positive
  Scenario: Register a new cheque
    When the user registers cheque "CHQ-100" with amount 500 AED, bank "Bank A"
    Then it appears in the cheques list

  @positive
  Scenario: Merge cheques
    Given two cheques "CHQ-200" (200 AED) and "CHQ-201" (300 AED) exist
    When the user merges them into a batch
    Then a new batch entry with total 500 AED is created

  @negative
  Scenario: Merge already merged cheque
    When attempting to merge an already merged cheque, the system prevents it

  @negative
  Scenario: Cheque number duplicate
    When registering a cheque with an existing number, the system rejects
