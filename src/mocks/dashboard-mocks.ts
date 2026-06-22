import { Page, Route } from '@playwright/test';
import { mockOverviewResponse, mockPlazaComparisonResponse, mockFilterOptions } from './mock-data';

export class DashboardMocks {
  static async setup(page: Page, options: {
    gate?: string;
    lane?: string;
    dateRange?: string;
  } = {}) {
    // Intercept ALL network requests to API endpoints
    await page.route('**/api/**', async (route: Route) => {
      const url = route.request().url();
      const method = route.request().method();

      // Only mock GET requests; let other methods pass through
      if (method !== 'GET') {
        await route.continue();
        return;
      }

      // Filter options endpoint
      if (url.includes('/filters') || url.includes('/dropdown') || url.includes('/options')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: mockFilterOptions,
            errorCode: 0,
            errorMessage: 'Success'
          })
        });
        return;
      }

      // Plaza comparison endpoint
      if (url.includes('/plaza-comparison') || url.includes('comparison')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: mockPlazaComparisonResponse,
            errorCode: 0,
            errorMessage: 'Success'
          })
        });
        return;
      }

      // Overview dashboard and stats endpoints
      if (url.includes('/dashboard/') || url.includes('/overview')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: mockOverviewResponse,
            errorCode: 0,
            errorMessage: 'Success'
          })
        });
        return;
      }

      // Default: allow all other requests to pass through
      await route.continue();
    });
  }

  static async clear(page: Page) {
    try {
      if (page.isClosed()) return;
      await page.unroute('**/api/**');
    } catch (error:any) {
      // Page may already be closed or have been navigated away; ignore cleanup errors
      console.warn('[DashboardMocks] Unable to clear route:', error);
    }
  }
}