```markdown
# Tahseel Manage Portal - Automated Testing Framework

![Masar Logo](docs/images/masar-logo.png) <!-- Optional: Add a logo if available -->

## 📋 Project Overview

This repository contains the **automated testing framework** for the **Tahseel Manage Portal** web application. The framework is built using industry‑best practices to ensure comprehensive, reliable, and maintainable test coverage for the toll management platform developed for the Sharjah Roads and Transport Authority (SRTA).

The framework leverages:
- **Cucumber (Gherkin)** – for behavior‑driven development (BDD) and human‑readable test scenarios.
- **Playwright** – for fast, cross‑browser web automation.
- **TypeScript** – for type safety and maintainable code.
- **Allure Reporting** – for rich, interactive test reports.

---

## 🎯 Project Objectives

- Validate the Tahseel Manage Portal against all business requirements defined in the project’s user stories and feature files.
- Provide a reliable regression suite to catch defects early.
- Enable continuous testing in a CI/CD pipeline.
- Produce clear, actionable test reports for stakeholders.
- Promote reusability and maintainability through a well‑structured Page Object Model and step definitions.

---

## ✨ Features & Capabilities

- **BDD Test Scenarios** – 100+ Gherkin scenarios covering:
  - BI Dashboards
  - Site and System Configuration
  - Fee Management & Exemptions
  - Equipment Management
  - Truck and Passes Management
  - Revenue Reports
  - Action Logs
- **Cross‑Browser Testing** – Chromium, Firefox, and WebKit.
- **Data‑Driven Testing** – Using Scenario Outlines and external data sources.
- **Parallel Execution** – Faster test runs with Playwright’s built‑in sharding.
- **Visual Testing** – Optional screenshot and visual regression comparison.
- **API Testing** – Integrated API test support for backend validation.
- **Allure Reporting** – Detailed, historical test reports with trends.
- **CI/CD Integration** – Ready for Azure DevOps, GitHub Actions, or Jenkins.

---

## 🚀 Quick Start Guide

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/masar-central-automation.git
   cd masar-central-automation
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Playwright browsers**
   ```bash
   npx playwright install
   ```

4. **Set up environment variables**
   Copy `.env.example` to `.env` and fill in the required values:
   ```env
   BASE_URL=https://staging.tahseel.gov.ae/ManagePortal
   USERNAME=testuser
   PASSWORD=testpass
   # ... other variables
   ```

5. **Run the tests**
   ```bash
   npm test
   ```

---

## 📁 Project Structure

```
masar-central-automation/
├── .github/                  # CI/CD workflows (GitHub Actions)
├── src/
│   ├── features/             # Gherkin feature files (*.feature)
│   │   └── reports/
│   ├── step-definitions/      # Cucumber step definitions
│   │   ├── common.steps.ts
│   │   ├── dashboard.steps.ts
│   │   └── ...
│   ├── pages/                 # Page Object Model classes
│   │   ├── BasePage.ts
│   │   ├── LoginPage.ts
│   │   └── ...
│   ├── utils/                 # Helper functions
│   │   ├── config.ts
│   │   ├── data-generator.ts
│   │   └── hooks.ts           # Cucumber hooks (Before, After)
│   └── types/                  # TypeScript type definitions
├── test-results/              # Test artifacts (screenshots, videos)
├── allure-results/            # Raw Allure results
├── allure-report/             # Generated Allure report
├── .env.example               # Example environment variables
├── cucumber.js                # Cucumber configuration
├── playwright.config.ts       # Playwright configuration
├── package.json
└── README.md
```

---

## ⚙️ Configuration Options

### Environment Variables

| Variable          | Description                          | Example                         |
|-------------------|--------------------------------------|---------------------------------|
| `BASE_URL`        | Base URL of the Masar Central app    | https://masar-central.test.ae   |
| `USERNAME`        | Test user login                      | operator1                       |
| `PASSWORD`        | Test user password                   | ****                            |
| `HEADLESS`        | Run in headless mode (true/false)    | true                            |
| `SLOW_MO`         | Slow down Playwright operations (ms) | 100                             |
| `RETRIES`         | Number of test retries on failure    | 1                               |
| `ALLURE_RESULTS`  | Path to Allure results directory     | ./allure-results                |

### Cucumber Configuration (`cucumber.js`)

- `require`: Paths to step definitions and hooks.
- `format`: Report formats (e.g., `json:./reports/cucumber-report.json`).
- `paths`: Feature file locations.
- `tags`: Filter scenarios by tag (e.g., `@smoke`).

### Playwright Configuration (`playwright.config.ts`)

- Browser projects (chromium, firefox, webkit).
- Timeout settings.
- Screenshot and video capture on failure.
- Parallel workers.

---

## 🧪 Running Tests

### Run all tests
```bash
npm test
```

### Run tests by tag
```bash
npm test -- --tags "@smoke"
```

### Run tests with specific browser
```bash
npm test -- --project chromium
```

### Run tests in headed mode
```bash
HEADLESS=false npm test
```

### Generate Allure report
```bash
npm run allure:generate
npm run allure:open
```

### Run linting and type checks
```bash
npm run lint
npm run type-check
```

---

## 📊 Enhanced Reporting

This framework produces two types of reports:

1. **Cucumber JSON report** – used for CI integration.
2. **Allure Report** – rich HTML report with:
   - Test steps and attachments (screenshots, logs)
   - Trends over multiple runs
   - Categorization by feature and tag
   - Execution history

To view the Allure report locally after a test run:
```bash
npm run allure:serve
```

---

## 🔄 CI/CD Pipeline

The framework is designed to run in CI environments. Example GitHub Actions workflow (`.github/workflows/test.yml`):

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: allure-results
          path: allure-results/
```

