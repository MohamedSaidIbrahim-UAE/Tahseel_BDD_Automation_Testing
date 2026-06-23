// src/support/fixtures/custom-fixtures.ts
import { test as baseTest } from '@playwright/test';
import { DxDropdownHelper } from '../support/components/dx-dropdown.helper';

// Extend base test tracking capabilities
export const test = baseTest.extend<{
    dxDropdown: DxDropdownHelper;
}>({
    dxDropdown: async ({ page }, use) => {
        // Construct the helper instance and pass it out to test routines
        await use(new DxDropdownHelper(page));
    },
});