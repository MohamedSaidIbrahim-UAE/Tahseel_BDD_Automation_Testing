const fs = require('fs');
const path = require('path');

const ALLURE_RESULTS_DIR = 'allure-results';
const DASHBOARD_FILE = path.join(ALLURE_RESULTS_DIR, 'dashboard.html');

function generateDashboard() {
  console.log('📊 Generating enhanced dashboard...');

  const results = loadAllureResults();
  const summary = calculateSummary(results);
  const html = generateDashboardHTML(summary);

  fs.writeFileSync(DASHBOARD_FILE, html);
  console.log(`✅ Dashboard generated: ${DASHBOARD_FILE}`);
}

function loadAllureResults() {
  const files = fs.readdirSync(ALLURE_RESULTS_DIR)
    .filter(f => f.endsWith('-result.json'));
  
  return files.map(f => {
    const content = fs.readFileSync(path.join(ALLURE_RESULTS_DIR, f), 'utf8');
    return JSON.parse(content);
  });
}

function calculateSummary(results) {
  const total = results.length;
  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(2) : 0;

  return { total, passed, failed, skipped, passRate };
}

function generateDashboardHTML(summary) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tahseel Manage Portal - Test Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { color: #333; margin-bottom: 30px; text-align: center; }
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .summary-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
    .summary-card.total { border-left: 4px solid #2196F3; }
    .summary-card.passed { border-left: 4px solid #4CAF50; }
    .summary-card.failed { border-left: 4px solid #f44336; }
    .summary-card.skipped { border-left: 4px solid #FF9800; }
    .card-value { font-size: 48px; font-weight: bold; margin-bottom: 10px; }
    .card-label { font-size: 14px; color: #666; text-transform: uppercase; }
    .card-percentage { font-size: 24px; color: #4CAF50; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 Tahseel Manage Portal - Test Execution Dashboard</h1>
    <div class="summary-grid">
      <div class="summary-card total">
        <div class="card-value">${summary.total}</div>
        <div class="card-label">Total Tests</div>
      </div>
      <div class="summary-card passed">
        <div class="card-value">${summary.passed}</div>
        <div class="card-label">Passed</div>
        <div class="card-percentage">${summary.passRate}%</div>
      </div>
      <div class="summary-card failed">
        <div class="card-value">${summary.failed}</div>
        <div class="card-label">Failed</div>
      </div>
      <div class="summary-card skipped">
        <div class="card-value">${summary.skipped}</div>
        <div class="card-label">Skipped</div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

generateDashboard();
