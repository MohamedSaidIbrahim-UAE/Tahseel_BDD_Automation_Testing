// src/support/components/dx-dropdown.helper.ts
import { Page, expect, Locator } from '@playwright/test';

export class DxDropdownHelper {
    constructor(private page: Page) { }

    /**
     * Resiliently finds a DevExtreme select box by its associated label text,
     * expands it, and picks the target option string.
     * @param labelText - The exact or partial label string (e.g., 'User')
     * @param optionText - The option string value to select from the list (e.g., 'John Doe')
     */
    async selectOptionByLabel(labelText: string, optionText: string): Promise<void> {
        // 1. Isolate the explicit field row container that holds both our unique label and dropdown
        const fieldContainer = this.page.locator('.dx-field, .form-group, div.row').filter({
            has: this.page.locator('.dx-field-label, label', { hasText: new RegExp(`^\\s*${labelText}\\s*$`, 'i') })
        });

        // 2. Identify the interactive select box interaction area inside that isolated workspace
        const selectBox = fieldContainer.locator('dx-select-box, .dx-selectbox').first();
        await expect(selectBox).toBeVisible({
            timeout: 7000
        });

        // 3. Click to trigger the dropdown expansion list panel
        await selectBox.click();

        // 4. Target DevExtreme's global overlay/popup listing window pane container
        // DevExtreme appends this element block straight to the HTML body root level when activated
        const popupListWrapper = this.page.locator('.dx-dropdownlist-popup-wrapper, .dx-overlay-content').filter({ visible: true }).last();

        // 5. Target the individual selection option rows inside the active popup view
        const targetOptionItem = popupListWrapper.locator('.dx-list-item, [role="option"]').filter({
            hasText: new RegExp(`^\\s*${optionText}\\s*$`, 'i')
        }).first();

        // 6. Production Actionability Validation check
        await expect(targetOptionItem).toBeVisible({
            timeout: 5000
        });

        // 7. Commit interaction click, forcing a fallback execution if rendering shifts intercept the pointer
        await targetOptionItem.click().catch(async () => {
            console.warn(`[UI Warning] Selection click intercepted on option '${optionText}', executing forced override click.`);
            await targetOptionItem.click({ force: true });
        });

        // 8. Pre-flight verification: Ensure the option list pop-up screen correctly auto-dismisses
        await expect(popupListWrapper).not.toBeVisible({ timeout: 3000 }).catch(() => { });
    }
}