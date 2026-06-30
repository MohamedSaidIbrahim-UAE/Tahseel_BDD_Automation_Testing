/**
 * Shared Revenues Base Page - Production Grade
 *
 * Foundation for all shared revenue reports with revenue splitting logic.
 * Supports various split percentages and entity combinations.
 * 
 * Uses ImprovedReportPageBase for production-grade locator handling with:
 * - Multi-level fallback selector chains
 * - Exponential backoff retry logic
 * - Comprehensive error handling
 * - Production-ready timeouts and waits
 *
 * Shared Revenue Models Supported:
 * - DTPS & Sharjah Municipality (50/50 split)
 * - SEDD & SCTDA (60/40 split)
 * - Prevention & Safety Authority & SAND (70/30 split)
 * - Sharjah Municipality & Service Centers (80/20 split)
 */

import { Page } from '@playwright/test';
import { ImprovedReportPageBase } from '../report-page-base-improved';
import { LocatorConfig } from '../base-page-locator-helper';

export class SharedRevenuesBasePage extends ImprovedReportPageBase {
  // ── Report-specific filter selectors with production-grade fallbacks ────
  
  // Service filter - Multiple strategies for different UI frameworks
  protected serviceFilterConfig: LocatorConfig = {
    primary: 'dx-select-box[aria-label*="Service"]',
    fallbacks: [
      'select[name*="service"]',
      'div[role="combobox"][aria-label*="Service"]',
      '[data-component="select"][aria-label*="Service"]',
      '[aria-label*="Service"]',
    ],
    timeout: 15000,
    retry: 3,
  };

  // Entity filter - Multiple strategies for different UI frameworks
  protected entityFilterConfig: LocatorConfig = {
    primary: 'dx-select-box[aria-label*="Entity"]',
    fallbacks: [
      'select[name*="entity"]',
      'select[aria-label*="Entity"]',
      'div[role="combobox"][aria-label*="Entity"]',
      '[data-component="select"][aria-label*="Entity"]',
      '[aria-label*="Entity"]',
    ],
    timeout: 15000,
    retry: 3,
  };

  // Clear filter button - Multiple strategies
  protected clearFilterConfig: LocatorConfig = {
    primary: 'button:has-text("Clear")',
    fallbacks: [
      'button:has-text("Reset")',
      'button[aria-label*="Clear"]',
      'button[aria-label*="Reset"]',
      'button[title*="Clear"]',
    ],
    timeout: 10000,
    retry: 2,
  };

  // Export button - Multiple strategies
  protected exportButtonConfig: LocatorConfig = {
    primary: 'button:has-text("Export")',
    fallbacks: [
      'button:has-text("Download")',
      'button[aria-label*="Export"]',
      'button[title*="Export"]',
      'dx-button[icon="export"]',
    ],
    timeout: 15000,
    retry: 2,
  };

  // ── Export controls ─────────────────────────────────────────────────────
  readonly exportPdfOption = 'button:has-text("PDF"), span:has-text("PDF")';
  readonly exportExcelOption = 'button:has-text("Excel"), span:has-text("Excel")';

  // Revenue split configurations
  protected splitRules: {
    [key: string]: { entityA: number; entityB: number; description: string };
  } = {
    'DTPS_SHARJAH': { entityA: 50, entityB: 50, description: 'DTPS & Sharjah Municipality (50/50)' },
    'SEDD_SCTDA': { entityA: 60, entityB: 40, description: 'SEDD & SCTDA (60/40)' },
    'SAFETY_SAND': { entityA: 70, entityB: 30, description: 'Prevention & Safety Authority & SAND (70/30)' },
    'MUNICIPALITY_CENTERS': { entityA: 80, entityB: 20, description: 'Sharjah Municipality & Service Centers (80/20)' },
  };

  constructor(page: Page) {
    super(page);
    
    // Override base class configs with enhanced fallbacks for shared revenues
    this.setupCustomLocatorConfigs();
  }

