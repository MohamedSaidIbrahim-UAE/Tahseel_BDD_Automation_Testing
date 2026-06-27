/**
 * Data Factory Fixtures - Generate test data for modules
 * 
 * Provides factory methods to create valid, invalid, and boundary test data
 * for different module types.
 */

/**
 * Generic form data structure
 */
export interface FormData {
  [key: string]: string | number | boolean | Date;
}

/**
 * Transaction data for financial reports
 */
export interface TransactionData {
  id: string;
  amount: number;
  entity: string;
  service: string;
  date: Date;
  status: 'pending' | 'completed' | 'failed';
}

/**
 * Report filter data
 */
export interface ReportFilterData {
  fromDate: Date;
  toDate: Date;
  entity?: string;
  service?: string;
  status?: string;
}

/**
 * Data factory for creating test data
 */
export class DataFactory {
  /**
   * Create valid form data for a module
   */
  static createValidFormData(moduleName: string): FormData {
    switch (moduleName.toLowerCase()) {
      case 'user-management':
        return {
          username: `user_${this.generateId()}`,
          email: this.generateEmail(),
          firstName: 'Test',
          lastName: 'User',
          role: 'User',
          isActive: true,
        };

      case 'department-management':
        return {
          name: `Department_${this.generateId()}`,
          code: `DEPT_${this.generateId(6)}`,
          description: 'Test Department',
          isActive: true,
        };

      case 'service-management':
        return {
          name: `Service_${this.generateId()}`,
          code: `SVC_${this.generateId(6)}`,
          amount: 100,
          isActive: true,
        };

      default:
        return {
          name: `Record_${this.generateId()}`,
          description: 'Test Record',
          isActive: true,
        };
    }
  }

  /**
   * Create invalid form data for validation testing
   */
  static createInvalidFormData(moduleName: string): FormData {
    switch (moduleName.toLowerCase()) {
      case 'user-management':
        return {
          username: '', // Empty required field
          email: 'invalid-email', // Invalid email format
          firstName: '',
          lastName: '',
          role: '',
        };

      case 'department-management':
        return {
          name: '', // Empty
          code: '', // Empty
          description: '',
        };

      case 'service-management':
        return {
          name: '',
          code: '',
          amount: -100, // Negative amount
        };

      default:
        return {
          name: '',
          description: '',
        };
    }
  }

  /**
   * Create boundary value data for edge case testing
   */
  static createBoundaryFormData(moduleName: string): FormData {
    switch (moduleName.toLowerCase()) {
      case 'user-management':
        return {
          username: 'a', // Minimum length
          email: 'user@example.com',
          firstName: 'x'.repeat(255), // Maximum length
          lastName: 'y'.repeat(255),
          role: 'User',
        };

      case 'service-management':
        return {
          name: 'x'.repeat(255),
          code: 'ABC123',
          amount: 0, // Boundary: zero
        };

      default:
        return {
          name: 'x'.repeat(255),
          description: 'y'.repeat(1000),
        };
    }
  }

  /**
   * Create transaction data for financial reports
   */
  static createTransactionData(
    count: number = 1,
    options?: Partial<TransactionData>
  ): TransactionData[] {
    const transactions: TransactionData[] = [];

    for (let i = 0; i < count; i++) {
      transactions.push({
        id: `TXN_${this.generateId()}`,
        amount: Math.floor(Math.random() * 10000) + 100,
        entity: options?.entity || ['Entity A', 'Entity B', 'Entity C'][i % 3],
        service: options?.service || ['Service 1', 'Service 2', 'Service 3'][i % 3],
        date: options?.date || this.addDays(new Date(), -i),
        status: 'completed',
      });
    }

    return transactions;
  }

  /**
   * Create report filter data
   */
  static createReportFilterData(options?: Partial<ReportFilterData>): ReportFilterData {
    const today = new Date();
    const thirtyDaysAgo = this.addDays(today, -30);

    return {
      fromDate: options?.fromDate || thirtyDaysAgo,
      toDate: options?.toDate || today,
      entity: options?.entity || 'All',
      service: options?.service || 'All',
      status: options?.status || 'All',
    };
  }

  /**
   * Generate unique ID
   */
  static generateId(length: number = 8): string {
    return Math.random().toString(36).substring(2, length + 2);
  }

  /**
   * Generate email
   */
  static generateEmail(): string {
    return `test_${this.generateId()}@example.com`;
  }

