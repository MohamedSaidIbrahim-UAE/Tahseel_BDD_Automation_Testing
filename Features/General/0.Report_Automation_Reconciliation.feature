@report-automation @reconciliation @authenticated
Feature: Report Automation and Cross-Report Financial Reconciliation
  As a financial auditor
  I want to export the 11 official Tahseel reports to Excel
  And reconcile all financial components (fees, taxes, bank charges, service fees, research fees, receipt value)
  So that I can verify the absolute consistency of financial data across all report types
  with a tolerance of 0.01 AED

  Background:
    Given the download folder is prepared for report exports
    # The date range is set via input in the script; we can parameterise if needed.
    # For demonstration, we use a fixed range that the user can override via hooks.
    Given the date range is "{fromDate}" to "{toDate}"
    # And the tolerance threshold is set to 0.01

  # ═══════════════════════════════════════════════════════════════════════════════
  # SCENARIOS 1–11: Export Each Report (Exactly as per Legacy Script)
  # ═══════════════════════════════════════════════════════════════════════════════

  @export @revenue-receivable
  Scenario: 1 – Export Revenue Receivable Report
    When the user navigates to the report "Detailed Report of POS Transactions by Revenue Source"
    And the user sets the date range from the first day of the current year to today
    And I select "Paid" from the "Transaction Status" select dropdown
    And the user clicks "VIEW REPORT"
    And the user exports the report to Excel with filename "transactionpaymentservicessummaryreceivable_sec"
    Then the Excel file should be downloaded successfully

  @export @all-payment-methods-revenue
  Scenario: 2 – Export Transaction Fees For All Payment Methods (Revenue)
    When the user navigates to the report "Transaction Fees For All Payment Methods"
    And the user selects universal payment methods from the tag box
    And I select "Revenue Transactions" from the "Transaction Type" radio options
    And I select "Paid" from the "Transaction Status" select dropdown
    And the user sets the date range from the first day of the current year to today
    And the user clicks "VIEW REPORT"
    And the user exports the report to Excel with filename "TransactionFeesForAllPaymentMethods"
    Then the Excel file should be downloaded successfully

  @export @universal-payments
  Scenario: 3 – Export Universal Payment Methods (Bank Payments)
    When the user navigates to the report "Total Transactions report by revenue entity"
    And the user selects universal payment methods from the tag box
    And the user sets the date range from the first day of the current year to today
    And the user clicks "VIEW REPORT"
    And the user exports the report to Excel with filename "BankPayments"
    Then the Excel file should be downloaded successfully

  @export @all-payment-methods-deposit
  Scenario: 4 – Export Transaction Fees For All Payment Methods (Deposit / Amanat)
    When the user navigates to the report "Transaction Fees For All Payment Methods"
    And I select "Deposit Transactions" from the "Transaction Type" radio options
    And the user sets the date range from the fiI select "Deposit Transactions" from the "Transaction Type" radio optionsrst day of the current year to today
    And the user clicks "VIEW REPORT"
    And the user exports the report to Excel with filename "TransactionFeeReportforAllPaymentMethods(Deposit)"
    Then the Excel file should be downloaded successfully

  @export @credit-card-summary
  Scenario: 5 – Export Total Credit Card Summary Report
    When the user navigates to the report "Aggregated Transactions Report paid by Credit cards"
    And the user selects universal payment methods from the tag box
    And I select "Deposit Transactions" from the "Transaction Type" radio options
    And the user sets the date range from the first day of the current year to today
    And the user clicks "VIEW REPORT"
    And the user exports the report to Excel with filename "ShjCreditCardSummery"
    Then the Excel file should be downloaded successfully

  @export @smart-receipt-fees
  Scenario: 6 – Export Smart Receipt Printing Fees Report
    When the user navigates to the report "Summary GITFees Report for smart Reciept"
    And I select "Paid" from the "Transaction Status" select dropdown
    And the user sets the date range from the first day of the current year to today
    And the user clicks "VIEW REPORT"
    And the user exports the report to Excel with filename "GITFees_ShjGovTransStatistics"
    Then the Excel file should be downloaded successfully

  @export @support-services
  Scenario: 7 – Export Support Services Transactions Report
    When the user navigates to the report "Support Services Reports"
    And I select "Revenue Transactions" from the "Transaction Type" radio options
    And I select "Paid" from the "Transaction Status" select dropdown
    And the user sets the date range from the first day of the current year to today
    And the user clicks "Search"
    And the user exports the report to Excel with filename "TRANSACTIONPAYMENTDEPENDANTSERVICESSUMMARY_sec"
    Then the Excel file should be downloaded successfully

  @export @incurred-fees
  Scenario: 8 – Export Incurred Fees (Total Charges) Report
    When the user navigates to the report "Report the total service charges for loading Transactions"
    And I select "Paid" from the "Transaction Status" select dropdown
    And the user applies the filter fee type "Revenue Fees"
    And the user sets the date range from the first day of the current year to today
    And the user clicks "VIEW REPORT"
    And the user exports the report to Excel with filename "SummaryReport_of_IncurredFees PerRevenueEntity"
    Then the Excel file should be downloaded successfully

  @export @tax-revenue
  Scenario: 9 – Export Total Tax Report (Revenue)
    When the user navigates to the report "Transaction Summary Tax Report"
    And I select "Paid" from the "Transaction Status" select dropdown
    And the user selects universal payment methods from the tag box
    And I select "Revenue Transactions" from the "Transaction Type" radio options
    And the user sets the date range from the first day of the current year to today
    And the user clicks "VIEW REPORT"
    And the user exports the report to Excel with filename "TRANSACTIONTAXSUMARY"
    Then the Excel file should be downloaded successfully

  @export @total-transactions-revenue
  Scenario: 10 – Export Total Transactions Report (Revenue)
    When the user navigates to the report "Summary Transactions Report"
    And I select "Paid" from the "Transaction Status" select dropdown
    And the user selects universal payment methods from the tag box
    And I select "Revenue Transactions" from the "Transaction Type" radio options
    And the user sets the date range from the first day of the current year to today
    And the user clicks "VIEW REPORT"
    And the user exports the report to Excel with filename "ShjGovTransSummary_sec"
    Then the Excel file should be downloaded successfully

  @export @deposit-receivable
  Scenario: 11 – Export Deposit Receivable Report
    When the user navigates to the report "Transaction deposits detail Report (receivable)"
    And the user sets the date range from the first day of the current year to today
    And the user selects universal payment methods from the tag box
    And the user clicks "VIEW REPORT"
    And the user exports the report to Excel with filename "transactionpaymentservicessummaryDepositreceivable"
    Then the Excel file should be downloaded successfully

  # ═══════════════════════════════════════════════════════════════════════════════
  # SCENARIO 12: FULL CROSS-REPORT RECONCILIATION (MIRRORING PYTHON LOGIC)
  # ═══════════════════════════════════════════════════════════════════════════════

  @reconciliation @full-audit @financial-validation
  Scenario: Complete financial reconciliation across all exported reports with detailed component validation
    Given all 11 report exports from scenarios 1-11 are available in the download folder
    And the Excel files follow the standard naming conventions

    # ── Extract all values from each report (matching Python's get_last_value_in_column) ──
    When the user extracts the following values from the Revenue Receivable report:
      | Value Name                          | Sheet Name                          | Column(s)      |
      | Revenue_Transaction_Fees           | transactionpaymentservicessumma     | S,T,U,V,W,X,Y  |
      | Revenue_Tax_Total                  | transactionpaymentservicessumma     | R              |
    And the user extracts the following values from the All Payment Methods (Revenue) report:
      | Value Name                                | Sheet Name                          | Column(s)        |
      | AllPay_Transaction_Fees                  | TransactionFeesForAllPaymentMet     | AO               |
      | AllPay_Tax_Total                         | TransactionFeesForAllPaymentMet     | AN               |
      | AllPay_Tahseel_ServiceFee                | TransactionFeesForAllPaymentMet     | AF,AG,AH,AI      |
      | AllPay_SFD_ServiceFee                    | TransactionFeesForAllPaymentMet     | AJ,AK,AL         |
      | AllPay_ServiceFee_Charges                | TransactionFeesForAllPaymentMet     | W                |
      | AllPay_BankFees                          | TransactionFeesForAllPaymentMet     | M,N,O            |
      | AllPay_VAT_Charge                        | TransactionFeesForAllPaymentMet     | V                |
      | AllPay_BankFees_VAT                      | TransactionFeesForAllPaymentMet     | L                |
      | AllPay_Tahseel_VAT                       | TransactionFeesForAllPaymentMet     | AE               |
      | AllPay_ResearchFees                      | TransactionFeesForAllPaymentMet     | U                |
    And the user extracts the following values from the Universal Payments (BankPayments) report:
      | Value Name                                | Sheet Name                          | Column(s)        |
      | BankPay_NetFees                          | TransactionFeesForAllPaymentMet     | A,B,C,D,E        |
      | BankPay_IncomeFees                       | TransactionFeesForAllPaymentMet     | F                |
      | BankPay_BankShare                        | TransactionFeesForAllPaymentMet     | G                |
      | BankPay_TotalBankFees                    | TransactionFeesForAllPaymentMet     | I,J,K            |
      | BankPay_SFD_ServiceFee                   | TransactionFeesForAllPaymentMet     | AJ,AK,AL         |
      | BankPay_Tahseel_ServiceFee               | TransactionFeesForAllPaymentMet     | AF,AG,AH,AI      |
      | BankPay_Tahseel_VAT                      | TransactionFeesForAllPaymentMet     | AE               |
      | BankPay_BankFee                          | TransactionFeesForAllPaymentMet     | Q,R,S            |
      | BankPay_BankFee_BearExp                  | TransactionFeesForAllPaymentMet     | M,N,O            |
      | BankPay_BankTaxFee                       | TransactionFeesForAllPaymentMet     | P                |
      | BankPay_BankFeeTotal                     | TransactionFeesForAllPaymentMet     | L                |
      | BankPay_EntityShareFeesForResarchFees    | TransactionFeesForAllPaymentMet     | T                |
      | BankPay_ResarchFees                      | TransactionFeesForAllPaymentMet     | U                |
      | BankPay_TotalVATForEntityFee             | TransactionFeesForAllPaymentMet     | AN               |
      | BankPay_TotalTransactionFeeForEntityFee  | TransactionFeesForAllPaymentMet     | AO               |
    And the user extracts the following values from the All Payment Methods (Deposit) report:
      | Value Name                                | Sheet Name                          | Column(s)        |
      | Deposit_Tahseel_ServiceFee               | TransactionFeesForAllPaymentMet     | AF,AG,AH,AI      |
      | Deposit_SFD_ServiceFee                   | TransactionFeesForAllPaymentMet     | AJ,AK,AL         |
      | Deposit_Tahseel_VAT                      | TransactionFeesForAllPaymentMet     | AE               |
      | Deposit_Transaction_Fees                 | TransactionFeesForAllPaymentMet     | AM               |
    And the user extracts the following values from the Credit Card Summary report:
      | Value Name                                | Sheet Name                          | Column(s)        |
      | Credit_TotalTransactionFee               | Sheet1                              | Y                |
      | Credit_TotalTransactionFeeVat            | Sheet1                              | X                |
      | Credit_ResearchSupportFees               | Sheet1                              | W                |
      | Credit_EntityHold                        | Sheet1                              | U,V              |
      | Credit_TotalServiceFee                   | Sheet1                              | S,T              |
      | Credit_OutputFee                         | Sheet1                              | P,Q,R            |
      | Credit_EntityHoldServiceFee              | Sheet1                              | O                |
      | Credit_BankFee                           | Sheet1                              | N                |
      | Credit_OutputTax                         | Sheet1                              | M                |
      | Credit_DistributeBankFees_Bank           | Sheet1                              | I                |
      | Credit_DistributeBankFees_IncomeFee      | Sheet1                              | F,G,H            |
      | Credit_DistributeBankFees_EntityHold     | Sheet1                              | C                |
      | Credit_SFDTotal                          | Sheet1                              | A,B              |
    And the user extracts the following values from the Smart Receipt Fees report:
      | Value Name                                | Sheet Name                          | Column(s)        |
      | Smart_Tahseel_Share                      | هيئة مطار الشارقة                   | H                |
      | Smart_SFD_Share                          | هيئة مطار الشارقة                   | I,J,K            |
      | Smart_SFD_VAT                            | هيئة مطار الشارقة                   | F,G              |
      | Smart_Tahseel_VAT                        | هيئة مطار الشارقة                   | E                |
    And the user extracts the following values from the Support Services report:
      | Value Name                                | Sheet Name                          | Column(s)        |
      | Support_NetTotal                         | TRANSACTIONPAYMENTDEPENDANTSERV     | C,D,E,F,G,H      |
      # Receipt document value is extracted separately (row containing "سند قبض")
    And the user extracts the following values from the Incurred Fees report:
      | Value Name                                | Sheet Name                          | Column(s)        |
      | Incurred_ServiceFees                     | SummaryReport_of_IncurredFees P     | U                |
      | Incurred_BankFees                        | SummaryReport_of_IncurredFees P     | L                |
      | Incurred_VAT_ServiceFees                 | SummaryReport_of_IncurredFees P     | R,S,T            |
      | Incurred_BankFeesVAT                     | SummaryReport_of_IncurredFees P     | K                |
    And the user extracts the following values from the Tax Report (Revenue):
      | Value Name                                | Sheet Name                          | Column(s)        |
      | Tax_TotalVAT                             | TRANSACTIONTAXSUMARY                | I,J              |
    And the user extracts the following values from the Total Transactions Report (Revenue):
      | Value Name                                | Sheet Name                          | Column(s)        |
      | TotalTrans_AllDepts                      | جمارك الشارقة                       | A                |
    And the user extracts the following values from the Deposit Receivable report:
      | Value Name                                | Sheet Name                          | Column(s)        |
      | DepositReceivable_Fees                   | transactionpaymentservicessumma     | T,U,V,W,X,Y,Z    |

    # ── Now perform all validations exactly as in the Python script ──

    # 1. Compare transaction fees across reports
    Then the transaction fee from Revenue Receivable report should equal the transaction fee from All Payment Methods (Revenue) within tolerance
    And the transaction fee from All Payment Methods (Revenue) should equal the transaction fee from Total Transactions (Revenue) within tolerance

    # 2. Compare VAT totals
    Then the VAT from Revenue Receivable should equal the VAT from All Payment Methods (Revenue) within tolerance
    And the VAT from All Payment Methods (Revenue) should equal the VAT from Tax Report (Revenue) within tolerance

    # 3. Compare service fee components
    Then the total SFD service fee (Revenue + Deposit) should equal the SFD share from Smart Receipt report within tolerance
    And the total Tahseel service fee (Revenue + Deposit) should equal the Tahseel share from Smart Receipt report within tolerance

    # 4. Compare universal payment (bank) service fees
    Then the total service fee from Credit Card Summary should equal the sum of SFD and Tahseel service fees from BankPayments report within tolerance
    And the output VAT from Credit Card Summary should equal the Tahseel VAT from BankPayments report within tolerance

    # 5. Compare bank fees
    Then the bank fee from Credit Card Summary should equal the sum of bank fees and bank fee bear expenses from BankPayments report within tolerance
    And the bank fee output tax from Credit Card Summary should equal the sum of bank fee VAT and bank fee bear VAT from BankPayments report within tolerance

    # 6. Compare deposit related fees
    Then the fee from Deposit Receivable report should equal the transaction fee from All Payment Methods (Deposit) within tolerance

    # 7. Compare universal payment net fees with SFD total
    Then the net fees from BankPayments report should equal the SFD total from Credit Card Summary within tolerance

    # 8. Compare income tax (input VAT) distributions
    Then the income VAT from Credit Card Summary should equal the income VAT from BankPayments report within tolerance

    # 9. Compare bank share distributions
    Then the bank share from Credit Card Summary should equal the bank share from BankPayments report within tolerance

    # 10. Compare entity hold for bank fees
    Then the entity hold from Credit Card Summary should equal the sum of bank fee bear expense and its VAT from BankPayments report within tolerance

    # 11. Compare total bank fees (including tax)
    Then the bank fee plus output tax from Credit Card Summary should equal the total bank fees from BankPayments report within tolerance

    # 12. Compare entity transaction fees
    Then the entity transaction fee from BankPayments report should equal the transaction fee from Credit Card Summary within tolerance

    # 13. Compare entity VAT
    Then the entity VAT from BankPayments report should equal the output VAT on transaction fee from Credit Card Summary within tolerance

    # 14. Compare research fees
    Then the research fee from Credit Card Summary should equal the research fee from BankPayments report within tolerance

    # 15. Compare entity research fee hold
    Then the entity hold for research from Credit Card Summary should equal the entity share for research from BankPayments report within tolerance

    # 16. Calculate total fee coverage (sum of all fees and VAT) and verify
    When the user calculates total fee coverage from all reports
    Then the total fee coverage should equal the sum of "إجمالي تحمل الرسوم" and "إجمالي ضريبة تحمل الرسوم" within tolerance

    # 17. Validate receipt document value from Support Services
    When the user extracts the receipt document value from Support Services report (row containing "سند قبض")
    Then the receipt document value should equal the difference between net total of Support Services and research fees within tolerance

    # ── Final output and audit ──
    Then the detailed reconciliation results are saved to an Excel file "reconciliation_output_{timestamp}.xlsx"
    And the reconciliation audit log is written to "log.txt" with full Arabic and English details
    And all validations pass with zero inconsistencies reported