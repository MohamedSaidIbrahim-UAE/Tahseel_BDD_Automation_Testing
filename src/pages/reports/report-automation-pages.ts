/**
 * Report Automation POM Pages
 *
 * All 10 report page objects from the legacy ReportAutomationConsoleSaveToExcel.py.
 * Each extends ReportViewerBasePage with report-specific:
 *   - Report UUID (for direct URL navigation)
 *   - Arabic side-menu name
 *   - Date picker XPath selectors
 *   - Dropdown/radio/tag-box filter configurations
 *   - Expected export file names
 *
 * Migrated from: Guides/migration/ReportAutomationConsoleSaveToExcel.py
 */

import { Page } from '@playwright/test';
import { ReportViewerBasePage, ReportPageConfig } from './report-viewer-base.page';

// ═══════════════════════════════════════════════════════════════════════════════════
// 1. Total Report of Transactions by Revenue Source - Receivables Section
//    تقـريـر إجمالى بالمعاملات حسب جهة الايراد - المقبوضات
// ═══════════════════════════════════════════════════════════════════════════════════

export class TotalTransactionsRevenueReceivablePage extends ReportViewerBasePage {
  constructor(page: Page) {
    super(page, {
      reportId: 'da6263af-4818-4b0c-93cd-eafcd446ba5e',
      arabicName: 'تقـريـر  إجمالى بالمعاملات حسب جهة الايراد - المقبوضات',
      englishName: 'Detailed Report of POS Transactions by Revenue Source',
    });
  }

  readonly fromDateInputXPath =
    "dx-date-box input[type='text']";
  readonly toDateInputXPath =
    "dx-date-box input[type='text']";
  readonly paymentMethodSelector =
    "[data-dx_placeholder*='Choose'] ";

  override getDefaultFromDateSelector(): string { return this.fromDateInputXPath; }
  override getDefaultToDateSelector(): string { return this.toDateInputXPath; }

