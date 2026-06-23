# Page Audit Configuration and Metadata

This directory contains the parsed page audit data and configuration for code generation.

## Files

### `page-audit-metadata.json`
**Size**: ~1.2 MB  
**Format**: JSON  
**Contains**: Complete module metadata for all 204 modules

**Structure**:
```json
{
  "totalModules": 204,
  "modules": [
    {
      "moduleName": "Module Name",
      "url": "...",
      "selectors": {...},
      "elements": {...},
      "interactions": [...],
      "validationPoints": [...],
      ...
    }
  ],
  "modulesByCategory": {...},
  "stats": {...},
  "gaps": {...}
}
```

**Usage in Code**:
```typescript
import metadata from './page-audit-metadata.json';

// Access a specific module
const module = metadata.modules.find(m => m.moduleName === 'Module Name');

// Generate POM from module
const pageClass = generatePageClass(module);
```

### `page-audit-report.md`
**Format**: Markdown  
**Contains**: Human-readable summary of parsing results

**Sections**:
- Summary statistics
- Module statistics
- Categories breakdown
- Issues and gaps

### `PARSE_RESULTS.md`
**Format**: Markdown  
**Contains**: Detailed parsing execution report

**Sections**:
- Executive summary
- Task completion status
- Database structure
- Selector extraction results
- Module categories
- Quality metrics
- Next steps

## Module Metadata Fields

### Basic Info
- `moduleName`: String - Module identifier
- `url`: String - Page URL
- `timestamp`: String - ISO timestamp of audit

### Selectors
- `selectors`: Map<string, string[]>
  - Key: Element identifier (e.g., "input_0", "button_0", "field_Email")
  - Value: Array of selector strategies for the element

### Elements
- `elements.inputs`: AuditElement[] - Form inputs and search fields
- `elements.buttons`: ActionButton[] - Clickable buttons
- `elements.formFields`: FormField[] - Form field definitions
- `elements.tables`: TableInfo | null - Table structure

### Interaction Types
- `interactions`: string[]
  - Examples: "search", "input", "click", "add_new", "export", "table_navigation"
  - Used to determine which step definitions to generate

### Validation Points
- `validationPoints`: string[]
  - Examples: "field_required: Email", "table_column: Status"
  - Used to determine which assertions to generate

### Feature Flags
- `hasAddNew`: boolean - Has "Add New" button
- `hasExport`: boolean - Has export functionality
- `hasColumnChooser`: boolean - Has column chooser
- `hasSearch`: boolean - Has search/filter

## Statistics

From the parsed audit data:
- **Total Modules**: 204
- **Modules with Tables**: 204 (100%)
- **Modules with Forms**: 204 (100%)
- **Modules with Search**: 66 (32.4%)
- **Modules with Export**: 65 (31.9%)

## Categories

All modules are categorized under:
- **ManagePortal**: 204 modules

Subcategories (from URL patterns):
- Financial Reports
- Refund Management
- Business Intelligence
- Settlement/Deposits
- Help Desk
- Transactions
- User Management
- System Forms

## Using the Metadata

### For Code Generation

1. **Feature File Generation**
   ```typescript
   const module = getModuleMetadata('Module Name');
   const feature = generateFeatureFile(module);
   // Creates: Features/module-name.feature
   ```

2. **POM Class Generation**
   ```typescript
   const pomClass = generatePageClass(module);
   // Creates: src/pages/module-name.page.ts
   // Includes all selectors from module.selectors
   ```

3. **Step Definition Generation**
   ```typescript
   const steps = generateStepDefinitions(module);
   // Creates: src/steps/module-name.steps.ts
   // Includes steps for all module.interactions
   ```

### For Selector Strategy

```typescript
// Get selector strategies for an element
const selectorStrategies = module.selectors.get('input_0');
// Returns: ['.css-class', '[aria-label="..."]', 'placeholder']

// Try each strategy in order
for (const selector of selectorStrategies) {
  try {
    const element = page.locator(selector);
    if (await element.isVisible()) {
      return element; // Use this selector
    }
  } catch (e) {
    // Try next strategy
  }
}
```

### For Test Data Generation

```typescript
// Determine what kind of test data is needed
const module = getModuleMetadata('Module Name');

// If module has forms, generate form test data
if (module.elements.formFields.length > 0) {
  const testData = generateFormData(module.elements.formFields);
}

// If module has tables, generate table test data
if (module.elements.tables) {
  const rows = generateTableRows(module.elements.tables.columns);
}
```

## Query Examples

### Find all modules with search capability
```typescript
const searchableModules = metadata.modules.filter(m => m.hasSearch);
// Result: 66 modules
```

### Find all export-capable modules
```typescript
const exportModules = metadata.modules.filter(m => m.hasExport);
// Result: 65 modules
```

### Find modules by interaction type
```typescript
const formModules = metadata.modules.filter(m => 
  m.interactions.includes('form_fill')
);
// Result: 204 modules
```

### Find modules with multiple tables
```typescript
const complexModules = metadata.modules.filter(m => 
  m.elements.tables && m.elements.tables.columns.length > 5
);
```

### Get all form fields across all modules
```typescript
const allFields = metadata.modules.flatMap(m => 
  m.elements.formFields.map(f => f.label)
);
```

## Type Definitions

See `src/types/audit-types.ts` for complete TypeScript definitions:
- `AuditElement`
- `ModuleMetadata`
- `ModuleDatabase`
- `InteractionPattern`
- `ValidationPoint`
- `ModuleGenerationMetadata`

## Next Steps

1. Use metadata for feature file generation (Phase 3)
2. Use metadata for POM class generation (Phase 3)
3. Use metadata for step definition generation (Phase 3)
4. Use metadata for selector validation (Phase 4)

## Maintenance

To re-parse the audit data:

```bash
npx ts-node src/scripts/parse-page-audit.ts page-audit-results.json
```

This will regenerate:
- `page-audit-metadata.json`
- `page-audit-report.md`

Existing type definitions (`audit-types.ts`) will remain unchanged.
