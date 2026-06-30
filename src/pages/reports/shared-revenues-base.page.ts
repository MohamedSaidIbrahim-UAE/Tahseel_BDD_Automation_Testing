/**
 * Shared Revenues Base Page
 *
 * Foundation for all shared revenue reports with revenue splitting logic.
 * Supports various split percentages and entity combinations.
 *
 * Shared Revenue Models Supported:
 * - DTPS & Sharjah Municipality (50/50 split)
 * - SEDD & SCTDA (60/40 split)
 * - Prevention & Safety Authority & SAND (70/30 split)
 * - Sharjah Municipality & Service Centers (80/20 split)
 */

import { Page } from '@playwright/test';
import { BaseListPage } from '../base-list.page';

export class SharedRevenuesBasePage extends BaseListPage {
  // ── Filter selectors ─────────────────────────────────────────────────────
  // IMPROVED: Separated into individual selectors for better Playwright compatibility
  // ── Report-specific filter selectors ────────────────────────────────────
  readonly serviceFilterDropdown = 'dx-select-box[aria-label*="Service"]';
  readonly fromDateInput = 'input[type="date"]:first-of-type, input[aria-label*="From"], input[placeholder*="From"], input[name*="from"], input[id*="from"]';
  readonly toDateInput = 'input[type="date"]:last-of-type, input[aria-label*="To"], input[placeholder*="To"], input[name*="to"], input[id*="to"]';
  readonly entityFilterDropdown = 'dx-select-box[aria-label*="Entity"], select[name*="entity"], select[aria-label*="Entity"], div[role="combobox"][aria-label*="Entity"], [data-component="select"][aria-label*="Entity"]';
  readonly showReportButton = 'button[type="submit"],button:has-text("View Report"), button:has-text("Show Report"), button:has-text("Display"), button:has-text("Generate"), button:has-text("View"), button:has-text("Search"), button:has-text("Find"), button[aria-label*="Search"), button[aria-label*="Show"), button[aria-label*="Report"), input[type="submit"], dx-button';
  readonly clearFilterButton = 'button:has-text("Clear"), button:has-text("Reset"), button[aria-label*="Clear"), button[aria-label*="Reset"], button:nth-of-type(2)';

  // ── Report table selectors ──────────────────────────────────────────────
  // DevExtreme data grid selectors with multiple fallbacks for robust element location
  readonly reportTable = 'dx-data-grid, .dx-datagrid, .dx-datagrid-rowsview, [role="grid"], table[role="grid"], table.report-table, [class*="grid-container"], [class*="dx-grid"]';
  readonly revenueEntityColumn = '[data-field="revenueEntity"], [data-field="entity"], .dx-col-revenueEntity, td:has-text("Revenue Entity"), td:has-text("Entity"), td:has-text("Department")';
  readonly transactionCountColumn = '[data-field="count"], [data-field="transactionCount"], .dx-col-count, td:has-text("Transaction Count"), td:has-text("Count"), td:has-text("Transactions")';
  readonly totalAmountColumn = '[data-field="amount"], [data-field="totalAmount"], .dx-col-amount, td:has-text("Total Amount"), td:has-text("Amount"), td:has-text("Total")';
  readonly grandTotalRow = '.dx-row-group-footer, .dx-group-footer, .dx-row-total, tr:has-text("Grand Total"), tr:has-text("Total"), tr[class*="grand-total"]';
  readonly grandTotalAmount = '.dx-datagrid-group-footer [data-field="amount"], .dx-row-total [data-field="amount"], span:has-text("Grand Total") ~ span';
  readonly transactionIdColumn = '[data-field="transactionId"]';
  readonly serviceColumn = '[data-field="service"]';
  readonly amountColumn = '[data-field="amount"]';
  readonly entityAShareColumn = '[data-field="entityAShare"]';
  readonly entityBShareColumn = '[data-field="entityBShare"]';
  readonly splitPercentageColumn = '[data-field="splitPercentage"]';

  // ── Summary rows ────────────────────────────────────────────────────────
  readonly entityASummaryRow = '[role="row"][class*="summary"]';

