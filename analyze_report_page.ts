import { chromium, BrowserContext, Page } from 'playwright';
import * as fs from 'fs';

const storageState = JSON.parse(fs.readFileSync('storageState.stage.json', 'utf-8'));

async function analyzeReportPage() {
  const browser = await chromium.launch({ headless: true });
  const context: BrowserContext = await browser.newContext({ storageState: storageState as any });
  const page = await context.newPage();

  try {
    console.log('Navigating to Total Transactions Report page...');
    const response = await page.goto('https://staging.tahseel.gov.ae/ManagePortal/report-show/115f9d66-7ccb-4d1b-be96-2e499583af0c', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    
    console.log(`Navigation response status: ${response?.status()}`);
    console.log(`Current URL: ${page.url()}`);

    // Wait for the actual report content to load
    console.log('Waiting for report content to load...');
    
    // Try to wait for common report elements
    try {
      await page.waitForSelector('[class*="report"], [class*="dashboard"], [role="main"], main', { 
        timeout: 15000 
      }).catch(() => {
        console.log('Main content not found with selectors, continuing...');
      });
    } catch (e) {
      console.log('Timeout waiting for main content');
    }
    
    await page.waitForTimeout(3000);
    
    console.log(`Final URL after load: ${page.url()}`);

    // Analysis Object
    const analysis: any = {
      url: page.url(),
      title: await page.title(),
      filters: {},
      tableStructure: {},
      pagination: {},
      exportButtons: [],
      toolbarButtons: [],
      notificationAreas: [],
      emptyStateMessages: [],
      specialControls: [],
      fullDOM: ''
    };

    // 1. Find all filter controls
    console.log('\n=== Analyzing Filters ===');
    
    // Date pickers
    const datePickers = await page.locator('input[type="date"], input[placeholder*="date" i], .date-picker, [class*="date"]').all();
    console.log(`Found ${datePickers.length} date-related elements`);
    
    for (let i = 0; i < datePickers.length; i++) {
      const element = datePickers[i];
      try {
        const selector = await element.evaluate((el: any) => {
          if (el.id) return `#${el.id}`;
          if (el.name) return `input[name="${el.name}"]`;
          return el.className ? `.${el.className.split(' ').join('.')}` : null;
        });
        const placeholder = await element.getAttribute('placeholder');
        const value = await element.inputValue().catch(() => null);
        analysis.filters[`datePicker_${i}`] = {
          selector,
          placeholder,
          currentValue: value,
          type: 'date'
        };
      } catch (e) {
        console.log(`Could not analyze datePicker ${i}`);
      }
    }

    // Dropdowns
    const dropdowns = await page.locator('select, [role="combobox"], [role="listbox"], .dropdown, [class*="select"]').all();
    console.log(`Found ${dropdowns.length} dropdown elements`);
    
    for (let i = 0; i < Math.min(dropdowns.length, 10); i++) {
      const element = dropdowns[i];
      try {
        const selector = await element.evaluate((el: any) => {
          if (el.id) return `#${el.id}`;
          if (el.name) return `select[name="${el.name}"]`;
          return el.className ? `[class*="${el.className.split(' ')[0]}"]` : null;
        });
        const text = await element.textContent().catch(() => '');
        analysis.filters[`dropdown_${i}`] = {
          selector,
          text: text?.substring(0, 100),
          role: await element.getAttribute('role'),
          type: 'dropdown'
        };
      } catch (e) {
        console.log(`Could not analyze dropdown ${i}`);
      }
    }

    // Text inputs
    const textInputs = await page.locator('input[type="text"], input:not([type]), input[type="search"]').all();
    console.log(`Found ${textInputs.length} text input elements`);
    
    for (let i = 0; i < Math.min(textInputs.length, 5); i++) {
      const element = textInputs[i];
      try {
        const selector = await element.evaluate((el: any) => {
          if (el.id) return `#${el.id}`;
          if (el.name) return `input[name="${el.name}"]`;
          return el.placeholder || el.className;
        });
        const placeholder = await element.getAttribute('placeholder');
        analysis.filters[`textInput_${i}`] = {
          selector,
          placeholder,
          type: 'text'
        };
      } catch (e) {
        console.log(`Could not analyze textInput ${i}`);
      }
    }

    // Filter buttons
    const filterButtons = await page.locator('button:has-text("filter"), button[class*="filter"], [data-testid*="filter"]').all();
    console.log(`Found ${filterButtons.length} filter buttons`);

    // 2. Analyze table structure
    console.log('\n=== Analyzing Table Structure ===');
    
    const tables = await page.locator('table, [role="table"], [role="grid"]').all();
    console.log(`Found ${tables.length} table elements`);

    if (tables.length > 0) {
      const mainTable = tables[0];
      const headerCells = await mainTable.locator('th, [role="columnheader"]').all();
      const rows = await mainTable.locator('tbody tr, [role="row"]').all();

      console.log(`Table has ${headerCells.length} columns and ${rows.length} data rows`);

      analysis.tableStructure = {
        columns: [],
        columnCount: headerCells.length,
        rowCount: rows.length,
        selector: await mainTable.evaluate((el: any) => {
          if (el.id) return `#${el.id}`;
          if (el.className) return `.${el.className.split(' ').join('.')}`;
          return 'table';
        })
      };

      // Get column headers
      for (let i = 0; i < headerCells.length; i++) {
        const text = await headerCells[i].textContent();
        analysis.tableStructure.columns.push({
          index: i,
          text: text?.trim(),
          selector: `th:nth-child(${i + 1}), [role="columnheader"]:nth-child(${i + 1})`
        });
      }

      // Sample first row
      if (rows.length > 0) {
        const firstRow = rows[0];
        const cells = await firstRow.locator('td, [role="gridcell"]').all();
        analysis.tableStructure.firstRowCells = cells.length;
      }
    }

    // 3. Find pagination controls
    console.log('\n=== Analyzing Pagination ===');
    
    const paginationContainer = await page.locator('[class*="pagination"], [class*="pager"], nav[aria-label*="pagina"]').first();
    if (await paginationContainer.isVisible().catch(() => false)) {
      analysis.pagination.selector = await paginationContainer.evaluate((el: any) => {
        if (el.id) return `#${el.id}`;
        if (el.className) return `.${el.className.split(' ').join('.')}`;
        return 'pagination-container';
      });

      // Page size options
      const pageSizeSelects = await page.locator('select[name*="size"], select[name*="rows"], [class*="page-size"]').all();
      console.log(`Found ${pageSizeSelects.length} page size controls`);
      
      // Navigation buttons
      const navButtons = await paginationContainer.locator('button, a').all();
      analysis.pagination.buttons = [];
      for (const btn of navButtons) {
        const text = await btn.textContent();
        const ariaLabel = await btn.getAttribute('aria-label');
        analysis.pagination.buttons.push({
          text: text?.trim(),
          ariaLabel
        });
      }
    }

    // 4. Find export/print buttons
    console.log('\n=== Analyzing Export/Print Buttons ===');
    
    const exportButtons = await page.locator('button:has-text("export"), button:has-text("download"), button:has-text("print"), [class*="export"], [class*="download"]').all();
    console.log(`Found ${exportButtons.length} export/print buttons`);
    
    for (let i = 0; i < exportButtons.length; i++) {
      const btn = exportButtons[i];
      try {
        const text = await btn.textContent();
        const selector = await btn.evaluate((el: any) => {
          if (el.id) return `#${el.id}`;
          if (el.className) return `.${el.className.split(' ')[0]}`;
          return 'button';
        });
        analysis.exportButtons.push({
          text: text?.trim(),
          selector,
          title: await btn.getAttribute('title'),
          ariaLabel: await btn.getAttribute('aria-label')
        });
      } catch (e) {
        console.log(`Could not analyze export button ${i}`);
      }
    }

    // 5. Find toolbar buttons
    console.log('\n=== Analyzing Toolbar Buttons ===');
    
    const toolbars = await page.locator('[class*="toolbar"], [role="toolbar"], [class*="action-bar"]').all();
    console.log(`Found ${toolbars.length} toolbar elements`);
    
    for (let t = 0; t < Math.min(toolbars.length, 3); t++) {
      const toolbar = toolbars[t];
      const buttons = await toolbar.locator('button').all();
      for (let i = 0; i < buttons.length; i++) {
        const btn = buttons[i];
        try {
          const text = await btn.textContent();
          analysis.toolbarButtons.push({
            text: text?.trim(),
            title: await btn.getAttribute('title'),
            ariaLabel: await btn.getAttribute('aria-label'),
            class: await btn.getAttribute('class')
          });
        } catch (e) {
          console.log(`Could not analyze toolbar button ${i}`);
        }
      }
    }

    // 6. Find notification/toast areas
    console.log('\n=== Analyzing Notifications ===');
    
    const notifications = await page.locator('[role="alert"], [class*="toast"], [class*="notification"], [class*="message"]').all();
    console.log(`Found ${notifications.length} notification elements`);
    
    for (let i = 0; i < Math.min(notifications.length, 5); i++) {
      const notif = notifications[i];
      try {
        const text = await notif.textContent();
        if (text && text.trim().length > 0) {
          analysis.notificationAreas.push({
            text: text.trim().substring(0, 100),
            role: await notif.getAttribute('role'),
            selector: await notif.evaluate((el: any) => {
              if (el.id) return `#${el.id}`;
              if (el.className) return `.${el.className.split(' ')[0]}`;
              return el.tagName.toLowerCase();
            })
          });
        }
      } catch (e) {
        console.log(`Could not analyze notification ${i}`);
      }
    }

    // 7. Find empty state messages
    console.log('\n=== Analyzing Empty States ===');
    
    const emptyStates = await page.locator('[class*="empty"], [class*="no-data"], [class*="no-results"]').all();
    console.log(`Found ${emptyStates.length} potential empty state elements`);
    
    for (let i = 0; i < emptyStates.length; i++) {
      const empty = emptyStates[i];
      try {
        const text = await empty.textContent();
        const isVisible = await empty.isVisible().catch(() => false);
        if (isVisible && text && text.trim().length > 0) {
          analysis.emptyStateMessages.push({
            text: text.trim().substring(0, 100),
            selector: await empty.evaluate((el: any) => {
              if (el.id) return `#${el.id}`;
              if (el.className) return `.${el.className.split(' ').join('.')}`;
              return el.tagName.toLowerCase();
            })
          });
        }
      } catch (e) {
        console.log(`Could not analyze empty state ${i}`);
      }
    }

    // 8. Special report controls
    console.log('\n=== Analyzing Special Controls ===');
    
    const reportControls = await page.locator('[class*="report"], [data-testid*="report"], [class*="chart"], [class*="widget"]').all();
    console.log(`Found ${reportControls.length} report-specific elements`);

    // Get full page structure
    analysis.fullDOM = await page.content();

    // Output results
    console.log('\n=== ANALYSIS COMPLETE ===\n');
    
    const outputPath = 'report_analysis.json';
    fs.writeFileSync(outputPath, JSON.stringify(analysis, null, 2));
    console.log(`Full analysis saved to: ${outputPath}`);

    // Print summary
    console.log('\n=== SUMMARY ===');
    console.log(`URL: ${analysis.url}`);
    console.log(`Title: ${analysis.title}`);
    console.log(`Filter Controls: ${Object.keys(analysis.filters).length}`);
    console.log(`Table Columns: ${analysis.tableStructure.columnCount || 0}`);
    console.log(`Table Rows: ${analysis.tableStructure.rowCount || 0}`);
    console.log(`Export Buttons: ${analysis.exportButtons.length}`);
    console.log(`Toolbar Buttons: ${analysis.toolbarButtons.length}`);
    console.log(`Notifications Found: ${analysis.notificationAreas.length}`);
    console.log(`Empty States Found: ${analysis.emptyStateMessages.length}`);

    return analysis;

  } catch (error) {
    console.error('Error during page analysis:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

analyzeReportPage().catch(console.error);
