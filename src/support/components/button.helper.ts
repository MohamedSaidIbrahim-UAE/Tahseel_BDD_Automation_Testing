// src/support/components/button.helper.ts
import { Page, expect } from '@playwright/test';

export class ButtonHelper {
    constructor(private page: Page) { }

    /**
     * Resiliently targets and clicks a primary action button by its visible text.
     * @param buttonText - The visible display text inside the button (e.g., 'View Report')
     */
    async clickButtonByText(buttonText: string): Promise<void> {
        // 1. Target a primary button matching your exact class and text rules
        // Using a regex with boundary flags protects against partial matches (e.g., "Clear View Report")
        const targetButton = this.page.locator('button.btn-primary, .btn-primary, button').filter({
            hasText: new RegExp(`^\\s*${buttonText.trim()}\\s*$`, 'i')
        }).first();

        // 2. Web-First Pre-flight: Wait for dynamic reporting loading states to clear out
        const linearLoader = this.page.locator('.loading-overlay, .spinner-border, .dx-loadpanel');
        if (await linearLoader.count() > 0) {
            await expect(linearLoader).not.toBeVisible({ timeout: 15000 }).catch(() => { });
        }

        // 3. Assert visibility and scroll safely into the browser viewport bounds
        await expect(targetButton).toBeVisible({
            timeout: 10000
        });
        await targetButton.scrollIntoViewIfNeeded();

        // 4. Execute click with a clean fallback if an animation layer intercept happens
        await targetButton.click({ timeout: 5000 }).catch(async (error) => {
            console.warn(`[UI Warning] Click on '${buttonText}' button was blocked: ${error.message}. Executing forced click override.`);
            await targetButton.click({ force: true });
        });
    }
}