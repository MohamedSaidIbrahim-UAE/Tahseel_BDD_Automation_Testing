/**
 * Data Generators Utility
 * Provides test data generation for all 209 modules
 * Factory patterns for creating consistent, valid test data
 */

export class DataGenerators {
  private static seed = Date.now();

  /**
   * Generate random ID
   */
  static generateId(prefix = ''): string {
    const random = Math.floor(Math.random() * 1000000);
    return `${prefix}${random}_${Date.now()}`;
  }

  /**
   * Generate random email
   */
  static generateEmail(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `test.user.${timestamp}.${random}@example.com`;
  }

  /**
   * Generate random phone number
   */
  static generatePhoneNumber(format = 'UAE'): string {
    if (format === 'UAE') {
      const number = Math.floor(Math.random() * 9000000000) + 1000000000;
      return `+971${number.toString().slice(0, 9)}`;
    }
    
    const number = Math.floor(Math.random() * 9000000000) + 1000000000;
    return number.toString();
  }

  /**
   * Generate random date
   */
  static generateDate(
    daysFromNow = 0,
    format: 'ISO' | 'DD/MM/YYYY' | 'MM/DD/YYYY' = 'ISO'
  ): string {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);

    if (format === 'ISO') {
      return date.toISOString().split('T')[0];
    } else if (format === 'DD/MM/YYYY') {
      return date.toLocaleDateString('en-GB');
    } else {
      return date.toLocaleDateString('en-US');
    }
  }

  /**
   * Generate date range
   */
  static generateDateRange(
    startDaysFromNow = 0,
    endDaysFromNow = 30,
    format: 'ISO' | 'DD/MM/YYYY' | 'MM/DD/YYYY' = 'ISO'
  ): { startDate: string; endDate: string } {
    return {
      startDate: this.generateDate(startDaysFromNow, format),
      endDate: this.generateDate(endDaysFromNow, format)
    };
  }

  /**
   * Generate random name
   */
  static generateName(type: 'first' | 'last' | 'full' = 'full'): string {
    const firstNames = [
      'Ahmed', 'Mohammed', 'Fatima', 'Sara', 'Ali', 'Aisha', 'Hassan', 'Layla',
      'Omar', 'Noor', 'Karim', 'Zainab', 'Ibrahim', 'Hana', 'Tariq', 'Mariam'
    ];

    const lastNames = [
      'Al-Maktoum', 'Al-Nahyan', 'Al-Mansouri', 'Al-Mazrouei', 'Al-Hajri',
      'Al-Kaabi', 'Al-Khlifah', 'Al-Memari', 'Al-Suwaidi', 'Al-Neyadi',
      'Johnson', 'Smith', 'Williams', 'Brown', 'Jones'
    ];

    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    
    if (type === 'first') {
      return first;
    }

    const last = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    if (type === 'last') {
      return last;
    }

    return `${first} ${last}`;
  }

  /**
   * Generate random company name
   */
  static generateCompanyName(): string {
    const prefixes = ['Global', 'International', 'Premium', 'Advanced', 'Smart'];
    const suffixes = ['Solutions', 'Systems', 'Services', 'Technologies', 'Corporation'];
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    return `${prefix} ${suffix}`;
  }

  /**
   * Generate random amount
   */
  static generateAmount(min = 100, max = 10000, decimals = 2): number {
    const amount = Math.random() * (max - min) + min;
    return Number(amount.toFixed(decimals));
  }

  /**
   * Generate random percentage
   */
  static generatePercentage(decimals = 2): number {
    const percent = Math.random() * 100;
    return Number(percent.toFixed(decimals));
  }

  /**
   * Generate random IBAN (UAE format)
   */
  static generateIBAN(): string {
    const bankCode = '00' + Math.floor(Math.random() * 99).toString().padStart(2, '0');
    const accountNumber = Math.floor(Math.random() * 999999999999).toString().padStart(21, '0');
    return `AE${bankCode}${accountNumber}`;
  }

  /**
   * Generate random credit card number (test format)
   */
  static generateCreditCardNumber(): string {
    const bin = '411111'; // Visa test BIN
    const random = Math.floor(Math.random() * 9999999999).toString().padStart(10, '0');
    return `${bin}${random}`;
  }

  /**
   * Generate random reference number
   */
  static generateReferenceNumber(prefix = 'REF'): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${timestamp.slice(-6)}-${random}`;
  }

  /**
   * Generate random transaction ID
   */
  static generateTransactionId(): string {
    return this.generateReferenceNumber('TXN');
  }

  /**
   * Generate random receipt number
   */
  static generateReceiptNumber(): string {
    return this.generateReferenceNumber('RCP');
  }

  /**
   * Generate random order number
   */
  static generateOrderNumber(): string {
    return this.generateReferenceNumber('ORD');
  }

  /**
   * Generate random invoice number
   */
  static generateInvoiceNumber(): string {
    return this.generateReferenceNumber('INV');
  }

  /**
   * Generate random VAT/Tax number (UAE format)
   */
  static generateVATNumber(): string {
    const number = Math.floor(Math.random() * 999999999999).toString().padStart(15, '0');
    return `AE${number}`;
  }

  /**
   * Generate random account number
   */
  static generateAccountNumber(): string {
    return Math.floor(Math.random() * 9999999999).toString().padStart(10, '0');
  }

  /**
   * Generate random address
   */
  static generateAddress(): string {
    const streets = [
      'Sheikh Zayed Road',
      'Al Khaleej Al Arabi Street',
      'Shiekh Khalifa Bin Zayed Street',
      'Al Fahidi Street',
      'Al Manara Road'
    ];

    const areas = [
      'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah'
    ];

    const street = streets[Math.floor(Math.random() * streets.length)];
    const area = areas[Math.floor(Math.random() * areas.length)];
    const building = Math.floor(Math.random() * 1000) + 1;

    return `Building ${building}, ${street}, ${area}, UAE`;
  }

  /**
   * Generate random URL
   */
  static generateUrl(domain = 'example.com'): string {
    const path = this.generateId('path');
    return `https://${domain}/${path}`;
  }

  /**
   * Generate random username
   */
  static generateUsername(): string {
    const prefix = 'user';
    const random = Math.floor(Math.random() * 10000);
    return `${prefix}${random}`;
  }

  /**
   * Generate random password
   */
  static generatePassword(length = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    let password = '';

    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return password;
  }

  /**
   * Generate random status
   */
  static generateStatus(
    statuses = ['Active', 'Inactive', 'Pending', 'Completed', 'Cancelled']
  ): string {
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  /**
   * Generate random file name
   */
  static generateFileName(extension = 'pdf'): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `document_${timestamp}_${random}.${extension}`;
  }

  /**
   * Generate test user object
   */
  static generateUser() {
    return {
      email: this.generateEmail(),
      firstName: this.generateName('first'),
      lastName: this.generateName('last'),
      phoneNumber: this.generatePhoneNumber(),
      username: this.generateUsername(),
      password: this.generatePassword(),
      status: this.generateStatus(['Active', 'Inactive']),
      isActive: Math.random() > 0.5
    };
  }

  /**
   * Generate test transaction object
   */
  static generateTransaction() {
    return {
      transactionId: this.generateTransactionId(),
      referenceNumber: this.generateReferenceNumber(),
      amount: this.generateAmount(),
      date: this.generateDate(),
      status: this.generateStatus(),
      description: `Test Transaction ${this.generateId()}`,
      paymentMethod: ['Credit Card', 'Debit Card', 'Bank Transfer', 'Cheque'][
        Math.floor(Math.random() * 4)
      ]
    };
  }

  /**
   * Generate test report object
   */
  static generateReport() {
    return {
      reportId: this.generateId('RPT'),
      reportName: `Report ${this.generateId()}`,
      generatedDate: this.generateDate(),
      startDate: this.generateDate(-30),
      endDate: this.generateDate(),
      status: this.generateStatus(),
      recordsCount: Math.floor(Math.random() * 10000),
      totalAmount: this.generateAmount(1000, 1000000)
    };
  }

  /**
   * Generate test entity object
   */
  static generateEntity() {
    return {
      id: this.generateId(),
      name: this.generateCompanyName(),
      description: `Entity Description ${this.generateId()}`,
      status: this.generateStatus(),
      createdDate: this.generateDate(-90),
      modifiedDate: this.generateDate(),
      isActive: Math.random() > 0.5
    };
  }

  /**
   * Generate random enum value
   */
  static generateEnumValue<T>(enumValues: T[]): T {
    return enumValues[Math.floor(Math.random() * enumValues.length)];
  }

  /**
   * Generate random array of items
   */
  static generateArray<T>(generator: () => T, count = 5): T[] {
    return Array.from({ length: count }, () => generator());
  }

  /**
   * Generate realistic test data set
   */
  static generateTestDataSet() {
    return {
      user: this.generateUser(),
      transaction: this.generateTransaction(),
      report: this.generateReport(),
      entity: this.generateEntity(),
      currentDate: this.generateDate(),
      dateRange: this.generateDateRange()
    };
  }
}
