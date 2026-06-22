/**
 * verify-setup.js
 *
 * Verifies the framework structure and per-environment readiness.
 * Run: npm run verify
 */

const fs   = require('fs');
const path = require('path');

const ENVIRONMENTS = ['local', 'stage', 'production'];

console.log('🔍  Verifying framework setup...\n');

// ── Structural checks ─────────────────────────────────────────────────────────
const structureChecks = [
  { name: 'Node.js version',  check: () => process.version },
  { name: 'package.json',     check: () => fs.existsSync('package.json') },
  { name: 'tsconfig.json',    check: () => fs.existsSync('tsconfig.json') },
  { name: 'cucumber.js',      check: () => fs.existsSync('cucumber.js') },
  { name: 'src/config/',      check: () => fs.existsSync('src/config') },
  { name: 'src/pages/',       check: () => fs.existsSync('src/pages') },
  { name: 'src/steps/',       check: () => fs.existsSync('src/steps') },
  { name: 'src/fixtures/',    check: () => fs.existsSync('src/fixtures') },
  { name: 'Features/',        check: () => fs.existsSync('Features') },
  { name: 'scripts/',         check: () => fs.existsSync('scripts') },
  { name: '.env.example',     check: () => fs.existsSync('.env.example') },
];

let passed = 0;
let failed = 0;

structureChecks.forEach(({ name, check }) => {
  try {
    const result = check();
    if (result) {
      console.log(`✅  ${name}: ${result}`);
      passed++;
    } else {
      console.log(`❌  ${name}: not found`);
      failed++;
    }
  } catch (error) {
    console.log(`❌  ${name}: ${error.message}`);
    failed++;
  }
});

// ── Per-environment checks ────────────────────────────────────────────────────
console.log('\n📋  Environment readiness:\n');

ENVIRONMENTS.forEach((env) => {
  const envFile   = path.join(process.cwd(), `.env.${env}`);
  const stateFile = path.join(process.cwd(), `storageState.${env}.json`);

  const hasEnvFile   = fs.existsSync(envFile);
  const hasStateFile = fs.existsSync(stateFile);

  const envStatus   = hasEnvFile   ? '✅' : '❌';
  const stateStatus = hasStateFile ? '✅' : '⚠️ ';

  console.log(`  [${env.toUpperCase().padEnd(10)}]`);
  console.log(`    ${envStatus}  .env.${env}`);
  console.log(`    ${stateStatus}  storageState.${env}.json${hasStateFile ? '' : `  → run: npm run auth:setup:${env}`}`);

  if (hasEnvFile) {
    const content = fs.readFileSync(envFile, 'utf-8');
    const hasUser = content.includes('APP_USERNAME=') && !content.includes('APP_USERNAME=your_username');
    const hasPass = content.includes('APP_PASSWORD=') && !content.includes('APP_PASSWORD=your_password');
    const hasUrl  = content.includes('BASE_URL=');
    console.log(`    ${hasUrl  ? '✅' : '❌'}  BASE_URL configured`);
    console.log(`    ${hasUser ? '✅' : '⚠️ '}  APP_USERNAME configured`);
    console.log(`    ${hasPass ? '✅' : '⚠️ '}  APP_PASSWORD configured`);
  }
  console.log('');
});

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`📊  Structure: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('\n✅  Framework structure verified.\n');
  console.log('Next steps:');
  console.log('  1. Fill in credentials in .env.local / .env.stage / .env.production');
  console.log('  2. Run: npx playwright install');
  console.log('  3. Run: npm run auth:setup:local      (or :stage / :production)');
  console.log('  4. Run: npm run test:local            (or :stage / :production)');
} else {
  console.log('\n❌  Setup verification failed. Fix the errors above before running tests.');
  process.exit(1);
}
