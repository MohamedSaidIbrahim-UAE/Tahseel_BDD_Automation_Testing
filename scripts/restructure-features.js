
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const targetDir = path.join(__dirname, 'Features', 'Generated');
const files = glob.sync('**/*.feature', { cwd: targetDir });

files.forEach(file => {
    const filePath = path.join(targetDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove existing Feature line
    content = content.replace(/^\s*Feature:.*\n\n/i, '');

    // Reconstruct with the description block immediately following Feature
    const fileName = path.basename(file, '.feature');
    const featureName = fileName.replace(/-/g, ' ').toUpperCase();
    
    // Find the story block
    const match = content.match(/As a user[\s\S]*?So that[\s\S]*?\n\n/i);
    let newContent = `Feature: ${featureName}\n`;
    
    if (match) {
        newContent += match[0].trim() + '\n\n';
        content = content.replace(match[0], '');
    } else {
        newContent += `  As a user\n  I want to interact with ${featureName}\n  So that I can manage and track data\n\n`;
    }

    newContent += content.trim();

    fs.writeFileSync(filePath, newContent);
});
