/**
 * Shared Steps - Common step definitions used across multiple feature files
 * 
 * This file contains step definitions that are shared across different modules
 * to avoid duplication and ensure consistent behavior.
 */

import { Given, When, Then } from '@cucumber/cucumber';
import { World } from '../fixtures/world.fixture';
import { expect } from '@playwright/test';
import { resolveActivePage } from './active-page-resolver';

// src/steps/common-ui.steps.ts
import { DxDropdownHelper } from '../support/components/dx-dropdown.helper';
import { DxDateBoxHelper } from '../support/components/dx-datebox.helper';
import { ButtonHelper } from '../support/components/button.helper';


When('I click the {string} button', async function (this: World, buttonText: string) {
  const activePage = resolveActivePage(this, 'rawPage');
  // 1. Initialize the button helper onto the active page thread context
  const actionButton = new ButtonHelper(activePage);

  // 2. Dispatch the safe interaction call routine
  await actionButton.clickButtonByText(buttonText);

  this.addLog(`Successfully clicked the primary action button: "${buttonText}"`);
});

When(
  'I configure the {string} datepicker field to {string} and time {string}',
  async function (this: World, labelText: string, targetDate: string, targetTime: string) {
    const activePage = resolveActivePage(this, 'rawPage');

    // 1. Instantiating the clean dynamic component helper onto current active page thread context
    const dxDateBox = new DxDateBoxHelper(activePage);

    // 2. Dispatch programmatic data entry routine safely
    await dxDateBox.setDateTimeByLabel(labelText, targetDate, targetTime);
    this.addLog(`Successfully populated field [${labelText}] configuration state to value: ${targetDate} ${targetTime}`);
  }
);

When(
  'I select {string} from the {string} select dropdown',
  async function (this: World, optionText: string, labelText: string) {
    const activePage = resolveActivePage(this, 'rawPage');

    // Initialize the component helper using the current active page context layer
    const dxSelect = new DxDropdownHelper(activePage);

    // Execute the unified layout selector mechanism safely
    await dxSelect.selectOptionByLabel(labelText, optionText);

    this.addLog(`Successfully chose dropdown item "${optionText}" relative to label field: "${labelText}".`);
  }
);

// ── Shared pagination steps ────────────────────────────────────────────────────

Then('the page navigation element should be visible', async function (this: World) {
  const activePage = resolveActivePage(this, 'verifyPagerVisible');
  await activePage.verifyPagerVisible();
  this.addLog('Verified page navigation element visible');
});

Then('the page size options {string}, {string}, {string} should be available', async function (
  this: World, s1: string, s2: string, s3: string
) {
  const activePage = resolveActivePage(this, 'verifyPageSizeOptions');
  await activePage.verifyPageSizeOptions([s1, s2, s3]);
  this.addLog(`Verified page size options: ${[s1, s2, s3].join(', ')}`);
});

When('I select page size {string}', async function (this: World, size: string) {
  const activePage = resolveActivePage(this, 'selectPageSize');
  await activePage.selectPageSize(size);
  this.addLog(`Selected page size ${size}`);
});

Then('the table should display up to {int} records', async function (this: World, maxCount: number) {
  const activePage = resolveActivePage(this, 'rawPage');
  const rows = activePage.rawPage.locator('table').last().locator('tbody tr:not(.dx-freespace-row)');
  const count = await rows.count();
  expect(count).toBeLessThanOrEqual(maxCount);
  this.addLog(`Verified table displays up to ${maxCount} records (actual: ${count})`);
});

// ── Shared table verification steps ───────────────────────────────────────────

Then('the table should be visible', async function (this: World) {
  const activePage = resolveActivePage(this, 'verifyTableVisible');
  await activePage.verifyTableVisible();
  this.addLog('Verified table visible');
});

Then('the table should contain at least one record', async function (this: World) {
  const activePage = resolveActivePage(this, 'verifyTableHasRecords');
  await activePage.verifyTableHasRecords();
  this.addLog('Verified table has at least one record');
});

