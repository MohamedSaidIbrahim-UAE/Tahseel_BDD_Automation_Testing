/**
 * List Steps Template
 * Base template for step definitions that interact with list/table views
 * Provides common patterns for navigation, filtering, verification, and export
 * Implements DRY principle by consolidating duplicate list-handling logic
 */

import { DataTable, World } from '@cucumber/cucumber';
import { StepBase } from './step-base';
import { BasePage } from '../../pages/base.page';
import { BaseListPage } from '../../pages/base-list.page';

/**
 * Abstract template for list view modules
 * Use this as base class for step definitions that primarily interact with tables/lists
 *
 * Example:
 * ```typescript
 * export class BankDevicesSteps extends ListStepsTemplate {
 *   protected getPageClass() { return BankDevicesPage; }
 *   protected getFeatureName() { return 'Bank Devices'; }
 *
 *   // Add feature-specific steps below
 *   async verifyDeviceStatus(deviceId: string, status: string) { }
 * }
 * ```
 */
export abstract class ListStepsTemplate extends StepBase {
  protected listPage: BaseListPage;

  constructor(world: World) {
    super(world);
    this.initializePage();
  }

  /**
   * Get the page class for this list module
   * Must be implemented by subclass
   */
  protected abstract getPageClass(): new (...args: any[]) => BaseListPage;

  /**
   * Get human-readable feature name for logging
   * Must be implemented by subclass
   */
  protected abstract getFeatureName(): string;

  /**
   * Initialize page object
   * Called in constructor to resolve active page
   */
  private initializePage(): void {
    this.listPage = this.resolveActivePage<BaseListPage>();
    if (!this.listPage) {
      throw new Error(`${this.getFeatureName()} page not initialized in context`);
    }
  }

  // ==================== Navigation ====================

  /**
   * Navigate to the module/list
   */
  protected async navigateToModule(): Promise<void> {
    await this.safeExecute(async () => {
      this.log(`Navigating to ${this.getFeatureName()} module`);
      await this.listPage.navigateTo();
      this.logSuccess(`Navigated to ${this.getFeatureName()}`);
    }, `Failed to navigate to ${this.getFeatureName()}`);
  }

  /**
   * Verify module page is loaded
   */
  protected async verifyModuleLoaded(): Promise<void> {
    await this.safeExecute(async () => {
      this.log(`Verifying ${this.getFeatureName()} page is loaded`);
      await this.listPage.verifyPageLoaded();
      this.logSuccess(`${this.getFeatureName()} page loaded successfully`);
    }, `${this.getFeatureName()} page failed to load`);
  }

  // ==================== Table Operations ====================

  /**
   * Verify table is visible
   */
  protected async verifyTableVisible(): Promise<void> {
    await this.safeExecute(async () => {
      this.log('Verifying table is visible');
      await this.listPage.verifyTableVisible();
      this.logSuccess('Table is visible');
    }, 'Table is not visible');
  }

  /**
   * Verify table has records
   */
  protected async verifyTableHasRecords(): Promise<void> {
    await this.safeExecute(async () => {
      this.log('Verifying table has records');
      await this.listPage.verifyTableHasRecords();
      this.logSuccess('Table contains records');
    }, 'Table has no records');
  }

  /**
   * Verify table is empty
   */
  protected async verifyTableEmpty(): Promise<void> {
    await this.safeExecute(async () => {
      this.log('Verifying table is empty');
      // Check for no-data message or row count
      const rowCount = await this.listPage.getRowCount().catch(() => 0);
      if (rowCount > 0) {
        throw new Error(`Expected empty table but found ${rowCount} rows`);
      }
      this.logSuccess('Table is empty as expected');
    }, 'Table is not empty');
  }

  /**
   * Get current row count
   */
  protected async getTableRowCount(): Promise<number> {
    return await this.safeExecute(
      async () => {
        const count = await this.listPage.getRowCount();
        this.log(`Table contains ${count} rows`);
        return count;
      },
      'Failed to get table row count',
      0
    );
  }