  /**
   * Generate phone number
   */
  static generatePhoneNumber(): string {
    const prefix = '971'; // UAE
    const number = Math.floor(Math.random() * 1000000000);
    return `+${prefix}${number.toString().padStart(9, '0')}`;
  }

  /**
   * Generate date string in YYYY-MM-DD format
   */
  static generateDateString(daysOffset: number = 0): string {
    const date = this.addDays(new Date(), daysOffset);
    return date.toISOString().split('T')[0];
  }

  /**
   * Add days to date
   */
  private static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Create split rule data for revenue reports
   */
  static createSplitRuleData(entityA: string, entityB: string, percentA: number): object {
    return {
      entityA,
      entityB,
      percentageA: percentA,
      percentageB: 100 - percentA,
      effectiveDate: this.generateDateString(),
    };
  }

  /**
   * Create data table for Gherkin scenarios
   */
  static createDataTableForGherkin(data: FormData[]): string {
    if (data.length === 0) {
      return '';
    }

    const headers = Object.keys(data[0]);
    let table = '| ' + headers.join(' | ') + ' |\n';

    for (const row of data) {
      const values = headers.map((header) => String(row[header]));
      table += '| ' + values.join(' | ') + ' |\n';
    }

    return table;
  }
}

/**
 * Scenario fixtures for common test patterns
 */
export class ScenarioFixtures {
  /**
   * Setup for "create entity" scenario
   */
  static createEntityScenarioData(moduleName: string): object {
    return {
      formData: DataFactory.createValidFormData(moduleName),
      expectedMessage: 'Record created successfully',
      verifyFields: Object.keys(DataFactory.createValidFormData(moduleName)),
    };
  }

  /**
   * Setup for "edit entity" scenario
   */
  static editEntityScenarioData(moduleName: string): object {
    return {
      originalData: DataFactory.createValidFormData(moduleName),
      updatedData: DataFactory.createValidFormData(moduleName),
      expectedMessage: 'Record updated successfully',
    };
  }

  /**
   * Setup for "delete entity" scenario
   */
  static deleteEntityScenarioData(): object {
    return {
      confirmMessage: 'Are you sure you want to delete this record?',
      expectedMessage: 'Record deleted successfully',
    };
  }

  /**
   * Setup for "search" scenario
   */
  static searchScenarioData(searchTerm: string): object {
    return {
      searchTerm,
      expectedMinResults: 1,
      expectedMaxResults: 100,
    };
  }

  /**
   * Setup for "export" scenario
   */
  static exportScenarioData(format: string = 'Excel'): object {
    return {
      format,
      expectedExtension: format === 'Excel' ? 'xlsx' : 'pdf',
      expectedMinSize: 1024, // At least 1KB
    };
  }

  /**
   * Setup for "report" scenario
   */
  static reportScenarioData(reportType: string): object {
    return {
      reportType,
      filterData: DataFactory.createReportFilterData(),
      expectedMinRows: 1,
      expectedColumns: ['Date', 'Amount', 'Entity', 'Status'],
    };
  }
}

/**
 * Bulk data generator for performance testing
 */
export class BulkDataGenerator {
  /**
   * Generate large dataset for table pagination testing
   */
  static generateBulkRecords(moduleName: string, count: number): FormData[] {
    const records: FormData[] = [];

    for (let i = 0; i < count; i++) {
      records.push({
        ...DataFactory.createValidFormData(moduleName),
        id: i + 1,
        createdDate: DataFactory.generateDateString(-i),
      });
    }

    return records;
  }

  /**
   * Generate transactions for bulk import testing
   */
  static generateBulkTransactions(count: number): TransactionData[] {
    return DataFactory.createTransactionData(count);
  }

  /**
   * Generate report data spanning multiple pages
   */
  static generateBulkReportData(
    pageSize: number,
    pageCount: number
  ): { [key: string]: any }[] {
    const data: { [key: string]: any }[] = [];

    for (let p = 0; p < pageCount; p++) {
      for (let i = 0; i < pageSize; i++) {
        data.push({
          id: p * pageSize + i + 1,
          date: DataFactory.generateDateString(-(p * pageSize + i)),
          amount: Math.floor(Math.random() * 10000),
          entity: `Entity ${(i % 3) + 1}`,
          status: 'Completed',
        });
      }
    }

    return data;
  }
}
