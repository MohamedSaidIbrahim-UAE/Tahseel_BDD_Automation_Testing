import { Before, After, Status, setWorldConstructor } from '@cucumber/cucumber';
import { World } from '../fixtures/world.fixture';
import * as fs from 'fs';
import { testContext } from './test-context';

import { DashboardMocks } from '../mocks/dashboard-mocks';

setWorldConstructor(World);

Before(async function (this: World, { pickle }) {
  testContext.clear(); // Reset before every scenario execution

  try {
    await this.initialize();
    this.addLog('Test scenario started');

    // Setup dashboard mocks if @mock-dashboard tag is present
    const hasMockDashboardTag = pickle.tags.some(tag => tag.name === '@mock-dashboard');
    if (hasMockDashboardTag) {
      const page = this.getPage();
      if (!page) {
        throw new Error('Page is not initialized. Cannot setup dashboard mocks.');
      }
      await DashboardMocks.setup(page);
      this.addLog('Dashboard mocks setup complete');
    }

    // Graceful degradation for stage environment
    if (process.env.TEST_ENV === 'stage') {
      const page = this.getPage();
      if (page) {
        try {
          // Verify page is responsive with extended timeout
          await Promise.race([
            page.evaluate(() => document.readyState),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Initial connectivity check timeout')), 60000)
            ),
          ]);
          this.addLog('Stage environment: Connectivity check passed');
        } catch (error: any) {
          this.addLog(`Stage environment: Connectivity check warning: ${error.message}`);
          // Continue anyway - retry will happen during step execution
        }
      }
    }
  } catch (error: any) {
    this.addLog(`Test setup error: ${error.message}`);
    throw error;
  }
});


After(async function (this: any, { pickle, result }) {
  const world = this as World;
  world.addLog(`Test scenario finished with status: ${result?.status}`);

  // Clear dashboard mocks if @mock-dashboard tag is present
  const hasMockDashboardTag = pickle.tags.some(tag => tag.name === '@mock-dashboard');
  if (hasMockDashboardTag) {
    const page = world.getPage();
    if (page) {
      await DashboardMocks.clear(page).catch(() => undefined);
    }
  }

  // Screenshot on failure
  if (result?.status === Status.FAILED) {
    await world.takeScreenshot(`failed-${pickle.name}`).catch(() => undefined);
  }

  // Attach logs
  const logs = world.getLogs();
  if (logs && typeof this.attach === 'function') {
    await this.attach(logs, 'text/plain');
  }

  // Attach screenshots
  const attachments = world.getAttachments();
  for (const attachment of attachments) {
    if (fs.existsSync(attachment.path) && typeof this.attach === 'function') {
      const fileContent = fs.readFileSync(attachment.path);
      await this.attach(fileContent, attachment.type);
    }
  }

  // Attach trace
  const tracePath = world.getTracePath();
  if (tracePath && fs.existsSync(tracePath) && typeof this.attach === 'function') {
    const traceContent = fs.readFileSync(tracePath);
    await this.attach(traceContent, 'application/zip');
  }

  await world.cleanup();
});