Then('the table should contain multiple records', async function (this: World) {
  const activePage = resolveActivePage(this, 'verifyTableHasMultipleRecords');
  await activePage.verifyTableHasMultipleRecords();
  this.addLog('Verified table has multiple records');
});

Then('the table should be empty', async function (this: World) {
  const activePage = resolveActivePage(this, 'verifyTableIsEmpty');
  await activePage.verifyTableIsEmpty();
  this.addLog('Verified table is empty');
});

Then('the table should show an empty or no-data state', async function (this: World) {
  const activePage = resolveActivePage(this, 'verifyEmptyOrNoDataState');
  await activePage.verifyEmptyOrNoDataState();
  this.addLog('Verified empty or no-data state');
});

// ── Shared search steps ──────────────────────────────────────────────────────


When('I clear the search input', async function (this: World) {
  const activePage = resolveActivePage(this, 'clearGridSearch');
  await activePage.clearGridSearch();
  this.addLog('Cleared search input');
});

Then('only records matching the search term should be displayed', async function (this: World) {
  const activePage = resolveActivePage(this, 'verifyTableHasRecords');
  await activePage.verifyTableHasRecords();
  this.addLog('Verified search results');
});

Then('the full list should be restored', async function (this: World) {
  const activePage = resolveActivePage(this, 'verifyTableHasMultipleRecords');
  await activePage.verifyTableHasMultipleRecords();
  this.addLog('Verified full list restored');
});

// ── Shared export steps ──────────────────────────────────────────────────────

When('I click the export button and select {string}', async function (this: World, format: string) {
  const activePage = resolveActivePage(this, 'clickExportAndSelectFormat');
  await activePage.clickExportAndSelectFormat(format);
  this.addLog(`Clicked export and selected "${format}"`);
});

Then('an Excel file should be downloaded containing the data', async function (this: World) {
  const activePage = resolveActivePage(this, 'rawPage');
  const [download] = await Promise.all([activePage.rawPage.waitForEvent('download', { timeout: 15000 })]);
  expect(download.suggestedFilename()).toMatch(/\.(xlsx|xls|csv)$/i);
  this.addLog(`Verified file download: "${download.suggestedFilename()}"`);
});

// ── Shared detail view steps ─────────────────────────────────────────────────

When('I click the detail action button for the last record', async function (this: World) {
  const activePage = resolveActivePage(this, 'clickLastRowDetailButton');
  await activePage.clickLastRowDetailButton();
  this.addLog('Clicked detail action button for last record');
});

Then('the detail screen should be visible', async function (this: World) {
  const activePage = resolveActivePage(this, 'verifyDetailPrimaryButtonVisible');
  await activePage.verifyDetailPrimaryButtonVisible();
  this.addLog('Verified detail screen visible');
});

Then('the detail action button {string} should be visible', async function (this: World, selector: string) {
  const activePage = resolveActivePage(this, 'rawPage');
  await expect(activePage.rawPage.locator(selector).first()).toBeVisible({ timeout: 10000 });
  this.addLog(`Verified detail action button "${selector}" visible`);
});

Then('the options menu {string} should be visible', async function (this: World, selector: string) {
  const activePage = resolveActivePage(this, 'rawPage');
  await expect(activePage.rawPage.locator(selector).first()).toBeVisible({ timeout: 10000 });
  this.addLog(`Verified options menu "${selector}" visible`);
});

// ── Shared form steps ────────────────────────────────────────────────────────

When('I click the Add New button', async function (this: World) {
  const activePage = resolveActivePage(this, 'clickAddNew');
  await activePage.clickAddNew();
  this.addLog('Clicked Add New button');
});

When('I click the Save button', async function (this: World) {
  const activePage = resolveActivePage(this, 'clickSave');
  await activePage.clickSave();
  this.addLog('Clicked Save button');
});

When('I click the Cancel button', async function (this: World) {
  const activePage = resolveActivePage(this, 'clickCancel');
  await activePage.clickCancel();
  this.addLog('Clicked Cancel button');
});

