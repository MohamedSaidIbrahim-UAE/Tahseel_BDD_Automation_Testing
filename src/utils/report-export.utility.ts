/**
 * Report Export Utility for Excel/PDF Export Operations
 * 
 * Migrated from Python ReportAutomationConsoleSaveToExcel.py
 * Handles downloading, exporting, and managing report files with validation
 */

import { Page, Browser, BrowserContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import { promisify } from 'util';
import { WaitHelper } from './wait.helper';

const globAsync = promisify(glob.glob);

export interface ExportOptions {
  timeout?: number;
  maxRetries?: number;
  downloadTimeout?: number;
  format?: 'excel' | 'pdf';
}

export interface ExportResult {
  success: boolean;
  filePath?: string;
  fileName?: string;
  error?: string;
  timestamp: Date;
}

export class ReportExportUtility {
  private page: Page;
  private browser: Browser;
  private context: BrowserContext;
  private downloadPath: string;
  private waitHelper: WaitHelper;

  constructor(
    page: Page,
    browser: Browser,
    context: BrowserContext,
    downloadPath: string
  ) {
    this.page = page;
    this.browser = browser;
    this.context = context;
    this.downloadPath = downloadPath;
    this.waitHelper = new WaitHelper(page);
  }

  /**
   * Ensure download folder exists
   */
  private ensureDownloadFolder(): void {
    if (!fs.existsSync(this.downloadPath)) {
      fs.mkdirSync(this.downloadPath, { recursive: true });
    }
  }

  /**
   * Clear all files from download folder
   */
  async clearDownloadFolder(): Promise<void> {
    try {
      this.ensureDownloadFolder();
      const files = await globAsync(path.join(this.downloadPath, '*'));
      
      for (const file of files) {
        try {
          if (fs.statSync(file).isFile()) {
            fs.unlinkSync(file);
          }
        } catch (err) {
          console.warn(`Could not delete file: ${file}`, err);
        }
      }
    } catch (err) {
      console.warn('Error clearing download folder:', err);
    }
  }

  /**
   * Wait for file download completion
   * Polls for .crdownload files to disappear and new .xlsx/.pdf to appear
   */
  async waitForDownloadComplete(
    timeout: number = 60000,
    fileExtension: string = 'xlsx'
  ): Promise<string | null> {
    const startTime = Date.now();
    const extension = fileExtension.startsWith('.') ? fileExtension : `.${fileExtension}`;

    while (Date.now() - startTime < timeout) {
      try {
        // Check for in-progress downloads
        const crdownloadFiles = await globAsync(
          path.join(this.downloadPath, '*.crdownload')
        );

        // Check for completed files
        const completedFiles = await globAsync(
          path.join(this.downloadPath, `*${extension}`)
        );

        // If no in-progress files and we have completed files, return the newest one
        if (crdownloadFiles.length === 0 && completedFiles.length > 0) {
          // Sort by modification time (newest first)
          const sortedFiles = completedFiles.sort((a, b) => {
            const timeA = fs.statSync(a).mtimeMs;
            const timeB = fs.statSync(b).mtimeMs;
            return timeB - timeA;
          });

          return sortedFiles[0];
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (err) {
        console.warn('Error checking download status:', err);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return null;
  }

  /**
   * Click export button and select format (Excel or PDF)
   */
  async clickExportButton(
    exportButtonSelector: string,
    format: 'excel' | 'pdf' = 'excel'
  ): Promise<void> {
    // Click export button
    const exportBtn = await this.page.$(exportButtonSelector);
    if (!exportBtn) {
      throw new Error(`Export button not found: ${exportButtonSelector}`);
    }

    await exportBtn.click();
    await this.page.waitForLoadState('networkidle');

    // Select format option
    let formatSelector = '';
    if (format === 'excel') {
      formatSelector = "//a[@title='Excel'], button:has-text('Excel')";
    } else if (format === 'pdf') {
      formatSelector = "//a[@title='PDF'], button:has-text('PDF')";
    }

    const formatBtn = await this.page.$(formatSelector);
    if (!formatBtn) {
      throw new Error(`${format.toUpperCase()} export option not found`);
    }

    await formatBtn.click();
  }

  /**
   * Rename downloaded file to custom name
   */
  async renameDownloadedFile(
    downloadedFilePath: string,
    newName: string
  ): Promise<string> {
    this.ensureDownloadFolder();

    const fileName = newName.includes('.') 
      ? newName 
      : `${newName}.xlsx`;
    
    const newPath = path.join(this.downloadPath, fileName);

    if (fs.existsSync(downloadedFilePath)) {
      fs.renameSync(downloadedFilePath, newPath);
      return newPath;
    } else {
      throw new Error(`Downloaded file not found: ${downloadedFilePath}`);
    }
  }

  /**
   * Export report to Excel with retry logic
   */
  async exportReportToExcel(
    exportButtonSelector: string,
    options: ExportOptions = {}
  ): Promise<ExportResult> {
    const {
      timeout = 60000,
      maxRetries = 3,
      downloadTimeout = 60000
    } = options;

    this.ensureDownloadFolder();
    const startTime = Date.now();
    let attempt = 0;

    while (attempt < maxRetries) {
      attempt++;
      console.log(`📊 Export attempt ${attempt}/${maxRetries}`);

      try {
        // Track files before export
        const filesBefore = await globAsync(
          path.join(this.downloadPath, '*.xlsx')
        );
        const fileSetBefore = new Set(filesBefore);

        // Click export button
        await this.clickExportButton(exportButtonSelector, 'excel');

        // Wait for new file
        const downloadedFile = await this.waitForDownloadComplete(
          downloadTimeout,
          'xlsx'
        );

        if (!downloadedFile) {
          console.warn(`⚠️ Download did not complete within ${downloadTimeout}ms`);
          continue;
        }

        // Verify file is new
        if (!fileSetBefore.has(downloadedFile)) {
          return {
            success: true,
            filePath: downloadedFile,
            fileName: path.basename(downloadedFile),
            timestamp: new Date()
          };
        }
      } catch (err) {
        console.warn(`❌ Export attempt ${attempt} failed:`, err);
      }

      // Wait before retry
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return {
      success: false,
      error: `Excel export failed after ${maxRetries} attempts`,
      timestamp: new Date()
    };
  }

  /**
   * Export report to Excel with custom filename
   */
  async exportReportToExcelWithName(
    exportButtonSelector: string,
    customName: string,
    options: ExportOptions = {}
  ): Promise<ExportResult> {
    const result = await this.exportReportToExcel(exportButtonSelector, options);

    if (result.success && result.filePath) {
      try {
        const newPath = await this.renameDownloadedFile(
          result.filePath,
          customName
        );
        return {
          ...result,
          filePath: newPath,
          fileName: path.basename(newPath)
        };
      } catch (err) {
        console.warn('Failed to rename file:', err);
        return result; // Return original result if rename fails
      }
    }

    return result;
  }

  /**
   * Get latest Excel file matching pattern
   */
  async getLatestExcelFile(fileNameStartsWith: string): Promise<string | null> {
    try {
      const pattern = path.join(
        this.downloadPath,
        `${fileNameStartsWith}*.xlsx`
      );
      const matches = await globAsync(pattern);

      if (matches.length === 0) {
        console.log(`📭 No files matching pattern: ${fileNameStartsWith}`);
        return null;
      }

      // Sort by modification time (latest first)
      const sorted = matches.sort((a, b) => {
        const timeA = fs.statSync(a).mtimeMs;
        const timeB = fs.statSync(b).mtimeMs;
        return timeB - timeA;
      });

      return sorted[0];
    } catch (err) {
      console.warn('Error finding latest Excel file:', err);
      return null;
    }
  }

  /**
   * Switch to new tab/window for report display
   */
  async switchToReportTab(): Promise<Page> {
    const pages = this.context.pages();
    
    if (pages.length === 1) {
      // Wait for new page to open
      const newPagePromise = this.context.waitForEvent('page');
      const newPage = await newPagePromise;
      await newPage.waitForLoadState('load');
      return newPage;
    }

    // Return the last page (should be the new report tab)
    return pages[pages.length - 1];
  }

  /**
   * Wait for report to load and become visible
   */
  async waitForReportLoad(
    reportVisibleSelector: string = "//div[@id='VisibleReportContentrepViewer_ctl13']",
    asyncWaitSelector: string = "//*[@id='repViewer_AsyncWait_Wait']",
    timeout: number = 300000
  ): Promise<void> {
    // Wait for async loading to complete
    try {
      await this.page.waitForSelector(asyncWaitSelector, {
        state: 'hidden',
        timeout: timeout
      });
    } catch (err) {
      console.warn('Async wait element not found or timed out');
    }

    // Wait for report content to be visible
    await this.page.waitForSelector(reportVisibleSelector, {
      state: 'visible',
      timeout: timeout
    });
  }

  /**
   * Get list of files in download folder
   */
  async listDownloadedFiles(): Promise<string[]> {
    try {
      this.ensureDownloadFolder();
      const files = await globAsync(path.join(this.downloadPath, '*'));
      return files
        .filter(f => fs.statSync(f).isFile())
        .map(f => path.basename(f));
    } catch (err) {
      console.warn('Error listing download files:', err);
      return [];
    }
  }

  /**
   * Get file size in bytes
   */
  getFileSize(filePath: string): number {
    try {
      const stats = fs.statSync(filePath);
      return stats.size;
    } catch (err) {
      console.warn(`Could not get file size for: ${filePath}`);
      return 0;
    }
  }

  /**
   * Verify file was downloaded successfully
   */
  async verifyFileDownloaded(
    expectedFileName: string,
    maxWaitMs: number = 30000
  ): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitMs) {
      const filePath = path.join(this.downloadPath, expectedFileName);
      
      if (fs.existsSync(filePath)) {
        const size = this.getFileSize(filePath);
        if (size > 0) {
          return true;
        }
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return false;
  }

  /**
   * Get most recent file in download folder
   */
  async getMostRecentFile(): Promise<string | null> {
    try {
      const files = await globAsync(path.join(this.downloadPath, '*'));
      
      if (files.length === 0) {
        return null;
      }

      const sorted = files.sort((a, b) => {
        const timeA = fs.statSync(a).mtimeMs;
        const timeB = fs.statSync(b).mtimeMs;
        return timeB - timeA;
      });

      return sorted[0];
    } catch (err) {
      console.warn('Error getting most recent file:', err);
      return null;
    }
  }

  /**
   * Set download path
   */
  setDownloadPath(newPath: string): void {
    this.downloadPath = newPath;
  }

  /**
   * Get current download path
   */
  getDownloadPath(): string {
    return this.downloadPath;
  }
}