  async applyFilters(fromDate: string, toDate: string): Promise<void> {
    await this.selectDropdownOption(this.paymentMethodSelector, 'All');
    await this.setFromDate(fromDate, this.fromDateInputXPath);
    await this.setToDate(toDate, this.toDateInputXPath);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// 2. Transactions Fee Report for All Payment Methods
// ═══════════════════════════════════════════════════════════════════════════════════

export class TransactionsFeeReportPage extends ReportViewerBasePage {
  constructor(page: Page) {
    super(page, {
      reportId: '97353334-399a-4613-9097-9cf5dc95c690',
      arabicName: 'Payment methods detailed report',
      englishName: 'Transaction Fees For All Payment Methods',
    });
  }

  readonly fromDateInputXPath =
    "dx-date-box input[type='text']";
  readonly toDateInputXPath =
    "dx-date-box input[type='text']";

  override getDefaultFromDateSelector(): string { return this.fromDateInputXPath; }
  override getDefaultToDateSelector(): string { return this.toDateInputXPath; }

  async selectRevenueTransactionsRadio(): Promise<void> {
    await this.selectRadioOption('Revenue Transactions');
  }

  async selectDepositTransactionsRadio(): Promise<void> {
    await this.selectRadioOption('Deposit Transactions');
  }

  async applyRevenueFilters(fromDate: string, toDate: string): Promise<void> {
    await this.selectRevenueTransactionsRadio();
    await this.setFromDate(fromDate, this.fromDateInputXPath);
    await this.setToDate(toDate, this.toDateInputXPath);
  }

  async applyDepositFilters(fromDate: string, toDate: string): Promise<void> {
    await this.selectDepositTransactionsRadio();
    await this.setFromDate(fromDate, this.fromDateInputXPath);
    await this.setToDate(toDate, this.toDateInputXPath);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// 3. Universal Payment Methods (بطاقة ائتمان, جهاز الدفع البنكي, جوجل باي, etc.)
//    Payment methods detailed report | طرق الدفع العالمية
// ═══════════════════════════════════════════════════════════════════════════════════

export class UniversalPaymentsPage extends ReportViewerBasePage {
  constructor(page: Page) {
    super(page, {
      reportId: '8604150a-00b4-4189-8465-ee08a32d30ad',
      arabicName: 'Payment methods detailed report',
      englishName: 'Payment methods detailed report',
    });
  }

  readonly fromDateInputXPath =
    "dx-date-box input[type='text']";
  readonly toDateInputXPath =
    "dx-date-box input[type='text']";
  readonly tagBoxXPath =
    'dx-tag-box';
  readonly okButtonXPath =
    '[aria-label="Submit"]';

  override getDefaultFromDateSelector(): string { return this.fromDateInputXPath; }
  override getDefaultToDateSelector(): string { return this.toDateInputXPath; }

  async applyUniversalPaymentFilters(fromDate: string, toDate: string): Promise<void> {
    await this.setFromDate(fromDate, this.fromDateInputXPath);
    await this.setToDate(toDate, this.toDateInputXPath);
    await this.selectTagBoxItems(this.tagBoxXPath, [
      'Credit Card',
      'Bank POS',
      'Google Pay',
      'Samsung Pay',
      'Apple Pay',
    ], this.okButtonXPath);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// 4. Amanat (Deposits) Universal Payments
//    Payment methods detailed report (أمانات)
// ═══════════════════════════════════════════════════════════════════════════════════

export class AmanatUniversalPaymentsPage extends ReportViewerBasePage {
  constructor(page: Page) {
    super(page, {
      reportId: '8604150a-00b4-4189-8465-ee08a32d30ad',
      arabicName: 'Payment methods detailed report',
      englishName: 'Payment methods detailed report',
    });
  }

  readonly fromDateInputXPath =
    "dx-date-box input[type='text']";
  readonly toDateInputXPath =
    "dx-date-box input[type='text']";

  override getDefaultFromDateSelector(): string { return this.fromDateInputXPath; }
  override getDefaultToDateSelector(): string { return this.toDateInputXPath; }

  async applyAmanatFilters(fromDate: string, toDate: string): Promise<void> {
    await this.selectRadioOption('Deposit Transactions');
    await this.setFromDate(fromDate, this.fromDateInputXPath);
    await this.setToDate(toDate, this.toDateInputXPath);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// 5. Total Credit Card Report
// ═══════════════════════════════════════════════════════════════════════════════════

export class TotalCreditCardReportPage extends ReportViewerBasePage {
  constructor(page: Page) {
    super(page, {
      reportId: 'fedfceac-2366-407e-881a-29fa1ec5365b',
      arabicName: 'Detailed Report of Transactions paid by Credit cards',
      englishName: 'Aggregated Transactions Report paid by Credit cards',
    });
  }

  readonly fromDateInputXPath =
    "dx-date-box input[type='text']";
  readonly toDateInputXPath =
    "dx-date-box input[type='text']";
  readonly tagBoxXPath =
    'dx-tag-box';
  readonly okButtonXPath =
    '[aria-label="Submit"]';

  override getDefaultFromDateSelector(): string { return this.fromDateInputXPath; }
  override getDefaultToDateSelector(): string { return this.toDateInputXPath; }

  async applyFilters(fromDate: string, toDate: string): Promise<void> {
    await this.selectTagBoxItems(this.tagBoxXPath, ['Revenue Transactions', 'Deposit Transactions'], this.okButtonXPath);
    await this.setFromDate(fromDate, this.fromDateInputXPath);
    await this.setToDate(toDate, this.toDateInputXPath);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// 6. Smart Receipt Details Report
//    تقرير إجمالي لرسوم طباعة الإيصال الذكي
// ═══════════════════════════════════════════════════════════════════════════════════

export class SmartReceiptPrintingFeesPage extends ReportViewerBasePage {
  constructor(page: Page) {
    super(page, {
      reportId: '6f3f71e3-246e-48ed-853f-b5b6966a5267',
      arabicName: 'إجمالي رسوم طباعة الإيصال الذكي',
      englishName: 'Summary GITFees Report for smart Reciept',
    });
  }

  readonly fromDateInputXPath =
    "dx-date-box input[type='text']";
  readonly toDateInputXPath =
    "dx-date-box input[type='text']";
  readonly paymentMethodSelector =
    "[data-dx_placeholder*='Choose'] ";

  override getDefaultFromDateSelector(): string { return this.fromDateInputXPath; }
  override getDefaultToDateSelector(): string { return this.toDateInputXPath; }

  async applyFilters(fromDate: string, toDate: string): Promise<void> {
    await this.selectDropdownOption(this.paymentMethodSelector, 'All');
    await this.setFromDate(fromDate, this.fromDateInputXPath);
    await this.setToDate(toDate, this.toDateInputXPath);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// 7. Support Services Reports Report
// ═══════════════════════════════════════════════════════════════════════════════════

export class SupportServicesTransactionsPage extends ReportViewerBasePage {
  constructor(page: Page) {
    super(page, {
      reportId: 'b541adc6-ef50-4019-aac2-32e748add600',
      arabicName: 'إجمالي بمعاملات الخدمات الداعمة',
      englishName: 'Dependant services revenue summary reports',
    });
  }

  readonly fromDateInputXPath =
    "dx-date-box input[type='text']";
  readonly toDateInputXPath =
    "dx-date-box input[type='text']";
  readonly paymentMethodSelector =
    "[data-dx_placeholder*='Choose'] ";

  override getDefaultFromDateSelector(): string { return this.fromDateInputXPath; }
  override getDefaultToDateSelector(): string { return this.toDateInputXPath; }

  async applyFilters(fromDate: string, toDate: string): Promise<void> {
    await this.selectRadioOption('Revenue Transactions');
    await this.selectDropdownOption(this.paymentMethodSelector, 'All', 0);
    await this.setFromDate(fromDate, this.fromDateInputXPath);
    await this.setToDate(toDate, this.toDateInputXPath);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// 8. Total Charges Report by Revenue Source
// ═══════════════════════════════════════════════════════════════════════════════════

export class TotalChargesByRevenuePage extends ReportViewerBasePage {
  constructor(page: Page) {
    super(page, {
      reportId: 'f4bebe7a-28c3-494e-ad2a-d5bd090531b6',
      arabicName: 'إجمالي التحملات حسب جهة الإيراد',
      englishName: 'Report the total service charges for loading Transactions',
    });
  }

  readonly fromDateInputXPath =
    "dx-date-box input[type='text']";
  readonly toDateInputXPath =
    "dx-date-box input[type='text']";
  readonly paymentMethodSelector =
    "[data-dx_placeholder*='Choose'] ";
  readonly feeTypeDropdownXPath =
    "[data-dx_placeholder*='Choose'] ";

  override getDefaultFromDateSelector(): string { return this.fromDateInputXPath; }
  override getDefaultToDateSelector(): string { return this.toDateInputXPath; }

  async applyFilters(fromDate: string, toDate: string): Promise<void> {
    // feeType (div[6]) is nth=0, status (div[7]) is nth=1 in DOM order
    await this.selectDropdownOption(this.paymentMethodSelector, 'All', 1);
    await this.selectDropdownOption(this.feeTypeDropdownXPath, 'Revenue Fees', 0);
    await this.setFromDate(fromDate, this.fromDateInputXPath);
    await this.setToDate(toDate, this.toDateInputXPath);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// 9. Total Tax Report
// ═══════════════════════════════════════════════════════════════════════════════════

export class TotalTaxReportPage extends ReportViewerBasePage {
  constructor(page: Page) {
    super(page, {
      reportId: '366f4450-11cf-4b44-a5b2-66c472dbe3c1',
      arabicName: 'Transaction Summary Tax Report',
      englishName: 'Transaction Summary Tax Report',
    });
  }

  readonly fromDateInputXPath =
    "dx-date-box input[type='text']";
  readonly toDateInputXPath =
    "dx-date-box input[type='text']";
  readonly paymentMethodSelector =
    "[data-dx_placeholder*='Choose'] ";

  override getDefaultFromDateSelector(): string { return this.fromDateInputXPath; }
  override getDefaultToDateSelector(): string { return this.toDateInputXPath; }

  async applyFilters(fromDate: string, toDate: string): Promise<void> {
    await this.selectDropdownOption(this.paymentMethodSelector, 'All');
    await this.selectRadioOption('Revenue Transactions');
    await this.setFromDate(fromDate, this.fromDateInputXPath);
    await this.setToDate(toDate, this.toDateInputXPath);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// 10. Total Transaction Report
// ═══════════════════════════════════════════════════════════════════════════════════

export class TotalTransactionReportPage extends ReportViewerBasePage {
  constructor(page: Page) {
    super(page, {
      reportId: '132a8205-691c-4c1d-92f5-5c507020940e',
      arabicName: 'Transaction summary income report based on collecting entities',
      englishName: 'Summary Transactions Report',
    });
  }

  readonly fromDateInputXPath =
    "dx-date-box input[type='text']";
  readonly toDateInputXPath =
    "dx-date-box input[type='text']";
  readonly paymentMethodSelector =
    "[data-dx_placeholder*='Choose'] ";

  override getDefaultFromDateSelector(): string { return this.fromDateInputXPath; }
  override getDefaultToDateSelector(): string { return this.toDateInputXPath; }

  async applyFilters(fromDate: string, toDate: string): Promise<void> {
    await this.selectDropdownOption(this.paymentMethodSelector, 'All');
    await this.selectRadioOption('Revenue Transactions');
    await this.setFromDate(fromDate, this.fromDateInputXPath);
    await this.setToDate(toDate, this.toDateInputXPath);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// 11. Transaction Payment Services Summary Transaction deposits detail Report (receivable)
//     تقـريـر Transaction summary income report based on collecting entities
// ═══════════════════════════════════════════════════════════════════════════════════

export class DepositReceivableReportPage extends ReportViewerBasePage {
  constructor(page: Page) {
    super(page, {
      reportId: '962e3249-71d7-4dc9-973d-da2005ae7745',
      arabicName: 'Transaction summary income report based on collecting entities',
      englishName: 'Transaction deposits detail Report (receivable)',
    });
  }

  readonly fromDateInputXPath =
    "dx-date-box input[type='text']";
  readonly toDateInputXPath =
    "dx-date-box input[type='text']";

  override getDefaultFromDateSelector(): string { return this.fromDateInputXPath; }
  override getDefaultToDateSelector(): string { return this.toDateInputXPath; }

  async applyFilters(fromDate: string, toDate: string): Promise<void> {
    await this.setFromDate(fromDate, this.fromDateInputXPath);
    await this.setToDate(toDate, this.toDateInputXPath);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// MAP of report names → page constructors (for dynamic dispatch)
// ═══════════════════════════════════════════════════════════════════════════════════

export const ReportPageRegistry: Record<string, new (page: Page) => ReportViewerBasePage> = {
  'total-transactions-revenue-receivable': TotalTransactionsRevenueReceivablePage,
  'transaction-fees-all-payment-methods': TransactionsFeeReportPage,
  'universal-payments': UniversalPaymentsPage,
  'amanat-universal-payments': AmanatUniversalPaymentsPage,
  'total-credit-card': TotalCreditCardReportPage,
  'smart-receipt-printing-fees': SmartReceiptPrintingFeesPage,
  'support-services-transactions': SupportServicesTransactionsPage,
  'total-charges-by-revenue': TotalChargesByRevenuePage,
  'total-tax': TotalTaxReportPage,
  'total-transaction': TotalTransactionReportPage,
  'deposit-receivable': DepositReceivableReportPage,
};
