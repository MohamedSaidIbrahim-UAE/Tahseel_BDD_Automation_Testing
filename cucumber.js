module.exports = {
  default: {
    require: ['src/steps/hooks.ts', 'src/steps/shared.steps.ts', 'src/steps/**/*.steps.ts'],
    requireModule: ['ts-node/register'],
    format: [
      'progress',
      'html:cucumber-report.html',
      'json:cucumber-report.json'
    ],
    parallel: 4,
    timeout: 60000
  },
  chromium: {
    require: ['src/steps/hooks.ts', 'src/steps/shared.steps.ts', 'src/steps/**/*.steps.ts'],
    requireModule: ['ts-node/register'],
    format: [
      'progress',
      'html:cucumber-report-chromium.html',
      'json:allure-results/chromium-results.json'
    ],
    parallel: 4,
    timeout: 60000
  },
  firefox: {
    require: ['src/steps/hooks.ts', 'src/steps/shared.steps.ts', 'src/steps/**/*.steps.ts'],
    requireModule: ['ts-node/register'],
    format: [
      'progress',
      'html:cucumber-report-firefox.html',
      'json:allure-results/firefox-results.json'
    ],
    parallel: 3,
    timeout: 60000
  },
  webkit: {
    require: ['src/steps/hooks.ts', 'src/steps/shared.steps.ts', 'src/steps/**/*.steps.ts'],
    requireModule: ['ts-node/register'],
    format: [
      'progress',
      'html:cucumber-report-webkit.html',
      'json:allure-results/webkit-results.json'
    ],
    parallel: 2,
    timeout: 60000
  }
};
