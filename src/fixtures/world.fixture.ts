import { World as CucumberWorld, IWorldOptions } from '@cucumber/cucumber';
import { BrowserFixture } from './browser.fixture'; // Adjust path if necessary
import { Page } from '@playwright/test';
import { BasePage } from '../pages/base.page';
import { testContext } from '../steps/test-context';
import { DashboardPage } from '../pages/dashboard.page';
import { LoginPage } from '../pages/login.page';
import { SiteConfigurationPage } from '../pages/site-configuration.page';
import { EquipmentBrandPage } from '../pages/equipment-brand.page';
import { EquipmentTypePage } from '../pages/equipment-type.page';
import { EquipmentInstancePage } from '../pages/equipment-instance.page';
import { EquipmentMaintenancePage } from '../pages/equipment-maintenance.page';
import { PlazaWorkingHoursPage } from '../pages/plaza-working-hours.page';
import { SystemParametersPage } from '../pages/system-parameters.page';
import { ServiceCataloguePage } from '../pages/service-catalogue.page';
import { TruckClassificationPage } from '../pages/truck-classification.page';
import { TollableClassificationPage } from '../pages/tollable-classification.page';
import { ManageFeesPage } from '../pages/manage-fees.page';
import { CompanyProfilesPage } from '../pages/company-profiles.page';
import { TruckListPage } from '../pages/truck-list.page';
import { TruckPermitPage } from '../pages/truck-permit.page';
import { PassesManagementPage } from '../pages/passes-management.page';
import { ActionLogsPage } from '../pages/action-logs.page';
import { AuthManager } from '../utils/auth.manager';
import { UserRegistrationData } from '../models/user.model';
import * as path from 'path';
import * as fs from 'fs';

export interface Attachment {
  name: string;
  path: string;
  type: string;
}

export class World extends CucumberWorld {
  public page: Page | null = null;
  public browserFixture: BrowserFixture;
  private logs: string[] = [];
  private attachments: Attachment[] = [];

  // Page Objects
  dashboardPage: DashboardPage | null = null;
  loginPage: LoginPage | null = null;
  siteConfigPage: SiteConfigurationPage | null = null;
  equipmentBrandPage: EquipmentBrandPage | null = null;
  equipmentTypePage: EquipmentTypePage | null = null;
  equipmentInstancePage: EquipmentInstancePage | null = null;
  equipmentMaintenancePage: EquipmentMaintenancePage | null = null;
  plazaWorkingHoursPage: PlazaWorkingHoursPage | null = null;
  systemParametersPage: SystemParametersPage | null = null;
  serviceCataloguePage: ServiceCataloguePage | null = null;
  truckClassificationPage: TruckClassificationPage | null = null;
  tollableClassificationPage: TollableClassificationPage | null = null;
  manageFeesPage: ManageFeesPage | null = null;
  companyProfilesPage: CompanyProfilesPage | null = null;
  truckListPage: TruckListPage | null = null;
  truckPermitPage: TruckPermitPage | null = null;
  passesManagementPage: PassesManagementPage | null = null;
  actionLogsPage: ActionLogsPage | null = null;

  // Auth manager — provides token extraction and session recovery
  authManager: AuthManager | null = null;

  // Test Data
  registeredUser: UserRegistrationData | null = null;
  lastCreatedBrandName: string | null = null;
  lastCreatedTypeName: string | null = null;
  lastCreatedInstanceName: string | null = null;
  lastCreatedMaintenanceProvider: string | null = null;
  lastCreatedWorkingHoursDay: string | null = null;
  lastCreatedParamName: string | null = null;
  lastCreatedServiceName: string | null = null;
  lastCreatedTruckClassName: string | null = null;
  lastCreatedTollableClassName: string | null = null;
  lastCreatedFeeName: string | null = null;
  targetPageLabel!: string;

  // Item Count Tracking (for list view assertions)
  beforeAddItemCount: number | null = null;
  beforeUpdateItemCount: number | null = null;