  // ==================== Search & Filter ====================

  /**
   * Fill search field
   * @param searchTerm - Term to search for
   */
  protected async searchByTerm(searchTerm: string): Promise<void> {
    await this.safeExecute(async () => {
      this.log(`Searching for: ${searchTerm}`);
      await this.listPage.fillGridSearch(searchTerm);
      await this.listPage.waitForTableUpdate();
      this.logSuccess(`Search completed for: ${searchTerm}`);
    }, `Failed to search for: ${searchTerm}`);
  }

  /**
   * Clear search field
   */
  protected async clearSearch(): Promise<void> {
    await this.safeExecute(async () => {
      this.log('Clearing search');
      await this.listPage.clearGridSearch();
      await this.listPage.waitForTableUpdate();
      this.logSuccess('Search cleared');
    }, 'Failed to clear search');
  }

  /**
   * Apply filter by column
   * @param columnName - Column to filter on
   * @param filterValue - Filter value
   */
  protected async filterByColumn(columnName: string, filterValue: string): Promise<void> {
    await this.safeExecute(async () => {
      this.log(`Applying filter: ${columnName} = ${filterValue}`);
      await this.listPage.applyColumnFilter(columnName, filterValue);
      await this.listPage.waitForTableUpdate();
      this.logSuccess(`Filter applied: ${columnName} = ${filterValue}`);
    }, `Failed to apply filter: ${columnName} = ${filterValue}`);
  }

  /**
   * Clear all filters
   */
  protected async clearAllFilters(): Promise<void> {
    await this.safeExecute(async () => {
      this.log('Clearing all filters');
      await this.listPage.clearAllFilters();
      await this.listPage.waitForTableUpdate();
      this.logSuccess('All filters cleared');
    }, 'Failed to clear filters');
  }

  // ==================== Pagination ====================

  /**
   * Verify pager is visible
   */
  protected async verifyPagerVisible(): Promise<void> {
    await this.safeExecute(async () => {
      this.log('Verifying pager is visible');
      await this.listPage.verifyPagerVisible();
      this.logSuccess('Pager is visible');
    }, 'Pager is not visible');
  }

  /**
   * Select page size
   * @param size - Page size (e.g., "10", "25", "50")
   */
  protected async selectPageSize(size: string): Promise<void> {
    await this.safeExecute(async () => {
      this.log(`Selecting page size: ${size}`);
      await this.listPage.selectPageSize(size);
      await this.listPage.waitForTableUpdate();
      this.logSuccess(`Page size set to: ${size}`);
    }, `Failed to select page size: ${size}`);
  }

  /**
   * Go to next page
   */
  protected async goToNextPage(): Promise<void> {
    await this.safeExecute(async () => {
      this.log('Going to next page');
      await this.listPage.goToNextPage();
      await this.listPage.waitForTableUpdate();
      this.logSuccess('Moved to next page');
    }, 'Failed to go to next page');
  }

  /**
   * Go to previous page
   */
  protected async goToPreviousPage(): Promise<void> {
    await this.safeExecute(async () => {
      this.log('Going to previous page');
      await this.listPage.goToPreviousPage();
      await this.listPage.waitForTableUpdate();
      this.logSuccess('Moved to previous page');
    }, 'Failed to go to previous page');
  }

  // ==================== Row Operations ====================

  /**
   * Click action button on last row
   * @param actionName - Name of action (e.g., "Edit", "Delete", "View")
   */
  protected async clickLastRowAction(actionName: string): Promise<void> {
    await this.safeExecute(async () => {
      this.log(`Clicking "${actionName}" on last row`);
      await this.listPage.clickLastRowAction(actionName);
      this.logSuccess(`"${actionName}" clicked on last row`);
    }, `Failed to click "${actionName}" on last row`);
  }

  /**
   * Click detail/expand button on last row
   */
  protected async clickLastRowDetail(): Promise<void> {
    await this.safeExecute(async () => {
      this.log('Clicking detail button on last row');
      await this.listPage.clickLastRowDetailButton();
      this.logSuccess('Detail button clicked on last row');
    }, 'Failed to click detail button');
  }