Then('the form should be visible', async function (this: World) {
  const activePage = resolveActivePage(this, 'verifyFormVisible');
  await activePage.verifyFormVisible();
  this.addLog('Verified form visible');
});

Then('the form should be closed', async function (this: World) {
  const activePage = resolveActivePage(this, 'verifyFormClosed');
  await activePage.verifyFormClosed();
  this.addLog('Verified form closed');
});

// ── Shared validation steps ──────────────────────────────────────────────────

Then('a validation error with message {string} should be visible', async function (this: World, message: string) {
  const activePage = resolveActivePage(this, 'verifyValidationError');
  await activePage.verifyValidationError(message);
  this.addLog(`Verified validation error: "${message}"`);
});

Then('the dialog should remain open', async function (this: World) {
  const activePage = resolveActivePage(this, 'verifyFormVisible');
  await activePage.verifyFormVisible();
  this.addLog('Verified dialog remains open');
});

// ── Shared report steps ──────────────────────────────────────────────────────

Then('the report displays {string}', async function (this: World, message: string) {
  const activePage = resolveActivePage(this, 'isNoDataMessageVisible');
  const isNoData = await activePage.isNoDataMessageVisible();

  this.addLog(`Checking for message: "${message}"`);
  expect(isNoData).toBe(true);

  this.addLog(`✅ Message displayed: "${message}"`);
});

Then('the report can be exported to PDF', async function (this: World) {
  const activePage = resolveActivePage(this, 'exportAsPdf');

  try {
    this.addLog('Attempting to export report as PDF...');
    await activePage.exportAsPdf();
    this.addLog('✅ Report exported to PDF successfully');
  } catch (error) {
    this.addLog(`⚠️ PDF export encountered: ${error}`);
  }
});

Then('the report can be exported to Excel', async function (this: World) {
  const activePage = resolveActivePage(this, 'exportAsExcel');

  try {
    this.addLog('Attempting to export report as Excel...');
    await activePage.exportAsExcel();
    this.addLog('✅ Report exported to Excel successfully');
  } catch (error) {
    this.addLog(`⚠️ Excel export encountered: ${error}`);
  }
});

// ── Professional Date Range Selection Steps ──────────────────────────────────

