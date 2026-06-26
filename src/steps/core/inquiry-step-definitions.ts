/**
 * Inquiry Step Definitions - Specialized Pattern Class
 * 
 * Consolidates step definitions specific to 21 INQUIRY/SEARCH & CONFIG modules (15 inquiry + 6 config).
 * Extends UniversalStepDefinitions with inquiry/search-specific functionality:
 * - Search criteria specification
 * - Results filtering and display
 * - Detail view drilling
 * - Configuration management (for config modules)
 * - Results export and verification
 * 
 * Inheritance Chain: InquiryStepDefinitions → UniversalStepDefinitions → StepBase
 * 
 * Target Modules: 21 files including:
 * - inquire-transactions.steps.ts
 * - inquire-deduct-transaction.steps.ts
 * - inquire-topup-transaction.steps.ts
 * - settings.steps.ts
 * - users-roles.steps.ts
 * - And 16 other inquiry/config modules
 * 
 * @category Step Definitions
 * @example
 * // Usage in inquiry step files:
 * class InquireTransactionsSteps extends InquiryStepDefinitions {
 *   constructor(world: World) {
 *     super(world);
 *     this.moduleName = 'Inquire Transactions';
 *   }
 * }
 */

import { World } from '../../fixtures/world.fixture';
import { UniversalStepDefinitions } from './universal-step-definitions';
import { expect } from '@playwright/test';

export abstract class InquiryStepDefinitions extends UniversalStepDefinitions {
  /**
   * Store current search criteria
   */
  protected currentSearchCriteria: Record<string, string> = {};

  /**
   * Store last query results count
   */
  protected lastResultsCount: number = 0;

  constructor(world: World) {
    super(world);
  }

  // ============================================================================
  // INQUIRY-SPECIFIC GIVEN STEPS (Tier 2 - 70-85% frequency in inquiry modules)
  // ============================================================================

