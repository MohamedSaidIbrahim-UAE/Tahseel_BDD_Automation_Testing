
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const targetDir = path.join(__dirname, 'Features', 'Generated');
const files = glob.sync('**/*.feature', { cwd: targetDir });

files.forEach(file => {
    const filePath = path.join(targetDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove existing Feature line
    content = content.replace(/^\s*Feature:.*\n/i, '');

    const fileName = path.basename(file, '.feature');
    const featureName = fileName.replace(/-/g, ' ').toUpperCase();
    
    // Split content into story block and scenarios
    const parts = content.split(/Scenario:/i);
    let storyBlock = parts[0].trim();
    let scenarios = parts.slice(1).map(s => 'Scenario:' + s).join('\n\n');

    // Create compliant structure
    let newContent = `Feature: ${featureName}\n\n`;
    
    // Put story block as description, ensuring it's not empty
    if (storyBlock) {
        newContent += storyBlock + '\n\n';
    } else {
        newContent += `  As a user\n  I want to interact with ${featureName}\n  So that I can manage and track data\n\n`;
    }

    newContent += scenarios.trim();

    fs.writeFileSync(filePath, newContent);
});
