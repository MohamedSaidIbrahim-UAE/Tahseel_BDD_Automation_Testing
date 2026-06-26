import { Given, When, Then, Before } from '@cucumber/cucumber';
import { World } from '../../fixtures/world.fixture';
import { DepositsDetailsReportSteps } from './deposits-details-report-implementation';
let steps: DepositsDetailsReportSteps;
Before(function (this: World) { steps = new DepositsDetailsReportSteps(this); });
Given('the user navigates to deposits details report', async function () { await steps.navigateToReport(); });
When('the user generates deposits details report', async function () { await steps.generateReport(); });
Then('the deposits details report should display', async function () { await steps.verifyReport(); });
