
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const targetDir = path.join(__dirname, 'Features', 'Generated');
const files = glob.sync('**/*.feature', { cwd: targetDir });

files.forEach(file => {
    const filePath = path.join(targetDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Convert `# Feature:` to `Feature:`
    content = content.replace(/^\s*#\s*Feature:/i, 'Feature:');

    // Ensure the structure is correct for the parser
    // If it doesn't start with Feature: but has the As/I/So block, try to fix
    if (!content.trim().startsWith('Feature:')) {
        content = 'Feature: ' + path.basename(file, '.feature').replace(/-/g, ' ').toUpperCase() + '\n\n' + content;
    }

    fs.writeFileSync(filePath, content);
});
