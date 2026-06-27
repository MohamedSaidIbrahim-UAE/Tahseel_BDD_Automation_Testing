
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const targetDir = path.join(__dirname, 'src', 'pages', 'generated');
const files = glob.sync('*.page.ts', { cwd: targetDir });

files.forEach(file => {
    if (file === 'daily-deposit-for-business-service-centers.page.ts' || file === 'inquire-transactions.page.ts') return;
    
    const filePath = path.join(targetDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Determine base class based on content
    const isList = content.includes('dataTable') || content.includes('searchInput');
    const baseClass = isList ? 'BaseListPage' : 'BaseFormPage';
    const importPath = isList ? '../base-list.page' : '../base-form.page';

    // Update Import
    content = content.replace(/import \{ BasePage \} from '..\/base.page';/, `import { ${baseClass} } from '${importPath}';`);
    
    // Update Class Declaration
    content = content.replace(/export class (.*) extends BasePage/, `export class $1 extends ${baseClass}`);

    // Update Methods (Simplified heuristic)
    if (isList) {
        content = content.replace(/await this.fill\(selector, value\);/g, 'await this.fillFilterInput(selector, value);');
        content = content.replace(/await this.clickSave\(\);/g, 'await this.clickActionSearch();');
        content = content.replace(/await this.fill\(this.selectors.searchInput as string, term\);/g, 'await this.fillGridSearchImpl(term);');
        content = content.replace(/await this.expectElementVisible\(this.selectors.errorMessage\);/g, 'await this.expectElementVisible(this.selectors.errorMessage);');
    } else {
        content = content.replace(/await this.fill\(selector, value\);/g, 'await super.fillField(selector, value);');
        content = content.replace(/await this.clickSave\(\);/g, 'await super.submitForm(this.selectors.submitButton);');
    }

    fs.writeFileSync(filePath, content);
    console.log(`Refactored: ${file} to ${baseClass}`);
});
