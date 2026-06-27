import { chromium, BrowserContext } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const storageState = JSON.parse(fs.readFileSync('storageState.stage.json', 'utf-8'));

async function extractReportControls() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--ignore-certificate-errors']
  });

  try {
    const context: BrowserContext = await browser.newContext({ 
      storageState: storageState as any,
      ignoreHTTPSErrors: true,
      viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();

    console.log('📱 Navigating to Total Transactions Report...\n');
    
    await page.goto(
      'https://staging.tahseel.gov.ae/ManagePortal/report-show/115f9d66-7ccb-4d1b-be96-2e499583af0c',
      { waitUntil: 'domcontentloaded', timeout: 60000 }
    );

    // If redirected to dashboard, navigate to report again
    if (page.url().includes('/auth/login')) {
      await page.goto('https://staging.tahseel.gov.ae/ManagePortal/', { 
        waitUntil: 'domcontentloaded', timeout: 30000 
      }).catch(() => {});

      await page.waitForTimeout(2000);

      if (!page.url().includes('/auth/login')) {
        await page.goto(
          'https://staging.tahseel.gov.ae/ManagePortal/report-show/115f9d66-7ccb-4d1b-be96-2e499583af0c',
          { waitUntil: 'domcontentloaded', timeout: 30000 }
        ).catch(() => {});
      }
    }

    await page.waitForTimeout(3000);

    const controls: any = {
      timestamp: new Date().toISOString(),
      url: page.url(),
      pageTitle: await page.title(),
      reportTitle: await page.locator('h3.kt-subheader__title').textContent().catch(() => null),
      filters: {},
      tableInfo: {},
      buttons: {},
      inputs: {},
      selectElements: {},
      otherControls: {}
    };

    console.log('=== PAGE STRUCTURE ===\n');
    console.log(`URL: ${controls.url}`);
    console.log(`Title: ${controls.pageTitle}`);
    console.log(`Report Title: ${controls.reportTitle}\n`);

    // ========== FILTERS ==========
    console.log('🔍 ANALYZING FILTERS...\n');

    // Look for dx-date-box (DevExpress date picker)
    const dateBoxes = await page.locator('[class*="dx-date"], .dx-datebox, [class*="date-picker"]').all();
    console.log(`Found ${dateBoxes.length} date picker elements\n`);

    for (let i = 0; i < dateBoxes.length; i++) {
      const box = dateBoxes[i];
      const visible = await box.isVisible().catch(() => false);
      if (visible) {
        const label = await page.locator(`label[for="${await box.getAttribute('id')}"]`).textContent().catch(() => null);
        const value = await box.locator('input').inputValue().catch(() => null);
        const id = await box.getAttribute('id');
        
        controls.filters[`dateFilter_${i}`] = {
          id,
          label: label?.trim(),
          currentValue: value,
          selector: `[id="${id}"]`,
          type: 'date-picker'
        };
        
        console.log(`  Date Filter ${i}:`);
        console.log(`    ID: ${id}`);
        console.log(`    Label: ${label?.trim()}`);
        console.log(`    Selector: [id="${id}"]`);
        console.log(`    Current Value: ${value}\n`);
      }
    }

    // Look for text inputs/textboxes (filter inputs)
    const filterInputs = await page.locator('[class*="dx-textbox"], .dx-texteditor-input').all();
    console.log(`Found ${filterInputs.length} text input filter elements\n`);

    for (let i = 0; i < Math.min(filterInputs.length, 5); i++) {
      const inp = filterInputs[i];
      const visible = await inp.isVisible().catch(() => false);
      if (visible) {
        const id = await inp.getAttribute('id');
        const placeholder = await inp.getAttribute('placeholder');
        const parent = await inp.locator('xpath=./ancestor::*[1]').getAttribute('class');
        
        controls.filters[`textFilter_${i}`] = {
          id,
          placeholder,
          parentClass: parent,
          selector: `[class*="dx-textbox"]:nth-of-type(${i + 1})`
        };
        
        console.log(`  Text Filter ${i}:`);
        console.log(`    ID: ${id}`);
        console.log(`    Placeholder: ${placeholder}`);
        console.log(`    Parent Class: ${parent}\n`);
      }
    }

    // Look for dropdowns/selects
    const selects = await page.locator('select, [class*="dx-select"], [role="combobox"]').all();
    console.log(`Found ${selects.length} select/dropdown elements\n`);

    for (let i = 0; i < selects.length; i++) {
      const sel = selects[i];
      const visible = await sel.isVisible().catch(() => false);
      if (visible) {
        const id = await sel.getAttribute('id');
        const name = await sel.getAttribute('name');
        const options = await sel.locator('option').count().catch(() => 0);
        
        controls.selectElements[`select_${i}`] = {
          id,
          name,
          optionCount: options,
          selector: id ? `#${id}` : name ? `select[name="${name}"]` : `select:nth-of-type(${i + 1})`
        };
        
        console.log(`  Select ${i}:`);
        console.log(`    ID: ${id}`);
        console.log(`    Name: ${name}`);
        console.log(`    Options: ${options}\n`);
      }
    }

    // ========== BUTTONS ==========
    console.log('\n🔘 ANALYZING BUTTONS...\n');

    const buttons = await page.locator('button').all();
    console.log(`Found ${buttons.length} button elements\n`);

    const buttonsByFunction: any = {
      show: [],
      archive: [],
      export: [],
      print: [],
      refresh: [],
      other: []
    };

    for (const btn of buttons) {
      const text = await btn.textContent().catch(() => '');
      const visible = await btn.isVisible().catch(() => false);
      const id = await btn.getAttribute('id');
      const title = await btn.getAttribute('title');
      const ariaLabel = await btn.getAttribute('aria-label');
      const cls = await btn.getAttribute('class');

      if (visible && text?.trim()) {
        const selector = await btn.evaluate((el: any) => {
          if (el.id) return `#${el.id}`;
          if (el.className.includes('btn-primary')) return `.btn.btn-primary:contains("${el.textContent.trim().substring(0, 20)}")`;
          return 'button';
        });

        const buttonInfo = {
          text: text.trim(),
          id,
          title,
          ariaLabel,
          class: cls,
          selector
        };

        if (text.includes('عرض') || text.includes('show')) {
          buttonsByFunction.show.push(buttonInfo);
        } else if (text.includes('أرشيف') || text.includes('archive')) {
          buttonsByFunction.archive.push(buttonInfo);
        } else if (text.includes('تصدير') || text.includes('export')) {
          buttonsByFunction.export.push(buttonInfo);
        } else if (text.includes('طباعة') || text.includes('print')) {
          buttonsByFunction.print.push(buttonInfo);
        } else if (text.includes('تحديث') || text.includes('refresh')) {
          buttonsByFunction.refresh.push(buttonInfo);
        } else {
          buttonsByFunction.other.push(buttonInfo);
        }
      }
    }

    Object.entries(buttonsByFunction).forEach(([fn, btnList]: [string, any]) => {
      if (btnList.length > 0) {
        console.log(`  ${fn.toUpperCase()} Buttons (${btnList.length}):`);
        btnList.forEach((btn: any, idx: number) => {
          console.log(`    ${idx + 1}. "${btn.text}"`);
          console.log(`       Selector: ${btn.selector}`);
          if (btn.id) console.log(`       ID: ${btn.id}`);
          console.log();
        });
      }
    });

    controls.buttons = buttonsByFunction;

    // ========== TABLE ANALYSIS ==========
    console.log('\n📊 ANALYZING TABLE/GRID...\n');

    const tables = await page.locator('table, [role="table"], [role="grid"], [class*="dx-datagrid"]').all();
    console.log(`Found ${tables.length} table/grid elements\n`);

    if (tables.length > 0) {
      const mainTable = tables[0];
      const headers = await mainTable.locator('th, [role="columnheader"], .dx-column-header').all();
      const rows = await mainTable.locator('tbody tr, [role="row"], .dx-row').all();

      console.log(`  Table Structure:`);
      console.log(`    Columns: ${headers.length}`);
      console.log(`    Data Rows: ${rows.length}\n`);

      controls.tableInfo = {
        columnCount: headers.length,
        rowCount: rows.length,
        headers: [],
        firstRowCells: 0
      };

      console.log(`  Column Headers:`);
      for (let i = 0; i < headers.length; i++) {
        const text = await headers[i].textContent();
        controls.tableInfo.headers.push({
          index: i,
          text: text?.trim(),
          selector: `th:nth-child(${i + 1})`
        });
        console.log(`    ${i + 1}. ${text?.trim()}`);
      }

      if (rows.length > 0) {
        const cells = await rows[0].locator('td, [role="gridcell"]').all();
        controls.tableInfo.firstRowCells = cells.length;
        console.log(`\n  First Data Row: ${cells.length} cells`);
      }
    }

    // ========== OTHER CONTROLS ==========
    console.log('\n\n🎛️  OTHER CONTROLS...\n');

    // Pagination
    const pagination = await page.locator('[class*="pagination"], [class*="pager"], [role="navigation"]').count();
    controls.otherControls.paginationElements = pagination;
    console.log(`  Pagination Elements: ${pagination}`);

    // Export options
    const exportBtns = await page.locator('[class*="export"], [class*="download"]').count();
    controls.otherControls.exportButtons = exportBtns;
    console.log(`  Export/Download Elements: ${exportBtns}`);

    // Notifications
    const notifications = await page.locator('[role="alert"], [class*="notification"]').count();
    controls.otherControls.notificationElements = notifications;
    console.log(`  Notification Elements: ${notifications}`);

    // Save results
    const outputPath = path.join(process.cwd(), 'report_controls_extracted.json');
    fs.writeFileSync(outputPath, JSON.stringify(controls, null, 2));
    console.log(`\n\n💾 Complete analysis saved to: ${outputPath}`);

    return controls;

  } finally {
    await browser.close();
  }
}

extractReportControls().catch(err => {
  console.error('\n❌ Extraction failed:', err);
  process.exit(1);
});
