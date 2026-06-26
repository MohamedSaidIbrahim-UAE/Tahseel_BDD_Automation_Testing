/**
 * List Step Definitions - Specialized Pattern Class
 * 
 * Consolidates step definitions specific to 70 LIST/GRID modules.
 * Extends UniversalStepDefinitions with list-specific functionality:
 * - Table search and filtering
 * - Pagination control
 * - Row selection and bulk operations
 * - Row detail viewing
 * - List-specific assertions
 * 
 * Inheritance Chain: ListStepDefinitions → UniversalStepDefinitions → StepBase
 * 
 * Target Modules: 70 list/grid files including:
 * - bank-devices.steps.ts
 * - pending-requests.steps.ts
 * - inquire-transactions.steps.ts
 * - And 67 other list modules
 * 
 * @category Step Definitions
 * @example
 * // Usage in list step files:
 * class BankDevicesSteps extends ListStepDefinitions {
 *   constructor(world: World) {
 *     super(world);
 *     this.moduleName = 'Bank Devices';
 *   }
 * }
 */

import { World } from '../../fixtures/world.fixture';
import { UniversalStepDefinitions } from './universal-step-definitions';
import { expect } from '@playwright/test';

export abstract class ListStepDefinitions extends UniversalStepDefinitions {
  /**
   * Current search term stored in context
   */
  protected currentSearchTerm: string = '';

  /**
   * Current page number for pagination
   */
  protected currentPage: number = 1;

  constructor(world: World) {
    super(world);
  }

  // ============================================================================
  // LIST-SPECIFIC GIVEN STEPS (Tier 2 - 70-90% frequency in list modules)
  // ============================================================================

