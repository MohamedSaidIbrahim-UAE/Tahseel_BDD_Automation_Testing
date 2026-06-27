/**
 * POS Transactions Report by Revenue Source Page
 *
 * Handles:
 * - POS (Point-of-Sale) terminal mapping verification
 * - Terminal-level transaction aggregation
 * - Revenue entity assignment for terminals
 * - Orphan terminal (unmapped) detection
 * - Transaction detail by terminal
 */

import { Page } from '@playwright/test';
import { BaseListPage } from '../base-list.page';

export class POSTransactionsPage extends BaseListPage {
  // ── Filter selectors ─────────────────────────────────────────────────────
  readonly fromDateInput = 'input[aria-label*="From"], input[placeholder*="From"]';
  readonly toDateInput = 'input[aria-label*="To"], input[placeholder*="To"]';
  readonly terminalFilterDropdown = 'select[aria-label*="Terminal"], div[role="combobox"][aria-label*="Terminal"]';
  readonly entityFilterDropdown = 'select[aria-label*="Entity"], div[role="combobox"][aria-label*="Entity"]';
  readonly showReportButton = 'button:has-text("Show Report"), button:has-text("Search"), button[aria-label*="Search"]';
  readonly clearFilterButton = 'button:has-text("Clear"), button[aria-label*="Clear"]';

  // ── Report table selectors ──────────────────────────────────────────────
  readonly reportTable = 'table[role="grid"], table.report-table, dx-data-grid';
  readonly terminalIdColumn = 'td:has-text("Terminal ID"), [data-field="terminalId"]';
  readonly terminalNameColumn = 'td:has-text("Terminal Name"), [data-field="terminalName"]';
  readonly transactionIdColumn = 'td:has-text("Transaction ID"), [data-field="transactionId"]';
  readonly amountColumn = 'td:has-text("Amount"), [data-field="amount"]';
  readonly revenueEntityColumn = 'td:has-text("Revenue Entity"), [data-field="revenueEntity"]';
  readonly terminalStatusColumn = 'td:has-text("Status"), [data-field="status"]';

  // ── Summary rows ────────────────────────────────────────────────────────
  readonly terminalSummaryRow = 'tr:has-text("Total for"), tr[class*="terminal-summary"]';
  readonly grandTotalRow = 'tr:has-text("Grand Total")';
  readonly unmappedSection = 'tr:has-text("Unmapped"), tr:has-text("No Entity")';

