/**
 * Revenue Reports Page
 * 
 * Migrated from Python ReportAutomationConsoleSaveToExcel.py
 * Handles various revenue-related reports with filtering and export
 */

import { Page } from '@playwright/test';
import { BaseListPage } from '../base-list.page';
import { ReportFilterUtility } from '../../utils/report-filter.utility';
import { ReportExportUtility } from '../../utils/report-export.utility';
import { ExcelManagerUtility } from '../../utils/excel-manager.utility';

export class RevenueReportsPage extends BaseListPage {
  private filterUtility: ReportFilterUtility;
  private exportUtility: ReportExportUtility | null = null;
  private excelUtility: ExcelManagerUtility;

  // Report URLs
  readonly TOTAL_REPORT_BY_REVENUE_URL = 'https://staging.tahseel.gov.ae/ManagePortal/report-show/7c9f7dcd-1163-4e89-91dd-02b841c24ed7';
  readonly TRANSACTION_FEE_REPORT_URL = 'https://staging.tahseel.gov.ae/ManagePortal/report-show/97353334-399a-4613-9097-9cf5dc95c690';
  readonly CREDIT_CARD_REPORT_URL = 'https://staging.tahseel.gov.ae/ManagePortal/report-show/fedfceac-2366-407e-881a-29fa1ec5365b';
  readonly TAX_REPORT_URL = 'https://staging.tahseel.gov.ae/ManagePortal/report-show/366f4450-11cf-4b44-a5b2-66c472dbe3c1';

  // Generic selectors (can be customized per report)
  readonly exportButton = "//div[@id='repViewer_ctl09_ctl04_ctl00_ButtonLink'], button[aria-label*='Export']";
  readonly excelExportOption = "//a[@title='Excel']";
  readonly pdfExportOption = "//a[@title='PDF']";
  readonly submitButton = "//button[contains(text(), 'عرض التقرير')], //*[@id='kt_content']/div/app-show/div/div[2]/button";
  readonly reportTable = "table[role='grid'], div.dx-datagrid";
  readonly asyncWaitIndicator = "//*[@id='repViewer_AsyncWait_Wait']";
  readonly reportContent = "//div[@id='VisibleReportContentrepViewer_ctl13']";

  constructor(page: Page) {
    super(page);
    this.filterUtility = new ReportFilterUtility(page);
    this.excelUtility = new ExcelManagerUtility();
  }

  /**
   * Initialize export utility with browser context
   */
  initializeExportUtility(downloadPath: string): void {
    const browser = this.page.context().browser();
    const context = this.page.context();

    if (browser && context) {
      this.exportUtility = new ReportExportUtility(
        this.page,
        browser,
        context,
        downloadPath
      );
    }
  }

  /**
   * Navigate to Total Transactions by Revenue Report
   */
  async navigateToTotalTransactionsReport(): Promise<void> {
    await this.navigateToUrl(this.TOTAL_REPORT_BY_REVENUE_URL);
    await this.waitForReportLoad();
  }

  /**
   * Navigate to Transaction Fee Report
   */
  async navigateToTransactionFeeReport(): Promise<void> {
    await this.navigateToUrl(this.TRANSACTION_FEE_REPORT_URL);
    await this.waitForReportLoad();
  }

  /**
   * Navigate to Credit Card Report
   */
  async navigateToCreditCardReport(): Promise<void> {
    await this.navigateToUrl(this.CREDIT_CARD_REPORT_URL);
    await this.waitForReportLoad();
  }

  /**
   * Navigate to Tax Report
   */
  async navigateToTaxReport(): Promise<void> {
    await this.navigateToUrl(this.TAX_REPORT_URL);
    await this.waitForReportLoad();
  }

  /**
   * Set payment status to "مدفوعة" (Paid)
   */
  async setPaymentStatusToPaid(
    dropdownSelector: string = "//*[@id='kt_content']/div/app-show/div/div[1]/div[12]/div[2]/dx-select-box//div[contains(@class,'dx-dropdowneditor-button')]"
  ): Promise<void> {
    await this.filterUtility.selectSecondOptionFromDropdown(
      dropdownSelector,
      'مدفوعة'
    );
  }

  /**
   * Set transaction type to "معاملات إيراد" (Revenue Transactions)
   */
  async setTransactionTypeToRevenue(): Promise<void> {
    await this.filterUtility.selectRadioButtonOption('معاملات ايراد');
  }

  /**
   * Set transaction type to "معاملات أمانات" (Deposit Transactions)
   */
  async setTransactionTypeToDeposit(): Promise<void> {
    await this.filterUtility.selectRadioButtonOption('معاملات امانات');
  }

  /**
   * Set date range
   */
  async setDateRange(
    fromDate: string,
    toDate: string,
    fromDateSelector: string = "//*[@id='kt_content']/div/app-show/div/div[1]/div[7]/div[2]/dx-date-box//input[@type='text']",
    toDateSelector: string = "//*[@id='kt_content']/div/app-show/div/div[1]/div[8]/div[2]/dx-date-box//input[@type='text']"
  ): Promise<void> {
    await this.filterUtility.setFromDate(fromDateSelector, fromDate);
    await this.filterUtility.setToDate(toDateSelector, toDate);
  }

