/**
 * Report Data Validation Utility
 * 
 * Provides validation helpers for report data accuracy, calculations, and format
 */

import { expect } from '@playwright/test';

export interface ReportRow {
  entity: string;
  count: number;
  amount: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class ReportValidator {
  /**
   * Validate amount format (must be number with max 2 decimal places)
   */
  static validateAmountFormat(amount: string): boolean {
    const amountRegex = /^\d+(\.\d{1,2})?$/;
    return amountRegex.test(amount.trim());
  }

  /**
   * Validate count format (must be non-negative integer)
   */
  static validateCountFormat(count: string): boolean {
    const countRegex = /^\d+$/;
    return countRegex.test(count.trim());
  }

  /**
   * Compare expected vs actual report data
   */
  static compareReportData(
    expected: ReportRow[],
    actual: ReportRow[],
    tolerance: number = 0.01
  ): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Check if same number of rows
    if (expected.length !== actual.length) {
      result.isValid = false;
      result.errors.push(
        `Row count mismatch: expected ${expected.length}, got ${actual.length}`
      );
    }

    // Validate each row
    for (const exp of expected) {
      const act = actual.find(a => a.entity === exp.entity);

      if (!act) {
        result.isValid = false;
        result.errors.push(`Entity ${exp.entity} not found in actual data`);
        continue;
      }

      // Check count
      if (act.count !== exp.count) {
        result.isValid = false;
        result.errors.push(
          `Count mismatch for ${exp.entity}: expected ${exp.count}, got ${act.count}`
        );
      }

      // Check amount with tolerance
      const amountDiff = Math.abs(act.amount - exp.amount);
      if (amountDiff > tolerance) {
        result.isValid = false;
        result.errors.push(
          `Amount mismatch for ${exp.entity}: expected ${exp.amount}, got ${act.amount} ` +
          `(difference: ${amountDiff})`
        );
      }
    }

    // Check for extra rows in actual data
    for (const act of actual) {
      if (!expected.find(e => e.entity === act.entity)) {
        result.warnings.push(`Unexpected entity in actual data: ${act.entity}`);
      }
    }

    return result;
  }

  /**
   * Validate grand total calculation
   */
  static validateGrandTotal(
    reportData: ReportRow[],
    expectedGrandTotal: number,
    tolerance: number = 0.01
  ): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    const calculatedTotal = reportData.reduce((sum, row) => sum + row.amount, 0);
    const difference = Math.abs(calculatedTotal - expectedGrandTotal);

    if (difference > tolerance) {
      result.isValid = false;
      result.errors.push(
        `Grand total mismatch: calculated ${calculatedTotal}, expected ${expectedGrandTotal} ` +
        `(difference: ${difference})`
      );
    }

    return result;
  }

  /**
   * Validate transaction count total
   */
  static validateTransactionCountTotal(
    reportData: ReportRow[],
    expectedTotal: number
  ): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    const calculatedTotal = reportData.reduce((sum, row) => sum + row.count, 0);

    if (calculatedTotal !== expectedTotal) {
      result.isValid = false;
      result.errors.push(
        `Transaction count total mismatch: calculated ${calculatedTotal}, expected ${expectedTotal}`
      );
    }

    return result;
  }

  /**
   * Validate entity appearance based on rules
   */
  static validateEntityAppearance(
    reportData: ReportRow[],
    entityName: string,
    shouldAppear: boolean,
    shouldHaveZeroData?: boolean
  ): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    const entity = reportData.find(r => r.entity === entityName);

    if (shouldAppear) {
      if (!entity) {
        result.isValid = false;
        result.errors.push(`Entity ${entityName} should appear but is missing`);
      } else if (shouldHaveZeroData && (entity.count !== 0 || entity.amount !== 0)) {
        result.isValid = false;
        result.errors.push(
          `Entity ${entityName} should have zero data but has: count=${entity.count}, amount=${entity.amount}`
        );
      }
    } else {
      if (entity) {
        result.isValid = false;
        result.errors.push(
          `Entity ${entityName} should not appear but found: count=${entity.count}, amount=${entity.amount}`
        );
      }
    }

    return result;
  }

  /**
   * Validate RBAC - only authorized entities visible
   */
  static validateRBACRestriction(
    reportData: ReportRow[],
    allowedEntities: string[]
  ): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    const actualEntities = reportData.map(r => r.entity);

    for (const entity of actualEntities) {
      if (!allowedEntities.includes(entity)) {
        result.isValid = false;
        result.errors.push(
          `Unauthorized entity in report: ${entity}. Allowed: ${allowedEntities.join(', ')}`
        );
      }
    }

    for (const allowed of allowedEntities) {
      if (!actualEntities.includes(allowed) && allowed !== 'Entity-C') {
        // Entity-C may have zero transactions and be omitted
        result.warnings.push(`Expected entity ${allowed} not found in report`);
      }
    }

    return result;
  }

  /**
   * Format validation error message for reporting
   */
  static formatValidationError(result: ValidationResult): string {
    if (result.isValid) {
      return 'Validation passed';
    }

    let message = 'Validation failed:\n';
    result.errors.forEach(err => {
      message += `  ❌ ${err}\n`;
    });
    result.warnings.forEach(warn => {
      message += `  ⚠️  ${warn}\n`;
    });

    return message;
  }

  /**
   * Throw error if validation fails
   */
  static assertValid(result: ValidationResult, context: string = ''): void {
    if (!result.isValid) {
      const ctxMsg = context ? ` [${context}]` : '';
      throw new Error(`${this.formatValidationError(result)}${ctxMsg}`);
    }
  }
}
