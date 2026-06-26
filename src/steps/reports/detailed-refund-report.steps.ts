import { Given, When, Then, Before } from '@cucumber/cucumber';
import { World } from '../../fixtures/world.fixture';
import { DetailedRefundReportSteps } from './detailed-refund-report-implementation';
let steps: DetailedRefundReportSteps;
Before(function (this: World) { steps = new DetailedRefundReportSteps(this); });
Given('the user navigates to detailed refund report', async function () { await steps.navigateToReport(); });
When('the user generates detailed refund report', async function () { await steps.generateReport(); });
Then('the detailed refund report should display', async function () { await steps.verifyReport(); });