  constructor(options: IWorldOptions) {
    // 1. Call super first to initialize the parent Cucumber World object
    super(options);

    // 2. Now you can safely use 'this'
    this.browserFixture = new BrowserFixture();
  }

  async initialize(): Promise<void> {
    this.page = await this.browserFixture.initialize();
    this.initializePageObjects();
    this.setupConsoleLogging();
  }

  private initializePageObjects(): void {
    if (this.page) {
      this.dashboardPage = new DashboardPage(this.page);
      this.loginPage = new LoginPage(this.page);
      this.siteConfigPage = new SiteConfigurationPage(this.page);
      this.equipmentBrandPage = new EquipmentBrandPage(this.page);
      this.equipmentTypePage = new EquipmentTypePage(this.page);
      this.equipmentInstancePage = new EquipmentInstancePage(this.page);
      this.equipmentMaintenancePage = new EquipmentMaintenancePage(this.page);
      this.plazaWorkingHoursPage = new PlazaWorkingHoursPage(this.page);
      this.systemParametersPage = new SystemParametersPage(this.page);
      this.serviceCataloguePage = new ServiceCataloguePage(this.page);
      this.truckClassificationPage = new TruckClassificationPage(this.page);
      this.tollableClassificationPage = new TollableClassificationPage(this.page);
      this.manageFeesPage = new ManageFeesPage(this.page);
      this.companyProfilesPage = new CompanyProfilesPage(this.page);
      this.truckListPage = new TruckListPage(this.page);
      this.truckPermitPage = new TruckPermitPage(this.page);
      this.passesManagementPage = new PassesManagementPage(this.page);
      this.actionLogsPage = new ActionLogsPage(this.page);

      // AuthManager requires both page and context
      const context = this.browserFixture.getContext();
      if (context) {
        this.authManager = new AuthManager(this.page, context);
        // Register with BasePage so all page objects can trigger re-login
        // automatically when a session expiry is detected during navigation
        BasePage.setAuthManager(this.authManager);
      }

      this.syncTestContextPage();
    }
  }

  private syncTestContextPage(): void {
    const pageObject = this.findFirstPageObject();
    if (pageObject) {
      testContext.setPage(pageObject);
    }
  }

  private findFirstPageObject(): any | null {
    return Object.values(this).find(value =>
      value && typeof value === 'object' && typeof (value as any).rawPage === 'object'
    ) || null;
  }

  private setupConsoleLogging(): void {
    if (this.page) {
      this.page.on('console', msg => {
        this.addLog(`[CONSOLE ${msg.type()}] ${msg.text()}`);
      });
    }
  }

  async cleanup(): Promise<void> {
    await this.browserFixture.cleanup();
  }

  getPage(): Page | null {
    return this.page;
  }

  setPage(page: Page): void {
    this.page = page;
    // Reinitialize page objects with new page
    this.initializePageObjects();
  }

  getContext() {
    return this.browserFixture.getContext();
  }

  addLog(message: string): void {
    const timestamp = new Date().toISOString();
    this.logs.push(`[${timestamp}] ${message}`);
  }

  getLogs(): string {
    return this.logs.join('\n');
  }

  async takeScreenshot(name: string): Promise<void> {
    if (!this.page) return;

    const screenshotDir = path.join(process.cwd(), 'test-results', 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    const safeName = name.replace(/[<>:"/\\|?*\x00-\x1F]/g, '-').replace(/\s+/g, ' ').trim();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = path.join(screenshotDir, `${safeName}-${timestamp}.png`);

    await this.page.screenshot({ path: screenshotPath, timeout: 10000 });

    this.attachments.push({
      name: `${safeName}-${timestamp}`,
      path: screenshotPath,
      type: 'image/png'
    });
  }

  getAttachments(): Attachment[] {
    return this.attachments;
  }

  getTracePath(): string {
    return this.browserFixture.getTracePath();
  }
}
