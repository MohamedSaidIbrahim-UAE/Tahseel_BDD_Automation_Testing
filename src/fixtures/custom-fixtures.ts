// src/support/fixtures/custom-fixtures.ts
import { test as baseTest } from '@playwright/test';
import { DxDateBoxHelper } from '../support/components/dx-datebox.helper';
import { DxDropdownHelper } from '../support/components/dx-dropdown.helper';

export const test = baseTest.extend<{
    dxDateBox: DxDateBoxHelper;
    dxDropdown: DxDropdownHelper;
}>({
    dxDateBox: async ({ page }, use) => {
        await use(new DxDateBoxHelper(page));
    },
    dxDropdown: async ({ page }, use) => {
        await use(new DxDropdownHelper(page));
    },
});