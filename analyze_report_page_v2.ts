import { chromium, BrowserContext } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const storageState = JSON.parse(fs.readFileSync('storageState.stage.json', 'utf-8'));

async function analyzeReportPage() {
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

    // Set extra headers to mimic a real browser
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });

    console.log('=== Starting Page Analysis ===\n');
    
    try {
      console.log('📱 Navigating to report page...');
      const response = await page.goto(
        'https://staging.tahseel.gov.ae/ManagePortal/report-show/115f9d66-7ccb-4d1b-be96-2e499583af0c',
        { waitUntil: 'domcontentloaded', timeout: 60000 }
      );
      
      console.log(`Response status: ${response?.status()}`);
      console.log(`Current URL: ${page.url()}\n`);

      // If redirected to login, try to get the dashboard first
      if (page.url().includes('/auth/login')) {
        console.log('⚠️  Redirected to login. Attempting to navigate to dashboard first...');
        
        // Try dashboard
        await page.goto('https://staging.tahseel.gov.ae/ManagePortal/', { 
          waitUntil: 'domcontentloaded', 
          timeout: 30000 
        }).catch(() => {
          console.log('Dashboard navigation failed');
        });

        await page.waitForTimeout(3000);
        console.log(`Dashboard URL: ${page.url()}\n`);

        // Then try report again
        if (!page.url().includes('/auth/login')) {
          console.log('Retrying report page...');
          await page.goto(
            'https://staging.tahseel.gov.ae/ManagePortal/report-show/115f9d66-7ccb-4d1b-be96-2e499583af0c',
            { waitUntil: 'domcontentloaded', timeout: 30000 }
          ).catch(() => {
            console.log('Report retry failed');
          });
        }
      }

      // Wait a bit for content to render
      await page.waitForTimeout(3000);

      console.log(`Final URL: ${page.url()}`);
      console.log(`Title: ${await page.title()}\n`);

      // Get the full page HTML for analysis
      const html = await page.content();

      // Create comprehensive analysis
      const analysis: any = {
        timestamp: new Date().toISOString(),
        url: page.url(),
        title: await page.title(),
        pageStructure: {
          headings: [],
          buttons: [],
          inputs: [],
          tables: [],
          dropdowns: [],
          datePickers: [],
          selects: [],
          links: [],
          divs_with_class: [],
          spans_with_data_attributes: []
        },
        reportSpecificElements: {
          filterSections: [],
          tableHeaders: [],
          toolbarElements: [],
          paginationElements: [],
          exportButtons: [],
          notificationElements: [],
          emptyStateElements: [],
          customComponents: []
        },
        fullHTML: html.substring(0, 50000) // First 50KB of HTML
      };

      // Extract all headings
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      for (const h of headings) {
        const text = await h.textContent();
        const tag = await h.evaluate(el => el.tagName);
        analysis.pageStructure.headings.push({
          tag,
          text: text?.trim(),
          class: await h.getAttribute('class'),
          id: await h.getAttribute('id')
        });
      }
      console.log(`✓ Found ${headings.length} headings`);

      // Extract all buttons
      const buttons = await page.locator('button').all();
      for (let i = 0; i < Math.min(buttons.length, 30); i++) {
        const btn = buttons[i];
        const text = await btn.textContent();
        const visible = await btn.isVisible().catch(() => false);
        if (text?.trim()) {
          analysis.pageStructure.buttons.push({
            text: text.trim().substring(0, 100),
            visible,
            class: await btn.getAttribute('class'),
            id: await btn.getAttribute('id'),
            ariaLabel: await btn.getAttribute('aria-label'),
            title: await btn.getAttribute('title'),
            selector: await btn.evaluate((el) => {
              if (el.id) return `#${el.id}`;
              const cls = el.className.split(' ')[0];
              return cls ? `.${cls}` : 'button';
            })
          });
        }
      }
      console.log(`✓ Found ${Math.min(buttons.length, 30)} buttons`);

      // Extract all inputs
      const inputs = await page.locator('input').all();
      for (let i = 0; i < Math.min(inputs.length, 30); i++) {
        const inp = inputs[i];
        const type = await inp.getAttribute('type');
        const visible = await inp.isVisible().catch(() => false);
        if (visible) {
          analysis.pageStructure.inputs.push({
            type,
            placeholder: await inp.getAttribute('placeholder'),
            name: await inp.getAttribute('name'),
            id: await inp.getAttribute('id'),
            class: await inp.getAttribute('class'),
            ariaLabel: await inp.getAttribute('aria-label'),
            selector: await inp.evaluate((el: any) => {
              if (el.id) return `#${el.id}`;
              if (el.name) return `input[name="${el.name}"]`;
              const cls = el.className.split(' ')[0];
              return cls ? `input.${cls}` : 'input';
            })
          });
        }
      }
      console.log(`✓ Found ${Math.min(inputs.length, 30)} input elements`);

      // Extract selects
      const selects = await page.locator('select').all();
      for (let i = 0; i < Math.min(selects.length, 20); i++) {
        const sel = selects[i];
        const visible = await sel.isVisible().catch(() => false);
        if (visible) {
          const options = await sel.locator('option').count();
          analysis.pageStructure.selects.push({
            name: await sel.getAttribute('name'),
            id: await sel.getAttribute('id'),
            class: await sel.getAttribute('class'),
            optionCount: options,
            ariaLabel: await sel.getAttribute('aria-label'),
            selector: await sel.evaluate((el: any) => {
              if (el.id) return `#${el.id}`;
              if (el.name) return `select[name="${el.name}"]`;
              const cls = el.className.split(' ')[0];
              return cls ? `select.${cls}` : 'select';
            })
          });
        }
      }
      console.log(`✓ Found ${selects.length} select elements`);

      // Extract tables
      const tables = await page.locator('table, [role="table"]').all();
      for (let i = 0; i < Math.min(tables.length, 10); i++) {
        const table = tables[i];
        const visible = await table.isVisible().catch(() => false);
        if (visible) {
          const headers = await table.locator('th, [role="columnheader"]').count();
          const rows = await table.locator('tbody tr, [role="row"]').count();
          analysis.pageStructure.tables.push({
            index: i,
            headerCount: headers,
            rowCount: rows,
            class: await table.getAttribute('class'),
            id: await table.getAttribute('id'),
            selector: await table.evaluate((el) => {
              if (el.id) return `#${el.id}`;
              const cls = el.className.split(' ')[0];
              return cls ? `.${cls}` : 'table';
            })
          });
        }
      }
      console.log(`✓ Found ${tables.length} tables`);

      // Extract all links
      const links = await page.locator('a').all();
      for (let i = 0; i < Math.min(links.length, 20); i++) {
        const link = links[i];
        const text = await link.textContent();
        const visible = await link.isVisible().catch(() => false);
        if (visible && text?.trim()) {
          analysis.pageStructure.links.push({
            text: text.trim().substring(0, 100),
            href: await link.getAttribute('href'),
            class: await link.getAttribute('class'),
            id: await link.getAttribute('id'),
            ariaLabel: await link.getAttribute('aria-label')
          });
        }
      }
      console.log(`✓ Found ${Math.min(links.length, 20)} links\n`);

      // Find report-specific elements
      console.log('🔍 Analyzing report-specific elements...\n');

      // Filters
      const filterElements = await page.locator('[class*="filter"], [id*="filter"], [data-testid*="filter"]').all();
      for (const el of filterElements.slice(0, 20)) {
        const visible = await el.isVisible().catch(() => false);
        const text = await el.textContent();
        if (visible && text?.trim()) {
          analysis.reportSpecificElements.filterSections.push({
            text: text.trim().substring(0, 150),
            class: await el.getAttribute('class'),
            id: await el.getAttribute('id'),
            role: await el.getAttribute('role'),
            dataTestId: await el.getAttribute('data-testid')
          });
        }
      }
      console.log(`✓ Found ${filterElements.length} filter elements`);

      // Toolbar elements
      const toolbars = await page.locator('[class*="toolbar"], [role="toolbar"], [class*="header"]').all();
      for (let i = 0; i < Math.min(toolbars.length, 10); i++) {
        const toolbar = toolbars[i];
        const visible = await toolbar.isVisible().catch(() => false);
        if (visible) {
          const buttons = await toolbar.locator('button').count();
          const text = await toolbar.textContent();
          analysis.reportSpecificElements.toolbarElements.push({
            index: i,
            buttonCount: buttons,
            text: text?.trim().substring(0, 150),
            class: await toolbar.getAttribute('class'),
            id: await toolbar.getAttribute('id'),
            selector: await toolbar.evaluate((el) => {
              if (el.id) return `#${el.id}`;
              const cls = el.className.split(' ')[0];
              return cls ? `.${cls}` : 'div';
            })
          });
        }
      }
      console.log(`✓ Found ${toolbars.length} toolbar elements`);

      // Pagination
      const pagination = await page.locator('[class*="paginat"], [role="navigation"], nav').all();
      for (const pag of pagination.slice(0, 10)) {
        const visible = await pag.isVisible().catch(() => false);
        if (visible) {
          const text = await pag.textContent();
          if (text && (text.includes('page') || text.includes('next') || text.includes('prev') || text.match(/\d+/))) {
            analysis.reportSpecificElements.paginationElements.push({
              text: text.trim().substring(0, 150),
              class: await pag.getAttribute('class'),
              id: await pag.getAttribute('id'),
              role: await pag.getAttribute('role')
            });
          }
        }
      }
      console.log(`✓ Found ${pagination.length} pagination elements`);

      // Export/Print buttons
      const exportButtons = await page.locator(
        'button:has-text("export"), button:has-text("download"), button:has-text("print"), [class*="export"], [class*="download"]'
      ).all();
      for (const btn of exportButtons) {
        const visible = await btn.isVisible().catch(() => false);
        if (visible) {
          analysis.reportSpecificElements.exportButtons.push({
            text: await btn.textContent(),
            class: await btn.getAttribute('class'),
            id: await btn.getAttribute('id'),
            title: await btn.getAttribute('title'),
            ariaLabel: await btn.getAttribute('aria-label')
          });
        }
      }
      console.log(`✓ Found ${exportButtons.length} export/print buttons`);

      // Notifications/Alerts
      const notifications = await page.locator('[role="alert"], [class*="toast"], [class*="notification"]').all();
      for (const notif of notifications.slice(0, 10)) {
        const visible = await notif.isVisible().catch(() => false);
        if (visible) {
          const text = await notif.textContent();
          if (text?.trim()) {
            analysis.reportSpecificElements.notificationElements.push({
              text: text.trim().substring(0, 200),
              class: await notif.getAttribute('class'),
              id: await notif.getAttribute('id'),
              role: await notif.getAttribute('role')
            });
          }
        }
      }
      console.log(`✓ Found ${notifications.length} notification elements`);

      // Empty states
      const emptyStates = await page.locator('[class*="empty"], [class*="no-data"], [class*="no-result"]').all();
      for (const empty of emptyStates.slice(0, 10)) {
        const visible = await empty.isVisible().catch(() => false);
        if (visible) {
          const text = await empty.textContent();
          if (text?.trim()) {
            analysis.reportSpecificElements.emptyStateElements.push({
              text: text.trim().substring(0, 200),
              class: await empty.getAttribute('class'),
              id: await empty.getAttribute('id')
            });
          }
        }
      }
      console.log(`✓ Found ${emptyStates.length} empty state elements`);

      // Save analysis
      const outputPath = path.join(process.cwd(), 'report_page_analysis.json');
      fs.writeFileSync(outputPath, JSON.stringify(analysis, null, 2));
      console.log(`\n💾 Analysis saved to: ${outputPath}`);

      // Print summary
      console.log('\n=== ANALYSIS SUMMARY ===');
      console.log(`Page Title: ${analysis.title}`);
      console.log(`Page URL: ${analysis.url}`);
      console.log(`Headings: ${analysis.pageStructure.headings.length}`);
      console.log(`Buttons: ${analysis.pageStructure.buttons.length}`);
      console.log(`Input Fields: ${analysis.pageStructure.inputs.length}`);
      console.log(`Select Elements: ${analysis.pageStructure.selects.length}`);
      console.log(`Tables: ${analysis.pageStructure.tables.length}`);
      console.log(`Links: ${analysis.pageStructure.links.length}`);
      console.log(`Filter Elements: ${analysis.reportSpecificElements.filterSections.length}`);
      console.log(`Toolbar Elements: ${analysis.reportSpecificElements.toolbarElements.length}`);
      console.log(`Pagination Elements: ${analysis.reportSpecificElements.paginationElements.length}`);
      console.log(`Export/Print Buttons: ${analysis.reportSpecificElements.exportButtons.length}`);
      console.log(`Notifications: ${analysis.reportSpecificElements.notificationElements.length}`);
      console.log(`Empty States: ${analysis.reportSpecificElements.emptyStateElements.length}`);

      return analysis;

    } catch (error) {
      console.error('Navigation/analysis error:', error);
      // Save the HTML anyway for debugging
      const html = await page.content();
      const debugPath = path.join(process.cwd(), 'report_page_debug.html');
      fs.writeFileSync(debugPath, html);
      console.log(`Debug HTML saved to: ${debugPath}`);
      throw error;
    } finally {
      await context.close();
    }

  } finally {
    await browser.close();
  }
}

analyzeReportPage().catch(err => {
  console.error('\n❌ Analysis failed:', err);
  process.exit(1);
});
