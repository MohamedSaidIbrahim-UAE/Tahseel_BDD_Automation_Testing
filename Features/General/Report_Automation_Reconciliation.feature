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
    When the user navigates to the report "Detailed_Report_of_POS_Transactions_by_Revenue_Source"
    And the user sets the date range from the first day of the current year to today
    And the user clicks "VIEW REPORT"
    And the user exports the report to Excel with filename "transactionpaymentservicessummaryreceivable_sec"
    Then the Excel file should be downloaded successfully

  @export @all-payment-methods
  Scenario: Export Transaction Fees For All Payment Methods to Excel
    When the user navigates to the report "Transaction Fees For All Payment Methods"
    And the user selects the "Revenue Transactions" dropdown option
    And the user sets the date range from the first day of the current year to today
    And the user clicks "VIEW REPORT"
    And the user exports the report to Excel with filename "TransactionFeesForAllPaymentMethods"
    Then the Excel file should be downloaded successfully

  @export @universal-payments
  Scenario: Export Universal Payment Methods Report to Excel
    When the user navigates to the report "Total Transactions report by revenue entity"
    And the user sets the date range from the first day of the current year to today
    And the user selects universal payment methods from the tag box
    And the user clicks "VIEW REPORT"
    And the user exports the report to Excel with filename "Total_Transactions_report_by_revenue_entity"
    Then the Excel file should be downloaded successfully

  @export @amanat
  Scenario: Export Amanat Universal Payments Report to Excel
    When the user navigates to the report "Aggregated Transactions Report paid by Credit cards"
    And the user selects universal payment methods from the tag box
    And the user selects the "Deposit Transactions" dropdown option
    And the user sets the date range from the first day of the current year to today
    And the user clicks "VIEW REPORT"
    And the user exports the report to Excel with filename "Aggregated_Transactions_Report_paid_by_Credit_cards"
    Then the Excel file should be downloaded successfully

  @export @credit-card
  Scenario: Export Total Credit Card Report to Excel
    When the user navigates to the report "Summary GITFees Report for smart Reciept"
    And the user selects universal payment methods from the tag box
    And the user sets the date range from the first day of the current year to today
    And the user clicks "VIEW REPORT"
    And the user exports the report to Excel with filename "Summary_GITFees_Report_for_smart_Reciept"
    Then the Excel file should be downloaded successfully

  @export @smart-receipt
  Scenario: Export Smart Receipt Details Report to Excel
    When the user navigates to the report "Smart Receipt Details"
    And the user applies the filter status "Paid"
    And the user sets the date range from the first day of the current year to today
    And the user clicks "VIEW REPORT"
    And the user exports the report to Excel with filename "Smart_Receipt_Details"
    Then the Excel file should be downloaded successfully

  @export @support-services
  Scenario: Export Support Services Reports Report to Excel
    When the user navigates to the report "Support Services Reports"
    And the user selects the "Revenue Transactions" dropdown option
    And the user sets the date range from the first day of the current year to today
    And the user clicks "Search"
    And the user exports the report to Excel with filename "Support_Services_Reports"
    Then the Excel file should be downloaded successfully

  @export @total-charges
  Scenario: Export Report the total service charges for loading Transactions Report to Excel
    When the user navigates to the report "Report the total service charges for loading Transactions"
    And the user sets the date range from the first day of the current year to today
    And the user clicks "VIEW REPORT"
    And the user exports the report to Excel with filename "Report_the_total_service_charges_for_loading_Transactions"
    Then the Excel file should be downloaded successfully

  @export @total-tax
  Scenario: Export Total Revenue Tax Report to Excel
    When the user navigates to the report "Transaction Summary Tax Report"
    And the user applies the filter status "Paid"
    And the user selects universal payment methods from the tag box
    And the user selects the "Revenue Transactions" dropdown option
    And the user sets the date range from the first day of the current year to today
    And the user clicks "VIEW REPORT"
    And the user exports the report to Excel with filename "RevenueTRANSACTIONTAXSUMARY"
    Then the Excel file should be downloaded successfully

  @export @total-tax
  Scenario: Export Total Deposit Tax Report to Excel
    When the user navigates to the report "Transaction Summary Tax Report"
    And the user applies the filter status "Paid"
    And the user selects universal payment methods from the tag box
    And the user selects the "Deposit Transactions" dropdown option
    And the user sets the date range from the first day of the current year to today
    And the user clicks "VIEW REPORT"
    And the user exports the report to Excel with filename "DepositTRANSACTIONTAXSUMARY"
    Then the Excel file should be downloaded successfully

  @export @total-transaction
  Scenario: Export Total Revenue Transaction Report to Excel
    When the user navigates to the report "Summary Transactions Report"
    And the user applies the filter status "Paid"
    And the user selects universal payment methods from the tag box
    And the user selects the "Revenue Transactions" dropdown option
    And the user sets the date range from the first day of the current year to today
    And the user clicks "VIEW REPORT"
    And the user exports the report to Excel with filename "ShjGovRevenueTransSummary_sec"
    Then the Excel file should be downloaded successfully

  @export @total-transaction
  Scenario: Export Total Revenue Transaction Report to Excel
    When the user navigates to the report "Summary Transactions Report"
    And the user applies the filter status "Paid"
    And the user selects universal payment methods from the tag box
    And the user selects the "Deposit Transactions" dropdown option
    And the user sets the date range from the first day of the current year to today
    And the user clicks "VIEW REPORT"
    And the user exports the report to Excel with filename "ShjGovDepositTransSummary_sec"
    Then the Excel file should be downloaded successfully

  @export @deposit-receivable
  Scenario: Export Transaction deposits detail Report (receivable) Report to Excel
    When the user navigates to the report "Transaction deposits detail Report (receivable)"
    And the user sets the date range from the first day of the current year to today
    And the user selects universal payment methods from the tag box
    And the user clicks "VIEW REPORT"
    And the user exports the report to Excel with filename "transactionpaymentservicessummaryDepositreceivable"
    Then the Excel file should be downloaded successfully

  @export @service-revenue
  Scenario: Export Dependant services revenue summary Report to Excel
    When the user navigates to the report "Dependant services revenue summary reports"
    And the user sets the date range from the first day of the current year to today
    And the user selects universal payment methods from the tag box
    And the user selects the "Revenue Transactions" dropdown option
    And the user clicks "VIEW REPORT"
    And the user exports the report to Excel with filename "DependantServicesSummaryReport_RevenueTransaction"
    Then the Excel file should be downloaded successfully

  @export @service-revenue
  Scenario: Export Dependant services revenue summary Report to Excel
    When the user navigates to the report "Dependant services revenue summary reports"
    And the user sets the date range from the first day of the current year to today
    And the user selects universal payment methods from the tag box
    And the user selects the "Deposit Transactions" dropdown option
    And the user clicks "VIEW REPORT"
    And the user exports the report to Excel with filename "DependantServicesSummaryReport_DepositTransaction"
    Then the Excel file should be downloaded successfully

  # ═══════════════════════════════════════════════════════════════════════════════
  # SCENARIO 16: Cross-Report Reconciliation
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
  # SCENARIO 17: End-to-End Full Workflow
  # ═══════════════════════════════════════════════════════════════════════════════

  @e2e @smoke
  Scenario: End-to-end report automation and reconciliation workflow
    When the user exports all 11 reports for the date range "01/06/2026" to "30/06/2026"
    And the user performs full cross-report reconciliation
    Then the reconciliation summary should be saved successfully
    And all cross-report comparisons should be consistent