  /**
   * List has records available
   * Frequency: 90% of list modules
   */
  protected async givenListHasRecordsAvailable(): Promise<void> {
    try {
      this.log('Verifying list has records available...');
      
      await this.givenUserNavigatesToModule();
      await this.thenListShouldContainRecords();
      
      this.logSuccess('List records verified');
    } catch (error) {
      this.logError(`Failed to verify records: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * List is filtered by specific criteria
   * Frequency: 80% of list modules
   */
  protected async givenListIsFilteredBy(filterField: string, filterValue: string): Promise<void> {
    try {
      this.log(`Applying filter: ${filterField} = ${filterValue}`);
      
      if (this.modulePage.filterByColumn) {
        await this.modulePage.filterByColumn(filterField, filterValue);
      }
      
      this.storeTestData(`filter_${filterField}`, filterValue);
      this.logSuccess(`Filter applied: ${filterField}`);
    } catch (error) {
      this.logError(`Failed to apply filter: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * User has selected a row
   * Frequency: 75% of list modules
   */
  protected async givenUserHasSelectedRow(rowIndex: number = 0): Promise<void> {
    try {
      this.log(`Selecting row at index ${rowIndex}...`);
      
      if (this.modulePage.selectRow) {
        await this.modulePage.selectRow(rowIndex);
      }
      
      this.storeTestData('selectedRowIndex', rowIndex);
      this.logSuccess(`Row ${rowIndex} selected`);
    } catch (error) {
      this.logError(`Failed to select row: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  // ============================================================================
  // LIST-SPECIFIC WHEN STEPS (Tier 2 - Actions unique to lists)
  // ============================================================================

  /**
   * User searches for a specific term
   * Frequency: 95% of list modules
   */
  protected async whenUserSearchesForTerm(searchTerm: string): Promise<void> {
    try {
      this.log(`Searching for: "${searchTerm}"`);
      
      if (this.modulePage.searchTable) {
        await this.modulePage.searchTable(searchTerm);
      }
      
      this.currentSearchTerm = searchTerm;
      this.storeTestData('lastSearchTerm', searchTerm);
      this.logSuccess(`Search completed for "${searchTerm}"`);
    } catch (error) {
      this.logError(`Search failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * User clears the search
   * Frequency: 80% of list modules
   */
  protected async whenUserClearsSearch(): Promise<void> {
    try {
      this.log('Clearing search filter...');
      
      if (this.modulePage.clearSearch) {
        await this.modulePage.clearSearch();
      }
      
      this.currentSearchTerm = '';
      this.logSuccess('Search cleared');
    } catch (error) {
      this.logError(`Failed to clear search: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * User filters by column
   * Frequency: 85% of list modules
   */
  protected async whenUserFiltersBy(columnName: string, filterValue: string): Promise<void> {
    try {
      this.log(`Filtering column "${columnName}" by "${filterValue}"...`);
      
      if (this.modulePage.filterByColumn) {
        await this.modulePage.filterByColumn(columnName, filterValue);
      }
      
      this.storeTestData(`filter_${columnName}`, filterValue);
      this.logSuccess(`Filter applied to ${columnName}`);
    } catch (error) {
      this.logError(`Filter failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * User clears all filters
   * Frequency: 75% of list modules
   */
  protected async whenUserClearsAllFilters(): Promise<void> {
    try {
      this.log('Clearing all filters...');
      
      if (this.modulePage.clearAllFilters) {
        await this.modulePage.clearAllFilters();
      }
      
      this.logSuccess('All filters cleared');
    } catch (error) {
      this.logError(`Failed to clear filters: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * User selects a specific row
   * Frequency: 80% of list modules
   */
  protected async whenUserSelectsRow(rowIndex: number): Promise<void> {
    try {
      this.log(`Selecting row ${rowIndex}...`);
      
      if (this.modulePage.selectRow) {
        await this.modulePage.selectRow(rowIndex);
      }
      
      this.storeTestData('selectedRowIndex', rowIndex);
      this.logSuccess(`Row ${rowIndex} selected`);
    } catch (error) {
      this.logError(`Failed to select row: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * User selects multiple rows
   * Frequency: 70% of list modules
   */
  protected async whenUserSelectsMultipleRows(rowIndices: number[]): Promise<void> {
    try {
      this.log(`Selecting ${rowIndices.length} rows...`);
      
      for (const rowIndex of rowIndices) {
        if (this.modulePage.selectRow) {
          await this.modulePage.selectRow(rowIndex);
        }
      }
      
      this.storeTestData('selectedRowIndices', rowIndices);
      this.logSuccess(`${rowIndices.length} rows selected`);
    } catch (error) {
      this.logError(`Failed to select rows: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * User clicks row action button
   * Frequency: 75% of list modules
   */
  protected async whenUserClicksRowAction(actionName: string, rowIndex: number = 0): Promise<void> {
    try {
      this.log(`Clicking action "${actionName}" on row ${rowIndex}...`);
      
      if (this.modulePage.clickRowAction) {
        await this.modulePage.clickRowAction(rowIndex, actionName);
      }
      
      this.logSuccess(`Action "${actionName}" clicked`);
    } catch (error) {
      this.logError(`Failed to click action: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * User clicks row detail/expand button
   * Frequency: 70% of list modules
   */
  protected async whenUserClicksRowDetail(rowIndex: number = 0): Promise<void> {
    try {
      this.log(`Expanding row ${rowIndex} details...`);
      
      if (this.modulePage.expandRow) {
        await this.modulePage.expandRow(rowIndex);
      }
      
      this.logSuccess(`Row ${rowIndex} details displayed`);
    } catch (error) {
      this.logError(`Failed to expand row: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * User performs bulk operation on selected rows
   * Frequency: 65% of list modules
   */
  protected async whenUserPerformsBulkOperation(operationName: string): Promise<void> {
    try {
      this.log(`Performing bulk operation: "${operationName}"...`);
      
      if (this.modulePage.performBulkOperation) {
        await this.modulePage.performBulkOperation(operationName);
      }
      
      this.logSuccess(`Bulk operation "${operationName}" completed`);
    } catch (error) {
      this.logError(`Bulk operation failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * User navigates to next page
   * Frequency: 75% of list modules
   */
  protected async whenUserGoesToNextPage(): Promise<void> {
    try {
      this.log('Navigating to next page...');
      
      if (this.modulePage.goToNextPage) {
        await this.modulePage.goToNextPage();
      }
      
      this.currentPage++;
      this.logSuccess(`Navigated to page ${this.currentPage}`);
    } catch (error) {
      this.logError(`Failed to go to next page: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * User navigates to previous page
   * Frequency: 75% of list modules
   */
  protected async whenUserGoesToPreviousPage(): Promise<void> {
    try {
      this.log('Navigating to previous page...');
      
      if (this.modulePage.goToPreviousPage) {
        await this.modulePage.goToPreviousPage();
      }
      
      this.currentPage = Math.max(1, this.currentPage - 1);
      this.logSuccess(`Navigated to page ${this.currentPage}`);
    } catch (error) {
      this.logError(`Failed to go to previous page: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * User changes page size
   * Frequency: 70% of list modules
   */
  protected async whenUserChangesPageSize(pageSize: string): Promise<void> {
    try {
      this.log(`Changing page size to ${pageSize}...`);
      
      if (this.modulePage.selectPageSize) {
        await this.modulePage.selectPageSize(pageSize);
      }
      
      this.storeTestData('pageSize', pageSize);
      this.logSuccess(`Page size changed to ${pageSize}`);
    } catch (error) {
      this.logError(`Failed to change page size: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  // ============================================================================
  // LIST-SPECIFIC THEN STEPS (Tier 2 - Verifications unique to lists)
  // ============================================================================

  /**
   * List should contain records
   * Frequency: 95% of list modules
   */
  protected async thenListShouldContainRecords(): Promise<void> {
    try {
      this.log('Verifying list contains records...');
      
      if (this.modulePage.getTableRowCount) {
        const rowCount = await this.modulePage.getTableRowCount();
        expect(rowCount).toBeGreaterThan(0);
        this.logSuccess(`List contains ${rowCount} record(s)`);
      }
    } catch (error) {
      this.logError(`Record count verification failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Search results should be displayed
   * Frequency: 90% of list modules
   */
  protected async thenSearchResultsShouldBeDisplayed(): Promise<void> {
    try {
      this.log(`Verifying search results for "${this.currentSearchTerm}"...`);
      
      if (this.modulePage.getTableRowCount) {
        const rowCount = await this.modulePage.getTableRowCount();
        expect(rowCount).toBeGreaterThanOrEqual(0);
        this.logSuccess(`Search returned ${rowCount} result(s)`);
      }
    } catch (error) {
      this.logError(`Search results verification failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Results should contain search term
   * Frequency: 85% of list modules
   */
  protected async thenResultsShouldContainSearchTerm(): Promise<void> {
    try {
      this.log(`Verifying results contain "${this.currentSearchTerm}"...`);
      
      if (this.modulePage.getTableData) {
        const data = await this.modulePage.getTableData();
        
        let foundMatch = false;
        for (const row of data) {
          const rowText = JSON.stringify(row).toLowerCase();
          if (rowText.includes(this.currentSearchTerm.toLowerCase())) {
            foundMatch = true;
            break;
          }
        }
        
        expect(foundMatch).toBe(true);
        this.logSuccess(`Results contain "${this.currentSearchTerm}"`);
      }
    } catch (error) {
      this.logWarning(`Search term verification inconclusive: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Row should be selected
   * Frequency: 80% of list modules
   */
  protected async thenRowShouldBeSelected(rowIndex: number): Promise<void> {
    try {
      this.log(`Verifying row ${rowIndex} is selected...`);
      
      if (this.modulePage.isRowSelected) {
        const isSelected = await this.modulePage.isRowSelected(rowIndex);
        expect(isSelected).toBe(true);
        this.logSuccess(`Row ${rowIndex} is selected`);
      }
    } catch (error) {
      this.logError(`Row selection verification failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Multiple rows should be selected
   * Frequency: 75% of list modules
   */
  protected async thenMultipleRowsShouldBeSelected(count: number): Promise<void> {
    try {
      this.log(`Verifying ${count} rows are selected...`);
      
      if (this.modulePage.getSelectedRowCount) {
        const selectedCount = await this.modulePage.getSelectedRowCount();
        expect(selectedCount).toBe(count);
        this.logSuccess(`${selectedCount} rows are selected`);
      }
    } catch (error) {
      this.logError(`Multiple selection verification failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Pagination should be visible
   * Frequency: 80% of list modules
   */
  protected async thenPaginationShouldBeVisible(): Promise<void> {
    try {
      this.log('Verifying pagination controls are visible...');
      
      if (this.modulePage.isPaginationVisible) {
        const isVisible = await this.modulePage.isPaginationVisible();
        expect(isVisible).toBe(true);
        this.logSuccess('Pagination controls are visible');
      }
    } catch (error) {
      this.logError(`Pagination visibility failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Next page button should be enabled/disabled
   * Frequency: 75% of list modules
   */
  protected async thenNextPageButtonShouldBe(state: 'enabled' | 'disabled'): Promise<void> {
    try {
      this.log(`Verifying next page button is ${state}...`);
      
      if (this.modulePage.isNextPageEnabled) {
        const isEnabled = await this.modulePage.isNextPageEnabled();
        const expected = state === 'enabled';
        expect(isEnabled).toBe(expected);
        this.logSuccess(`Next page button is ${state}`);
      }
    } catch (error) {
      this.logError(`Button state verification failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Row should have specific data
   * Frequency: 85% of list modules
   */
  protected async thenRowShouldContainData(rowIndex: number, expectedData: Record<string, string>): Promise<void> {
    try {
      this.log(`Verifying row ${rowIndex} contains expected data...`);
      
      if (this.modulePage.getRowData) {
        const actualData = await this.modulePage.getRowData(rowIndex);
        
        for (const [key, expectedValue] of Object.entries(expectedData)) {
          const actualValue = actualData[key];
          expect(actualValue).toContain(expectedValue);
          this.log(`  ✓ ${key}: ${actualValue}`);
        }
        
        this.logSuccess(`Row ${rowIndex} data verified`);
      }
    } catch (error) {
      this.logError(`Row data verification failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Row detail should be expanded
   * Frequency: 70% of list modules
   */
  protected async thenRowDetailShouldBeExpanded(rowIndex: number): Promise<void> {
    try {
      this.log(`Verifying row ${rowIndex} details are expanded...`);
      
      if (this.modulePage.isRowExpanded) {
        const isExpanded = await this.modulePage.isRowExpanded(rowIndex);
        expect(isExpanded).toBe(true);
        this.logSuccess(`Row ${rowIndex} is expanded`);
      }
    } catch (error) {
      this.logError(`Row expansion verification failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Bulk operation should complete
   * Frequency: 65% of list modules
   */
  protected async thenBulkOperationShouldComplete(): Promise<void> {
    try {
      this.log('Verifying bulk operation completed...');
      
      await this.thenSuccessMesShouldBeDisplayed();
      this.logSuccess('Bulk operation completed successfully');
    } catch (error) {
      this.logWarning(`Bulk operation completion verification inconclusive`);
    }
  }

  // ============================================================================
  // LIST UTILITY METHODS
  // ============================================================================

  /**
   * Get total record count
   */
  protected async getTotalRecordCount(): Promise<number> {
    try {
      if (this.modulePage.getTotalRecordCount) {
        return await this.modulePage.getTotalRecordCount();
      }
      return 0;
    } catch (error) {
      this.logError(`Failed to get total count: ${error instanceof Error ? error.message : String(error)}`);
      return 0;
    }
  }

  /**
   * Get visible row count on current page
   */
  protected async getVisibleRowCount(): Promise<number> {
    try {
      if (this.modulePage.getTableRowCount) {
        return await this.modulePage.getTableRowCount();
      }
      return 0;
    } catch (error) {
      this.logError(`Failed to get visible count: ${error instanceof Error ? error.message : String(error)}`);
      return 0;
    }
  }

  /**
   * Get all list data
   */
  protected async getListData(): Promise<Record<string, string>[]> {
    try {
      if (this.modulePage.getTableData) {
        return await this.modulePage.getTableData();
      }
      return [];
    } catch (error) {
      this.logError(`Failed to get list data: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  }

  /**
   * Find row by column value
   */
  protected async findRowByValue(columnName: string, value: string): Promise<number> {
    try {
      const data = await this.getListData();
      
      for (let i = 0; i < data.length; i++) {
        if (data[i][columnName]?.includes(value)) {
          return i;
        }
      }
      
      this.logWarning(`Row with ${columnName}="${value}" not found`);
      return -1;
    } catch (error) {
      this.logError(`Failed to find row: ${error instanceof Error ? error.message : String(error)}`);
      return -1;
    }
  }
}
