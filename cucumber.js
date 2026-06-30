module.exports = {
  default: {
    require: ['src/steps/hooks.ts', 'src/steps/shared.steps.ts', 'src/steps/reports/**/*.steps.ts', 'src/steps/core/**/*.steps.ts'],
    requireModule: ['ts-node/register'],
    format: [
      'progress',
      'html:cucumber-report.html',
      'json:cucumber-report.json'
    ],
    parallel: 4,
    timeout: 60000,
    formatOptions: {
      snippetInterface: 'async-await'
    }
  },
  chromium: {
    require: ['src/steps/hooks.ts', 'src/steps/shared.steps.ts', 'src/steps/reports/**/*.steps.ts', 'src/steps/core/**/*.steps.ts'],
    requireModule: ['ts-node/register'],
    format: [
      'progress',
      'html:cucumber-report-chromium.html',
      'json:allure-results/chromium-results.json'
    ],
    parallel: 4,
    timeout: 60000,
    formatOptions: {
      snippetInterface: 'async-await'
    }
  },
  'revenue-tests': {
    require: ['src/steps/hooks.ts', 'src/steps/shared.steps.ts', 'src/steps/reports/total-transactions-revenue-entity.steps.ts', 'src/steps/reports/shared-revenues.steps.ts', 'src/steps/reports/detailed-transactions-revenue-entity.steps.ts'],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'html:cucumber-report-chromium.html',
      'json:allure-results/chromium-results.json'
    ],
    parallel: 1,
    timeout: 120000,
    formatOptions: {
      snippetInterface: 'async-await'
    }
  },
  firefox: {
    require: ['src/steps/hooks.ts', 'src/steps/shared.steps.ts', 'src/steps/reports/**/*.steps.ts', 'src/steps/core/**/*.steps.ts'],
    requireModule: ['ts-node/register'],
    format: [
      'progress',
      'html:cucumber-report-firefox.html',
      'json:allure-results/firefox-results.json'
    ],
    parallel: 3,
    timeout: 60000,
    formatOptions: {
      snippetInterface: 'async-await'
    }
  },
  webkit: {
    require: ['src/steps/hooks.ts', 'src/steps/shared.steps.ts', 'src/steps/reports/**/*.steps.ts', 'src/steps/core/**/*.steps.ts'],
    requireModule: ['ts-node/register'],
    format: [
      'progress',
      'html:cucumber-report-webkit.html',
      'json:allure-results/webkit-results.json'
    ],
    parallel: 2,
    timeout: 60000,
    formatOptions: {
      snippetInterface: 'async-await'
    }
  },
  'report-automation': {
    require: [
      'src/steps/hooks.ts',
      'src/steps/shared.steps.ts',
      'src/steps/reports/report-automation-reconciliation.steps.ts',
      'src/steps/core/**/*.steps.ts'
    ],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'html:cucumber-report-automation.html',
      'json:allure-results/automation-results.json'
    ],
    parallel: 1,
    timeout: 600000,
    formatOptions: {
      snippetInterface: 'async-await',
      colorsEnabled: true
    },
    publishQuiet: false
  }
};
