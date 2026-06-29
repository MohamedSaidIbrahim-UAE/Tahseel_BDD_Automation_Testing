/**
 * Cross-Report Reconciliation Utility
 *
 * Encapsulates all Excel value extraction, cross-report comparison,
 * and summary save logic from the legacy ReportAutomationConsoleSaveToExcel.py.
 *
 * Uses the existing ExcelManagerUtility for file I/O and openpyxl-like operations.
 *
 * Responsibilities:
 *   1. Get the latest matching Excel file from a download folder
 *   2. Extract the last non-empty value from specific column(s)
 *   3. Extract receipt document values (search for label in K-O, get G column)
 *   4. Compare two values (with optional mode)
 *   5. Save label/value pairs to a summary Excel workbook
 *   6. Run all reconciliation checks across reports
 *
 * Migrated from: Guides/migration/ReportAutomationConsoleSaveToExcel.py
 */

import * as fs from 'fs';
import * as path from 'path';
import * as ExcelJS from 'exceljs';

// ── Types ────────────────────────────────────────────────────────────────────────

export interface ReconciliationEntry {
  label: string;
  value: number | string;
  fileSource?: string;
}

export interface ComparisonResult {
  label1: string;
  value1: number;
  label2: string;
  value2: number;
  difference: number;
  mode: 0 | 1; // 0 = subtract, 1 = add
  description: string;
}

export interface ReconciliationReport {
  folderPath: string;
  timestamp: Date;
  entries: ReconciliationEntry[];
  comparisons: ComparisonResult[];
  summaryFilePath: string;
}

// ── Constants from legacy script ─────────────────────────────────────────────────

/** Expected exported file names mapped to their logical keys */
export const EXPECTED_EXPORT_FILES: Record<string, string> = {
  depositReceivable: 'transactionpaymentservicessummaryDepositreceivable',
  revenueReceivable: 'transactionpaymentservicessummaryreceivable_sec',
  allPaymentMethods: 'TransactionFeesForAllPaymentMethods',
  bankPayments: 'BankPayments',
  creditCardSummary: 'ShjCreditCardSummery',
  govTransSummary: 'ShjGovTransSummary_sec',
  supportServices: 'TRANSACTIONPAYMENTDEPENDANTSERVICESSUMMARY_sec',
  taxSummary: 'TRANSACTIONTAXSUMARY',
  depositAllPaymentMethods: 'TransactionFeeReportforAllPaymentMethods(Deposit)',
  incurredFees: 'SummaryReport_of_IncurredFees PerRevenueEntity',
  smartReceipt: 'GITFees_ShjGovTransStatistics',
};

/** Sheet names mapped to their expected truncated Excel sheet names (31-char limit) */
export const SHEET_NAMES: Record<string, string> = {
  transactionFees: 'TransactionFeesForAllPaymentMet',
  transactionSummary: 'transactionpaymentservicessumma',
  creditCard: 'Sheet1',
  govTrans: 'جمارك الشارقة',
  supportServices: 'TRANSACTIONPAYMENTDEPENDANTSERV',
  taxSummary: 'TRANSACTIONTAXSUMARY',
  incurredFees: 'SummaryReport_of_IncurredFees P',
  smartReceipt: 'هيئة مطار الشارقة',
};

// ═══════════════════════════════════════════════════════════════════════════════════
// CrossReportReconciliation Class
// ═══════════════════════════════════════════════════════════════════════════════════

export class CrossReportReconciliation {
  private folderPath: string;
  private entries: ReconciliationEntry[] = [];
  private comparisons: ComparisonResult[] = [];
  private summaryWorkbook: ExcelJS.Workbook;

  constructor(folderPath: string) {
    this.folderPath = folderPath;
    this.summaryWorkbook = new ExcelJS.Workbook();
    this.ensureFolder();
  }

