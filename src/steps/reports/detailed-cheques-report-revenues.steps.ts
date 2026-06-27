/**
 * Detailed Cheques Report Revenues - Consolidated
 * @category Step Definitions
 */

import { Given, When, Then, Before } from '@cucumber/cucumber';
import { World } from '../../fixtures/world.fixture';
import { DetailedChequesReportRevenuesSteps } from './detailed-cheques-report-revenues-implementation';

let steps: DetailedChequesReportRevenuesSteps;
Before(function (this: World) { steps = new DetailedChequesReportRevenuesSteps(this); });

Given('the user navigates to detailed cheques report', async function () { await steps.navigateToReport(); });
When('the user generates detailed cheques report', async function () { await steps.generateReport(); });
Then('the detailed cheques report should display', async function () { await steps.verifyReport(); });
