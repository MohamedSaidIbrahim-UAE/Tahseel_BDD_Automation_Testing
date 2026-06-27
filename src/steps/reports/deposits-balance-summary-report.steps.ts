import { Given, When, Then, Before } from '@cucumber/cucumber';
import { World } from '../../fixtures/world.fixture';
import { DepositsBalanceSummaryReportSteps } from './deposits-balance-summary-report-implementation';
let steps: DepositsBalanceSummaryReportSteps;
Before(function (this: World) { steps = new DepositsBalanceSummaryReportSteps(this); });
Given('the user navigates to deposits balance report', async function () { await steps.navigateToReport(); });
When('the user generates deposits balance report', async function () { await steps.generateReport(); });
Then('the deposits balance report should display', async function () { await steps.verifyReport(); });
