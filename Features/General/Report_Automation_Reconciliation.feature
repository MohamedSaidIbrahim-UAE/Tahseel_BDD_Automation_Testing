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
    And the user sets the date range from the first day of the current year to today
    And the user clicks "VIEW REPORT"
    And the user exports the report to Excel with filename "Detailed_Report_of_POS_Transactions_by_Revenue_Source"
    Then the Excel file should be downloaded successfully

  @export @all-payment-methods
  Scenario: Export Transaction Fees For All Payment Methods to Excel
    When the user navigates to the report "Transaction Fees For All Payment Methods"
    And the user sets the date range from the first day of the current year to today
    And the user selects universal payment methods from the tag box
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
    And I select "Deposit Transactions" from the "Transaction Type" radio options
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
    And I select "Paid" from the "Transaction Status" select dropdown
    And the user sets the date range from the first day of the current year to today
    And the user clicks "VIEW REPORT"
    And the user exports the report to Excel with filename "Smart_Receipt_Details"
    Then the Excel file should be downloaded successfully

  @export @support-services
  Scenario: Export Support Services Reports Report to Excel
    When the user navigates to the report "Support Services Reports"
    And I select "Revenue Transactions" from the "Transaction Type" radio options
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
    And I select "Paid" from the "Transaction Status" select dropdown
    And the user selects universal payment methods from the tag box
    And I select "Revenue Transactions" from the "Transaction Type" radio options
    And the user sets the date range from the first day of the current year to today
    And the user clicks "VIEW REPORT"
    And the user exports the report to Excel with filename "RevenueTRANSACTIONTAXSUMARY"
    Then the Excel file should be downloaded successfully

  @export @total-tax
  Scenario: Export Total Deposit Tax Report to Excel
    When the user navigates to the report "Transaction Summary Tax Report"
    And I select "Paid" from the "Transaction Status" select dropdown
    And the user selects universal payment methods from the tag box
    And I select "Deposit Transactions" from the "Transaction Type" radio options
    And the user sets the date range from the first day of the current year to today
    And the user clicks "VIEW REPORT"
    And the user exports the report to Excel with filename "DepositTRANSACTIONTAXSUMARY"
    Then the Excel file should be downloaded successfully

  @export @total-transaction
  Scenario: Export Total Revenue Transaction Report to Excel
    When the user navigates to the report "Summary Transactions Report"
    And I select "Paid" from the "Transaction Status" select dropdown
    And the user selects universal payment methods from the tag box
    And I select "Revenue Transactions" from the "Transaction Type" radio options
    And the user sets the date range from the first day of the current year to today
    And the user clicks "VIEW REPORT"
    And the user exports the report to Excel with filename "ShjGovRevenueTransSummary_sec"
    Then the Excel file should be downloaded successfully

  @export @total-transaction
  Scenario: Export Total Revenue Transaction Report to Excel
    When the user navigates to the report "Summary Transactions Report"
    And I select "Paid" from the "Transaction Status" select dropdown
    And the user selects universal payment methods from the tag box
    And I select "Deposit Transactions" from the "Transaction Type" radio options
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
    And I select "Revenue Transactions" from the "Transaction Type" radio options
    And the user clicks "VIEW REPORT"
    And the user exports the report to Excel with filename "DependantServicesSummaryReport_RevenueTransaction"
    Then the Excel file should be downloaded successfully

  @export @service-revenue
  Scenario: Export Dependant services revenue summary Report to Excel
    When the user navigates to the report "Dependant services revenue summary reports"
    And the user sets the date range from the first day of the current year to today
    And the user selects universal payment methods from the tag box
    And I select "Deposit Transactions" from the "Transaction Type" radio options
    And the user clicks "VIEW REPORT"
    And the user exports the report to Excel with filename "DependantServicesSummaryReport_DepositTransaction"
    Then the Excel file should be downloaded successfully
  # ═══════════════════════════════════════════════════════════════════════════════
  # SCENARIO 16: Cross-Report Financial Reconciliation
  # ═══════════════════════════════════════════════════════════════════════════════
  # Purpose: Validates financial data consistency across all 11 exported reports
  # by extracting and comparing key totals with acceptable tolerance levels
  # ═══════════════════════════════════════════════════════════════════════════════

  @reconciliation @audit @financial-validation
  Scenario: Reconcile financial totals across all exported reports with tolerance validation
    Given the user has completed all 11 report exports from scenarios 1-15
    And the Excel files are available in the download folder with standard naming conventions
    When the user extracts transaction fee totals from all reports
    And the user extracts VAT totals from all reports
    And the user extracts service fee totals from all reports
    And the user extracts bank fee totals from all reports
    And the user extracts universal payment method totals from all reports
    And the user calculates the total fee coverage amount
    Then the transaction fee totals should match within tolerance across all reports
    And the VAT totals should be consistent within tolerance across all reports
    And the service fee totals should be consistent within tolerance across all reports
    And the bank fee totals should be consistent within tolerance across all reports
    And the universal payment method totals should be consistent across reports
    And the total fee coverage should represent 100% of reported transactions
    And the reconciliation summary should be generated and saved to "reconciliation_output_{timestamp}.xlsx"
    And reconciliation status should be logged with audit trail
  # ═══════════════════════════════════════════════════════════════════════════════
  # SCENARIO 17: End-to-End Automated Report Workflow with Integrated Reconciliation
  # ═══════════════════════════════════════════════════════════════════════════════
  # Purpose: Executes the complete workflow in one test run - all exports followed
  # by automated reconciliation, demonstrating full production-grade process
  # ═══════════════════════════════════════════════════════════════════════════════

  @e2e @smoke @production-workflow @ci
  Scenario: Complete end-to-end report generation and automated reconciliation workflow
    When the user executes the full export workflow for all 11 reports
    And the user applies the date range "01/06/2026" to "30/06/2026" to all report exports
    And the user initiates automated cross-report reconciliation on all exported files
    Then all 11 reports should be exported successfully to Excel format
    And each report file should be named according to standard conventions
    And each exported file should contain valid data with no errors or warnings
    And the cross-report reconciliation should complete without exceptions
    And all extracted values should be within acceptable tolerance thresholds
    And the reconciliation audit log should document all validation steps performed
    And the final reconciliation summary should be saved with timestamp and audit metadata
    And the workflow should complete with zero data inconsistencies reported
