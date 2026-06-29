import * as path from 'path';
import * as fs from 'fs';

/**
 * ExcelReaderHelper - Utility class for reading and validating Excel files
 * Provides methods for loading reports and validating Excel structure
 */
export class ExcelReaderHelper {
  private downloadFolder: string;

  constructor() {
    this.downloadFolder = path.join(process.cwd(), 'downloads');
  }

  /**
   * Load all Excel report files from the downloads folder
   * Returns file list for validation
   */
  async loadAllReportFiles(): Promise<Record<string, string>> {
    const reportFiles: Record<string, string> = {};

    if (!fs.existsSync(this.downloadFolder)) {
      throw new Error(`Download folder not found: ${this.downloadFolder}`);
    }

    const files = fs.readdirSync(this.downloadFolder).filter(f => f.endsWith('.xlsx'));

    if (files.length === 0) {
      throw new Error(`No Excel files found in ${this.downloadFolder}`);
    }

    for (const file of files) {
      try {
        const filePath = path.join(this.downloadFolder, file);
        const reportName = file.replace('.xlsx', '');
        reportFiles[reportName] = filePath;
      } catch (error) {
        throw new Error(`Failed to load Excel file ${file}: ${(error as Error).message}`);
      }
    }

    return reportFiles;
  }

  /**
   * Validate Excel file exists
   */
  async validateExcelFile(filePath: string): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      if (!fs.existsSync(filePath)) {
        errors.push(`File does not exist: ${filePath}`);
      }

      const stats = fs.statSync(filePath);
      if (stats.size === 0) {
        errors.push(`File is empty: ${filePath}`);
      }

      if (!filePath.endsWith('.xlsx')) {
        errors.push(`File is not an Excel file: ${filePath}`);
      }

      return { valid: errors.length === 0, errors };
    } catch (error) {
      return { valid: false, errors: [`Failed to validate: ${(error as Error).message}`] };
    }
  }

  /**
   * Get list of all report files
   */
  async listReportFiles(): Promise<string[]> {
    if (!fs.existsSync(this.downloadFolder)) {
      return [];
    }

    return fs.readdirSync(this.downloadFolder)
      .filter(f => f.endsWith('.xlsx'))
      .map(f => path.join(this.downloadFolder, f));
  }

  /**
   * Check if report file exists
   */
  async reportFileExists(filename: string): Promise<boolean> {
    const filePath = path.join(this.downloadFolder, filename);
    return fs.existsSync(filePath);
  }

  /**
   * Get file size in bytes
   */
  async getFileSize(filename: string): Promise<number> {
    const filePath = path.join(this.downloadFolder, filename);
    if (!fs.existsSync(filePath)) {
      return 0;
    }
    return fs.statSync(filePath).size;
  }
}