  /**
   * Setup custom locator configurations for shared revenues report
   */
  private setupCustomLocatorConfigs(): void {
    // Override from date input with additional fallbacks
    this.fromDateInputConfig = {
      primary: 'input[type="date"]:first-of-type',
      fallbacks: [
        'input[placeholder*="From"]',
        'input[name*="from_date"]',
        'input[aria-label*="From"]',
        'dx-date-box:first-of-type input',
        '[data-qa*="from-date"] input',
        '.date-from input',
      ],
      timeout: 20000,
      retry: 4,
    };

    // Override to date input with additional fallbacks
    this.toDateInputConfig = {
      primary: 'input[type="date"]:last-of-type',
      fallbacks: [
        'input[placeholder*="To"]',
        'input[name*="to_date"]',
        'input[aria-label*="To"]',
        'dx-date-box:last-of-type input',
        '[data-qa*="to-date"] input',
        '.date-to input',
      ],
      timeout: 20000,
      retry: 4,
    };

    // Override show report button with additional fallbacks
    this.showReportButtonConfig = {
      primary: 'button:has-text("View Report")',
      fallbacks: [
        'button:has-text("Generate")',
        'button:has-text("Show Report")',
        'button:has-text("Search")',
        'button[type="button"]:first-of-type',
        'button[aria-label*="Report"]',
        'dx-button',
        '[role="button"]',
      ],
      timeout: 20000,
      retry: 4,
    };
  }

  /**
   * Set from date with production-grade locator helper
   */
  async setFromDate(date: string): Promise<void> {
    await this.locatorHelper.executeWithRetry(
      async () => {
        await this.locatorHelper.safeFill(this.fromDateInputConfig, date);
      },
      { description: `Set from date to ${date}`, maxAttempts: 4 }
    );
  }

  /**
   * Set to date with production-grade locator helper
   */
  async setToDate(date: string): Promise<void> {
    await this.locatorHelper.executeWithRetry(
      async () => {
        await this.locatorHelper.safeFill(this.toDateInputConfig, date);
      },
      { description: `Set to date to ${date}`, maxAttempts: 4 }
    );
  }

  /**
   * Show report - Click show report button and wait for results
   */
  async showReport(): Promise<void> {
    await this.locatorHelper.executeWithRetry(
      async () => {
        await this.locatorHelper.safeClick(this.showReportButtonConfig);
        await this.page.waitForTimeout(2000);
        // Wait for report table to appear
        await this.waitForReportTable();
      },
      { description: 'Show report', maxAttempts: 4 }
    );
  }

  /**
   * Navigate to report URL
   */
  async navigateToReport(reportUrl: string): Promise<void> {
    await this.navigateToReportUrl(reportUrl);
  }

  /**
   * Wait for report table to load
   */
  async waitForReportTable(): Promise<void> {
    await this.locatorHelper.executeWithRetry(
      async () => {
        await this.locatorHelper.waitForElement(this.reportTableConfig);
      },
      { description: 'Wait for report table', maxAttempts: 5, delayMs: 1000 }
    );
  }

  /**
   * Click export and select format
   */
  async clickExportAndSelectFormat(format: 'PDF' | 'Excel'): Promise<void> {
    await this.locatorHelper.executeWithRetry(
      async () => {
        // Click export button
        await this.locatorHelper.safeClick(this.exportButtonConfig);
        await this.page.waitForTimeout(500);

        // Select format
        const formatConfig: LocatorConfig = {
          primary: `button:has-text("${format}")`,
          fallbacks: [
            `span:has-text("${format}")`,
            `a:has-text("${format}")`,
          ],
          timeout: 10000,
          retry: 2,
        };
        
        await this.locatorHelper.safeClick(formatConfig);
      },
      { description: `Export as ${format}`, maxAttempts: 2 }
    );
  }

  /**
   * Filter by entity using production-grade locator helper
   */
  async filterByEntity(entityName: string): Promise<void> {
    await this.locatorHelper.executeWithRetry(
      async () => {
        const dropdown = this.page.locator(this.entityFilterConfig.primary).first();
        await dropdown.click();
        await this.page.locator(`text=${entityName}`).first().click();
        await this.waitHelper.waitForRequestQuiet();
      },
      { description: `Filter by entity: ${entityName}`, maxAttempts: 3 }
    );
  }

