
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const targetDir = path.join(__dirname, 'Features', 'Generated');
const files = glob.sync('**/*.feature', { cwd: targetDir });

files.forEach(file => {
    const filePath = path.join(targetDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Skip if it already starts with Feature:
    if (/^\s*Feature:/i.test(content)) {
        return;
    }

    // Extract potential name from the first comment line or file name
    const fileName = path.basename(file, '.feature');
    const featureName = fileName.replace(/-/g, ' ').toUpperCase();

    console.log(`Prepend Feature: to ${file}`);
    const newContent = `Feature: ${featureName}\n\n${content}`;
    fs.writeFileSync(filePath, newContent);
});
