import fs from 'node:fs/promises';
import path from 'node:path';

// Change this to match the actual path of your Cucumber JSON file
const RESULTS_PATH = path.join(process.cwd(), 'reports', 'screens-report.json');
const OUTPUT_PATH = path.join(process.cwd(), 'screens-failure-report.md');

async function generateReport() {
    try {
        const data = await fs.readFile(RESULTS_PATH, 'utf8');
        const features = JSON.parse(data);

        const errorMap = new Map();
        let totalFailures = 0;

        // Traverse Features -> Scenarios -> Steps
        for (const feature of features) {
            for (const element of feature.elements) {
                if (element.type !== 'scenario') continue;

                // Find the failed step
                const failedStep = element.steps.find(step => step.result.status === 'failed');

                if (failedStep) {
                    totalFailures++;
                    // Clean the error message to create a "fingerprint"
                    const rawError = failedStep.result.error_message || 'Unknown Error';
                    const shortError = rawError.split('\n')[0].trim();

                    if (!errorMap.has(shortError)) {
                        errorMap.set(shortError, {
                            count: 0,
                            instances: []
                        });
                    }

                    const entry = errorMap.get(shortError);
                    entry.count++;
                    entry.instances.push({
                        scenario: element.name,
                        feature: feature.name,
                        step: failedStep.name
                    });
                }
            }
        }

        if (totalFailures === 0) {
            console.log('✅ No failed steps found in the Cucumber JSON.');
            return;
        }

        // Sort by frequency
        const sortedErrors = [...errorMap.entries()].sort((a, b) => b[1].count - a[1].count);

        // Markdown Generation
        let md = `# 🚩 Test Failure Analysis Report\n\n`;
        md += `**Generated:** ${new Date().toLocaleString()}  \n`;
        md += `**Total Scenarios Failed:** ${totalFailures}\n\n`;

        md += `## 📊 Top Issues Summary\n\n`;
        md += `| Occurrences | Primary Error Message |\n`;
        md += `| :--- | :--- |\n`;
        for (const [msg, data] of sortedErrors) {
            md += `| ${data.count} | \`${msg.replace(/\|/g, '\\|')}\` |\n`;
        }

        md += `\n---\n\n## 🔍 Detailed Failure Breakdown\n\n`;

        for (const [msg, data] of sortedErrors) {
            md += `### ❌ \`${msg}\`\n`;
            md += `**Total Impact:** ${data.count} scenario(s)\n\n`;
            md += `| Feature | Scenario | Failed Step |\n`;
            md += `| :--- | :--- | :--- |\n`;
            for (const inst of data.instances) {
                md += `| ${inst.feature} | ${inst.scenario} | *${inst.step}* |\n`;
            }
            md += `\n`;
        }

        await fs.writeFile(OUTPUT_PATH, md);
        console.log(`🚀 Report created: ${OUTPUT_PATH}`);

    } catch (error) {
        console.error('❌ Critical Error:', error.message);
    }
}

generateReport();