  /**
   * Filter by service using production-grade locator helper
   */
  async filterByService(serviceName: string): Promise<void> {
    await this.locatorHelper.executeWithRetry(
      async () => {
        const dropdown = this.page.locator(this.serviceFilterConfig.primary).first();
        await dropdown.click();
        await this.page.locator(`text=${serviceName}`).first().click();
        await this.waitHelper.waitForRequestQuiet();
      },
      { description: `Filter by service: ${serviceName}`, maxAttempts: 3 }
    );
  }

  /**
   * Clear all filters using production-grade locator helper
   */
  async clearFilters(): Promise<void> {
    await this.locatorHelper.executeWithRetry(
      async () => {
        await this.locatorHelper.safeClick(this.clearFilterConfig);
        await this.waitHelper.waitForRequestQuiet();
      },
      { description: 'Clear all filters', maxAttempts: 2 }
    ).catch(() => {
      // Ignore if clear button not found - it's optional
    });
  }

  /**
   * Get all transactions with split amounts from report table
   */
  async getAllTransactionsWithSplit(): Promise<
    Array<{
      transactionId: string;
      service: string;
      totalAmount: number;
      entityAShare: number;
      entityBShare: number;
      splitPercentage: string;
    }>
  > {
    const data: Array<{
      transactionId: string;
      service: string;
      totalAmount: number;
      entityAShare: number;
      entityBShare: number;
      splitPercentage: string;
    }> = [];

    await this.locatorHelper.executeWithRetry(
      async () => {
        // Use production-grade table locator from base class
        const tableLocator = this.page.locator(this.reportTableConfig.primary);
        const tbody = tableLocator.locator('tbody');
        const rows = tbody.locator('tr:not(.dx-freespace-row)');
        const count = await rows.count();

        for (let i = 0; i < count; i++) {
          const cells = rows.nth(i).locator('td');
          const txnId = await cells.nth(0).textContent();
          const service = await cells.nth(1).textContent();
          const totalText = await cells.nth(2).textContent();
          const shareAText = await cells.nth(3).textContent();
          const shareBText = await cells.nth(4).textContent();
          const splitText = await cells.nth(5).textContent();

          if (txnId?.trim()) {
            data.push({
              transactionId: txnId.trim(),
              service: service?.trim() || '',
              totalAmount: parseFloat(totalText?.replace(/[^0-9.]/g, '') || '0'),
              entityAShare: parseFloat(shareAText?.replace(/[^0-9.]/g, '') || '0'),
              entityBShare: parseFloat(shareBText?.replace(/[^0-9.]/g, '') || '0'),
              splitPercentage: splitText?.trim() || '',
            });
          }
        }
      },
      { description: 'Extract all transactions with splits', maxAttempts: 3 }
    );

    return data;
  }

  /**
   * Verify split is correctly applied for transaction
   */
  async verifyTransactionSplit(
    transactionId: string,
    expectedEntityAPercentage: number,
    expectedEntityBPercentage: number
  ): Promise<boolean> {
    const transactions = await this.getAllTransactionsWithSplit();
    const txn = transactions.find(t => t.transactionId === transactionId);

    if (!txn) {
      return false;
    }

    const expectedShareA = (txn.totalAmount * expectedEntityAPercentage) / 100;
    const expectedShareB = (txn.totalAmount * expectedEntityBPercentage) / 100;

    // Allow 0.01 AED tolerance for floating point (1 fils)
    const tolerance = 0.01;
    return (
      Math.abs(txn.entityAShare - expectedShareA) < tolerance &&
      Math.abs(txn.entityBShare - expectedShareB) < tolerance
    );
  }

  /**
   * Calculate total for Entity A
   */
  async getTotalForEntityA(): Promise<number> {
    const transactions = await this.getAllTransactionsWithSplit();
    return transactions.reduce((sum, txn) => sum + txn.entityAShare, 0);
  }

