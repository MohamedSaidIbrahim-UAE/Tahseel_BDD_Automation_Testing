# Report Export & Excel Integration Guide

## Quick Start

### 1. Import Required Utilities
```typescript
import { RevenueReportsPage } from './src/pages/reports/revenue-reports.page';
import { ReportExportUtility } from './src/utils/report-export.utility';
import { ExcelManagerUtility } from './src/utils/excel-manager.utility';
import { ReportFilterUtility } from './src/utils/report-filter.utility';
```

### 2. Initialize in Step Definition
```typescript
Given('I have initialized the report export utilities', async function (this: World) {
  if (!this.page) throw new Error('Page not initialized');
  
  const reportPage = new RevenueReportsPage(this.page);
  const downloadPath = path.join(process.cwd(), 'test-downloads');
  
  reportPage.initializeExportUtility(downloadPath);
  this.reportPage = reportPage; // Store for later use
});
```

### 3. Use in Test Scenarios
```typescript
When('I apply date filters and export the report', async function (this: World) {
  const reportPage = this.reportPage as RevenueReportsPage;
  
  // Navigate to report
  await reportPage.navigateToTotalTransactionsReport();
  
  // Apply filters
  await reportPage.setDateRange('01/06/2026', '30/06/2026');
  await reportPage.setPaymentStatusToPaid();
  
  // Submit and export
  await reportPage.submitReport();
  const filePath = await reportPage.exportToExcel('MyReport');
  
  this.exportedFilePath = filePath;
});

Then('the exported file contains data', async function (this: World) {
  const reportPage = this.reportPage as RevenueReportsPage;
  const filePath = this.exportedFilePath;
  
  if (!filePath) throw new Error('No file exported');
  
  // Read Excel data
  await reportPage.openExportedExcelFile(filePath);
  const data = await reportPage.readExcelData();
  
  expect(data.length).toBeGreaterThan(0);
  this.addLog(`✅ Verified ${data.length} rows of data`);
});
```

---

## 🎯 Utility Reference

### ReportExportUtility

**Purpose:** Handle file downloads and export operations

**Key Methods:**

```typescript
// Initialize with page context
const exportUtility = new ReportExportUtility(
  page,
  browser,
  context,
  downloadPath
);

// Export to Excel
const result = await exportUtility.exportReportToExcel(
  exportButtonSelector,
  { timeout: 60000, maxRetries: 3 }
);

// Export with custom filename
const result = await exportUtility.exportReportToExcelWithName(
  exportButtonSelector,
  'CustomName',
  { timeout: 60000 }
);

// Export to PDF
await exportUtility.clickExportButton(exportButtonSelector, 'pdf');

// Wait for download
const filePath = await exportUtility.waitForDownloadComplete(
  60000,
  'xlsx'
);

// Verify file
const verified = await exportUtility.verifyFileDownloaded(
  'ExpectedFileName.xlsx',
  30000
);

// List files in download folder
const files = await exportUtility.listDownloadedFiles();

// Get most recent file
const latest = await exportUtility.getMostRecentFile();

// Clear download folder
await exportUtility.clearDownloadFolder();
```

**Options:**
```typescript
interface ExportOptions {
  timeout?: number;           // Overall timeout (default: 60000)
  maxRetries?: number;        // Retry attempts (default: 3)
  downloadTimeout?: number;   // Download wait timeout (default: 60000)
  format?: 'excel' | 'pdf';   // Export format
}
```

---

### ExcelManagerUtility

**Purpose:** Read, write, and manipulate Excel files

**Key Methods:**

```typescript
const excelUtility = new ExcelManagerUtility();

// Load existing file
await excelUtility.loadExcelFile('/path/to/file.xlsx');

// Create new workbook
excelUtility.createNewExcelFile();

// Add data
excelUtility.addHeaderRow(['Name', 'Value']);
excelUtility.addRow(['Item', 'Data']);

// Read data
const value = excelUtility.getCellValue(1, 'A'); // Row 1, Column A
const lastValue = excelUtility.getLastValueInColumn('B');

// Find data
const result = excelUtility.findCellByValue('SearchTerm');
const patternResult = excelUtility.findCellByPattern(/total.*/i);

// Get all data
const allRows = excelUtility.getAllRowsAsObjects();
const rowObject = excelUtility.getRowAsObject(5);

// Append data
await excelUtility.appendLabelValue(
  'Label',
  'Value',
  '/path/to/folder',
  'results.xlsx'
);

// Auto-fit columns
excelUtility.autoFitColumns();

// Save
await excelUtility.saveExcelFile('/path/to/file.xlsx');
```

---

### ReportFilterUtility

**Purpose:** Interact with report filter controls

**Key Methods:**

