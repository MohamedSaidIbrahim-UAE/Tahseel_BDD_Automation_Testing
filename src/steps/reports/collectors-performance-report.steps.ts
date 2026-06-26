/**
 * Collectors Performance Report - Consolidated Step Definitions
 * @category Step Definitions
 * @module collectors-performance-report.steps
 */

import { Given, When, Then, Before } from '@cucumber/cucumber';
import { World } from '../../fixtures/world.fixture';
import { CollectorsPerformanceReportSteps } from './collectors-performance-report-implementation';

let steps: CollectorsPerformanceReportSteps;

Before(function (this: World) {
  steps = new CollectorsPerformanceReportSteps(this);
});

Given('the user navigates to collectors performance report', async function () {
  await steps.navigateToReport();
});

When('the user generates the performance report', async function () {
  await steps.generateReport();
});

Then('the performance report should display collector metrics', async function () {
  await steps.verifyReport();
});