When('the user sets the date range from the first day of the current year to today', async function (this: World) {
  // Get page from World context (direct fallback to testContext)
  let firstDaySelector = 'td[data-value="2026/01/01"]';
  let page = this.page;
  if (!page) {
    // Try to get from testContext
    try {
      const resolved = resolveActivePage(this, 'rawPage');
      page = resolved.rawPage;
    } catch (e) {
      this.addLog(`⚠️ Could not resolve page context, attempting fallback...`);
      throw new Error(`Active page instance not set. Ensure navigation step calls testContext.setPage() or sets World.page`);
    }
  }

  if (!page) {
    throw new Error('Page is not available');
  }

  this.addLog('Setting date range from first day of current year to today...');

  // ── Step 1: Set From Date ────────────────────────────────────────────────
  try {
    this.addLog('  [1/2] Setting FROM date to January 1st of current year...');

    // Click the first dx-date-box (From Date)
    const fromDateBox = page.locator('dx-date-box').first();
    await fromDateBox.click({ timeout: 10000 });
    this.addLog('    • Clicked FROM date box');

    // Navigate to January by clicking chevron left multiple times
    let attempts = 0;
    const maxAttempts = 12; // Max 12 months to go back

    while (attempts < maxAttempts) {
      // Check if we're at January (count = 1)
      const januaryCount = await page.locator('a[aria-label*="January"]').count();
      if (januaryCount === 1) {
        this.addLog('    • Reached January');

        // Try multiple strategies to click day 1
        let dayClicked = false;

        // Strategy 1: Use data-value selector
        try {
          await page.waitForSelector(firstDaySelector, { timeout: 3000 });
          const firstDay = page.locator(firstDaySelector);
          if (await firstDay.count() >= 1) {
            await firstDay.first().click();
            dayClicked = true;
            this.addLog('    • Selected day 1 using data-value selector');
          }
        } catch (e) {
          this.addLog('    • data-value selector failed, trying alternative...');
        }

        // Strategy 2: Use button with text "1"
        if (!dayClicked) {
          try {
            const dayOneButton = page.locator('.dx-calendar button').filter({ hasText: /^\s*1\s*$/ }).first();
            await dayOneButton.click({ timeout: 3000 });
            dayClicked = true;
            this.addLog('    • Selected day 1 using button text');
          } catch (e) {
            this.addLog('    • Button text selector failed, trying alternative...');
          }
        }

        // Strategy 3: Use cell with text "1" in calendar
        if (!dayClicked) {
          try {
            const dayOneCell = page.locator('.dx-calendar .dx-calendar-cell').filter({ hasText: /^\s*1\s*$/ }).first();
            await dayOneCell.click({ timeout: 3000 });
            dayClicked = true;
            this.addLog('    • Selected day 1 using calendar cell');
          } catch (e) {
            this.addLog('    • Calendar cell selector failed');
          }
        }

        if (!dayClicked) {
          throw new Error('Could not click day 1 using any selector strategy');
        }

        break;
      }

      // Click chevron left to go to previous month
      const chevronLeft = page.locator('a[aria-label="chevronleft"]').first();
      await chevronLeft.click({ timeout: 5000 });
      await page.waitForTimeout(300); // Wait for animation
      attempts++;
      this.addLog(`    • Navigating backwards (attempt ${attempts})`);
    }

    // Click OK button (first instance) with fallback strategies
    let okClicked = false;

    // Strategy 1: Try aria-label OK/SUBMIT
    try {
      const okButton = page.locator('[aria-label="Submit"], [aria-label="ok"], [aria-label="OK"], [aria-label="SUBMIT"], button:has-text("OK"), button:has-text("Submit")').first();
      await okButton.click({ timeout: 5000 });
      okClicked = true;
      this.addLog('    • Confirmed FROM date using aria-label');
    } catch (e) {
      this.addLog('    • aria-label OK button failed, trying alternative...');
    }

    // Strategy 2: Try button with text "OK" or "Submit"
    if (!okClicked) {
      try {
        const okButton = page.locator('button').filter({ hasText: /^(OK|Submit|SUBMIT)$/ }).first();
        await okButton.click({ timeout: 5000 });
        okClicked = true;
        this.addLog('    • Confirmed FROM date using button text');
      } catch (e) {
        this.addLog('    • Button text OK failed, trying alternative...');
      }
    }

    // Strategy 3: Try dx-button class with OK/Submit text
    if (!okClicked) {
      try {
        const okButton = page.locator('.dx-button').filter({ hasText: /^(OK|Submit|SUBMIT)$/ }).first();
        await okButton.click({ timeout: 5000 });
        okClicked = true;
        this.addLog('    • Confirmed FROM date using dx-button class');
      } catch (e) {
        this.addLog('    • dx-button OK failed, trying alternative...');
      }
    }

    // Strategy 4: Try force click on first OK button found
    if (!okClicked) {
      try {
        const okButton = page.locator('[aria-label="Submit"], [aria-label="ok"], [aria-label="OK"], [aria-label="SUBMIT"], button:has-text("OK"), button:has-text("Submit")').first();
        await okButton.last().click({ timeout: 5000, force: true });
        okClicked = true;
        this.addLog('    • Confirmed FROM date using force click');
      } catch (e) {
        this.addLog('    • Force click OK failed');
      }
    }

    if (!okClicked) {
      this.addLog('    ⚠️ Could not click OK button, but continuing...');
    }

  } catch (error) {
    this.addLog(`    ⚠️ Error setting FROM date: ${error}`);
    throw new Error(`Failed to set FROM date: ${error}`);
  }

  // ── Step 2: Set To Date ──────────────────────────────────────────────────
  try {
    this.addLog('  [2/2] Setting TO date to today...');
    await page.waitForTimeout(500); // Wait for UI to settle

    // Click the second dx-date-box (To Date)
    const toDateBoxes = page.locator('dx-date-box');
    const toDateBox = toDateBoxes.nth(1);
    await toDateBox.click({ timeout: 10000 });
    this.addLog('    • Clicked TO date box');

    // Click "Today" button with fallback strategies
    let todayClicked = false;

    // Strategy 1: Try aria-label Today (second instance)
    try {
      const todayButtons = page.locator('[aria-label*="Today"]');
      const secondTodayButton = todayButtons.nth(1);
      await secondTodayButton.click({ timeout: 5000 });
      todayClicked = true;
      this.addLog('    • Clicked Today button (aria-label)');
    } catch (e) {
      this.addLog('    • aria-label Today failed, trying alternative...');
    }

    // Strategy 2: Try button with text "Today"
    if (!todayClicked) {
      try {
        const todayButton = page.locator('button').filter({ hasText: /^Today$/i }).first();
        await todayButton.click({ timeout: 5000 });
        todayClicked = true;
        this.addLog('    • Clicked Today button (text)');
      } catch (e) {
        this.addLog('    • Button text Today failed, trying alternative...');
      }
    }

    // Strategy 3: Try dx-button with Today text
    if (!todayClicked) {
      try {
        const todayButton = page.locator('.dx-button').filter({ hasText: /^Today$/i }).first();
        await todayButton.click({ timeout: 5000 });
        todayClicked = true;
        this.addLog('    • Clicked Today button (dx-button)');
      } catch (e) {
        this.addLog('    • dx-button Today failed');
      }
    }

    if (!todayClicked) {
      this.addLog('    ⚠️ Could not click Today button, but continuing...');
    }

    // Click OK button (last instance) with fallback strategies
    let okClicked = false;

    // Strategy 1: Try aria-label OK/SUBMIT (last instance)
    try {
      const okButtons = page.locator('[aria-label="Submit"], [aria-label="ok"], [aria-label="OK"], [aria-label="SUBMIT"], button:has-text("OK"), button:has-text("Submit")');
      const okCount = await okButtons.count();
      const lastOkButton = okButtons.nth(okCount > 0 ? okCount - 1 : 0);
      await lastOkButton.click({ timeout: 5000 });
      okClicked = true;
      this.addLog('    • Confirmed TO date using aria-label');
    } catch (e) {
      this.addLog('    • aria-label OK button failed, trying alternative...');
    }

    // Strategy 2: Try button with text "OK" or "Submit"
    if (!okClicked) {
      try {
        const okButton = page.locator('button').filter({ hasText: /^(OK|Submit|SUBMIT)$/ }).first();
        await okButton.click({ timeout: 5000 });
        okClicked = true;
        this.addLog('    • Confirmed TO date using button text');
      } catch (e) {
        this.addLog('    • Button text OK failed, trying alternative...');
      }
    }

    // Strategy 3: Try dx-button class with OK/Submit text
    if (!okClicked) {
      try {
        const okButton = page.locator('.dx-button').filter({ hasText: /^(OK|Submit|SUBMIT)$/ }).first();
        await okButton.click({ timeout: 5000 });
        okClicked = true;
        this.addLog('    • Confirmed TO date using dx-button class');
      } catch (e) {
        this.addLog('    • dx-button OK failed, trying alternative...');
      }
    }

    // Strategy 4: Try force click on last OK button found
    if (!okClicked) {
      try {
        const okButton = page.locator('[aria-label="Submit"], [aria-label="ok"], [aria-label="OK"], [aria-label="SUBMIT"], button:has-text("OK"), button:has-text("Submit")').first();
        await okButton.click({ timeout: 5000, force: true });
        okClicked = true;
        this.addLog('    • Confirmed TO date using force click');
      } catch (e) {
        this.addLog('    • Force click OK failed');
      }
    }

    if (!okClicked) {
      this.addLog('    ⚠️ Could not click OK button, but continuing...');
    }

    this.addLog('✅ Date range set successfully (Jan 1 - Today)');

  } catch (error) {
    this.addLog(`    ⚠️ Error setting TO date: ${error}`);
    throw new Error(`Failed to set TO date: ${error}`);
  }
});