```typescript
const filterUtility = new ReportFilterUtility(page);

// Set dates
await filterUtility.setFromDate(selector, '01/06/2026');
await filterUtility.setToDate(selector, '30/06/2026');

// Select from dropdown
await filterUtility.selectSecondOptionFromDropdown(
  dropdownSelector,
  'مدفوعة'
);

// Select radio button
await filterUtility.selectRadioButtonOption('معاملات ايراد');

// Select from tag box (multi-select)
await filterUtility.selectFromTagBox(
  tagBoxSelector,
  ['Option1', 'Option2', 'Option3']
);

// Set text input
await filterUtility.setTextInput(selector, 'SearchTerm');

// Click buttons
await filterUtility.clickSearchButton(submitButtonSelector);
await filterUtility.clickConfirmButton(okButtonSelector);

// Format dates
const arabicDate = filterUtility.formatDateToArabic(new Date());

// Parse dates
const date = filterUtility.parseDateString('01/06/2026');

// Get filter values
const values = await filterUtility.getFilterValues(fromSelector, toSelector);
```

---

### RevenueReportsPage

**Purpose:** High-level report operations

**Key Methods:**

```typescript
const reportPage = new RevenueReportsPage(page);
reportPage.initializeExportUtility(downloadPath);

// Navigate to reports
await reportPage.navigateToTotalTransactionsReport();
await reportPage.navigateToTransactionFeeReport();
await reportPage.navigateToCreditCardReport();
await reportPage.navigateToTaxReport();

// Set filters
await reportPage.setPaymentStatusToPaid();
await reportPage.setTransactionTypeToRevenue();
await reportPage.setTransactionTypeToDeposit();
await reportPage.setDateRange('01/06/2026', '30/06/2026');
await reportPage.selectPaymentMethods(['بطاقة ائتمان', 'جهاز الدفع البنكي']);

// Execute report
await reportPage.submitReport();

// Export
const excelFile = await reportPage.exportToExcel('MyReport');
const pdfFile = await reportPage.exportToPdf('MyPDF');

// Verify
const verified = await reportPage.verifyExportedFile('MyReport.xlsx');
const files = await reportPage.listExportedFiles();

// Read Excel
await reportPage.openExportedExcelFile(excelFile);
const data = await reportPage.readExcelData();
const value = await reportPage.getExcelCellValue(1, 'A');

// Append results
await reportPage.appendToResultsExcel('Label', 'Value', folderPath);

// Cleanup
await reportPage.clearExportedFiles();
```

---

## 📋 Common Scenarios

### Scenario 1: Export Report with Custom Name
```typescript
When('I export the report as {string}', async function (this: World, fileName: string) {
  const reportPage = this.reportPage as RevenueReportsPage;
  
  const filePath = await reportPage.exportToExcel(fileName);
  
  expect(filePath).toBeTruthy();
  this.exportedFilePath = filePath;
  this.addLog(`✅ Exported: ${fileName}`);
});
```

### Scenario 2: Verify Export Data
```typescript
Then('the exported file has {int} rows of data', async function (this: World, expectedRows: number) {
  const reportPage = this.reportPage as RevenueReportsPage;
  const filePath = this.exportedFilePath;
  
  await reportPage.openExportedExcelFile(filePath);
  const data = await reportPage.readExcelData();
  
  expect(data.length).toBe(expectedRows);
  this.addLog(`✅ Verified ${data.length} rows`);
});
```

### Scenario 3: Append Summary to Results
```typescript
Then('I record the summary in results file', async function (this: World) {
  const reportPage = this.reportPage as RevenueReportsPage;
  const data = await reportPage.readExcelData();
  
  const totalAmount = data.reduce((sum, row) => sum + (row['Amount'] || 0), 0);
  
  await reportPage.appendToResultsExcel(
    'Total Transactions',
    data.length,
    process.cwd()
  );
  
  await reportPage.appendToResultsExcel(
    'Total Amount',
    totalAmount,
    process.cwd()
  );
  
  this.addLog(`✅ Summary recorded: ${data.length} rows, ${totalAmount} AED`);
});
```

### Scenario 4: Compare Multiple Reports
```typescript
When('I compare {string} and {string}', async function (this: World, report1: string, report2: string) {
  const reportPage = this.reportPage as RevenueReportsPage;
  
  // Export first report
  await reportPage.navigateToTotalTransactionsReport();
  await reportPage.setDateRange('01/06/2026', '30/06/2026');
  await reportPage.submitReport();
  const file1 = await reportPage.exportToExcel(report1);
  
  // Export second report
  await reportPage.navigateToTransactionFeeReport();
  await reportPage.setDateRange('01/06/2026', '30/06/2026');
  await reportPage.submitReport();
  const file2 = await reportPage.exportToExcel(report2);
  
  // Compare data
  await reportPage.openExportedExcelFile(file1);
  const data1 = await reportPage.readExcelData();
  
  await reportPage.openExportedExcelFile(file2);
  const data2 = await reportPage.readExcelData();
  
  const count1 = data1.length;
  const count2 = data2.length;
  
  this.addLog(`📊 ${report1}: ${count1} rows`);
  this.addLog(`📊 ${report2}: ${count2} rows`);
  this.addLog(`📊 Difference: ${Math.abs(count1 - count2)} rows`);
});
```

