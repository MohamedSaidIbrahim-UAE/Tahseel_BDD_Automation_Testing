/**
 * test-auth-setup.js
 *
 * Validates that auth-setup.ts runs correctly for a given environment and
 * produces the expected storageState.<env>.json file.
 *
 * Usage:
 *   node test-auth-setup.js                  # defaults to TEST_ENV=local
 *   TEST_ENV=stage node test-auth-setup.js
 *   TEST_ENV=production node test-auth-setup.js
 */

const { exec }  = require('child_process');
const path      = require('path');
const fs        = require('fs');

const TEST_ENV  = process.env.TEST_ENV || 'local';
const envFile   = path.join(__dirname, `.env.${TEST_ENV}`);
const statePath = path.join(__dirname, `storageState.${TEST_ENV}.json`);

console.log(`🔐  Testing auth-setup for environment: ${TEST_ENV.toUpperCase()}\n`);

// ── Pre-flight: verify the env file exists and has credentials ────────────────
if (!fs.existsSync(envFile)) {
  console.error(`❌  .env.${TEST_ENV} not found.`);
  console.error(`   Create it from .env.example and set APP_USERNAME / APP_PASSWORD.`);
  process.exit(1);
}

const envContent = fs.readFileSync(envFile, 'utf-8');
if (!envContent.includes('APP_USERNAME=') || !envContent.includes('APP_PASSWORD=')) {
  console.error(`❌  .env.${TEST_ENV} is missing APP_USERNAME or APP_PASSWORD.`);
  process.exit(1);
}

console.log(`✅  .env.${TEST_ENV} found with credentials.`);
console.log(`   Running auth-setup.ts...\n`);

// ── Run the auth setup script ─────────────────────────────────────────────────
const cmd = `npx cross-env TEST_ENV=${TEST_ENV} ts-node scripts/auth-setup.ts`;

exec(cmd, { env: { ...process.env, TEST_ENV } }, (error, stdout, stderr) => {
  if (stdout) console.log(stdout);
  if (stderr) console.error(stderr);

  if (error) {
    console.error(`\n❌  auth-setup.ts failed for [${TEST_ENV.toUpperCase()}].`);
    process.exit(1);
  }

  // ── Verify the output file ──────────────────────────────────────────────────
  if (fs.existsSync(statePath)) {
    const stats = fs.statSync(statePath);
    console.log(`\n✅  storageState.${TEST_ENV}.json created successfully!`);
    console.log(`   Path      : ${statePath}`);
    console.log(`   File size : ${stats.size} bytes`);
    console.log(`\n✅  Auth setup complete for [${TEST_ENV.toUpperCase()}]. Run your tests with:`);
    console.log(`   npm run test:${TEST_ENV}`);
  } else {
    console.error(`\n❌  storageState.${TEST_ENV}.json was not created.`);
    process.exit(1);
  }
});