For **Azure DevOps**, a similar pipeline can be created using the `VSTest` task or a custom script.

---

## ✅ Best Practices

- **Gherkin Style**:
  - Use `Feature` to describe the module.
  - Use `Background` for common preconditions.
  - Use `Scenario Outline` for data‑driven tests.
  - Tag scenarios consistently (e.g., `@smoke`, `@regression`, `@P1`).

- **Page Object Model**:
  - Each page/screen has a dedicated class.
  - Locators are stored as private properties.
  - Methods represent user actions (e.g., `login()`, `addNewFee()`).

- **Step Definitions**:
  - Keep steps short and delegate to page objects.
  - Use regex or Cucumber expressions for flexibility.
  - Avoid logic in steps – move to page objects or utilities.

- **Data Management**:
  - Use `Before` hooks to set up test data via API calls.
  - Clean up data in `After` hooks to avoid test pollution.
  - Generate unique test data (e.g., UUIDs) to prevent conflicts.

- **Assertions**:
  - Use Playwright’s built‑in assertions (`expect(page).toHaveText()`).
  - Prefer soft assertions for non‑critical checks.

---

## 🔍 Troubleshooting

### Common Issues

| Issue                          | Solution                                                                 |
|--------------------------------|--------------------------------------------------------------------------|
| Tests fail with timeout        | Increase Playwright timeout in config; check network/API slowness.       |
| Element not found              | Verify locator; use `page.waitForSelector()`; check if element is in iframe. |
| Test data conflicts            | Use unique identifiers; clean up data in `After` hook.                   |
| Allure report not generated    | Ensure `allure-results` directory is populated; run `allure generate`.   |

### Debugging

- Run tests in headed mode: `HEADLESS=false npm test`
- Use `page.pause()` to enter Playwright inspector.
- Capture video and screenshots automatically on failure (enabled in config).

---

## 👥 Contributing Guidelines

We welcome contributions! Please follow these steps:

1. **Fork** the repository.
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`).
3. **Commit your changes** with clear messages.
4. **Run linting and tests** locally.
5. **Push** to your branch.
6. **Open a Pull Request** describing your changes.

### Coding Standards

- Use TypeScript with strict mode.
- Follow the existing folder structure.
- Write Gherkin scenarios in business language.
- Add comments where logic is non‑trivial.
- Update documentation if needed.

---

## ✅ Framework Implementation Complete

### Core Architecture Created:

1. **Configuration Layer**
   - TypeScript config with strict mode
   - Browser configurations (Chromium, Firefox, WebKit)
   - Environment variable management
   - Cucumber profiles for each browser

2. **Page Object Model**
   - BasePage with common methods (SOLID principles)
   - DashboardPage as example implementation
   - Proper encapsulation and abstraction

3. **Fixture Pattern**
   - BrowserFixture for browser lifecycle management
   - World fixture with page object initialization
   - Automatic console logging and attachment handling

4. **Test Data Management**
   - TestDataFactory using Faker.js
   - User, credit card, and address data generators
   - TypeScript interfaces for type safety

5. **Cucumber Integration**
   - Hooks with Before/After lifecycle
   - Common steps pattern for reusability
   - Feature-specific step definitions
   - Automatic screenshot on failure
   - Trace and video recording

6. **Reporting Scripts**
   - Allure converter (Cucumber JSON → Allure format)
   - Dashboard generator with HTML visualization
   - Cross-platform report opener
   - Setup verification script

7. **CI/CD Pipeline**
   - GitHub Actions workflow
   - Multi-browser matrix testing
   - Artifact management
   - Code quality checks (ESLint, Prettier)

8. **Code Quality**
   - ESLint configuration
   - Prettier formatting
   - TypeScript strict mode
   - Comprehensive npm scripts



## 📄 License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited. © 2026 Tahseel Information Technology – SRTA.

---

## 📞 Contact

For questions or support, please contact the **Test Automation Team**:

- **Mohamed Said Ibrahim** – Senior Test Consultant – [m.said@tahseelit.ae](mailto:m.said@tahseelit.ae)
---

**Thank you for contributing to the quality of the Tahseel Manage Portal!**