  // ── Empty/No-data states ────────────────────────────────────────────────
  readonly noDataMessage = 'span:has-text("No data"), .empty-state, .no-records-message';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to POS Transactions report
   */
  async navigateToReport(): Promise<void> {
    const reportUrl = 'https://staging.tahseel.gov.ae/ManagePortal/report-show/pos-transactions-report';
    await this.navigateToUrl(reportUrl);
    await this.waitHelper.waitForElement(this.reportTable);
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
   * Filter by terminal
   */
  async filterByTerminal(terminalId: string): Promise<void> {
    const dropdown = this.page.locator(this.terminalFilterDropdown).first();
    await dropdown.click();
    await this.waitHelper.waitForElement(`text=${terminalId}`);
    await this.page.locator(`text=${terminalId}`).first().click();
    await this.waitHelper.waitForRequestQuiet();
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
   * Apply filters and show report
   */
  async showReport(): Promise<void> {
    await this.click(this.showReportButton);
    await this.waitHelper.waitForRequestQuiet();
    await this.waitHelper.waitForElement(this.reportTable);
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
   * Get all POS transactions
   */
  async getAllPOSTransactions(): Promise<
    Array<{
      terminalId: string;
      terminalName: string;
      transactionId: string;
      amount: number;
      entity: string;
      status: string;
    }>
  > {
    const data: Array<{
      terminalId: string;
      terminalName: string;
      transactionId: string;
      amount: number;
      entity: string;
      status: string;
    }> = [];

    const rows = this.page.locator(`${this.reportTable} tbody tr:not(.dx-freespace-row)`);
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const cells = rows.nth(i).locator('td');
      const terminalId = await cells.nth(0).textContent();
      const terminalName = await cells.nth(1).textContent();
      const txnId = await cells.nth(2).textContent();
      const amountText = await cells.nth(3).textContent();
      const entity = await cells.nth(4).textContent();
      const status = await cells.nth(5).textContent();

      if (terminalId?.trim()) {
        data.push({
          terminalId: terminalId.trim(),
          terminalName: terminalName?.trim() || '',
          transactionId: txnId?.trim() || '',
          amount: parseFloat(amountText?.replace(/[^0-9.]/g, '') || '0'),
          entity: entity?.trim() || 'Unmapped',
          status: status?.trim() || '',
        });
      }
    }

    return data;
  }

  /**
   * Get transactions for specific terminal
   */
  async getTransactionsByTerminal(terminalId: string): Promise<
    Array<{
      transactionId: string;
      amount: number;
      entity: string;
    }>
  > {
    const transactions: Array<{ transactionId: string; amount: number; entity: string }> = [];
    const rows = this.page.locator(`${this.reportTable} tbody tr:not(.dx-freespace-row)`);
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const cells = rows.nth(i).locator('td');
      const termId = await cells.nth(0).textContent();
      if (termId?.trim() === terminalId) {
        const txnId = await cells.nth(2).textContent();
        const amountText = await cells.nth(3).textContent();
        const entity = await cells.nth(4).textContent();
        transactions.push({
          transactionId: txnId?.trim() || '',
          amount: parseFloat(amountText?.replace(/[^0-9.]/g, '') || '0'),
          entity: entity?.trim() || 'Unmapped',
        });
      }
    }

    return transactions;
  }

  /**
   * Calculate total for terminal
   */
  async getTerminalTotal(terminalId: string): Promise<number> {
    const transactions = await this.getTransactionsByTerminal(terminalId);
    return transactions.reduce((sum, txn) => sum + txn.amount, 0);
  }

  /**
   * Get all mapped terminals (with entity)
   */
  async getMappedTerminals(): Promise<string[]> {
    const transactions = await this.getAllPOSTransactions();
    const mappedTerminals = new Set<string>();

    transactions
      .filter(txn => txn.entity !== 'Unmapped')
      .forEach(txn => {
        mappedTerminals.add(txn.terminalId);
      });

    return Array.from(mappedTerminals);
  }

  /**
   * Get all unmapped terminals (orphans)
   */
  async getUnmappedTerminals(): Promise<
    Array<{
      terminalId: string;
      terminalName: string;
      transactionCount: number;
      totalAmount: number;
    }>
  > {
    const transactions = await this.getAllPOSTransactions();
    const unmappedMap = new Map<
      string,
      {
        terminalId: string;
        terminalName: string;
        transactionCount: number;
        totalAmount: number;
      }
    >();

    transactions
      .filter(txn => txn.entity === 'Unmapped')
      .forEach(txn => {
        if (!unmappedMap.has(txn.terminalId)) {
          unmappedMap.set(txn.terminalId, {
            terminalId: txn.terminalId,
            terminalName: txn.terminalName,
            transactionCount: 0,
            totalAmount: 0,
          });
        }
        const terminal = unmappedMap.get(txn.terminalId)!;
        terminal.transactionCount++;
        terminal.totalAmount += txn.amount;
      });

    return Array.from(unmappedMap.values());
  }

  /**
   * Verify terminal is mapped to entity
   */
  async verifyTerminalMapping(terminalId: string, expectedEntity: string): Promise<boolean> {
    const transactions = await this.getTransactionsByTerminal(terminalId);
    return transactions.length > 0 && transactions.every(txn => txn.entity === expectedEntity);
  }

  /**
   * Get grand total
   */
  async getGrandTotal(): Promise<number> {
    const transactions = await this.getAllPOSTransactions();
    return transactions.reduce((sum, txn) => sum + txn.amount, 0);
  }

  /**
   * Check if no data message is visible
   */
  async isNoDataMessageVisible(): Promise<boolean> {
    return await this.page.locator(this.noDataMessage).isVisible().catch(() => false);
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
   * Get summary by entity
   */
  async getSummaryByEntity(): Promise<
    Array<{
      entity: string;
      terminalCount: number;
      transactionCount: number;
      totalAmount: number;
    }>
  > {
    const transactions = await this.getAllPOSTransactions();
    const summaryMap = new Map<
      string,
      {
        entity: string;
        terminalCount: number;
        transactionCount: number;
        totalAmount: number;
      }
    >();

    const terminals = new Set<string>();

    transactions.forEach(txn => {
      const entity = txn.entity || 'Unmapped';
      if (!summaryMap.has(entity)) {
        summaryMap.set(entity, {
          entity,
          terminalCount: 0,
          transactionCount: 0,
          totalAmount: 0,
        });
      }
      const summary = summaryMap.get(entity)!;
      summary.transactionCount++;
      summary.totalAmount += txn.amount;
      terminals.add(txn.terminalId);
    });

    // Count unique terminals per entity
    transactions.forEach(txn => {
      const entity = txn.entity || 'Unmapped';
      const summary = summaryMap.get(entity);
      if (summary && !summary.terminalCount) {
        // Count unique terminals for this entity
        const uniqueTerminals = new Set(
          transactions.filter(t => t.entity === entity).map(t => t.terminalId)
        );
        summary.terminalCount = uniqueTerminals.size;
      }
    });

    return Array.from(summaryMap.values());
  }
}
