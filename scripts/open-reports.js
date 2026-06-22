const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const reportType = process.argv[2] || 'dashboard';

const reports = {
  dashboard: path.join('allure-results', 'dashboard.html'),
  allure: path.join('allure-report', 'index.html'),
  cucumber: 'cucumber-report.html'
};

const reportPath = reports[reportType];

if (!reportPath || !fs.existsSync(reportPath)) {
  console.error(`❌ Report not found: ${reportPath}`);
  process.exit(1);
}

const absolutePath = path.resolve(reportPath);
const command = process.platform === 'win32' ? `start "" "${absolutePath}"` :
                process.platform === 'darwin' ? `open "${absolutePath}"` :
                `xdg-open "${absolutePath}"`;

exec(command, (error) => {
  if (error) {
    console.error(`❌ Failed to open report: ${error.message}`);
    process.exit(1);
  }
  console.log(`✅ Opened ${reportType} report: ${absolutePath}`);
});
