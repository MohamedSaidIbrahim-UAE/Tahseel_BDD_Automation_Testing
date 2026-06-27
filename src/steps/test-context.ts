// src/steps/test-context.ts
import { BasePage } from '../pages/base.page'; // Use your common base page or base list page layout class

class TestContext {
    private activePageInstance: any = null;

    setPage(pageInstance: any) {
        this.activePageInstance = pageInstance;
    }

    getPage() {
        if (!this.activePageInstance) {
            throw new Error('TestContext error: Active page instance was never set. Ensure the navigation step calls testContext.setPage().');
        }
        return this.activePageInstance;
    }

    clear() {
        this.activePageInstance = null;
    }
}

export const testContext = new TestContext();
