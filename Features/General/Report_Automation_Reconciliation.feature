# language: en
@report-automation @reconciliation @authenticated
Feature: Report Automation and Cross-Report Reconciliation
  As a financial auditor
  I want to export Tahseel reports to Excel and reconcile values across reports
  So that I can verify financial data consistency across all report types

  Background:
    Given the download folder is prepared for report exports
    And the date range is "01/06/2026" to "30/06/2026"

  # ═══════════════════════════════════════════════════════════════════════════════
  # SCENARIO 1: Export and Reconcile Revenue Source Reports
  # ═══════════════════════════════════════════════════════════════════════════════

  @export @revenue
  Scenario: Export Detailed Report of POS Transactions by Revenue Source to Excel
    When the user navigates to the report "Detailed Report of POS Transactions by Revenue Source"
    And the user applies the filter status "Paid"
    And the user sets the date range
    And the user clicks "Show Report"
    And the user exports the report to Excel with filename "transactionpaymentservicessummaryreceivable_sec"
    Then the Excel file should be downloaded successfully

  @export @all-payment-methods
  Scenario: Export Transaction Fees for All Payment Methods to Excel
    When the user navigates to the report "Transaction Fees for All Payment Methods"
    And the user selects the "Revenue Transactions" radio option
    And the user sets the date range
    And the user clicks "Show Report"
    And the user exports the report to Excel with filename "TransactionFeesForAllPaymentMethods"
    Then the Excel file should be downloaded successfully

  @export @universal-payments
  Scenario: Export Universal Payment Methods Report to Excel
    When the user navigates to the report "Universal Payment Methods"
    And the user sets the date range
    And the user selects universal payment methods from the tag box
    And the user clicks "Show Report"
    And the user exports the report to Excel with filename "BankPayments"
    Then the Excel file should be downloaded successfully

  @export @amanat
  Scenario: Export Amanat Universal Payments Report to Excel
    When the user navigates to the report "Amanat Universal Payments"
    And the user selects the "Deposit Transactions" radio option
    And the user sets the date range
    And the user clicks "Show Report"
    And the user exports the report to Excel with filename "TransactionFeeReportforAllPaymentMethods(Deposit)"
    Then the Excel file should be downloaded successfully

  @export @credit-card
  Scenario: Export Total Credit Card Report to Excel
    When the user navigates to the report "Total Credit Card Report"
    And the user selects transaction types from the tag box
    And the user sets the date range
    And the user clicks "Show Report"
    And the user exports the report to Excel with filename "ShjCreditCardSummery"
    Then the Excel file should be downloaded successfully

  @export @smart-receipt
  Scenario: Export Smart Receipt Details Report to Excel
    When the user navigates to the report "Smart Receipt Details"
    And the user applies the filter status "Paid"
    And the user sets the date range
    And the user clicks "Show Report"
    And the user exports the report to Excel with filename "GITFees_ShjGovTransStatistics"
    Then the Excel file should be downloaded successfully

  @export @support-services
  Scenario: Export Support Services Reports Report to Excel
    When the user navigates to the report "Support Services Reports"
    And the user selects the "Revenue Transactions" radio option
    And the user applies the filter status "Paid"
    And the user sets the date range
    And the user clicks "Show Report"
    And the user exports the report to Excel with filename "TRANSACTIONPAYMENTDEPENDANTSERVICESSUMMARY_sec"
    Then the Excel file should be downloaded successfully

  @export @total-charges
  Scenario: Export Report the total service charges for loading Transactions Report to Excel
    When the user navigates to the report "Report the total service charges for loading Transactions"
    And the user applies the filter status "Paid"
    And the user applies the filter fee type "Revenue Fees"
    And the user sets the date range
    And the user clicks "Show Report"
    And the user exports the report to Excel with filename "SummaryReport_of_IncurredFees PerRevenueEntity"
    Then the Excel file should be downloaded successfully

  @export @total-tax
  Scenario: Export Total Tax Report to Excel
    When the user navigates to the report "Total Tax Report"
    And the user applies the filter status "Paid"
    And the user selects the "Revenue Transactions" radio option
    And the user sets the date range
    And the user clicks "Show Report"
    And the user exports the report to Excel with filename "TRANSACTIONTAXSUMARY"
    Then the Excel file should be downloaded successfully

  @export @total-transaction
  Scenario: Export Total Transaction Report to Excel
    When the user navigates to the report "Total Transaction Report"
    And the user applies the filter status "Paid"
    And the user selects the "Revenue Transactions" radio option
    And the user sets the date range
    And the user clicks "Show Report"
    And the user exports the report to Excel with filename "ShjGovTransSummary_sec"
    Then the Excel file should be downloaded successfully

  @export @deposit-receivable
  Scenario: Export Transaction deposits detail Report (receivable) Report to Excel
    When the user navigates to the report "Transaction deposits detail Report (receivable)"
    And the user sets the date range
    And the user clicks "Show Report"
    And the user exports the report to Excel with filename "transactionpaymentservicessummaryDepositreceivable"
    Then the Excel file should be downloaded successfully

  # ═══════════════════════════════════════════════════════════════════════════════
  # SCENARIO 12: Cross-Report Reconciliation
  # ═══════════════════════════════════════════════════════════════════════════════

  @reconciliation @full-reconciliation
  Scenario: Reconcile values across all exported reports
    Given all 11 reports have been exported to Excel

    When the user extracts values from the "Revenue Receivable" report
    And the user extracts values from the "All Payment Methods" report
    And the user extracts values from the "Universal Payments" report
    And the user extracts values from the "Credit Card Summary" report
    And the user extracts values from the "Government Transactions Summary" report
    And the user extracts values from the "Support Services" report
    And the user extracts values from the "Tax Summary" report
    And the user extracts values from the "Deposit All Payment Methods" report
    And the user extracts values from the "Incurred Fees" report
    And the user extracts values from the "Smart Receipt" report
    And the user extracts values from the "Transaction deposits detail Report (receivable)" report

    And the user compares transaction fee totals across reports
    And the user compares VAT totals across reports
    And the user compares service fee totals across reports
    And the user compares bank fee totals across reports
    And the user compares universal payment method totals across reports
    And the user calculates total fee coverage
    And the user verifies the receipt document value

    Then the reconciliation summary is saved to "output.xlsx"
    And all compared values should be within tolerance

  # ═══════════════════════════════════════════════════════════════════════════════
  # SCENARIO 13: End-to-End Full Workflow
  # ═══════════════════════════════════════════════════════════════════════════════

  @e2e @smoke
  Scenario: End-to-end report automation and reconciliation workflow
    When the user exports all 11 reports for the date range "01/06/2026" to "30/06/2026"
    And the user performs full cross-report reconciliation
    Then the reconciliation summary should be saved successfully
    And all cross-report comparisons should be consistent
