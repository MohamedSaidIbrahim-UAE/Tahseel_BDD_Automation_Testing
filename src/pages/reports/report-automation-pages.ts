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
      reportId: '7c9f7dcd-1163-4e89-91dd-02b841c24ed7',
      arabicName: 'تقـريـر  إجمالى بالمعاملات حسب جهة الايراد - المقبوضات',
      englishName: 'Total Transactions by Revenue Source - Receivables',
    });
  }

  readonly fromDateInputXPath =
    "//*[@id='kt_content']/div/app-show/div/div[1]/div[7]/div[2]/dx-date-box//input[@type='text']";
  readonly toDateInputXPath =
    "//*[@id='kt_content']/div/app-show/div/div[1]/div[8]/div[2]/dx-date-box//input[@type='text']";
  readonly statusDropdownXPath =
    "//*[@id='kt_content']/div/app-show/div/div[1]/div[12]/div[2]/dx-select-box//div[contains(@class,'dx-dropdowneditor-button')]";

  override getDefaultFromDateSelector(): string { return this.fromDateInputXPath; }
  override getDefaultToDateSelector(): string { return this.toDateInputXPath; }

  async applyFilters(fromDate: string, toDate: string): Promise<void> {
    await this.selectDropdownOption(this.statusDropdownXPath, 'مدفوعة');
    await this.setFromDate(fromDate, this.fromDateInputXPath);
    await this.setToDate(toDate, this.toDateInputXPath);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// 2. Transactions Fee Report for All Payment Methods
//    تقرير رسوم المعاملات لكافة وسائل الدفع
// ═══════════════════════════════════════════════════════════════════════════════════

export class TransactionsFeeReportPage extends ReportViewerBasePage {
  constructor(page: Page) {
    super(page, {
      reportId: '97353334-399a-4613-9097-9cf5dc95c690',
      arabicName: 'تقرير رسوم المعاملات لكافة وسائل الدفع',
      englishName: 'Transaction Fees for All Payment Methods',
    });
  }

  readonly fromDateInputXPath =
    "//*[@id='kt_content']/div/app-show/div/div[1]/div[5]/div[2]/dx-date-box//input[@type='text']";
  readonly toDateInputXPath =
    "//*[@id='kt_content']/div/app-show/div/div[1]/div[6]/div[2]/dx-date-box//input[@type='text']";

  override getDefaultFromDateSelector(): string { return this.fromDateInputXPath; }
  override getDefaultToDateSelector(): string { return this.toDateInputXPath; }

  /** Select the "Revenue Transactions" (معاملات ايراد) radio button */
  async selectRevenueTransactionsRadio(): Promise<void> {
    await this.selectRadioOption('معاملات ايراد');
  }

  /** Select the "Deposit Transactions" (معاملات امانات) radio button */
  async selectDepositTransactionsRadio(): Promise<void> {
    await this.selectRadioOption('معاملات امانات');
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
//    تقرير رسوم المعاملات لكافة وسائل الدفع | طرق الدفع العالمية
// ═══════════════════════════════════════════════════════════════════════════════════

export class UniversalPaymentsPage extends ReportViewerBasePage {
  constructor(page: Page) {
    super(page, {
      reportId: '97353334-399a-4613-9097-9cf5dc95c690',
      arabicName: 'تقرير رسوم المعاملات لكافة وسائل الدفع',
      englishName: 'Universal Payment Methods',
    });
  }

  readonly fromDateInputXPath =
    "//*[@id='kt_content']/div/app-show/div/div[1]/div[5]/div[2]/dx-date-box//input[@type='text']";
  readonly toDateInputXPath =
    "//*[@id='kt_content']/div/app-show/div/div[1]/div[6]/div[2]/dx-date-box//input[@type='text']";
  readonly tagBoxXPath =
    '//*[@id="kt_content"]/div/app-show/div/div[1]/div[3]/div[2]/dx-tag-box/div[1]/div/div[1]';
  readonly okButtonXPath =
    '/html/body/div[2]/div/div[2]/div/div[2]/div[1]/div/div';

  override getDefaultFromDateSelector(): string { return this.fromDateInputXPath; }
  override getDefaultToDateSelector(): string { return this.toDateInputXPath; }

  async applyUniversalPaymentFilters(fromDate: string, toDate: string): Promise<void> {
    await this.setFromDate(fromDate, this.fromDateInputXPath);
    await this.setToDate(toDate, this.toDateInputXPath);
    await this.selectTagBoxItems(this.tagBoxXPath, [
      'بطاقة ائتمان',
      'جهاز الدفع البنكي',
      'جوجل باي',
      'سامسونج باي',
      'آبل باي',
    ]);
    await this.clickConfirmButton(this.okButtonXPath);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// 4. Amanat (Deposits) Universal Payments
//    تقرير رسوم المعاملات لكافة وسائل الدفع (أمانات)
// ═══════════════════════════════════════════════════════════════════════════════════

export class AmanatUniversalPaymentsPage extends ReportViewerBasePage {
  constructor(page: Page) {
    super(page, {
      reportId: '97353334-399a-4613-9097-9cf5dc95c690',
      arabicName: 'تقرير رسوم المعاملات لكافة وسائل الدفع',
      englishName: 'Amanat (Deposit) Universal Payments',
    });
  }

  readonly fromDateInputXPath =
    "//*[@id='kt_content']/div/app-show/div/div[1]/div[5]/div[2]/dx-date-box//input[@type='text']";
  readonly toDateInputXPath =
    "//*[@id='kt_content']/div/app-show/div/div[1]/div[6]/div[2]/dx-date-box//input[@type='text']";

  override getDefaultFromDateSelector(): string { return this.fromDateInputXPath; }
  override getDefaultToDateSelector(): string { return this.toDateInputXPath; }

  async applyAmanatFilters(fromDate: string, toDate: string): Promise<void> {
    await this.selectRadioOption('معاملات امانات');
    await this.setFromDate(fromDate, this.fromDateInputXPath);
    await this.setToDate(toDate, this.toDateInputXPath);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// 5. Total Credit Card Report
//    تقرير اجمالي بطاقات الائتمان
// ═══════════════════════════════════════════════════════════════════════════════════

export class TotalCreditCardReportPage extends ReportViewerBasePage {
  constructor(page: Page) {
    super(page, {
      reportId: 'fedfceac-2366-407e-881a-29fa1ec5365b',
      arabicName: 'تقرير اجمالي بطاقات الائتمان',
      englishName: 'Total Credit Card Report',
    });
  }

  readonly fromDateInputXPath =
    "//*[@id='kt_content']/div/app-show/div/div[1]/div[5]/div[2]/dx-date-box/div/div/div[1]/input[@type='text']";
  readonly toDateInputXPath =
    "//*[@id='kt_content']/div/app-show/div/div[1]/div[6]/div[2]/dx-date-box/div/div/div[1]/input[@type='text']";
  readonly tagBoxXPath =
    '//*[@id="kt_content"]/div/app-show/div/div[1]/div[8]/div[2]/dx-tag-box/div[1]/div/div[1]';
  readonly okButtonXPath =
    '/html/body/div[2]/div/div[2]/div/div[2]/div[1]/div/div';

  override getDefaultFromDateSelector(): string { return this.fromDateInputXPath; }
  override getDefaultToDateSelector(): string { return this.toDateInputXPath; }

  async applyFilters(fromDate: string, toDate: string): Promise<void> {
    await this.selectTagBoxItems(this.tagBoxXPath, ['معاملات ايراد', 'معاملات امانات']);
    await this.clickConfirmButton(this.okButtonXPath);
    await this.setFromDate(fromDate, this.fromDateInputXPath);
    await this.setToDate(toDate, this.toDateInputXPath);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// 6. Smart Receipt Printing Fees Report
//    تقرير إجمالي لرسوم طباعة الإيصال الذكي
// ═══════════════════════════════════════════════════════════════════════════════════

export class SmartReceiptPrintingFeesPage extends ReportViewerBasePage {
  constructor(page: Page) {
    super(page, {
      reportId: '6f3f71e3-246e-48ed-853f-b5b6966a5267',
      arabicName: 'إجمالي رسوم طباعة الإيصال الذكي',
      englishName: 'Smart Receipt Printing Fees',
    });
  }

  readonly fromDateInputXPath =
    "//*[@id='kt_content']/div/app-show/div/div[1]/div[3]/div[2]/dx-date-box//input[@type='text']";
  readonly toDateInputXPath =
    "//*[@id='kt_content']/div/app-show/div/div[1]/div[4]/div[2]/dx-date-box//input[@type='text']";
  readonly statusDropdownXPath =
    "//*[@id='kt_content']/div/app-show/div/div[1]/div[6]/div[2]/dx-select-box//div[contains(@class,'dx-dropdowneditor-button')]";

  override getDefaultFromDateSelector(): string { return this.fromDateInputXPath; }
  override getDefaultToDateSelector(): string { return this.toDateInputXPath; }

  async applyFilters(fromDate: string, toDate: string): Promise<void> {
    await this.selectDropdownOption(this.statusDropdownXPath, 'مدفوعة');
    await this.setFromDate(fromDate, this.fromDateInputXPath);
    await this.setToDate(toDate, this.toDateInputXPath);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// 7. Support Services Transactions Report
//    تقـريـر إجمالي بمعاملات الخدمات الداعمة
// ═══════════════════════════════════════════════════════════════════════════════════

export class SupportServicesTransactionsPage extends ReportViewerBasePage {
  constructor(page: Page) {
    super(page, {
      reportId: 'b541adc6-ef50-4019-aac2-32e748add600',
      arabicName: 'إجمالي بمعاملات الخدمات الداعمة',
      englishName: 'Support Services Transactions',
    });
  }

  readonly fromDateInputXPath =
    "//*[@id='kt_content']/div/app-show/div/div[1]/div[7]/div[2]/dx-date-box//input[@type='text']";
  readonly toDateInputXPath =
    "//*[@id='kt_content']/div/app-show/div/div[1]/div[8]/div[2]/dx-date-box//input[@type='text']";
  readonly statusDropdownXPath =
    "//*[@id='kt_content']/div/app-show/div/div[1]/div[11]/div[2]/dx-select-box//div[contains(@class,'dx-dropdowneditor-button')]";

  override getDefaultFromDateSelector(): string { return this.fromDateInputXPath; }
  override getDefaultToDateSelector(): string { return this.toDateInputXPath; }

  async applyFilters(fromDate: string, toDate: string): Promise<void> {
    await this.selectRadioOption('معاملات ايراد');
    await this.selectDropdownOption(this.statusDropdownXPath, 'مدفوعة');
    await this.setFromDate(fromDate, this.fromDateInputXPath);
    await this.setToDate(toDate, this.toDateInputXPath);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// 8. Total Charges Report by Revenue Source
//    تقرير إجمالي التحملات حسب جهة الإيراد
// ═══════════════════════════════════════════════════════════════════════════════════

export class TotalChargesByRevenuePage extends ReportViewerBasePage {
  constructor(page: Page) {
    super(page, {
      reportId: 'cb6cde66-44d4-4755-84b5-ec32e76c3d30',
      arabicName: 'إجمالي التحملات حسب جهة الإيراد',
      englishName: 'Total Charges by Revenue Source',
    });
  }

  readonly fromDateInputXPath =
    "//*[@id='kt_content']/div/app-show/div/div[1]/div[3]/div[2]/dx-date-box//input[@type='text']";
  readonly toDateInputXPath =
    "//*[@id='kt_content']/div/app-show/div/div[1]/div[4]/div[2]/dx-date-box//input[@type='text']";
  readonly statusDropdownXPath =
    "//*[@id='kt_content']/div/app-show/div/div[1]/div[7]/div[2]/dx-select-box//div[contains(@class,'dx-dropdowneditor-button')]";
  readonly feeTypeDropdownXPath =
    "//*[@id='kt_content']/div/app-show/div/div[1]/div[6]/div[2]/dx-select-box//div[contains(@class,'dx-dropdowneditor-button')]";

  override getDefaultFromDateSelector(): string { return this.fromDateInputXPath; }
  override getDefaultToDateSelector(): string { return this.toDateInputXPath; }

  async applyFilters(fromDate: string, toDate: string): Promise<void> {
    await this.selectDropdownOption(this.statusDropdownXPath, 'مدفوعة');
    await this.selectDropdownOption(this.feeTypeDropdownXPath, 'رسوم إيرادات');
    await this.setFromDate(fromDate, this.fromDateInputXPath);
    await this.setToDate(toDate, this.toDateInputXPath);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// 9. Total Tax Report
//    تقـريـر إجمالي بالرسوم الضريبية
// ═══════════════════════════════════════════════════════════════════════════════════

export class TotalTaxReportPage extends ReportViewerBasePage {
  constructor(page: Page) {
    super(page, {
      reportId: '366f4450-11cf-4b44-a5b2-66c472dbe3c1',
      arabicName: 'إجمالي بالرسوم الضريبية',
      englishName: 'Total Tax Report',
    });
  }

  readonly fromDateInputXPath =
    "//*[@id='kt_content']/div/app-show/div/div[1]/div[5]/div[2]/dx-date-box//input[@type='text']";
  readonly toDateInputXPath =
    "//*[@id='kt_content']/div/app-show/div/div[1]/div[6]/div[2]/dx-date-box//input[@type='text']";
  readonly statusDropdownXPath =
    "//*[@id='kt_content']/div/app-show/div/div[1]/div[9]/div[2]/dx-select-box//div[contains(@class,'dx-dropdowneditor-button')]";

  override getDefaultFromDateSelector(): string { return this.fromDateInputXPath; }
  override getDefaultToDateSelector(): string { return this.toDateInputXPath; }

  async applyFilters(fromDate: string, toDate: string): Promise<void> {
    await this.selectDropdownOption(this.statusDropdownXPath, 'مدفوعة');
    await this.selectRadioOption('معاملات ايراد');
    await this.setFromDate(fromDate, this.fromDateInputXPath);
    await this.setToDate(toDate, this.toDateInputXPath);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// 10. Total Transaction Report
//     تقـريـر إجمالي بالمعاملات
// ═══════════════════════════════════════════════════════════════════════════════════

export class TotalTransactionReportPage extends ReportViewerBasePage {
  constructor(page: Page) {
    super(page, {
      reportId: '132a8205-691c-4c1d-92f5-5c507020940e',
      arabicName: 'إجمالي بالمعاملات',
      englishName: 'Total Transaction Report',
    });
  }

  readonly fromDateInputXPath =
    "//*[@id='kt_content']/div/app-show/div/div[1]/div[5]/div[2]/dx-date-box//input[@type='text']";
  readonly toDateInputXPath =
    "//*[@id='kt_content']/div/app-show/div/div[1]/div[6]/div[2]/dx-date-box//input[@type='text']";
  readonly statusDropdownXPath =
    "//*[@id='kt_content']/div/app-show/div/div[1]/div[10]/div[2]/dx-select-box//div[contains(@class,'dx-dropdowneditor-button')]";

  override getDefaultFromDateSelector(): string { return this.fromDateInputXPath; }
  override getDefaultToDateSelector(): string { return this.toDateInputXPath; }

  async applyFilters(fromDate: string, toDate: string): Promise<void> {
    await this.selectDropdownOption(this.statusDropdownXPath, 'مدفوعة');
    await this.selectRadioOption('معاملات ايراد');
    await this.setFromDate(fromDate, this.fromDateInputXPath);
    await this.setToDate(toDate, this.toDateInputXPath);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// 11. Transaction Payment Services Summary Deposit Receivable
//     تقـريـر إجمالى بالمعاملات حسب جهة الامانة - المقبوضات
// ═══════════════════════════════════════════════════════════════════════════════════

export class DepositReceivableReportPage extends ReportViewerBasePage {
  constructor(page: Page) {
    super(page, {
      reportId: '962e3249-71d7-4dc9-973d-da2005ae7745',
      arabicName: 'إجمالى بالمعاملات حسب جهة الامانة - المقبوضات',
      englishName: 'Transaction Payment Services Summary - Deposit Receivable',
    });
  }

  readonly fromDateInputXPath =
    "//*[@id='kt_content']/div/app-show/div/div[1]/div[7]/div[2]/dx-date-box//input[@type='text']";
  readonly toDateInputXPath =
    "//*[@id='kt_content']/div/app-show/div/div[1]/div[8]/div[2]/dx-date-box//input[@type='text']";

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
