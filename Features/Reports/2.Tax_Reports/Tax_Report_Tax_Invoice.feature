Feature: Tax Report – Tax Invoice
  As a paying customer or merchant, I need a VAT-compliant invoice for a specific transaction,
  so that I can claim input VAT or maintain records.

  Background:
    Given the user is logged in as "Finance Admin" with invoice generation privileges
    And the system has a 5% VAT rate

  @positive @e2e
  Scenario: Generate a tax invoice for a taxable transaction
    Given a taxable transaction "TXN-501" exists with:
      | Field         | Value                |
      | Service       | SRV-100              |
      | Base Amount   | 5000.00 AED          |
      | VAT Rate      | 5%                   |
      | VAT Amount    | 250.00 AED           |
      | Total Amount  | 5250.00 AED          |
      | Payment Method| Credit Card          |
      | Entity        | Civil Aviation             |
    When the user navigates to the "Tax Invoice" report and enters transaction ID "TXN-501"
    Then a VAT-compliant invoice is displayed with the following details:
      | Invoice Field      | Expected Value               |
      | Transaction ID     | TXN-501                      |
      | Date & Time        | The exact transaction timestamp |
      | Base Amount        | 5000.00 AED                  |
      | VAT Rate           | 5%                           |
      | VAT Amount         | 250.00 AED                   |
      | Total incl. VAT    | 5250.00 AED                  |
      | Supplier TRN       | Displayed and valid (if configured) |
      | Customer Info      | Displayed (if applicable)    |
    And the invoice can be exported to PDF
    And the PDF contains all mandatory tax invoice fields as per UAE FTA requirements

  @positive @e2e
  Scenario: Tax invoice for an exempt transaction shows zero VAT
    Given an exempt transaction "TXN-502" with 0% VAT exists
    When the user generates the tax invoice for "TXN-502"
    Then the invoice shows "Exempt" or "0%" in the VAT rate column
    And the total amount equals the base amount (no VAT added)

  @positive @e2e @localisation
  Scenario: Tax invoice in Arabic language
    Given the user switches the portal language to Arabic
    When the user generates the tax invoice for "TXN-501"
    Then the invoice layout is right-to-left
    And all labels and amounts are correctly translated into Arabic
    And the PDF export preserves the RTL layout

  @negative
  Scenario: Invoice for a non-existent transaction
    When the user enters a non-existent transaction ID "INVALID-999"
    Then the system displays "Transaction not found" and no invoice is generated

  @negative @rbac
  Scenario: Unauthorised user attempts to generate a tax invoice
    Given the user is logged in as "Customer Support"
    When the user tries to access the Tax Invoice report
    Then an "Access Denied" error is shown

  @negative @performance
  Scenario: High concurrency on invoice generation
    Given 50 users simultaneously request tax invoices for different valid transactions
    Then each user receives the correct invoice within 10 seconds without any server errors
