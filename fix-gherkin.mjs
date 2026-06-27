#!/usr/bin/env node
import { Parser, AstBuilder, GherkinClassicTokenMatcher } from '@cucumber/gherkin';
import { pretty } from '@cucumber/gherkin-utils';
import { IdGenerator } from '@cucumber/messages';
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

// CLI arguments
const args = process.argv.slice(2);
const folder = args.find(a => !a.startsWith('--')) || '.';
const write = args.includes('--write');
const check = args.includes('--check');
if (check && write) {
  console.error('Cannot use both --check and --write. Choose one.');
  process.exit(1);
}

/**
 * Attempt to fix a file that is missing the 'Feature:' line.
 * Respects a leading '# language:' header if present.
 */
function insertMissingFeatureLine(content) {
  const lines = content.split('\n');
  let insertAt = 0;

  // Find the first non-blank line
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed !== '') {
      // If it's a language header, insert right after it
      if (/^#\s*language\s*:/i.test(trimmed)) {
        insertAt = i + 1;
      }
      break;
    }
  }

  // Insert a generic Feature line
  lines.splice(insertAt, 0, 'Feature: Generated Feature');
  return lines.join('\n');
}

/**
 * Parse and pretty-print a .feature file.
 * Returns the formatted string, or null on failure.
 */
async function formatFeature(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const newId = IdGenerator.uuid();

  const tryParse = (text) => {
    const builder = new AstBuilder(newId);
    const matcher = new GherkinClassicTokenMatcher('en');
    const parser = new Parser(builder, matcher);
    return parser.parse(text);
  };

  let document;
  try {
    document = tryParse(content);
  } catch (firstError) {
    // Check if the error is because of a missing Feature: line
    if (firstError.message.includes('expected: #FeatureLine')) {
      console.warn(`🔧 Missing Feature: line in ${filePath} – inserting placeholder.`);
      const fixedContent = insertMissingFeatureLine(content);
      try {
        document = tryParse(fixedContent);
      } catch (secondError) {
        console.error(`❌ Could not fix ${filePath}: ${secondError.message}`);
        return null;
      }
    } else {
      console.error(`❌ Parse error in ${filePath}: ${firstError.message}`);
      return null;
    }
  }

  if (!document?.feature) {
    console.warn(`⚠️  No feature found in ${filePath}, skipping.`);
    return null;
  }

  return pretty(document, 'gherkin');
}

async function processFile(filePath) {
  console.log(`🔍 Processing: ${filePath}`);
  const formatted = await formatFeature(filePath);
  if (formatted === null) return false;

  const original = await fs.readFile(filePath, 'utf-8');

  if (check) {
    if (original === formatted) {
      console.log(`  ✅ Already clean`);
    } else {
      console.log(`  ❌ Needs formatting`);
    }
    return original === formatted;
  }

  if (write) {
    await fs.writeFile(filePath, formatted, 'utf-8');
    console.log(`  ✍️  Written`);
  } else {
    if (original !== formatted) {
      console.log(`  ℹ️  Would be formatted (use --write to apply)`);
    } else {
      console.log(`  ✅ Already clean`);
    }
  }
  return true;
}

async function main() {
  try {
    await fs.access(folder);
  } catch {
    console.error(`Folder does not exist: ${folder}`);
    process.exit(1);
  }

  const pattern = path.join(folder, '**', '*.feature').replace(/\\/g, '/');
  const files = await glob(pattern, { nodir: true, ignore: 'node_modules/**' });

  if (files.length === 0) {
    console.log('No .feature files found.');
    return;
  }

  console.log(`Found ${files.length} .feature file(s)\n`);

  let errorCount = 0;
  for (const file of files) {
    const ok = await processFile(file);
    if (!ok) errorCount++;
  }

  console.log(`\nDone. ${errorCount ? `Errors in ${errorCount} file(s).` : 'All files processed.'}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});