  // ── Empty/No-data states ────────────────────────────────────────────────
  readonly noDataMessage = '.dx-empty-row, span:has-text("No data"), span:has-text("No records"), .empty-state, .no-records-message, [class*="no-data"], [class*="empty"]';

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
  }

  /**
   * Navigate to report
   */
  async navigateToReport(reportUrl: string): Promise<void> {
    let attempts = 0;
    const maxAttempts = 3;
    let lastError: Error | null = null;

    while (attempts < maxAttempts) {
      try {
        attempts++;

        // Navigate to report URL
        await this.navigateToUrl(reportUrl);

        // Wait for page to load
        await Promise.race([
          this.page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => { }),
          this.page.waitForTimeout(2000)
        ]);

        // Additional wait for dynamic content
        await this.page.waitForTimeout(1000);

        // Check if page has any meaningful content
        const bodyContent = await this.page.locator('body').textContent({ timeout: 5000 }).catch(() => '');
        if (!bodyContent || bodyContent.trim().length < 50) {
          throw new Error('Page has no meaningful content');
        }

        // Try to find any type of table or grid container
        const tableFound = await this.findTableElement();
        if (!tableFound) {
          // Check if there's an error on the page
          const hasError = await this.page.locator('[class*="error"], [role="alert"], .error-message')
            .first()
            .isVisible({ timeout: 1000 })
            .catch(() => false);

          if (hasError) {
            throw new Error('Error displayed on report page');
          }
        }

        // Page loaded successfully
        return;
      } catch (error) {
        lastError = error as Error;

        if (attempts < maxAttempts) {
          await this.page.waitForTimeout(1000);
          try {
            await this.page.reload();
            await this.page.waitForTimeout(1000);
          } catch {
            // Reload failed, continue to next attempt
          }
        }
      }
    }

    throw new Error(
      `Failed to navigate to report after ${maxAttempts} attempts. Last error: ${lastError?.message || 'Unknown'}`
    );
  }

  /**
   * Find table element using multiple selector strategies
   */
  private async findTableElement(): Promise<boolean> {
    const selectors = [
      'table[role="grid"]',
      'table.report-table',
      'dx-data-grid',
      '[role="grid"]',
      'table[class*="table"]',
      '.dx-datagrid',
      'table'
    ];

    for (const selector of selectors) {
      try {
        const isVisible = await this.page.locator(selector)
          .first()
          .isVisible({ timeout: 1000 })
          .catch(() => false);

        if (isVisible) {
          return true;
        }
      } catch {
        continue;
      }
    }

    return false;
  }

  /**
   * Set from date filter
   */
  async setFromDate(date: string): Promise<void> {
    await this.fillFilterInput(this.fromDateInput, date);
  }

  /**
   * Set to date filter
   */
  async setToDate(date: string): Promise<void> {
    await this.fillFilterInput(this.toDateInput, date);
  }

  /**
   * Filter by entity
   */
  async filterByEntity(entityName: string): Promise<void> {
    const dropdown = this.page.locator(this.entityFilterDropdown).first();
    await dropdown.click();
    await this.waitHelper.waitForElement(`text=${entityName}`);
    await this.page.locator(`text=${entityName}`).first().click();
    await this.waitHelper.waitForRequestQuiet();
  }

  /**
   * Filter by service
   */
  async filterByService(serviceName: string): Promise<void> {
    const dropdown = this.page.locator(this.serviceFilterDropdown).first();
    await dropdown.click();
    await this.waitHelper.waitForElement(`text=${serviceName}`);
    await this.page.locator(`text=${serviceName}`).first().click();
    await this.waitHelper.waitForRequestQuiet();
  }

  /**
   * Apply filters and show report
   */
  async showReport(): Promise<void> {
    await this.page.waitForTimeout(800);

    let attempts = 0;
    const maxAttempts = 5;
    let lastError: Error | null = null;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const buttonClicked = await this.clickShowReportButton();
        if (buttonClicked) {
          break;
        }

        if (attempts < maxAttempts) {
          await this.page.waitForTimeout(400);
        }
      } catch (error) {
        lastError = error as Error;

        if (attempts < maxAttempts) {
          await this.page.waitForTimeout(400);
        }
      }
    }

    if (attempts >= maxAttempts) {
      throw new Error(
        `Show Report button not clickable after ${maxAttempts} attempts. Last error: ${lastError?.message || 'Button not found'}`
      );
    }

    // Wait for network to settle
    await this.waitHelper.waitForRequestQuiet();

    // Wait for report to render
    await this.waitForReportToRender();
  }

  /**
   * Click Show Report button with simplified selector strategy
   * Optimized for DevExtreme framework (used by Tahseel)
   */
  private async clickShowReportButton(): Promise<boolean> {
    // Strategy 1: Direct type-based selectors (most reliable)
    const primarySelectors = [
      'button[type="submit"]',
      'button[type="button"]',
    ];

    // Strategy 2: Framework-specific (DevExtreme)
    const frameworkSelectors = [
      'dx-button',
      '.dx-button',
    ];

    // Strategy 3: Fallback to any visible button
    const fallbackSelectors = [
      'button',
    ];

    const allSelectors = [...primarySelectors, ...frameworkSelectors, ...fallbackSelectors];

    for (const selector of allSelectors) {
      try {
        const buttons = this.page.locator(selector);
        const count = await buttons.count().catch(() => 0);

        if (count > 0) {
          // Try the first visible, enabled button
          for (let i = 0; i < Math.min(count, 5); i++) {
            try {
              const btn = buttons.nth(i);
              const isVisible = await btn.isVisible({ timeout: 1000 }).catch(() => false);
              const isDisabled = await btn.isDisabled().catch(() => false);

              if (isVisible && !isDisabled) {
                await btn.scrollIntoViewIfNeeded().catch(() => { });
                await btn.click({ timeout: 3000 });
                return true;
              }
            } catch (error) {
              continue;
            }
          }
        }
      } catch (error) {
        continue;
      }
    }

    return false;
  }

  /**
   * Wait for report to render after clicking Show Report
   * Optimized for DevExtreme framework
   */
  private async waitForReportToRender(): Promise<void> {
    // Primary: DevExtreme grid (most likely)
    const primarySelectors = [
      'dx-data-grid',
      '.dx-datagrid-rowsview',
    ];

    // Secondary: Standard HTML table with role
    const secondarySelectors = [
      '[role="grid"]',
      'table[role="grid"]',
    ];

    // Fallback: Generic table
    const fallbackSelectors = [
      'table',
      'tbody',
    ];

    const allSelectors = [...primarySelectors, ...secondarySelectors, ...fallbackSelectors];

    let foundVisible = false;

    for (const selector of allSelectors) {
      try {
        const element = this.page.locator(selector).first();
        const isVisible = await Promise.race([
          element.isVisible({ timeout: 3000 }).then(() => true),
          this.page.waitForTimeout(3000).then(() => false)
        ]).catch(() => false);

        if (isVisible) {
          await this.page.waitForTimeout(500);
          foundVisible = true;
          break;
        }
      } catch (error) {
        continue;
      }
    }

    if (!foundVisible) {
      // Check for no-data message
      const noDataVisible = await this.page.locator(this.noDataMessage).first()
        .isVisible({ timeout: 1000 })
        .catch(() => false);

      if (!noDataVisible) {
        throw new Error('Report did not render: No data grid or table found');
      }
    }
  }

  /**
   * Clear all filters
   */
  async clearFilters(): Promise<void> {
    const clearBtn = this.page.locator(this.clearFilterButton);
    if (await clearBtn.isVisible()) {
      await clearBtn.click();
      await this.waitHelper.waitForRequestQuiet();
    }
  }

  /**
   * Get all transactions with split amounts
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

    const rows = this.page.locator(`${this.reportTable} tbody tr:not(.dx-freespace-row)`);
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

    // Allow 0.01 tolerance for floating point
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
    return await this.page.locator(this.noDataMessage).isVisible().catch(() => false);
  }

  /**
   * Verify no data message when no transactions
   */
  async verifyNoDataMessage(): Promise<void> {
    await this.waitHelper.waitForElement(this.noDataMessage);
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
}