  private ensureFolder(): void {
    if (!fs.existsSync(this.folderPath)) {
      fs.mkdirSync(this.folderPath, { recursive: true });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // FILE DISCOVERY
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Get the latest Excel file matching a name prefix.
   * Mirrors get_latest_excel_file() from Python.
   */
  getLatestExcelFile(fileNameStartsWith: string): string | null {
    try {
      const files = fs.readdirSync(this.folderPath)
        .filter(f => f.startsWith(fileNameStartsWith) && f.endsWith('.xlsx'))
        .map(f => ({
          name: f,
          fullPath: path.join(this.folderPath, f),
          mtime: fs.statSync(path.join(this.folderPath, f)).mtimeMs,
        }))
        .sort((a, b) => b.mtime - a.mtime);

      if (files.length === 0) {
        console.warn(`[Reconciliation] No files matching: ${fileNameStartsWith}`);
        return null;
      }

      console.log(`[Reconciliation] Latest file: ${files[0].name}`);
      return files[0].fullPath;
    } catch (error) {
      console.warn(`[Reconciliation] Error finding file: ${error}`);
      return null;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // EXCEL VALUE EXTRACTION
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Convert Excel column letter(s) to index(es).
   * Handles both single letters ("A") and arrays (["A","B","C"]).
   */
  private columnLettersToIndices(columns: string | string[]): number[] {
    if (typeof columns === 'string') {
      return [this.columnLetterToIndex(columns)];
    }
    return columns.map(c => this.columnLetterToIndex(c));
  }

  private columnLetterToIndex(column: string): number {
    let index = 0;
    for (let i = 0; i < column.length; i++) {
      index = index * 26 + (column.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
    }
    return index;
  }

  /**
   * Get the last non-empty value in a specified column (or merged range).
   * Mirrors get_last_value_in_column() from Python.
   *
   * For single column: scans bottom-up for non-empty cell.
   * For multiple columns: checks merged cell ranges first, then individual cells.
   */
  async getLastValueInColumn(
    filePath: string | null,
    sheetName: string,
    columns: string | string[]
  ): Promise<number | null> {
    if (!filePath || !fs.existsSync(filePath)) {
      console.warn(`[Reconciliation] File not found for value extraction: ${filePath}`);
      return null;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);

      const worksheet = workbook.getWorksheet(sheetName)
        || workbook.getWorksheet(1);

      if (!worksheet) {
        console.warn(`[Reconciliation] Worksheet not found: ${sheetName}`);
        return null;
      }

      const colIndices = this.columnLettersToIndices(columns);
      const isSingleCol = colIndices.length === 1;

      // Build a map of merged cell ranges for the target columns
      const mergeMap = new Map<number, { row: number; col: number }>();
      if (!isSingleCol && (worksheet as any).model?.merges) {
        for (const merge of (worksheet as any).model.merges || []) {
          const minCol = merge.left + 1; // ExcelJS uses 0-based for left
          const maxCol = merge.right + 1;
          if (colIndices.some(ci => ci >= minCol && ci <= maxCol)) {
            mergeMap.set(merge.top + 1, { row: merge.top + 1, col: merge.left + 1 });
          }
        }
      }

      // Scan bottom-up
      for (let row = worksheet.rowCount; row >= 1; row--) {
        if (isSingleCol) {
          const cell = worksheet.getCell(row, colIndices[0]);
          const value = cell.value;
          if (value !== null && value !== undefined && String(value).trim() !== '') {
            const num = this.parseNumericValue(value);
            if (num !== null) return num;
          }
        } else {
          // Check if this row is part of a merged range
          const merged = mergeMap.get(row);
          if (merged) {
            const cell = worksheet.getCell(merged.row, merged.col);
            const value = cell.value;
            if (value !== null && value !== undefined && String(value).trim() !== '') {
              const num = this.parseNumericValue(value);
              if (num !== null) return num;
            }
          }

          // Also check individual cells in the target columns
          for (const ci of colIndices) {
            const cell = worksheet.getCell(row, ci);
            const value = cell.value;
            if (value !== null && value !== undefined && String(value).trim() !== '') {
              const num = this.parseNumericValue(value);
              if (num !== null) return num;
            }
          }
        }
      }

      console.warn(`[Reconciliation] No values found in columns ${columns}`);
      return null;
    } catch (error) {
      console.warn(`[Reconciliation] Error reading Excel: ${error}`);
      return null;
    }
  }

  /**
   * Get the value of a receipt document (سند قبض).
   * Searches columns K-O for the label, returns value in column G.
   * Mirrors get_valueOf_receipt_document() from Python.
   */
  async getReceiptDocumentValue(
    filePath: string | null,
    label: string = 'سند قبض'
  ): Promise<number | null> {
    if (!filePath || !fs.existsSync(filePath)) {
      console.warn(`[Reconciliation] File not found: ${filePath}`);
      return null;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      const worksheet = workbook.getWorksheet(1);
      if (!worksheet) return null;

      // Search columns K (11) to O (15) for the label
      for (let row = 1; row <= worksheet.rowCount; row++) {
        for (let col = 11; col <= 15; col++) {
          const cell = worksheet.getCell(row, col);
          const cellValue = String(cell.value || '').trim();
          if (cellValue === label) {
            // Get value from column G (7)
            const valueCell = worksheet.getCell(row, 7);
            return this.parseNumericValue(valueCell.value);
          }
        }
      }

      console.warn(`[Reconciliation] Receipt document label "${label}" not found`);
      return null;
    } catch (error) {
      console.warn(`[Reconciliation] Error reading receipt value: ${error}`);
      return null;
    }
  }

  /**
   * Parse a cell value to a number, handling various formats.
   */
  private parseNumericValue(value: ExcelJS.CellValue): number | null {
    if (value === null || value === undefined) return null;

    if (typeof value === 'number') return value;

    if (typeof value === 'string') {
      // Remove commas, currency symbols, etc.
      const cleaned = value.replace(/[,،\s\u00A0AEDد.إدرهم]/g, '').trim();
      const num = parseFloat(cleaned);
      return isNaN(num) ? null : num;
    }

    if (typeof value === 'object' && value !== null) {
      // RichText or formula result
      const str = String((value as any).text || (value as any).result || value);
      return this.parseNumericValue(str);
    }

    return null;
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // COMPARISON
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Compare two values. Mode 0 = subtract, Mode 1 = add.
   * Mirrors compare_values() from Python.
   */
  compareValues(
    label1: string,
    value1: number | null,
    label2: string,
    value2: number | null,
    mode: 0 | 1 = 0
  ): ComparisonResult | null {
    if (value1 === null || value2 === null) {
      console.warn(`[Reconciliation] Cannot compare: ${label1}=${value1}, ${label2}=${value2}`);
      return null;
    }

    const difference = mode === 0
      ? value1 - value2
      : value1 + value2;

    const description = mode === 0
      ? `Difference between ${label1} and ${label2}: ${difference.toFixed(4)}`
      : `Sum of ${label1} and ${label2}: ${difference.toFixed(4)}`;

    console.log(`[Reconciliation] ${description}`);

    const result: ComparisonResult = {
      label1,
      value1,
      label2,
      value2,
      difference,
      mode,
      description,
    };

    this.comparisons.push(result);
    return result;
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // SUMMARY SAVE
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Save a label-value pair to the internal entries list.
   * File paths are automatically truncated to basenames.
   */
  saveEntry(label: string, value: number | string | null, fileSource?: string): void {
    if (value === null || value === undefined) return;

    let valueToWrite: string | number = value;

    // If it's a file path, save just the basename
    if (typeof value === 'string' && fs.existsSync(value) && fs.statSync(value).isFile()) {
      valueToWrite = path.basename(value);
    }

    this.entries.push({ label, value: valueToWrite, fileSource });
    console.log(`[Reconciliation] Saved: ${label} = ${valueToWrite}`);
  }

  /**
   * Write all entries and comparisons to the summary Excel file.
   * Mirrors SaveToExcel() behavior from Python.
   */
  async writeSummaryExcel(filename: string = 'output.xlsx'): Promise<string> {
    const fullPath = path.join(this.folderPath, filename);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');

    // Style for headers
    const headerFill: ExcelJS.Fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    const headerFont: Partial<ExcelJS.Font> = { bold: true, color: { argb: 'FFFFFFFF' } };
    const headerAlignment: Partial<ExcelJS.Alignment> = { horizontal: 'center', vertical: 'middle' };

    // ── Section 1: Entries ─────────────────────────────────────────────────────
    worksheet.getCell('A1').value = 'Label';
    worksheet.getCell('B1').value = 'Value';
    worksheet.getCell('A1').fill = headerFill;
    worksheet.getCell('B1').fill = headerFill;
    worksheet.getCell('A1').font = headerFont;
    worksheet.getCell('B1').font = headerFont;
    worksheet.getCell('A1').alignment = headerAlignment;
    worksheet.getCell('B1').alignment = headerAlignment;

    const thinBorder: Partial<ExcelJS.Borders> = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    let row = 2;
    for (const entry of this.entries) {
      worksheet.getCell(`A${row}`).value = entry.label;
      worksheet.getCell(`B${row}`).value = entry.value;
      worksheet.getCell(`A${row}`).border = thinBorder;
      worksheet.getCell(`B${row}`).border = thinBorder;
      worksheet.getCell(`A${row}`).alignment = { wrapText: true, vertical: 'middle' };
      worksheet.getCell(`B${row}`).alignment = { vertical: 'middle' };
      row++;
    }

    // ── Section 2: Comparisons ─────────────────────────────────────────────────
    row += 2; // Blank row separator
    worksheet.getCell(`A${row}`).value = 'Comparison';
    worksheet.getCell(`B${row}`).value = 'Value 1';
    worksheet.getCell(`C${row}`).value = 'Value 2';
    worksheet.getCell(`D${row}`).value = 'Difference';
    for (const col of ['A', 'B', 'C', 'D']) {
      const cell = worksheet.getCell(`${col}${row}`);
      cell.fill = headerFill;
      cell.font = headerFont;
      cell.alignment = headerAlignment;
    }
    row++;

    for (const cmp of this.comparisons) {
      worksheet.getCell(`A${row}`).value = cmp.description;
      worksheet.getCell(`B${row}`).value = cmp.value1;
      worksheet.getCell(`C${row}`).value = cmp.value2;
      worksheet.getCell(`D${row}`).value = cmp.difference;
      for (const col of ['A', 'B', 'C', 'D']) {
        worksheet.getCell(`${col}${row}`).border = thinBorder;
      }
      row++;
    }

    // ── Auto-fit columns ───────────────────────────────────────────────────────
    worksheet.columns?.forEach((col) => {
      if (col && col.values) {
        let maxLen = 12;
        for (const val of col.values) {
          const len = String(val ?? '').length;
          if (len > maxLen) maxLen = len;
        }
        col.width = Math.min(80, maxLen + 4);
      }
    });

    await workbook.xlsx.writeFile(fullPath);
    console.log(`[Reconciliation] Summary saved to: ${fullPath}`);
    return fullPath;
  }

  /**
   * Run all cross-report reconciliation checks.
   * This mirrors the "Getting Values From Excel Files" and "Calculations" sections.
   */
  async runFullReconciliation(): Promise<ReconciliationReport> {
    // This will be called by the implementation layer with all extracted values.
    // The implementation class will populate and call compare/save methods.

    const summaryPath = await this.writeSummaryExcel();

    return {
      folderPath: this.folderPath,
      timestamp: new Date(),
      entries: this.entries,
      comparisons: this.comparisons,
      summaryFilePath: summaryPath,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // HELPERS (exposed for use by implementation)
  // ═══════════════════════════════════════════════════════════════════════════════

  getEntries(): ReconciliationEntry[] { return this.entries; }
  getComparisons(): ComparisonResult[] { return this.comparisons; }
  getFolderPath(): string { return this.folderPath; }
}
