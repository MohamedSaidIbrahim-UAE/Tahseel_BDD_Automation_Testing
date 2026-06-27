
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const targetDir = path.join(__dirname, '..', 'src', 'pages', 'generated');
const files = glob.sync('*.page.ts', { cwd: targetDir });

const DRY_RUN = false; 

files.forEach(file => {
    if (file === 'base.page.ts' || file === 'base-list.page.ts' || file === 'base-form.page.ts') return;
    
    const filePath = path.join(targetDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Skip if already refactored
    if (content.includes('extends BaseListPage') || content.includes('extends BaseFormPage')) {
        return;
    }

    // Determine base class
    const isList = content.includes('dataTable') || content.includes('searchInput') || content.includes('tableRows');
    const baseClass = isList ? 'BaseListPage' : 'BaseFormPage';
    const importPath = isList ? '../base-list.page' : '../base-form.page';

    console.log(`Analyzing ${file}: Identified as ${baseClass}`);

    // Update Import and Class Declaration
    let newContent = content
        .replace(/import \{ BasePage \} from '..\/base.page';/, `import { ${baseClass} } from '${importPath}';`)
        .replace(/export class (.*) extends BasePage/, `export class $1 extends ${baseClass}`);

    // Robust Method Mappings
    if (isList) {
        newContent = newContent
            .replace(/await this\.fill\(selector, value\);/g, 'await super.fillFilterInput(selector, value);')
            .replace(/await this\.clickSave\(\);/g, 'await super.clickActionSearch();')
            .replace(/await this\.fill\(this\.selectors\.searchInput as string, term\);/g, 'await super.fillGridSearchImpl(term);')
            .replace(/await this\.verifyTableHasRecords\(\);/g, 'await super.verifyTableHasRecords();')
            .replace(/await this\.getLocatorCount\(this\.selectors\.tableRows\);/g, 'return await this.getLocatorCount(this.selectors.tableRows);');
    } else {
        newContent = newContent
            .replace(/await this\.fill\(selector, value\);/g, 'await super.fillField(selector, value);')
            .replace(/await this\.clickSave\(\);/g, 'await super.submitForm(this.selectors.submitButton);');
    }
    
    if (DRY_RUN) {
        console.log(`[DRY RUN] ${file}: Mapped to ${baseClass}`);
    } else {
        fs.writeFileSync(filePath, newContent);
        console.log(`Refactored: ${file} to ${baseClass}`);
    }
});