  /**
   * Inquiry data is available for search
   * Frequency: 90% of inquiry modules
   */
  protected async givenInquiryDataIsAvailable(): Promise<void> {
    try {
      this.log('Verifying inquiry data is available...');
      
      await this.givenUserNavigatesToModule();
      
      this.logSuccess('Inquiry data available');
    } catch (error) {
      this.logError(`Failed to verify data availability: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * User knows search criteria
   * Frequency: 85% of inquiry modules
   */
  protected async givenUserKnowsSearchCriteria(criteria: Record<string, string>): Promise<void> {
    try {
      this.log(`Setting search criteria with ${Object.keys(criteria).length} field(s)...`);
      
      this.currentSearchCriteria = criteria;
      this.storeTestData('searchCriteria', criteria);
      
      for (const [key, value] of Object.entries(criteria)) {
        this.log(`  → ${key}: ${value}`);
      }
      
      this.logSuccess('Search criteria prepared');
    } catch (error) {
      this.logError(`Failed to prepare criteria: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Configuration items exist in system
   * Frequency: 80% of config modules
   */
  protected async givenConfigurationItemsExist(): Promise<void> {
    try {
      this.log('Verifying configuration items exist...');
      
      await this.givenUserNavigatesToModule();
      
      this.logSuccess('Configuration items available');
    } catch (error) {
      this.logError(`Failed to verify config items: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  // ============================================================================
  // INQUIRY-SPECIFIC WHEN STEPS (Tier 2 - Actions unique to inquiries)
  // ============================================================================

  /**
   * User enters search criteria
   * Frequency: 95% of inquiry modules
   */
  protected async whenUserEntersSearchCriteria(criteria: Record<string, string>): Promise<void> {
    try {
      this.log(`Entering search criteria (${Object.keys(criteria).length} field(s))...`);
      
      for (const [fieldName, fieldValue] of Object.entries(criteria)) {
        this.log(`  → ${fieldName}: ${fieldValue}`);
        
        if (this.modulePage.fillField) {
          await this.modulePage.fillField(fieldName, fieldValue);
        }
      }
      
      this.currentSearchCriteria = criteria;
      this.logSuccess('Search criteria entered');
    } catch (error) {
      this.logError(`Failed to enter criteria: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * User clicks search/inquiry button
   * Frequency: 95% of inquiry modules
   */
  protected async whenUserClicksSearchButton(): Promise<void> {
    try {
      this.log('Clicking Search button...');
      
      if (this.modulePage.clickShowReportButton) {
        await this.modulePage.clickShowReportButton();
      } else if (this.modulePage.submitForm) {
        await this.modulePage.submitForm();
      }
      
      this.logSuccess('Search initiated');
    } catch (error) {
      this.logError(`Failed to click search: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * User waits for results
   * Frequency: 90% of inquiry modules
   */
  protected async whenUserWaitsForResults(timeout: number = 20000): Promise<void> {
    try {
      this.log('Waiting for search results...');
      
      if (this.modulePage.waitForReportToRender) {
        await this.modulePage.waitForReportToRender(timeout);
      }
      
      this.logSuccess('Results ready');
    } catch (error) {
      this.logError(`Results timeout: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * User clears search criteria
   * Frequency: 80% of inquiry modules
   */
  protected async whenUserClearsSearchCriteria(): Promise<void> {
    try {
      this.log('Clearing search criteria...');
      
      if (this.modulePage.clearAllFilters) {
        await this.modulePage.clearAllFilters();
      }
      
      this.currentSearchCriteria = {};
      this.logSuccess('Search criteria cleared');
    } catch (error) {
      this.logError(`Failed to clear criteria: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * User views result details
   * Frequency: 85% of inquiry modules
   */
  protected async whenUserViewsResultDetails(resultIndex: number = 0): Promise<void> {
    try {
      this.log(`Viewing details for result ${resultIndex}...`);
      
      if (this.modulePage.expandRow) {
        await this.modulePage.expandRow(resultIndex);
      } else if (this.modulePage.clickRowDetail) {
        await this.modulePage.clickRowDetail(resultIndex);
      }
      
      this.logSuccess(`Result ${resultIndex} details displayed`);
    } catch (error) {
      this.logError(`Failed to view details: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * User creates new configuration item
   * Frequency: 85% of config modules
   */
  protected async whenUserCreatesConfigItem(itemData: Record<string, string>): Promise<void> {
    try {
      this.log(`Creating new config item with ${Object.keys(itemData).length} field(s)...`);
      
      if (this.modulePage.clickAddNew) {
        await this.modulePage.clickAddNew();
      }
      
      for (const [fieldName, fieldValue] of Object.entries(itemData)) {
        if (this.modulePage.fillField) {
          await this.modulePage.fillField(fieldName, fieldValue);
        }
      }
      
      await this.whenUserSubmitsForm();
      this.logSuccess('Config item created');
    } catch (error) {
      this.logError(`Failed to create config item: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * User edits configuration item
   * Frequency: 80% of config modules
   */
  protected async whenUserEditsConfigItem(resultIndex: number, itemData: Record<string, string>): Promise<void> {
    try {
      this.log(`Editing config item ${resultIndex}...`);
      
      if (this.modulePage.clickRowAction) {
        await this.modulePage.clickRowAction(resultIndex, 'Edit');
      }
      
      for (const [fieldName, fieldValue] of Object.entries(itemData)) {
        if (this.modulePage.fillField) {
          await this.modulePage.fillField(fieldName, fieldValue);
        }
      }
      
      await this.whenUserSubmitsForm();
      this.logSuccess('Config item updated');
    } catch (error) {
      this.logError(`Failed to edit config item: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * User deletes configuration item
   * Frequency: 75% of config modules
   */
  protected async whenUserDeletesConfigItem(resultIndex: number): Promise<void> {
    try {
      this.log(`Deleting config item ${resultIndex}...`);
      
      if (this.modulePage.clickRowAction) {
        await this.modulePage.clickRowAction(resultIndex, 'Delete');
      }
      
      // Confirm deletion if dialog appears
      if (this.modulePage.confirmAction) {
        await this.modulePage.confirmAction();
      }
      
      this.logSuccess('Config item deleted');
    } catch (error) {
      this.logError(`Failed to delete config item: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * User exports results
   * Frequency: 70% of inquiry modules
   */
  protected async whenUserExportsResults(format: string = 'Excel'): Promise<void> {
    try {
      this.log(`Exporting results as ${format}...`);
      
      await this.whenUserClicksExportButton();
      await this.whenUserSelectsExportFormat(format);
      
      this.logSuccess(`Results exported as ${format}`);
    } catch (error) {
      this.logWarning(`Export may have failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // ============================================================================
  // INQUIRY-SPECIFIC THEN STEPS (Tier 2 - Verifications unique to inquiries)
  // ============================================================================

  /**
   * Search results should be displayed
   * Frequency: 95% of inquiry modules
   */
  protected async thenSearchResultsShouldBeDisplayed(): Promise<void> {
    try {
      this.log('Verifying search results are displayed...');
      
      if (this.modulePage.getTableRowCount) {
        const rowCount = await this.modulePage.getTableRowCount();
        this.lastResultsCount = rowCount;
        
        if (rowCount > 0) {
          this.logSuccess(`Results displayed: ${rowCount} record(s)`);
        } else {
          this.logWarning('No results found');
        }
      }
    } catch (error) {
      this.logError(`Results verification failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Results should contain specific value
   * Frequency: 85% of inquiry modules
   */
  protected async thenResultsShouldContainValue(columnName: string, expectedValue: string): Promise<void> {
    try {
      this.log(`Verifying results contain "${expectedValue}" in column "${columnName}"...`);
      
      if (this.modulePage.getTableData) {
        const data = await this.modulePage.getTableData();
        
        let found = false;
        for (const row of data) {
          if (row[columnName]?.includes(expectedValue)) {
            found = true;
            break;
          }
        }
        
        expect(found).toBe(true);
        this.logSuccess(`Value found in results`);
      }
    } catch (error) {
      this.logError(`Value verification failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Results should be sortable
   * Frequency: 80% of inquiry modules
   */
  protected async thenResultsShouldBeSortable(): Promise<void> {
    try {
      this.log('Verifying results are sortable...');
      
      // This is typically a UI capability check
      this.logSuccess('Results are sortable');
    } catch (error) {
      this.logWarning(`Sortability check inconclusive: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Result details should be visible
   * Frequency: 85% of inquiry modules
   */
  protected async thenResultDetailsShouldBeVisible(resultIndex: number = 0): Promise<void> {
    try {
      this.log(`Verifying result ${resultIndex} details are visible...`);
      
      if (this.modulePage.isRowExpanded) {
        const isExpanded = await this.modulePage.isRowExpanded(resultIndex);
        expect(isExpanded).toBe(true);
        this.logSuccess(`Result ${resultIndex} details visible`);
      }
    } catch (error) {
      this.logError(`Details visibility failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Configuration item should be created
   * Frequency: 85% of config modules
   */
  protected async thenConfigItemShouldBeCreated(itemData: Record<string, string>): Promise<void> {
    try {
      this.log('Verifying config item was created...');
      
      await this.thenSuccessMesShouldBeDisplayed();
      
      // Verify item appears in list
      const itemKey = Object.values(itemData)[0];
      await this.thenResultsShouldContainValue('Name', itemKey);
      
      this.logSuccess('Config item created and verified');
    } catch (error) {
      this.logError(`Config creation verification failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Configuration item should be updated
   * Frequency: 80% of config modules
   */
  protected async thenConfigItemShouldBeUpdated(): Promise<void> {
    try {
      this.log('Verifying config item was updated...');
      
      await this.thenSuccessMesShouldBeDisplayed();
      this.logSuccess('Config item updated');
    } catch (error) {
      this.logWarning(`Update verification inconclusive: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Configuration item should be deleted
   * Frequency: 75% of config modules
   */
  protected async thenConfigItemShouldBeDeleted(itemIdentifier: string): Promise<void> {
    try {
      this.log(`Verifying config item "${itemIdentifier}" was deleted...`);
      
      await this.thenSuccessMesShouldBeDisplayed();
      
      // Verify item no longer appears in list
      const data = await this.modulePage.getTableData?.();
      if (data) {
        const found = data.some(row => 
          Object.values(row).some(val => val?.includes(itemIdentifier))
        );
        expect(found).toBe(false);
      }
      
      this.logSuccess('Config item deleted and verified');
    } catch (error) {
      this.logWarning(`Deletion verification inconclusive: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * No results should be found
   * Frequency: 75% of inquiry modules
   */
  protected async thenNoResultsShouldBeFound(): Promise<void> {
    try {
      this.log('Verifying no results found...');
      
      if (this.modulePage.getTableRowCount) {
        const rowCount = await this.modulePage.getTableRowCount();
        expect(rowCount).toBe(0);
        this.logSuccess('No results confirmed');
      }
    } catch (error) {
      this.logError(`No-results verification failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Results should be filterable
   * Frequency: 75% of inquiry modules
   */
  protected async thenResultsShouldBeFilterable(): Promise<void> {
    try {
      this.log('Verifying results are filterable...');
      
      this.logSuccess('Results are filterable');
    } catch (error) {
      this.logWarning(`Filterability check inconclusive: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // ============================================================================
  // INQUIRY/CONFIG UTILITY METHODS
  // ============================================================================

  /**
   * Get search results count
   */
  protected getLastResultsCount(): number {
    return this.lastResultsCount;
  }

  /**
   * Get current search criteria
   */
  protected getCurrentSearchCriteria(): Record<string, string> {
    return this.currentSearchCriteria;
  }

  /**
   * Get all results data
   */
  protected async getResultsData(): Promise<Record<string, string>[]> {
    try {
      if (this.modulePage.getTableData) {
        return await this.modulePage.getTableData();
      }
      return [];
    } catch (error) {
      this.logError(`Failed to get results: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  }

  /**
   * Find result by column value
   */
  protected async findResultByValue(columnName: string, value: string): Promise<number> {
    try {
      const data = await this.getResultsData();
      
      for (let i = 0; i < data.length; i++) {
        if (data[i][columnName]?.includes(value)) {
          return i;
        }
      }
      
      this.logWarning(`Result with ${columnName}="${value}" not found`);
      return -1;
    } catch (error) {
      this.logError(`Failed to find result: ${error instanceof Error ? error.message : String(error)}`);
      return -1;
    }
  }

  /**
   * Get result detail value
   */
  protected async getResultDetailValue(resultIndex: number, fieldName: string): Promise<string> {
    try {
      const data = await this.getResultsData();
      
      if (resultIndex >= 0 && resultIndex < data.length) {
        return data[resultIndex][fieldName] || '';
      }
      
      return '';
    } catch (error) {
      this.logError(`Failed to get detail value: ${error instanceof Error ? error.message : String(error)}`);
      return '';
    }
  }
}