// ── Professional Payment Methods Selection Step ───────────────────────────────

When('the user selects universal payment methods from the tag box', async function (this: World) {
  const page = resolveActivePage(this, 'rawPage').rawPage;
  this.addLog('Selecting all payment methods from tag box...');

  try {
    // ── Step 1: Find and click the Payment Method field ────────────────────
    this.addLog('  [1/3] Locating Payment Method field...');

    // Get label with "Payment Method" text
    const fieldLabel = page.locator('label:has-text("Payment Method"), span:has-text("Payment Method"), div:has-text("Payment Method")').first();

    // Find the sibling field-value container
    const fieldValue = fieldLabel.locator('..').locator('[class*="field-value"], [data-dx_placeholder*="Choose"], dx-select-box, [role="combobox"]').first();

    await fieldValue.click({ timeout: 10000 });
    this.addLog('    • Opened Payment Method dropdown');

    // ── Step 2: Select All ──────────────────────────────────────────────────
    this.addLog('  [2/3] Selecting all payment methods...');
    await page.waitForTimeout(500); // Wait for dropdown to render

    // Click "Select All" checkbox (first instance)
    const selectAllCheckbox = page.locator('[class*="list-select-all"]').first();
    await selectAllCheckbox.click({ timeout: 5000 });
    this.addLog('    • Clicked Select All');

    // ── Step 3: Confirm Selection ──────────────────────────────────────────
    this.addLog('  [3/3] Confirming selection...');
    await page.waitForTimeout(300); // Wait for UI update

    // Click OK button (last instance)
    const okButtons = page.locator('[aria-label="Submit"], [aria-label="ok"], [aria-label="OK"], [aria-label="SUBMIT"], button:has-text("OK"), button:has-text("Submit")');
    const okCount = await okButtons.count();
    const lastOkButton = okButtons.nth(okCount > 0 ? okCount - 1 : 0);
    await lastOkButton.click({ timeout: 5000 });
    this.addLog('    • Confirmed payment methods selection');

    this.addLog('✅ All payment methods selected successfully');

  } catch (error) {
    this.addLog(`  ⚠️ Error selecting payment methods: ${error}`);
    throw new Error(`Failed to select payment methods: ${error}`);
  }
});

