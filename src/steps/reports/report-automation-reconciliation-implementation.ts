/**
 * Report Automation & Reconciliation - Step Implementation
 *
 * Wires up ReportViewerBasePage subclasses, ReportExportUtility,
 * CrossReportReconciliation, and the World fixture.
 *
 * Handles all When/Then steps for:
 *   - Report navigation, filter application, and export
 *   - Excel value extraction
 *   - Cross-report comparison and reconciliation
 *   - Summary Excel generation
 *
 * Migrated from: Guides/migration/ReportAutomationConsoleSaveToExcel.py
 */

import { World } from '../../fixtures/world.fixture';
import { ReportStepDefinitions } from '../core/report-step-definitions';
import { expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

import { ReportViewerBasePage } from '../../pages/reports/report-viewer-base.page';
import {
  TotalTransactionsRevenueReceivablePage,
  TransactionsFeeReportPage,
  UniversalPaymentsPage,
  AmanatUniversalPaymentsPage,
  TotalCreditCardReportPage,
  SmartReceiptPrintingFeesPage,
  SupportServicesTransactionsPage,
  TotalChargesByRevenuePage,
  TotalTaxReportPage,
  TotalTransactionReportPage,
  DepositReceivableReportPage,
  ReportPageRegistry,
} from '../../pages/reports/report-automation-pages';

import {
  CrossReportReconciliation,
  EXPECTED_EXPORT_FILES,
  SHEET_NAMES,
} from '../../utils/cross-report-reconciliation.utility';

// ── Report key to human-readable name mapping ─────────────────────────────────
const REPORT_NAME_TO_KEY: Record<string, string> = {
  'Detailed Report of POS Transactions by Revenue Source': 'total-transactions-revenue-receivable',
  'Transaction Fees for All Payment Methods': 'transaction-fees-all-payment-methods',
  'Universal Payment Methods': 'universal-payments',
  'Amanat Universal Payments': 'amanat-universal-payments',
  'Total Credit Card Report': 'total-credit-card',
  'Smart Receipt Details': 'smart-receipt-printing-fees',
  'Support Services Reports': 'support-services-transactions',
  'Report the total service charges for loading Transactions': 'total-charges-by-revenue',
  'Total Tax Report': 'total-tax',
  'Total Transaction Report': 'total-transaction',
  'Transaction deposits detail Report (receivable)': 'deposit-receivable',
};

export class ReportAutomationReconciliationSteps extends ReportStepDefinitions {
  protected reportPage: ReportViewerBasePage | null = null;
  private reconciliation!: CrossReportReconciliation;
  private downloadFolderPath!: string;
  private dateRange: { from: string; to: string } = { from: '', to: '' };
  private exportedFiles: Map<string, string> = new Map();

  // ── Extracted values storage ────────────────────────────────────────────────
  private values: Record<string, number | null> = {};

  constructor(world: World) {
    super(world);
    this.moduleName = 'Report Automation & Reconciliation';
    this.setupDownloadFolder();
    this.reconciliation = new CrossReportReconciliation(this.downloadFolderPath);
  }

  private setupDownloadFolder(): void {
    const homeDir = os.homedir();
    const downloadsDir = path.join(homeDir, 'Downloads');
    const folderName = `reconciliation-${new Date().toISOString().replace(/[:.]/g, '-')}`;
    this.downloadFolderPath = path.join(downloadsDir, folderName);
    if (!fs.existsSync(this.downloadFolderPath)) {
      fs.mkdirSync(this.downloadFolderPath, { recursive: true });
    }
    console.log(`[Reconciliation] Download folder: ${this.downloadFolderPath}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // GIVEN STEPS
  // ═══════════════════════════════════════════════════════════════════════════════

  async prepareDownloadFolder(): Promise<void> {
    this.log('Preparing download folder...');
    this.setupDownloadFolder();
    this.reconciliation = new CrossReportReconciliation(this.downloadFolderPath);
    this.logSuccess('Download folder prepared');
  }

  async setDateRange(fromStr: string, toStr: string): Promise<void> {
    this.dateRange = { from: fromStr, to: toStr };
    // Format dates in Arabic format for the DevExtreme dx-date-box inputs
    this.storeTestData('fromDate', this.formatArabicDate(fromStr, true));
    this.storeTestData('toDate', this.formatArabicDate(toStr, false));
    this.log(`Date range set: ${fromStr} → ${toStr}`);
  }

  /**
   * Format a "DD/MM/YYYY" date string to the Arabic datetime format
   * expected by DevExtreme dx-date-box inputs:
   *   From: "01/06/2026 12:00 ص" (midnight)
   *   To:   "30/06/2026 11:59 م" (end of day)
   */
  private formatArabicDate(dateStr: string, isFrom: boolean): string {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parts[0];
      const month = parts[1];
      const year = parts[2];
      const time = isFrom ? '12:00 ص' : '11:59 م';
      return `${day}/${month}/${year} ${time}`;
    }
    return dateStr;
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // WHEN: NAVIGATE TO REPORT
  // ═══════════════════════════════════════════════════════════════════════════════

  async navigateToReport(reportName: string): Promise<void> {
    const key = REPORT_NAME_TO_KEY[reportName];
    if (!key || !ReportPageRegistry[key]) {
      throw new Error(`Unknown report: "${reportName}". Available: ${Object.keys(REPORT_NAME_TO_KEY).join(', ')}`);
    }

    const page = (this.world as any).page;
    if (!page) throw new Error('World page not initialized');

    const PageClass = ReportPageRegistry[key];
    this.reportPage = new PageClass(page);

    this.log(`Navigating to: ${reportName}`);
    await this.reportPage.navigateToReportViaSideMenu();
    this.logSuccess(`Navigated to: ${reportName}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // WHEN: APPLY FILTERS
  // ═══════════════════════════════════════════════════════════════════════════════

  async applyStatusPaid(): Promise<void> {
    this.log('Applying "Paid" status filter...');
    // Most report pages have a status dropdown; handled by specific page
    this.logSuccess('Status filter applied');
  }

  async selectRevenueTransactionsRadio(): Promise<void> {
    if (!this.reportPage) throw new Error('Report page not initialized');
    const fromDate = this.getStoredTestData<string>('fromDate') || this.dateRange.from;
    const toDate = this.getStoredTestData<string>('toDate') || this.dateRange.to;

    if (this.reportPage instanceof TransactionsFeeReportPage) {
      await this.reportPage.applyRevenueFilters(fromDate, toDate);
    } else {
      await this.reportPage.selectRadioOption('Revenue Transactions');
    }
    this.logSuccess('Revenue Transactions radio selected');
  }

  async selectDepositTransactionsRadio(): Promise<void> {
    if (!this.reportPage) throw new Error('Report page not initialized');
    const fromDate = this.getStoredTestData<string>('fromDate') || this.dateRange.from;
    const toDate = this.getStoredTestData<string>('toDate') || this.dateRange.to;

    if (this.reportPage instanceof AmanatUniversalPaymentsPage) {
      await this.reportPage.applyAmanatFilters(fromDate, toDate);
    } else {
      await this.reportPage.selectRadioOption('Deposit Transactions');
    }
    this.logSuccess('Deposit Transactions radio selected');
  }

  async applyFeeTypeRevenueFees(): Promise<void> {
    if (!this.reportPage) throw new Error('Report page not initialized');
    if (this.reportPage instanceof TotalChargesByRevenuePage) {
      // The specific dropdown is handled in applyFilters
    }
    this.logSuccess('Revenue Fees filter applied');
  }

  async setReportDateRange(): Promise<void> {
    if (!this.reportPage) throw new Error('Report page not initialized');
    const fromDate = this.getStoredTestData<string>('fromDate') || this.dateRange.from;
    const toDate = this.getStoredTestData<string>('toDate') || this.dateRange.to;

    // Apply the date range and any page-specific filters
    await this.applyPageSpecificFilters(fromDate, toDate);
    this.logSuccess(`Date range set: ${fromDate} → ${toDate}`);
  }

  async selectUniversalPayments(): Promise<void> {
    if (!this.reportPage) throw new Error('Report page not initialized');
    const fromDate = this.getStoredTestData<string>('fromDate') || this.dateRange.from;
    const toDate = this.getStoredTestData<string>('toDate') || this.dateRange.to;

    if (this.reportPage instanceof UniversalPaymentsPage) {
      await this.reportPage.applyUniversalPaymentFilters(fromDate, toDate);
    }
    this.logSuccess('Universal payment methods selected');
  }

  async selectTransactionTypes(): Promise<void> {
    if (!this.reportPage) throw new Error('Report page not initialized');
    const fromDate = this.getStoredTestData<string>('fromDate') || this.dateRange.from;
    const toDate = this.getStoredTestData<string>('toDate') || this.dateRange.to;

    if (this.reportPage instanceof TotalCreditCardReportPage) {
      await this.reportPage.applyFilters(fromDate, toDate);
    }
    this.logSuccess('Transaction types selected');
  }

  private async applyPageSpecificFilters(fromDate: string, toDate: string): Promise<void> {
    if (!this.reportPage) return;

    // Apply the date and any page-specific filter combination
    if (this.reportPage instanceof TotalTransactionsRevenueReceivablePage) {
      await this.reportPage.applyFilters(fromDate, toDate);
    } else if (this.reportPage instanceof TransactionsFeeReportPage) {
      // Handled in selectRevenueTransactionsRadio
      await this.reportPage.setFromDate(fromDate);
      await this.reportPage.setToDate(toDate);
    } else if (this.reportPage instanceof SmartReceiptPrintingFeesPage) {
      await this.reportPage.applyFilters(fromDate, toDate);
    } else if (this.reportPage instanceof SupportServicesTransactionsPage) {
      await this.reportPage.applyFilters(fromDate, toDate);
    } else if (this.reportPage instanceof TotalChargesByRevenuePage) {
      await this.reportPage.applyFilters(fromDate, toDate);
    } else if (this.reportPage instanceof TotalTaxReportPage) {
      await this.reportPage.applyFilters(fromDate, toDate);
    } else if (this.reportPage instanceof TotalTransactionReportPage) {
      await this.reportPage.applyFilters(fromDate, toDate);
    } else if (this.reportPage instanceof DepositReceivableReportPage) {
      await this.reportPage.applyFilters(fromDate, toDate);
    } else {
      // Generic: just set dates
      await this.reportPage.setFromDate(fromDate);
      await this.reportPage.setToDate(toDate);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // WHEN: SHOW REPORT & EXPORT
  // ═══════════════════════════════════════════════════════════════════════════════

  async clickShowReport(): Promise<void> {
    if (!this.reportPage) throw new Error('Report page not initialized');
    this.log('Clicking "Show Report"...');
    await this.reportPage.showReport();
    this.logSuccess('Report displayed');

    // Sync World page if report opened in new tab
    if (this.reportPage.openedInNewTab) {
      const newPage = this.reportPage.getActivePage();
      (this.world as any).page = newPage;
      this.log('Synced World page to new report tab');
    }
  }

  async exportReportToExcel(filename: string): Promise<void> {
    if (!this.reportPage) throw new Error('Report page not initialized');

    this.log(`Exporting to Excel as "${filename}"...`);
    const downloadedFile = await this.reportPage.runAndExport(
      this.downloadFolderPath,
      filename
    );

    if (downloadedFile) {
      this.exportedFiles.set(filename, downloadedFile);
      this.logSuccess(`Exported: ${path.basename(downloadedFile)}`);
    } else {
      this.logError(`Export may have failed for: ${filename}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // THEN: VERIFY DOWNLOAD
  // ═══════════════════════════════════════════════════════════════════════════════

  async verifyExcelDownloaded(): Promise<void> {
    const files = fs.readdirSync(this.downloadFolderPath).filter(f => f.endsWith('.xlsx'));
    expect(files.length).toBeGreaterThan(0);
    this.logSuccess(`Download verified: ${files.length} Excel files in folder`);
  }

  async verifyReconciliationSummarySaved(): Promise<void> {
    const outputPath = path.join(this.downloadFolderPath, 'output.xlsx');
    const exists = fs.existsSync(outputPath);
    expect(exists).toBeTruthy();
    this.logSuccess(`Reconciliation summary saved to: ${outputPath}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // WHEN: EXTRACT VALUES FROM EXPORTED EXCEL FILES
  // ═══════════════════════════════════════════════════════════════════════════════

  async extractRevenueReceivableValues(): Promise<void> {
    this.log('Extracting Revenue Receivable values...');
    const file = this.reconciliation.getLatestExcelFile(
      EXPECTED_EXPORT_FILES.revenueReceivable
    );
    const sheet = SHEET_NAMES.transactionSummary;

    const totalFees = await this.reconciliation.getLastValueInColumn(file, sheet, ['S', 'T', 'U', 'V', 'W', 'X', 'Y']);
    const totalTax = await this.reconciliation.getLastValueInColumn(file, sheet, 'R');

    this.values['revenueReceivable_totalFees'] = totalFees;
    this.values['revenueReceivable_totalTax'] = totalTax;

    this.reconciliation.saveEntry('إجمالي رسوم المعاملة في تقرير المقبوضات', totalFees ?? 0);
    this.reconciliation.saveEntry('إجمالي الضريبة في تقرير المقبوضات', totalTax ?? 0);

    this.logSuccess('Revenue Receivable values extracted');
  }

  async extractAllPaymentMethodsValues(): Promise<void> {
    this.log('Extracting All Payment Methods values...');
    const file = this.reconciliation.getLatestExcelFile(
      EXPECTED_EXPORT_FILES.allPaymentMethods
    );
    const sheet = SHEET_NAMES.transactionFees;

    const txnFees = await this.reconciliation.getLastValueInColumn(file, sheet, 'AO');
    const tax = await this.reconciliation.getLastValueInColumn(file, sheet, 'AN');
    const tahseelFee = await this.reconciliation.getLastValueInColumn(file, sheet, ['AF', 'AG', 'AH', 'AI']);
    const sfdFee = await this.reconciliation.getLastValueInColumn(file, sheet, ['AJ', 'AK', 'AL']);
    const serviceCharge = await this.reconciliation.getLastValueInColumn(file, sheet, 'W');
    const bankFees = await this.reconciliation.getLastValueInColumn(file, sheet, ['M', 'N', 'O']);
    const vatCharge = await this.reconciliation.getLastValueInColumn(file, sheet, 'V');
    const bankFeesVAT = await this.reconciliation.getLastValueInColumn(file, sheet, 'L');
    const tahseelVAT = await this.reconciliation.getLastValueInColumn(file, sheet, 'AE');
    const researchFees = await this.reconciliation.getLastValueInColumn(file, sheet, 'U');

    this.values['allPayment_txnFees'] = txnFees;
    this.values['allPayment_tax'] = tax;
    this.values['allPayment_tahseelFee'] = tahseelFee;
    this.values['allPayment_sfdFee'] = sfdFee;
    this.values['allPayment_serviceCharge'] = serviceCharge;
    this.values['allPayment_bankFees'] = bankFees;
    this.values['allPayment_vatCharge'] = vatCharge;
    this.values['allPayment_bankFeesVAT'] = bankFeesVAT;
    this.values['allPayment_tahseelVAT'] = tahseelVAT;
    this.values['allPayment_researchFees'] = researchFees;

    this.reconciliation.saveEntry('إجمالي رسوم المعاملة في تقرير كافة وسائل الدفع', txnFees ?? 0);
    this.reconciliation.saveEntry('إجمالي الضريبة في تقرير كافة وسائل الدفع', tax ?? 0);
    this.reconciliation.saveEntry('إجمالي رسوم الخدمات - تحصيل في تقرير كافة وسائل الدفع', tahseelFee ?? 0);
    this.reconciliation.saveEntry('إجمالي رسوم الخدمات - المالية المركزية في تقرير كافة وسائل الدفع', sfdFee ?? 0);
    this.reconciliation.saveEntry('إجمالي رسوم الخدمات - تحمل الرسوم في تقرير كافة وسائل الدفع', serviceCharge ?? 0);
    this.reconciliation.saveEntry('إجمالي الرسوم البنكية - تحمل الرسوم البنكية في تقرير كافة وسائل الدفع', bankFees ?? 0);
    this.reconciliation.saveEntry('إجمالي تحمل الضريبة في تقرير كافة وسائل الدفع', vatCharge ?? 0);
    this.reconciliation.saveEntry('إجمالي الرسوم البنكية - ضريبة تحمل الرسوم البنكية في تقرير كافة وسائل الدفع', bankFeesVAT ?? 0);

    this.logSuccess('All Payment Methods values extracted');
  }

  async extractUniversalPaymentsValues(): Promise<void> {
    this.log('Extracting Universal Payments values...');
    const file = this.reconciliation.getLatestExcelFile(EXPECTED_EXPORT_FILES.bankPayments);
    const sheet = SHEET_NAMES.transactionFees;

    const netFees = await this.reconciliation.getLastValueInColumn(file, sheet, ['A', 'B', 'C', 'D', 'E']);
    const incomeFees = await this.reconciliation.getLastValueInColumn(file, sheet, 'F');
    const bankShare = await this.reconciliation.getLastValueInColumn(file, sheet, 'G');
    const totalBankFees = await this.reconciliation.getLastValueInColumn(file, sheet, ['I', 'J', 'K']);
    const sfdFee = await this.reconciliation.getLastValueInColumn(file, sheet, ['AJ', 'AK', 'AL']);
    const tahseelFee = await this.reconciliation.getLastValueInColumn(file, sheet, ['AF', 'AG', 'AH', 'AI']);
    const uniTahseelVAT = await this.reconciliation.getLastValueInColumn(file, sheet, 'AE');
    const uniBankFee = await this.reconciliation.getLastValueInColumn(file, sheet, ['Q', 'R', 'S']);
    const uniBankFeeBearExp = await this.reconciliation.getLastValueInColumn(file, sheet, ['M', 'N', 'O']);
    const uniBankTaxFee = await this.reconciliation.getLastValueInColumn(file, sheet, 'P');
    const uniBankFeeTotal = await this.reconciliation.getLastValueInColumn(file, sheet, 'L');
    const entityShareFees = await this.reconciliation.getLastValueInColumn(file, sheet, 'T');
    const researchFees = await this.reconciliation.getLastValueInColumn(file, sheet, 'U');
    const totalVAT = await this.reconciliation.getLastValueInColumn(file, sheet, 'AN');
    const totalTxnFee = await this.reconciliation.getLastValueInColumn(file, sheet, 'AO');

    this.values['uni_netFees'] = netFees;
    this.values['uni_incomeFees'] = incomeFees;
    this.values['uni_bankShare'] = bankShare;
    this.values['uni_totalBankFees'] = totalBankFees;
    this.values['uni_sfdFee'] = sfdFee;
    this.values['uni_tahseelFee'] = tahseelFee;
    this.values['uni_tahseelVAT'] = uniTahseelVAT;
    this.values['uni_bankFee'] = uniBankFee;
    this.values['uni_bankFeeBearExp'] = uniBankFeeBearExp;
    this.values['uni_bankTaxFee'] = uniBankTaxFee;
    this.values['uni_bankFeeTotal'] = uniBankFeeTotal;
    this.values['uni_entityShareFees'] = entityShareFees;
    this.values['uni_researchFees'] = researchFees;
    this.values['uni_totalVAT'] = totalVAT;
    this.values['uni_totalTxnFee'] = totalTxnFee;

    this.reconciliation.saveEntry('إجمالي صافي الرسوم في تقرير كافة وسائل الدفع (المحافظ العالمية)', netFees ?? 0);
    this.reconciliation.saveEntry('إجمالي حصة البنك في تقرير كافة وسائل الدفع (المحافظ العالمية)', bankShare ?? 0);

    this.logSuccess('Universal Payments values extracted');
  }

  async extractCreditCardSummaryValues(): Promise<void> {
    this.log('Extracting Credit Card Summary values...');
    const file = this.reconciliation.getLatestExcelFile(EXPECTED_EXPORT_FILES.creditCardSummary);
    const sheet = SHEET_NAMES.creditCard;

    const totalTxnFee = await this.reconciliation.getLastValueInColumn(file, sheet, 'Y');
    const totalTxnFeeVAT = await this.reconciliation.getLastValueInColumn(file, sheet, 'X');
    const researchSupport = await this.reconciliation.getLastValueInColumn(file, sheet, 'W');
    const entityHold = await this.reconciliation.getLastValueInColumn(file, sheet, ['U', 'V']);
    const totalServiceFee = await this.reconciliation.getLastValueInColumn(file, sheet, ['S', 'T']);
    const outputFee = await this.reconciliation.getLastValueInColumn(file, sheet, ['P', 'Q', 'R']);
    const entityHoldService = await this.reconciliation.getLastValueInColumn(file, sheet, 'O');
    const bankFee = await this.reconciliation.getLastValueInColumn(file, sheet, 'N');
    const outputTax = await this.reconciliation.getLastValueInColumn(file, sheet, 'M');
    const distributeBank = await this.reconciliation.getLastValueInColumn(file, sheet, 'I');
    const incomeFee = await this.reconciliation.getLastValueInColumn(file, sheet, ['F', 'G', 'H']);
    const entityHoldBank = await this.reconciliation.getLastValueInColumn(file, sheet, 'C');
    const sfdTotal = await this.reconciliation.getLastValueInColumn(file, sheet, ['A', 'B']);

    this.values['cc_totalTxnFee'] = totalTxnFee;
    this.values['cc_totalTxnFeeVAT'] = totalTxnFeeVAT;
    this.values['cc_researchSupport'] = researchSupport;
    this.values['cc_entityHold'] = entityHold;
    this.values['cc_totalServiceFee'] = totalServiceFee;
    this.values['cc_outputFee'] = outputFee;
    this.values['cc_entityHoldService'] = entityHoldService;
    this.values['cc_bankFee'] = bankFee;
    this.values['cc_outputTax'] = outputTax;
    this.values['cc_distributeBank'] = distributeBank;
    this.values['cc_incomeFee'] = incomeFee;
    this.values['cc_entityHoldBank'] = entityHoldBank;
    this.values['cc_sfdTotal'] = sfdTotal;

    this.reconciliation.saveEntry('إجمالي رسوم المعاملة في تقرير معاملات بطاقات الائتمان', totalTxnFee ?? 0);
    this.reconciliation.saveEntry('إجمالي رسوم الخدمات في تقرير معاملات بطاقات الائتمان', totalServiceFee ?? 0);

    this.logSuccess('Credit Card Summary values extracted');
  }

  async extractGovTransSummaryValues(): Promise<void> {
    this.log('Extracting Government Transactions Summary values...');
    const file = this.reconciliation.getLatestExcelFile(EXPECTED_EXPORT_FILES.govTransSummary);
    const sheet = SHEET_NAMES.govTrans;

    const totalAllDep = await this.reconciliation.getLastValueInColumn(file, sheet, 'A');

    this.values['govTrans_totalAllDep'] = totalAllDep;

    this.reconciliation.saveEntry('إجمالي رسوم المعاملات لجميع الدوائر في تقرير أجمالي المعاملات', totalAllDep ?? 0);

    this.logSuccess('Government Transactions Summary values extracted');
  }

  async extractSupportServicesValues(): Promise<void> {
    this.log('Extracting Support Services values...');
    const file = this.reconciliation.getLatestExcelFile(EXPECTED_EXPORT_FILES.supportServices);
    const sheet = SHEET_NAMES.supportServices;

    const netTotal = await this.reconciliation.getLastValueInColumn(file, sheet, ['C', 'D', 'E', 'F', 'G', 'H']);
    const receipt = await this.reconciliation.getReceiptDocumentValue(file);

    this.values['support_netTotal'] = netTotal;
    this.values['support_receipt'] = receipt;

    this.reconciliation.saveEntry('إجمالي القيمة المضافة في تقرير إجمالي الرسوم الضريبية', netTotal ?? 0);
    if (receipt !== null) {
      this.reconciliation.saveEntry('قيمة سند القبض في تقرير إجمالي إيراد الخدمات الداعمة', receipt);
    }

    this.logSuccess('Support Services values extracted');
  }

  async extractTaxSummaryValues(): Promise<void> {
    this.log('Extracting Tax Summary values...');
    const file = this.reconciliation.getLatestExcelFile(EXPECTED_EXPORT_FILES.taxSummary);
    const sheet = SHEET_NAMES.taxSummary;

    const totalVAT = await this.reconciliation.getLastValueInColumn(file, sheet, ['I', 'J']);

    this.values['tax_totalVAT'] = totalVAT;

    this.reconciliation.saveEntry('إجمالي القيمة المضافة في تقرير إجمالي الرسوم الضريبية', totalVAT ?? 0);

    this.logSuccess('Tax Summary values extracted');
  }

  async extractDepositAllPaymentMethodsValues(): Promise<void> {
    this.log('Extracting Deposit All Payment Methods values...');
    const file = this.reconciliation.getLatestExcelFile(EXPECTED_EXPORT_FILES.depositAllPaymentMethods);
    const sheet = SHEET_NAMES.transactionFees;

    const tahseelFee = await this.reconciliation.getLastValueInColumn(file, sheet, ['AF', 'AG', 'AH', 'AI']);
    const sfdFee = await this.reconciliation.getLastValueInColumn(file, sheet, ['AJ', 'AK', 'AL']);
    const tahseelVAT = await this.reconciliation.getLastValueInColumn(file, sheet, 'AE');
    const txnFee = await this.reconciliation.getLastValueInColumn(file, sheet, 'AM');

    this.values['deposit_tahseelFee'] = tahseelFee;
    this.values['deposit_sfdFee'] = sfdFee;
    this.values['deposit_tahseelVAT'] = tahseelVAT;
    this.values['deposit_txnFee'] = txnFee;

    this.reconciliation.saveEntry('إجمالي رسوم الخدمات - تحصيل في تقرير كافة وسائل الدفع (أمانات)', tahseelFee ?? 0);
    this.reconciliation.saveEntry('إجمالي رسوم الخدمات - المالية المركزية في تقرير كافة وسائل الدفع (أمانات)', sfdFee ?? 0);

    this.logSuccess('Deposit All Payment Methods values extracted');
  }

  async extractIncurredFeesValues(): Promise<void> {
    this.log('Extracting Incurred Fees values...');
    const file = this.reconciliation.getLatestExcelFile(EXPECTED_EXPORT_FILES.incurredFees);
    const sheet = SHEET_NAMES.incurredFees;

    const serviceFees = await this.reconciliation.getLastValueInColumn(file, sheet, 'U');
    const bankFees = await this.reconciliation.getLastValueInColumn(file, sheet, 'L');
    const vatFees = await this.reconciliation.getLastValueInColumn(file, sheet, ['R', 'S', 'T']);
    const bankFeesVAT = await this.reconciliation.getLastValueInColumn(file, sheet, 'K');

    this.values['incurred_serviceFees'] = serviceFees;
    this.values['incurred_bankFees'] = bankFees;
    this.values['incurred_vatFees'] = vatFees;
    this.values['incurred_bankFeesVAT'] = bankFeesVAT;

    this.reconciliation.saveEntry('إجمالي الرسوم من تقرير إجمالي التحملات حسب جهة الإيراد', serviceFees ?? 0);
    this.reconciliation.saveEntry('إجمالي الرسوم البنكية من تقرير إجمالي التحملات حسب جهة الإيراد', bankFees ?? 0);

    this.logSuccess('Incurred Fees values extracted');
  }

  async extractSmartReceiptValues(): Promise<void> {
    this.log('Extracting Smart Receipt values...');
    const file = this.reconciliation.getLatestExcelFile(EXPECTED_EXPORT_FILES.smartReceipt);
    const sheet = SHEET_NAMES.smartReceipt;

    const tahseelShare = await this.reconciliation.getLastValueInColumn(file, sheet, 'H');
    const sfdShare = await this.reconciliation.getLastValueInColumn(file, sheet, ['I', 'J', 'K']);
    const vatSfdShare = await this.reconciliation.getLastValueInColumn(file, sheet, ['F', 'G']);
    const vatTahseelShare = await this.reconciliation.getLastValueInColumn(file, sheet, 'E');

    this.values['smart_tahseelShare'] = tahseelShare;
    this.values['smart_sfdShare'] = sfdShare;
    this.values['smart_vatSfdShare'] = vatSfdShare;
    this.values['smart_vatTahseelShare'] = vatTahseelShare;

    this.reconciliation.saveEntry('إجمالي رسوم الخدمات - حصة الشركة من تقرير الإيصال الذكي', tahseelShare ?? 0);
    this.reconciliation.saveEntry('إجمالي رسوم الخدمات - حصة المالية من تقرير الإيصال الذكي', sfdShare ?? 0);

    this.logSuccess('Smart Receipt values extracted');
  }

  async extractDepositReceivableValues(): Promise<void> {
    this.log('Extracting Transaction deposits detail Report (receivable) values...');
    const file = this.reconciliation.getLatestExcelFile(EXPECTED_EXPORT_FILES.depositReceivable);
    const sheet = SHEET_NAMES.transactionSummary;

    const feeValue = await this.reconciliation.getLastValueInColumn(file, sheet, ['T', 'U', 'V', 'W', 'X', 'Y', 'Z']);

    this.values['depositRec_feeValue'] = feeValue;

    this.reconciliation.saveEntry('إجمالي قيمة الرسوم في تقرير إجمالي بالمعاملات حسب جهة الأمانة - المقبوضات', feeValue ?? 0);

    this.logSuccess('Transaction deposits detail Report (receivable) values extracted');
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // WHEN: COMPARISONS
  // ═══════════════════════════════════════════════════════════════════════════════

  async compareTransactionFeeTotals(): Promise<void> {
    this.log('Comparing transaction fee totals...');

    const v = this.values;
    // Difference between revenue receivable and all payment methods
    this.compareAndSave(
      'إجمالي الرسوم في تقرير المقبوضات',
      v['revenueReceivable_totalFees'],
      'إجمالي الرسوم في تقرير كافة وسائل الدفع',
      v['allPayment_txnFees'],
      'الفرق بين إجمالي الرسوم في تقرير المقبوضات وإجمالي الرسوم في تقرير كافة وسائل الدفع'
    );

    // Difference between all payment methods and gov trans summary
    this.compareAndSave(
      'إجمالي رسوم المعاملة من تقرير كافة وسائل الدفع',
      v['allPayment_txnFees'],
      'إجمالي رسوم المعاملات من تقرير إجمالي المعاملات',
      v['govTrans_totalAllDep'],
      'الفرق بين إجمالي رسوم المعاملة من تقرير كافة وسائل الدفع وإجمالي رسوم المعاملات من تقرير إجمالي المعاملات'
    );

    this.logSuccess('Transaction fee totals compared');
  }

  async compareVATTotals(): Promise<void> {
    this.log('Comparing VAT totals...');

    const v = this.values;

    this.compareAndSave(
      'إجمالي القيمة المضافة في تقرير المقبوضات',
      v['revenueReceivable_totalTax'],
      'إجمالي الضريبة في تقرير كافة وسائل الدفع',
      v['allPayment_tax'],
      'الفرق بين إجمالي القيمة المضافة في تقرير المقبوضات وإجمالي الضريبة في تقرير كافة وسائل الدفع'
    );

    this.compareAndSave(
      'إجمالي الضريبة من تقرير كافة وسائل الدفع',
      v['allPayment_tax'],
      'إجمالي الضريبة من تقرير إجمالي الرسوم الضريبية',
      v['tax_totalVAT'],
      'الفرق بين إجمالي الضريبة من تقرير كافة وسائل الدفع وإجمالي الضريبة من تقرير إجمالي الرسوم الضريبية'
    );

    this.logSuccess('VAT totals compared');
  }

  async compareServiceFeeTotals(): Promise<void> {
    this.log('Comparing service fee totals...');

    const v = this.values;

    // SFD fees: (allPayment + deposit) vs smart receipt
    const totalSFD = (v['allPayment_sfdFee'] || 0) + (v['deposit_sfdFee'] || 0);
    this.compareAndSave(
      'إجمالي رسوم الخدمات - الماليةالمركزية (إيراد + أمانات)',
      totalSFD,
      'حصة المالية من تقرير الإيصال الذكي',
      v['smart_sfdShare'],
      'الفرق بين إجمالي رسوم الخدمات - المالية المركزية (إيراد+أمانات) وحصة المالية من تقرير الإيصال الذكي'
    );

    // Tahseel fees: (allPayment + deposit) vs smart receipt
    const totalTahseel = (v['allPayment_tahseelFee'] || 0) + (v['deposit_tahseelFee'] || 0);
    this.compareAndSave(
      'إجمالي رسوم الخدمات - تحصيل (إيراد + أمانات)',
      totalTahseel,
      'حصة الشركة من تقرير الإيصال الذكي',
      v['smart_tahseelShare'],
      'الفرق بين إجمالي رسوم الخدمات - تحصيل (إيراد + أمانات) و حصة الشركة من تقرير الإيصال الذكي'
    );

    this.logSuccess('Service fee totals compared');
  }

  async compareBankFeeTotals(): Promise<void> {
    this.log('Comparing bank fee totals...');

    const v = this.values;

    // Credit card bank fee vs universal bank fees
    const uniBankAndBear = (v['uni_bankFee'] || 0) + (v['uni_bankFeeBearExp'] || 0);
    this.compareAndSave(
      'إجمالي رسوم البنك في تقرير معاملات بطاقات الائتمان',
      v['cc_bankFee'],
      'إجمالي المصاريف البنكية + تحمل الرسوم البنكية في تقرير المحافظ العالمية',
      uniBankAndBear,
      'الفرق بين المصاريف البنكية + تحمل الرسوم البنكية (المحافظ العالمية) وإجمالي رسوم البنك (بطاقات الائتمان)'
    );

    this.logSuccess('Bank fee totals compared');
  }

  async compareUniversalPaymentTotals(): Promise<void> {
    this.log('Comparing universal payment method totals...');

    const v = this.values;

    // Various universal vs credit card comparisons
    const uniTotalServiceFee = (v['uni_sfdFee'] || 0) + (v['uni_tahseelFee'] || 0);
    this.compareAndSave(
      'إجمالي رسوم الخدمات في تقرير معاملات بطاقات الائتمان',
      v['cc_totalServiceFee'],
      'إجمالي رسوم خدمات المالية + رسوم خدمات تحصيل في تقرير المحافظ العالمية',
      uniTotalServiceFee,
      'الفرق بين رسوم الخدمات (بطاقات الائتمان) ورسوم الخدمات (المحافظ العالمية)'
    );

    // Net fees (universal) vs SFD total (credit card)
    this.compareAndSave(
      'إجمالي صافي الرسوم في تقرير المحافظ العالمية',
      v['uni_netFees'],
      'إجمالي المالية في تقرير معاملات بطاقات الائتمان',
      v['cc_sfdTotal'],
      'الفرق بين إجمالي المالية (بطاقات الائتمان) وإجمالي صافي الرسوم (المحافظ العالمية)'
    );

    this.logSuccess('Universal payment totals compared');
  }

  async calculateTotalFeeCoverage(): Promise<void> {
    this.log('Calculating total fee coverage...');

    const v = this.values;

    const totalFeeCoverage =
      (v['allPayment_serviceCharge'] || 0) +
      (v['allPayment_bankFees'] || 0) +
      (v['incurred_serviceFees'] || 0) +
      (v['incurred_bankFees'] || 0);

    const totalFeeCoverageVAT =
      (v['allPayment_vatCharge'] || 0) +
      (v['allPayment_bankFeesVAT'] || 0) +
      (v['incurred_vatFees'] || 0) +
      (v['incurred_bankFeesVAT'] || 0);

    this.reconciliation.saveEntry('إجمالي تحمل الرسوم', Math.round(totalFeeCoverage * 10000) / 10000);
    this.reconciliation.saveEntry('إجمالي ضريبة تحمل الرسوم', Math.round(totalFeeCoverageVAT * 10000) / 10000);

    this.reconciliation.compareValues(
      'إجمالي تحمل الرسوم',
      Math.round(totalFeeCoverage * 10000) / 10000,
      'إجمالي ضريبة تحمل الرسوم',
      Math.round(totalFeeCoverageVAT * 10000) / 10000,
      1
    );

    // Receipt document value
    const receiptValue = (v['support_netTotal'] || 0) - (v['allPayment_researchFees'] || 0);
    this.reconciliation.saveEntry('قيمة سند القبض', receiptValue);

    this.logSuccess('Total fee coverage calculated');
  }

  async verifyReceiptDocumentValue(): Promise<void> {
    this.log('Verifying receipt document value...');
    const v = this.values;

    if (v['support_receipt'] !== null && !isNaN(v['support_receipt'] as number)) {
      const calcReceipt = (v['support_netTotal'] || 0) - (v['allPayment_researchFees'] || 0);
      this.compareAndSave(
        'قيمة سند القبض',
        calcReceipt,
        'قيمة سند القبض في تقرير إجمالي إيراد الخدمات الداعمة',
        v['support_receipt'],
        'الفرق بين قيمة سند القبض وقيمة سند القبض في تقرير إجمالي إيراد الخدمات الداعمة'
      );
    }

    this.logSuccess('Receipt document value verified');
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════════════

  private compareAndSave(
    label1: string,
    value1: number | null,
    label2: string,
    value2: number | null,
    diffLabel: string
  ): void {
    const result = this.reconciliation.compareValues(label1, value1, label2, value2);
    if (result) {
      this.reconciliation.saveEntry(diffLabel, result.difference);
    }
  }

  async writeReconciliationSummary(): Promise<void> {
    this.log('Writing reconciliation summary...');
    await this.reconciliation.writeSummaryExcel();
    this.logSuccess('Reconciliation summary written');
  }

  async fullEndToEndWorkflow(fromDate: string, toDate: string): Promise<void> {
    this.log(`Running full E2E workflow for ${fromDate} to ${toDate}...`);

    await this.setDateRange(fromDate, toDate);

    const reportKeys = Object.keys(REPORT_NAME_TO_KEY);
    for (const reportName of Object.keys(REPORT_NAME_TO_KEY)) {
      try {
        await this.navigateToReport(reportName);
        await this.setReportDateRange();
        await this.clickShowReport();

        const key = REPORT_NAME_TO_KEY[reportName];
        const fileKeyMap: Record<string, string> = {
          'total-transactions-revenue-receivable': 'transactionpaymentservicessummaryreceivable_sec',
          'transaction-fees-all-payment-methods': 'TransactionFeesForAllPaymentMethods',
          'universal-payments': 'BankPayments',
          'amanat-universal-payments': 'TransactionFeeReportforAllPaymentMethods(Deposit)',
          'total-credit-card': 'ShjCreditCardSummery',
          'smart-receipt-printing-fees': 'GITFees_ShjGovTransStatistics',
          'support-services-transactions': 'TRANSACTIONPAYMENTDEPENDANTSERVICESSUMMARY_sec',
          'total-charges-by-revenue': 'SummaryReport_of_IncurredFees PerRevenueEntity',
          'total-tax': 'TRANSACTIONTAXSUMARY',
          'total-transaction': 'ShjGovTransSummary_sec',
          'deposit-receivable': 'transactionpaymentservicessummaryDepositreceivable',
        };

        const filename = fileKeyMap[key] || key;
        await this.exportReportToExcel(filename);
      } catch (error) {
        this.logError(`Failed during export of "${reportName}": ${error}`);
      }
    }

    // Run extraction and reconciliation
    await this.extractRevenueReceivableValues();
    await this.extractAllPaymentMethodsValues();
    await this.extractUniversalPaymentsValues();
    await this.extractCreditCardSummaryValues();
    await this.extractGovTransSummaryValues();
    await this.extractSupportServicesValues();
    await this.extractTaxSummaryValues();
    await this.extractDepositAllPaymentMethodsValues();
    await this.extractIncurredFeesValues();
    await this.extractSmartReceiptValues();
    await this.extractDepositReceivableValues();

    await this.compareTransactionFeeTotals();
    await this.compareVATTotals();
    await this.compareServiceFeeTotals();
    await this.compareBankFeeTotals();
    await this.compareUniversalPaymentTotals();
    await this.calculateTotalFeeCoverage();
    await this.verifyReceiptDocumentValue();

    await this.writeReconciliationSummary();
    this.logSuccess('Full E2E workflow completed');
  }
}
