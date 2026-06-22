const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const ALLURE_RESULTS_DIR = 'allure-results';
const CUCUMBER_REPORTS = [
  'cucumber-report.json',
  'allure-results/chromium-results.json',
  'allure-results/firefox-results.json',
  'allure-results/webkit-results.json'
];

// Ensure allure-results directory exists
if (!fs.existsSync(ALLURE_RESULTS_DIR)) {
  fs.mkdirSync(ALLURE_RESULTS_DIR, { recursive: true });
}

function convertCucumberToAllure() {
  console.log('🔄 Converting Cucumber reports to Allure format...');

  CUCUMBER_REPORTS.forEach(reportFile => {
    if (!fs.existsSync(reportFile)) {
      console.log(`⚠️  Report not found: ${reportFile}`);
      return;
    }

    const cucumberReport = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
    processReport(cucumberReport, reportFile);
  });

  console.log('✅ Conversion completed successfully!');
}

function processReport(cucumberReport, reportFile) {
  cucumberReport.forEach(feature => {
    feature.elements.forEach(scenario => {
      const testUuid = uuidv4();
      const testResult = {
        uuid: testUuid,
        historyId: generateHistoryId(feature.name, scenario.name),
        name: scenario.name,
        fullName: `${feature.name}: ${scenario.name}`,
        status: getScenarioStatus(scenario),
        stage: 'finished',
        start: scenario.start_timestamp || Date.now(),
        stop: scenario.start_timestamp ? scenario.start_timestamp + getTotalDuration(scenario) : Date.now(),
        steps: convertSteps(scenario.steps),
        labels: [
          { name: 'feature', value: feature.name },
          { name: 'severity', value: 'normal' },
          { name: 'browser', value: getBrowserFromReport(reportFile) }
        ]
      };

      const resultFile = path.join(ALLURE_RESULTS_DIR, `${testUuid}-result.json`);
      fs.writeFileSync(resultFile, JSON.stringify(testResult, null, 2));
    });
  });
}

function getScenarioStatus(scenario) {
  const hasFailedStep = scenario.steps.some(step => step.result.status === 'failed');
  const hasSkippedStep = scenario.steps.some(step => step.result.status === 'skipped');
  
  if (hasFailedStep) return 'failed';
  if (hasSkippedStep) return 'skipped';
  return 'passed';
}

function convertSteps(steps) {
  return steps.map(step => ({
    name: `${step.keyword}${step.name}`,
    status: step.result.status === 'passed' ? 'passed' : 
            step.result.status === 'failed' ? 'failed' : 'skipped',
    stage: 'finished',
    start: Date.now(),
    stop: Date.now() + (step.result.duration || 0)
  }));
}

function getTotalDuration(scenario) {
  return scenario.steps.reduce((total, step) => total + (step.result.duration || 0), 0);
}

function generateHistoryId(featureName, scenarioName) {
  return Buffer.from(`${featureName}:${scenarioName}`).toString('base64');
}

function getBrowserFromReport(reportFile) {
  if (reportFile.includes('chromium')) return 'chromium';
  if (reportFile.includes('firefox')) return 'firefox';
  if (reportFile.includes('webkit')) return 'webkit';
  return 'unknown';
}

// Run conversion
convertCucumberToAllure();