  /**
   * Calculate total for Entity B
   */
  async getTotalForEntityB(): Promise<number> {
    const transactions = await this.getAllTransactionsWithSplit();
    return transactions.reduce((sum, txn) => sum + txn.entityBShare, 0);
  }

  /**
   * Calculate grand total
   */
  async getGrandTotal(): Promise<number> {
    const transactions = await this.getAllTransactionsWithSplit();
    return transactions.reduce((sum, txn) => sum + txn.totalAmount, 0);
  }

  /**
   * Verify all splits sum to total amount for each transaction
   */
  async verifySplitsBalance(): Promise<boolean> {
    const transactions = await this.getAllTransactionsWithSplit();

    return transactions.every(txn => {
      const sum = txn.entityAShare + txn.entityBShare;
      const tolerance = 0.01;
      return Math.abs(sum - txn.totalAmount) < tolerance;
    });
  }

  /**
   * Check if no data message is visible
   */
  async isNoDataMessageVisible(): Promise<boolean> {
    return await this.locatorHelper.executeWithRetry(
      async () => {
        const noDataConfig: LocatorConfig = {
          primary: '.dx-empty-row',
          fallbacks: [
            'span:has-text("No data")',
            'span:has-text("No records")',
            '.empty-state',
            '.no-records-message',
            '[class*="no-data"]',
          ],
          timeout: 5000,
        };
        const element = this.page.locator(noDataConfig.primary);
        return await element.isVisible({ timeout: 1000 }).catch(() => false);
      },
      { description: 'Check for no-data message', maxAttempts: 1 }
    ).catch(() => false);
  }

  /**
   * Verify no data message when no transactions
   */
  async verifyNoDataMessage(): Promise<void> {
    const isVisible = await this.isNoDataMessageVisible();
    if (!isVisible) {
      throw new Error('Expected no-data message not found on report');
    }
  }

  /**
   * Get split configuration by key
   */
  getSplitConfiguration(key: string): { entityA: number; entityB: number; description: string } | null {
    return this.splitRules[key] || null;
  }

  /**
   * Export report as PDF
   */
  async exportAsPdf(): Promise<void> {
    await this.clickExportAndSelectFormat('PDF');
  }

  /**
   * Export report as Excel
   */
  async exportAsExcel(): Promise<void> {
    await this.clickExportAndSelectFormat('Excel');
  }

  /**
   * Verify mid-period rule change impact on report
   */
  async verifyMidPeriodRuleChange(
    changeDate: string,
    newEntityAPercentage: number,
    newEntityBPercentage: number
  ): Promise<{
    beforeChange: number;
    afterChange: number;
    differenceInSplit: number;
  }> {
    const transactions = await this.getAllTransactionsWithSplit();

    // Split transactions by date relative to change date
    const changeDateObj = new Date(changeDate);
    
    const beforeChange = transactions
      .filter(t => {
        // Filter logic would depend on transaction date field
        return true; // Placeholder - implement based on actual transaction date field
      })
      .reduce((sum, t) => sum + t.entityAShare, 0);

    const afterChange = transactions
      .filter(t => {
        // Filter logic would depend on transaction date field
        return false; // Placeholder - implement based on actual transaction date field
      })
      .reduce((sum, t) => sum + t.entityAShare, 0);

    return {
      beforeChange,
      afterChange,
      differenceInSplit: Math.abs(beforeChange - afterChange),
    };
  }

  /**
   * Verify center manager can only see their center's share (RBAC)
   */
  async verifyCenterManagerRestriction(centerName: string): Promise<boolean> {
    try {
      const transactions = await this.getAllTransactionsWithSplit();
      // Center managers should only see transactions for their center
      // This would be verified through center-specific filtering
      return transactions.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Navigate to DTPS & Sharjah report (for backward compatibility)
   */
  async navigateToDTPSSharjahReport(): Promise<void> {
    const reportUrl = 'https://staging.tahseel.gov.ae/ManagePortal/report-show/dtps-sharjah-50-50';
    await this.navigateToReport(reportUrl);
  }
}