---

## 🔧 Advanced Usage

### Custom Export Path
```typescript
const customPath = path.join(process.env.DOWNLOAD_PATH || '.', 'exports');
reportPage.initializeExportUtility(customPath);
```

### Retry with Custom Options
```typescript
const result = await exportUtility.exportReportToExcel(
  exportButtonSelector,
  {
    timeout: 120000,        // 2 minutes
    maxRetries: 5,          // 5 retry attempts
    downloadTimeout: 90000  // 1.5 minutes per attempt
  }
);
```

### Extract Specific Data
```typescript
await reportPage.openExportedExcelFile(filePath);
const rows = await reportPage.readExcelData();

// Process rows
const totals = rows.reduce((acc, row) => {
  const key = row['Entity'];
  acc[key] = (acc[key] || 0) + parseFloat(row['Amount']);
  return acc;
}, {});

console.log(totals);
```

### Batch Export Multiple Reports
```typescript
const reports = [
  { name: 'Total Transactions', nav: () => reportPage.navigateToTotalTransactionsReport() },
  { name: 'Transaction Fees', nav: () => reportPage.navigateToTransactionFeeReport() },
  { name: 'Credit Cards', nav: () => reportPage.navigateToCreditCardReport() }
];

for (const report of reports) {
  await report.nav();
  await reportPage.setDateRange('01/06/2026', '30/06/2026');
  await reportPage.submitReport();
  const file = await reportPage.exportToExcel(report.name);
  console.log(`✅ Exported: ${file}`);
}
```

---

## 🚨 Error Handling

### Handle Export Failure
```typescript
When('I attempt to export the report', async function (this: World) {
  const reportPage = this.reportPage as RevenueReportsPage;
  
  try {
    const filePath = await reportPage.exportToExcel('Report');
    
    if (!filePath) {
      throw new Error('Export returned null');
    }
    
    this.exportedFilePath = filePath;
  } catch (error) {
    console.error('❌ Export failed:', error);
    this.addLog(`❌ Export failed: ${error.message}`);
    throw error;
  }
});
```

### Validate File Integrity
```typescript
Then('the exported file is valid', async function (this: World) {
  const reportPage = this.reportPage as RevenueReportsPage;
  const filePath = this.exportedFilePath;
  
  try {
    await reportPage.openExportedExcelFile(filePath);
    const data = await reportPage.readExcelData();
    
    if (!data || data.length === 0) {
      throw new Error('No data found in Excel file');
    }
    
    this.addLog(`✅ File valid with ${data.length} rows`);
  } catch (error) {
    console.error('❌ File validation failed:', error);
    throw error;
  }
});
```

---

## 📊 Performance Tips

1. **Parallel Exports:** Export multiple reports simultaneously
2. **Batch Operations:** Group related operations
3. **Selective Reading:** Only read needed columns/rows
4. **File Cleanup:** Regularly clear old downloads
5. **Timeout Tuning:** Adjust timeouts based on network speed

---

## ✅ Testing Checklist

- [ ] Export utilities initialize correctly
- [ ] Files download to correct location
- [ ] Excel files read/write correctly
- [ ] Filters apply as expected
- [ ] Date formatting works in Arabic
- [ ] Dropdown/radio/tag box interactions work
- [ ] Error handling works properly
- [ ] File cleanup executes
- [ ] Multiple concurrent exports work
- [ ] Framework integration is seamless

---

## 🎓 Best Practices

1. **Always Initialize:** Call `initializeExportUtility()` before exporting
2. **Verify Before Using:** Check file exists before reading
3. **Handle Errors:** Wrap export/read operations in try-catch
4. **Log Operations:** Use `this.addLog()` for debugging
5. **Clean Up:** Call `clearExportedFiles()` after tests
6. **Type Safety:** Use TypeScript types for parameters
7. **Reuse Objects:** Create utilities once, reuse throughout test

---

## 📞 Support

For issues or questions:
1. Check PYTHON_TO_TYPESCRIPT_MIGRATION.md for migration details
2. Review utility JSDoc comments in source files
3. See example usage in this guide
4. Check framework documentation

---

**Version:** 1.0.0  
**Last Updated:** June 22, 2026  
**Status:** ✅ Production Ready