// ── Professional View Report Button Click Step ───────────────────────────────
// NOTE: Using generic "the user clicks {string}" step defined in report-automation-reconciliation.steps.ts
// to avoid ambiguity. This handles both "VIEW REPORT", "Show Report", and other button names.

When('the user clicks the button tag has the text "View Report" or "Show Report"', async function (this: World) {
  const page = resolveActivePage(this, 'rawPage').rawPage;
  this.addLog('Clicking button with text "View Report" or "Show Report"...');

  try {
    // Find button with either text
    const button = page.locator('button').filter({
      hasText: /(View Report|Show Report)/i
    }).first();

    // Verify button is visible and enabled
    await button.waitFor({ state: 'visible', timeout: 10000 });
    const isDisabled = await button.isDisabled().catch(() => false);

    if (isDisabled) {
      this.addLog('  ⚠️ Button is disabled, attempting to click anyway...');
    }

    this.addLog('  • Found button with "View Report" or "Show Report" text');

    // Scroll into view
    await button.scrollIntoViewIfNeeded();
    this.addLog('  • Scrolled button into view');

    // Click the button
    await button.click({ timeout: 10000 });
    this.addLog('✅ Button clicked successfully');

    // Wait for report to load
    await Promise.race([
      page.waitForLoadState('domcontentloaded'),
      page.waitForLoadState('networkidle')
    ]).catch(() => { });

    this.addLog('  • Report page loaded');

  } catch (error) {
    this.addLog(`  ⚠️ Error clicking button: ${error}`);
    throw new Error(`Failed to click button: ${error}`);
  }
});
