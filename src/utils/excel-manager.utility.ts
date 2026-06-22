/**
 * Excel File Manager Utility
 * 
 * Migrated from Python ReportAutomationConsoleSaveToExcel.py
 * Handles reading, writing, and manipulating Excel files
 */

import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';

export interface ExcelCell {
  row: number;
  column: number | string;
  value: any;
}

export interface ExcelOptions {
  sheetName?: string;
  headerFill?: string;
  headerTextColor?: string;
  fontSize?: number;
}

export interface ExcelSearchResult {
  row: number;
  column: number;
  value: any;
}

export class ExcelManagerUtility {
  private workbook: ExcelJS.Workbook | null = null;
  private filePath: string = '';

  /**
   * Load existing Excel file
   */
  async loadExcelFile(filePath: string): Promise<void> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Excel file not found: ${filePath}`);
    }

    this.workbook = new ExcelJS.Workbook();
    await this.workbook.xlsx.readFile(filePath);
    this.filePath = filePath;
  }

  /**
   * Create new Excel file
   */
  createNewExcelFile(): void {
    this.workbook = new ExcelJS.Workbook();
    const worksheet = this.workbook.addWorksheet('Data');
    this.filePath = '';
  }

  /**
   * Get active worksheet
   */
  getActiveWorksheet(): ExcelJS.Worksheet {
    if (!this.workbook) {
      throw new Error('No workbook loaded');
    }
    return this.workbook.getWorksheet(1) || this.workbook.addWorksheet('Data');
  }

  /**
   * Get worksheet by name
   */
  getWorksheet(sheetName: string): ExcelJS.Worksheet {
    if (!this.workbook) {
      throw new Error('No workbook loaded');
    }
    const worksheet = this.workbook.getWorksheet(sheetName);
    if (!worksheet) {
      throw new Error(`Worksheet not found: ${sheetName}`);
    }
    return worksheet;
  }

  /**
   * Save Excel file
   */
  async saveExcelFile(filePath?: string): Promise<void> {
    if (!this.workbook) {
      throw new Error('No workbook to save');
    }

    const targetPath = filePath || this.filePath;
    if (!targetPath) {
      throw new Error('File path not specified');
    }

    // Ensure directory exists
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await this.workbook.xlsx.writeFile(targetPath);
    this.filePath = targetPath;
  }

  /**
   * Add row to worksheet
   */
  addRow(values: any[], sheetName?: string): ExcelJS.Row {
    const worksheet = sheetName 
      ? this.getWorksheet(sheetName)
      : this.getActiveWorksheet();

    const row = worksheet.addRow(values);
    return row;
  }

  /**
   * Add header row with formatting
   */
  addHeaderRow(
    headers: string[],
    options: ExcelOptions = {}
  ): ExcelJS.Row {
    const {
      sheetName,
      headerFill = '4472C4',
      headerTextColor = 'FFFFFF',
      fontSize = 11
    } = options;

    const worksheet = sheetName 
      ? this.getWorksheet(sheetName)
      : this.getActiveWorksheet();

    const row = worksheet.addRow(headers);

    // Apply styling
    row.eachCell((cell, colNumber) => {
      cell.fill = {
        type: 'solid',
        fgColor: { argb: `FF${headerFill}` }
      };

      cell.font = {
        bold: true,
        color: { argb: `FF${headerTextColor}` },
        size: fontSize
      };

      cell.alignment = {
        horizontal: 'center',
        vertical: 'center',
        wrapText: true
      };

      // Add border
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    return row;
  }

  /**
   * Get cell value
   */
  getCellValue(row: number, column: number | string, sheetName?: string): any {
    const worksheet = sheetName 
      ? this.getWorksheet(sheetName)
      : this.getActiveWorksheet();

    const cell = worksheet.getCell(row, this.normalizeColumn(column));
    return cell.value;
  }

  /**
   * Set cell value
   */
  setCellValue(
    row: number,
    column: number | string,
    value: any,
    sheetName?: string
  ): void {
    const worksheet = sheetName 
      ? this.getWorksheet(sheetName)
      : this.getActiveWorksheet();

    const cell = worksheet.getCell(row, this.normalizeColumn(column));
    cell.value = value;
  }

  /**
   * Normalize column reference (letter to number or vice versa)
   */
  private normalizeColumn(column: number | string): number {
    if (typeof column === 'number') {
      return column;
    }

    // Convert letter to number (A=1, B=2, etc.)
    let colNum = 0;
    for (let i = 0; i < column.length; i++) {
      colNum = colNum * 26 + (column.charCodeAt(i) - 64);
    }
    return colNum;
  }

  /**
   * Get last row with data in column
   */
  getLastValueInColumn(
    column: number | string,
    sheetName?: string
  ): any {
    const worksheet = sheetName 
      ? this.getWorksheet(sheetName)
      : this.getActiveWorksheet();

    const colNum = this.normalizeColumn(column);
    let lastValue = null;

    for (let row = worksheet.rowCount; row > 0; row--) {
      const cell = worksheet.getCell(row, colNum);
      if (cell.value !== null && cell.value !== undefined) {
        const strValue = String(cell.value).trim();
        if (strValue.length > 0) {
          return cell.value;
        }
      }
    }

    return lastValue;
  }

  /**
   * Find cell by value
   */
  findCellByValue(
    searchValue: any,
    sheetName?: string
  ): ExcelSearchResult | null {
    const worksheet = sheetName 
      ? this.getWorksheet(sheetName)
      : this.getActiveWorksheet();

    for (let row = 1; row <= worksheet.rowCount; row++) {
      for (let col = 1; col <= worksheet.columnCount; col++) {
        const cell = worksheet.getCell(row, col);
        if (cell.value === searchValue || String(cell.value) === String(searchValue)) {
          return {
            row,
            column: col,
            value: cell.value
          };
        }
      }
    }

    return null;
  }

  /**
   * Find cell by text pattern
   */
  findCellByPattern(
    pattern: RegExp,
    sheetName?: string
  ): ExcelSearchResult | null {
    const worksheet = sheetName 
      ? this.getWorksheet(sheetName)
      : this.getActiveWorksheet();

    for (let row = 1; row <= worksheet.rowCount; row++) {
      for (let col = 1; col <= worksheet.columnCount; col++) {
        const cell = worksheet.getCell(row, col);
        if (cell.value && pattern.test(String(cell.value))) {
          return {
            row,
            column: col,
            value: cell.value
          };
        }
      }
    }

    return null;
  }

  /**
   * Get row data as object
   */
  getRowAsObject(
    row: number,
    headerRow: number = 1,
    sheetName?: string
  ): Record<string, any> {
    const worksheet = sheetName 
      ? this.getWorksheet(sheetName)
      : this.getActiveWorksheet();

    const headers: string[] = [];
    const values: any[] = [];

    // Get headers
    for (let col = 1; col <= worksheet.columnCount; col++) {
      const headerCell = worksheet.getCell(headerRow, col);
      headers.push(String(headerCell.value || ''));
    }

    // Get values
    for (let col = 1; col <= worksheet.columnCount; col++) {
      const cell = worksheet.getCell(row, col);
      values.push(cell.value);
    }

    // Create object
    const obj: Record<string, any> = {};
    headers.forEach((header, index) => {
      obj[header] = values[index];
    });

    return obj;
  }

  /**
   * Get all rows as objects
   */
  getAllRowsAsObjects(
    headerRow: number = 1,
    sheetName?: string
  ): Record<string, any>[] {
    const worksheet = sheetName 
      ? this.getWorksheet(sheetName)
      : this.getActiveWorksheet();

    const results: Record<string, any>[] = [];

    for (let row = headerRow + 1; row <= worksheet.rowCount; row++) {
      results.push(this.getRowAsObject(row, headerRow, sheetName));
    }

    return results;
  }

  /**
   * Append label-value pair to Excel file
   */
  async appendLabelValue(
    label: string,
    value: any,
    filePath: string,
    fileName: string = 'output.xlsx',
    options: ExcelOptions = {}
  ): Promise<void> {
    const fullPath = path.join(filePath, fileName);

    // Load or create workbook
    if (fs.existsSync(fullPath)) {
      await this.loadExcelFile(fullPath);
    } else {
      this.createNewExcelFile();
    }

    const worksheet = this.getActiveWorksheet();

    // Add headers if first row is empty
    if (worksheet.rowCount === 0 || !worksheet.getCell(1, 1).value) {
      this.addHeaderRow(['Label', 'Value'], options);
    }

    // Add data row
    const nextRow = worksheet.rowCount + 1;
    const row = this.addRow([label, this.formatValue(value)]);

    // Apply borders
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };

      cell.alignment = {
        vertical: 'center',
        wrapText: true
      };
    });

    // Auto-fit columns
    this.autoFitColumns();

    await this.saveExcelFile(fullPath);
  }

  /**
   * Format value for Excel (handle file paths, etc.)
   */
  private formatValue(value: any): any {
    if (typeof value === 'string' && fs.existsSync(value)) {
      // Return just the filename for file paths
      return path.basename(value);
    }

    if (value === null || value === undefined) {
      return '';
    }

    return value;
  }

  /**
   * Auto-fit column widths
   */
  autoFitColumns(sheetName?: string): void {
    const worksheet = sheetName 
      ? this.getWorksheet(sheetName)
      : this.getActiveWorksheet();

    const columnWidths: number[] = [];

    // Calculate max width for each column
    for (let col = 1; col <= worksheet.columnCount; col++) {
      let maxWidth = 12; // Minimum width

      for (let row = 1; row <= worksheet.rowCount; row++) {
        const cell = worksheet.getCell(row, col);
        const cellValue = String(cell.value || '');
        const cellWidth = cellValue.length + 2;

        if (cellWidth > maxWidth) {
          maxWidth = cellWidth;
        }
      }

      columnWidths[col] = Math.min(maxWidth, 50); // Cap at 50
    }

    // Apply widths
    for (let col = 1; col <= worksheet.columnCount; col++) {
      worksheet.getColumn(col).width = columnWidths[col] || 12;
    }
  }

  /**
   * Extract numeric value from cell
   */
  extractNumericValue(value: any): number {
    if (typeof value === 'number') {
      return value;
    }

    const strValue = String(value || '');
    const numMatch = strValue.match(/[\d.,]+/);

    if (numMatch) {
      return parseFloat(numMatch[0].replace(/,/g, ''));
    }

    return 0;
  }

  /**
   * Get maximum row count
   */
  getRowCount(sheetName?: string): number {
    const worksheet = sheetName 
      ? this.getWorksheet(sheetName)
      : this.getActiveWorksheet();

    return worksheet.rowCount;
  }

  /**
   * Get maximum column count
   */
  getColumnCount(sheetName?: string): number {
    const worksheet = sheetName 
      ? this.getWorksheet(sheetName)
      : this.getActiveWorksheet();

    return worksheet.columnCount;
  }

  /**
   * Clear all cells in worksheet
   */
  clearWorksheet(sheetName?: string): void {
    const worksheet = sheetName 
      ? this.getWorksheet(sheetName)
      : this.getActiveWorksheet();

    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.value = null;
      });
    });
  }

  /**
   * Delete worksheet
   */
  deleteWorksheet(sheetName: string): void {
    if (!this.workbook) {
      throw new Error('No workbook loaded');
    }

    const worksheet = this.workbook.getWorksheet(sheetName);
    if (worksheet) {
      this.workbook.removeWorksheet(worksheet);
    }
  }

  /**
   * Copy worksheet
   */
  copyWorksheet(
    sourceSheetName: string,
    newSheetName: string
  ): ExcelJS.Worksheet {
    if (!this.workbook) {
      throw new Error('No workbook loaded');
    }

    const sourceSheet = this.workbook.getWorksheet(sourceSheetName);
    if (!sourceSheet) {
      throw new Error(`Source worksheet not found: ${sourceSheetName}`);
    }

    const newSheet = this.workbook.addWorksheet(newSheetName);
    sourceSheet.eachRow((row, rowNumber) => {
      const newRow = newSheet.getRow(rowNumber);
      row.eachCell((cell, colNumber) => {
        const newCell = newRow.getCell(colNumber);
        newCell.value = cell.value;
        newCell.font = { ...cell.font };
        newCell.fill = { ...cell.fill };
        newCell.border = { ...cell.border };
        newCell.alignment = { ...cell.alignment };
      });
    });

    return newSheet;
  }

  /**
   * Get current file path
   */
  getFilePath(): string {
    return this.filePath;
  }

  /**
   * Set current file path
   */
  setFilePath(filePath: string): void {
    this.filePath = filePath;
  }
}
