// src/support/components/dx-radio-button.helper.ts
import { Page, expect } from '@playwright/test';

export class DxRadioButtonHelper {
    constructor(private page: Page) { }

    /**
     * Resiliently finds a DevExtreme radio button group or container by its context,
     * targets the specific radio option matching the provided text label, and selects it.
     * @param groupLabelText - The label text of the parent group (optional, pass empty string if targeting page-wide)
     * @param optionText - The exact or partial label string of the target radio button (e.g., 'Revenue transactions')
     */
    async selectOptionByLabel(groupLabelText: string, optionText: string): Promise<void> {
        // 1. Isolate the workspace container if a group label is provided; fallback to page scope if not
        let contextLocator = this.page.locator('body');
        
        if (groupLabelText) {
            contextLocator = this.page.locator('.dx-field, .form-group, div.row').filter({
                has: this.page.locator('.dx-field-label, label', { hasText: new RegExp(`^\\s*${groupLabelText}\\s*$`, 'i') })
            }).first();
        }

        // 2. Locate the specific target radio button item based on DevExtreme's CSS class structural pattern
        const targetRadioButton = contextLocator.locator('.dx-radiobutton, [role="radio"]').filter({
            has: this.page.locator('.dx-item-content', { hasText: new RegExp(`^\\s*${optionText}\\s*$`, 'i') })
        }).first();

        // 3. Ensure the targeted option is visible and ready for interaction
        await expect(targetRadioButton).toBeVisible({
            timeout: 7000
        });

        // 4. Commit interaction click, forcing a fallback execution if rendering shifts intercept the pointer
        await targetRadioButton.click().catch(async () => {
            console.warn(`[UI Warning] Radio selection click intercepted on option '${optionText}', executing forced override click.`);
            await targetRadioButton.click({ force: true });
        });

        // 5. Pre-flight verification: Confirm that DevExtreme updates the element state to selected/checked
        await expect(targetRadioButton).toHaveClass(/dx-radiobutton-checked|dx-item-selected/, { timeout: 3000 });
    }
}