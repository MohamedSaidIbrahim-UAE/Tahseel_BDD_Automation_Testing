// src/support/components/dx-datebox.helper.ts
import { Page, expect } from '@playwright/test';

export class DxDateBoxHelper {
    constructor(private page: Page) { }

    /**
     * Resiliently finds a DevExtreme date-time picker by its layout label text,
     * cleans the field, and assigns the target date and time configuration.
     * @param labelText - The exact or partial label string (e.g., 'From Date', 'To Date')
     * @param dateStr - The target date string value in format YYYY-MM-DD or DD/MM/YYYY matching your application localized layout input masks
     * @param timeStr - The target time value configuration (e.g., '14:30', '00:00:00')
     */
    async setDateTimeByLabel(labelText: string, dateStr: string, timeStr: string): Promise<void> {
        // 1. Isolate the target row block container by matching its unique text label
        const fieldContainer = this.page.locator('.dx-field, .form-group, div.row').filter({
            has: this.page.locator('.dx-field-label, label', { hasText: new RegExp(`^\\s*${labelText}\\s*$`, 'i') })
        });

        // 2. Identify the interactive text input element layout node
        const textInput = fieldContainer.locator('dx-date-box input.dx-texteditor-input, .dx-texteditor-input').first();

        await expect(textInput).toBeVisible({
            timeout: 7000
        });

        // 3. Clear any existing pre-populated values safely and focus the interaction stream
        await textInput.click();

        // Clear via keyboard shortcuts to satisfy modern framework change detection tracking loops
        await textInput.press('Control+A');
        await textInput.press('Delete');

        // 4. Combine inputs into a unified target input payload string string sequence
        // DevExtreme inputs accept values typed in matching your framework mask (e.g., "23/06/2026 14:30")
        const fullDateTimePayload = `${dateStr.trim()} ${timeStr.trim()}`;

        // 5. Fill the interactive workspace sequentially
        await textInput.fill(fullDateTimePayload);

        // 6. Press Enter or Tab out to commit change records and dismiss calendar picker frames
        await textInput.press('Tab');

        // 7. Fire explicit DOM validation bubble events so Angular Reactive Forms intercept the update sequence
        await textInput.dispatchEvent('change');
        await textInput.dispatchEvent('blur');
    }
}