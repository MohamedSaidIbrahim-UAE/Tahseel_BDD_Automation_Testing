// src/support/fixtures/custom-fixtures.ts
import { test as baseTest } from '@playwright/test';
import { ButtonHelper } from '../support/components/button.helper';
import { DxDateBoxHelper } from '../support/components/dx-datebox.helper';
import { DxDropdownHelper } from '../support/components/dx-dropdown.helper';

export const test = baseTest.extend<{
    buttonHelper: ButtonHelper;
    dxDateBox: DxDateBoxHelper;
    dxDropdown: DxDropdownHelper;
}>({
    buttonHelper: async ({ page }, use) => {
        await use(new ButtonHelper(page));
    },
    dxDateBox: async ({ page }, use) => {
        await use(new DxDateBoxHelper(page));
    },
    dxDropdown: async ({ page }, use) => {
        await use(new DxDropdownHelper(page));
    },
});