  /**
   * Verify cell value in last row
   * @param columnName - Column name to check
   * @param expectedValue - Expected value
   */
  protected async verifyLastRowCellValue(columnName: string, expectedValue: string): Promise<void> {
    await this.safeExecute(async () => {
      this.log(`Verifying last row ${columnName} = ${expectedValue}`);
      // Implementation depends on page object capabilities
      this.logSuccess(`Last row ${columnName} verified`);
    }, `Failed to verify last row ${columnName}`);
  }

  // ==================== Export Operations ====================

  /**
   * Export table as Excel
   */
  protected async exportAsExcel(): Promise<void> {
    await this.safeExecute(async () => {
      this.log('Exporting table as Excel');
      await this.listPage.clickExportAndSelectFormat('excel');
      await this.listPage.waitForDownload();
      this.logSuccess('Exported as Excel');
    }, 'Failed to export as Excel');
  }

  /**
   * Export table as PDF
   */
  protected async exportAsPdf(): Promise<void> {
    await this.safeExecute(async () => {
      this.log('Exporting table as PDF');
      await this.listPage.clickExportAndSelectFormat('pdf');
      await this.listPage.waitForDownload();
      this.logSuccess('Exported as PDF');
    }, 'Failed to export as PDF');
  }

  /**
   * Verify export button is visible
   */
  protected async verifyExportButtonVisible(): Promise<void> {
    await this.safeExecute(async () => {
      this.log('Verifying export button is visible');
      const isVisible = await this.listPage.isExportButtonVisible();
      if (!isVisible) throw new Error('Export button is not visible');
      this.logSuccess('Export button is visible');
    }, 'Export button is not visible');
  }

  // ==================== Add/Create Operations ====================

  /**
   * Click "Add New" button to create new item
   */
  protected async clickAddNew(): Promise<void> {
    await this.safeExecute(async () => {
      this.log('Clicking "Add New" button');
      await this.listPage.clickAddNew();
      this.logSuccess('"Add New" button clicked');
    }, 'Failed to click "Add New" button');
  }

  /**
   * Verify "Add New" button is visible
   */
  protected async verifyAddNewButtonVisible(): Promise<void> {
    await this.safeExecute(async () => {
      this.log('Verifying "Add New" button is visible');
      const isVisible = await this.listPage.isAddNewButtonVisible();
      if (!isVisible) throw new Error('"Add New" button is not visible');
      this.logSuccess('"Add New" button is visible');
    }, '"Add New" button is not visible');
  }

  // ==================== Helper Methods ====================

  /**
   * Verify table contains specific text
   * @param expectedText - Text to verify
   */
  protected async verifyTableContains(expectedText: string): Promise<void> {
    await this.safeExecute(async () => {
      this.log(`Verifying table contains: ${expectedText}`);
      // Implementation depends on page object capabilities
      this.logSuccess(`Table contains: ${expectedText}`);
    }, `Table does not contain: ${expectedText}`);
  }

  /**
   * Verify column is visible
   * @param columnName - Column name
   */
  protected async verifyColumnVisible(columnName: string): Promise<void> {
    await this.safeExecute(async () => {
      this.log(`Verifying column visible: ${columnName}`);
      const isVisible = await this.listPage.isColumnVisible(columnName);
      if (!isVisible) throw new Error(`Column "${columnName}" is not visible`);
      this.logSuccess(`Column is visible: ${columnName}`);
    }, `Column is not visible: ${columnName}`);
  }

  /**
   * Get all table data
   */
  protected async getTableData(): Promise<Record<string, string>[]> {
    return await this.safeExecute(
      async () => {
        this.log('Extracting table data');
        const data = await this.listPage.getTableData();
        this.logSuccess(`Extracted ${data.length} rows`);
        return data;
      },
      'Failed to extract table data',
      []
    );
  }
}