  /**
   * Select payment methods for universal payments
   */
  async selectPaymentMethods(
    methods: string[],
    tagBoxSelector: string = '//*[@id="kt_content"]/div/app-show/div/div[1]/div[3]/div[2]/dx-tag-box/div[1]/div/div[1]',
    okButtonSelector: string = '/html/body/div[2]/div/div[2]/div/div[2]/div[1]/div/div'
  ): Promise<void> {
    // Click tag box to open
    const tagBox = await this.page.$(tagBoxSelector);
    if (tagBox) {
      await tagBox.click();
      await this.page.waitForLoadState('networkidle');
    }

    // Find and click each method
    for (const method of methods) {
      const items = await this.page.$$("//div[contains(@class,'dx-list-item')]");

      for (const item of items) {
        const text = await item.evaluate((el) => (el as HTMLElement).innerText);
        if (text.includes(method)) {
          await item.click();
          await this.page.waitForTimeout(300);
          break;
        }
      }
    }

    // Click OK button
    await this.filterUtility.clickConfirmButton(okButtonSelector);
  }

  /**
   * Submit report query
   */
  async submitReport(): Promise<void> {
    await this.filterUtility.clickSearchButton(this.submitButton);
    await this.waitForReportLoad();
  }

  /**
   * Wait for report to load
   */
  async waitForReportLoad(
    timeout: number = 300000
  ): Promise<void> {
    // Wait for async loading to complete
    try {
      await this.page.waitForSelector(this.asyncWaitIndicator, {
        state: 'hidden',
        timeout
      });
    } catch {
      // Selector might not exist, continue
    }

    // Wait for report content to be visible
    await this.page.waitForSelector(this.reportContent, {
      state: 'visible',
      timeout
    });
  }

  /**
   * Export report to Excel
   */
  async exportToExcel(
    fileName?: string,
    exportBtnSelector: string = this.exportButton
  ): Promise<string | null> {
    if (!this.exportUtility) {
      throw new Error('Export utility not initialized. Call initializeExportUtility() first');
    }

    const result = fileName
      ? await this.exportUtility.exportReportToExcelWithName(
          exportBtnSelector,
          fileName
        )
      : await this.exportUtility.exportReportToExcel(exportBtnSelector);

    if (result.success) {
      console.log(`✅ Exported to: ${result.filePath}`);
      return result.filePath || null;
    } else {
      console.error(`❌ Export failed: ${result.error}`);
      return null;
    }
  }

  /**
   * Export report to PDF
   */
  async exportToPdf(
    fileName?: string
  ): Promise<string | null> {
    if (!this.exportUtility) {
      throw new Error('Export utility not initialized');
    }

    try {
      await this.exportUtility.clickExportButton(this.exportButton, 'pdf');
      const downloadedFile = await this.exportUtility.waitForDownloadComplete(
        60000,
        'pdf'
      );

      if (downloadedFile && fileName) {
        return await this.exportUtility.renameDownloadedFile(
          downloadedFile,
          fileName
        );
      }

      return downloadedFile;
    } catch (err) {
      console.error(`❌ PDF export failed:`, err);
      return null;
    }
  }

  /**
   * Get exported file path
   */
  async getMostRecentExportedFile(): Promise<string | null> {
    if (!this.exportUtility) {
      return null;
    }

    return await this.exportUtility.getMostRecentFile();
  }

  /**
   * Verify file was exported successfully
   */
  async verifyExportedFile(fileName: string): Promise<boolean> {
    if (!this.exportUtility) {
      return false;
    }

    return await this.exportUtility.verifyFileDownloaded(fileName);
  }

  /**
   * List exported files
   */
  async listExportedFiles(): Promise<string[]> {
    if (!this.exportUtility) {
      return [];
    }

    return await this.exportUtility.listDownloadedFiles();
  }

  /**
   * Clear exported files
   */
  async clearExportedFiles(): Promise<void> {
    if (this.exportUtility) {
      await this.exportUtility.clearDownloadFolder();
    }
  }

  /**
   * Open exported Excel file for reading
   */
  async openExportedExcelFile(filePath: string): Promise<void> {
    await this.excelUtility.loadExcelFile(filePath);
  }

  /**
   * Read data from exported Excel file
   */
  async readExcelData(sheetName?: string): Promise<Record<string, any>[]> {
    return this.excelUtility.getAllRowsAsObjects(1, sheetName);
  }

  /**
   * Get specific cell value from Excel
   */
  async getExcelCellValue(
    row: number,
    column: number | string,
    sheetName?: string
  ): Promise<any> {
    return this.excelUtility.getCellValue(row, column, sheetName);
  }

  /**
   * Get last value in column
   */
  async getLastValueInExcelColumn(
    column: number | string,
    sheetName?: string
  ): Promise<any> {
    return this.excelUtility.getLastValueInColumn(column, sheetName);
  }

  /**
   * Append label-value pair to Excel results
   */
  async appendToResultsExcel(
    label: string,
    value: any,
    filePath: string,
    fileName: string = 'results.xlsx'
  ): Promise<void> {
    await this.excelUtility.appendLabelValue(
      label,
      value,
      filePath,
      fileName
    );
  }

  /**
   * Get report page current URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Get export utility for advanced operations
   */
  getExportUtility(): ReportExportUtility | null {
    return this.exportUtility;
  }

  /**
   * Get Excel utility for advanced operations
   */
  getExcelUtility(): ExcelManagerUtility {
    return this.excelUtility;
  }

  /**
   * Get filter utility for advanced operations
   */
  getFilterUtility(): ReportFilterUtility {
    return this.filterUtility;
  }
}
