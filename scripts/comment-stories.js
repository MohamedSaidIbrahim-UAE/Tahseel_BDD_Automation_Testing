
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const targetDir = path.join(__dirname, 'Features', 'Generated');
const files = glob.sync('**/*.feature', { cwd: targetDir });

files.forEach(file => {
    const filePath = path.join(targetDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Find the story block
    const storyMatch = content.match(/As a user[\s\S]*?So that[\s\S]*?\n\n/i);
    
    if (storyMatch) {
        let storyBlock = storyMatch[0].trim();
        let commentBlock = storyBlock.split('\n').map(line => '# ' + line).join('\n');
        
        content = content.replace(storyMatch[0], commentBlock + '\n\n');
        fs.writeFileSync(filePath, content);
    }
});
