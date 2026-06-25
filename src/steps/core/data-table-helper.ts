/**
 * Data Table Helper
 * 
 * Utilities for handling Cucumber data tables with:
 * - Safe parsing
 * - Type conversion
 * - Validation
 * - Logging
 */

import { DataTable } from '@cucumber/cucumber';

export interface DataTableRow {
  [key: string]: string;
}

export interface ParsedDataRow {
  [key: string]: string | number | boolean | Date;
}

export class DataTableHelper {
  /**
   * Convert data table to array of hashes
   */
  static toHashes(dataTable: DataTable): DataTableRow[] {
    try {
      return dataTable.hashes();
    } catch (error) {
      throw new Error(
        `Failed to parse data table: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Convert data table to 2D array
   */
  static toArray(dataTable: DataTable): string[][] {
    try {
      return dataTable.raw();
    } catch (error) {
      throw new Error(
        `Failed to parse data table to array: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Parse single row with type conversion
   */
  static parseRow(row: DataTableRow, schema?: { [key: string]: 'string' | 'number' | 'boolean' | 'date' }): ParsedDataRow {
    const parsed: ParsedDataRow = {};

    for (const [key, value] of Object.entries(row)) {
      const type = schema?.[key] || 'string';

      try {
        switch (type) {
          case 'number':
            parsed[key] = parseFloat(value) || 0;
            break;
          case 'boolean':
            parsed[key] = value.toLowerCase() === 'true' || value === '1';
            break;
          case 'date':
            parsed[key] = new Date(value);
            break;
          case 'string':
          default:
            parsed[key] = value;
        }
      } catch (error) {
        throw new Error(
          `Failed to parse field "${key}" as type "${type}" with value "${value}": ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }

    return parsed;
  }

  /**
   * Parse multiple rows with type conversion
   */
  static parseRows(
    rows: DataTableRow[],
    schema?: { [key: string]: 'string' | 'number' | 'boolean' | 'date' }
  ): ParsedDataRow[] {
    return rows.map((row, index) => {
      try {
        return this.parseRow(row, schema);
      } catch (error) {
        throw new Error(
          `Failed to parse row ${index + 1}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  }

  /**
   * Validate required columns exist
   */
  static validateColumns(row: DataTableRow, requiredColumns: string[]): void {
    const missingColumns = requiredColumns.filter(col => !(col in row));

    if (missingColumns.length > 0) {
      const availableColumns = Object.keys(row).join(', ');
      throw new Error(
        `Missing required columns: ${missingColumns.join(', ')}. Available columns: ${availableColumns}`
      );
    }
  }

  /**
   * Validate all rows have required columns
   */
  static validateAllRows(rows: DataTableRow[], requiredColumns: string[]): void {
    rows.forEach((row, index) => {
      try {
        this.validateColumns(row, requiredColumns);
      } catch (error) {
        throw new Error(
          `Row ${index + 1} validation failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  }

  /**
   * Filter rows by column value
   */
  static filterRows(rows: DataTableRow[], columnName: string, value: string): DataTableRow[] {
    return rows.filter(row => row[columnName]?.toLowerCase() === value.toLowerCase());
  }

  /**
   * Group rows by column value
   */
  static groupRows(rows: DataTableRow[], columnName: string): { [key: string]: DataTableRow[] } {
    const groups: { [key: string]: DataTableRow[] } = {};

    rows.forEach(row => {
      const key = row[columnName] || 'undefined';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(row);
    });

    return groups;
  }

  /**
   * Sum numeric column
   */
  static sumColumn(rows: DataTableRow[], columnName: string): number {
    return rows.reduce((sum, row) => {
      const value = parseFloat(row[columnName]) || 0;
      return sum + value;
    }, 0);
  }

  /**
   * Get unique values from column
   */
  static getUniqueValues(rows: DataTableRow[], columnName: string): string[] {
    const values = new Set(rows.map(row => row[columnName]));
    return Array.from(values).filter(Boolean);
  }

  /**
   * Find row by column value
   */
  static findRow(rows: DataTableRow[], columnName: string, value: string): DataTableRow | undefined {
    return rows.find(row => row[columnName]?.toLowerCase() === value.toLowerCase());
  }

  /**
   * Create summary of data table
   */
  static getSummary(rows: DataTableRow[]): string {
    if (rows.length === 0) {
      return 'Empty data table';
    }

    const columnCount = Object.keys(rows[0]).length;
    return `${rows.length} rows × ${columnCount} columns`;
  }
}
