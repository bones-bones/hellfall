#!/usr/bin/env node
/**
 * Detect circular TypeScript imports across workspace packages.
 * Uses madge with each package tsconfig for path alias resolution.
 *
 * Baseline counts in circular-deps.baseline.json allow existing debt while
 * blocking new cycles. Run with --update-baseline after fixing cycles.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import madge from 'madge';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const baselinePath = path.join(__dirname, 'circular-deps.baseline.json');

const packages = [
  'packages/shared',
  'packages/backend',
  'packages/frontend',
  'packages/server',
  'packages/scripts',
];

const updateBaseline = process.argv.includes('--update-baseline');
const verbose = process.argv.includes('--verbose');

/** @type {Record<string, number>} */
const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));

/** @type {Record<string, number>} */
const observed = {};
/** @type {string[]} */
const errors = [];

for (const pkg of packages) {
  const srcDir = path.join(root, pkg, 'src');
  const tsConfig = path.join(root, pkg, 'tsconfig.json');

  const result = await madge(srcDir, {
    fileExtensions: ['ts', 'tsx'],
    tsConfig,
  });

  const cycles = result.circular();
  observed[pkg] = cycles.length;

  if (verbose && cycles.length > 0) {
    console.log(`\n${pkg} (${cycles.length} chain(s)):`);
    cycles.forEach((cycle, index) => {
      console.log(`  ${index + 1}) ${cycle.join(' → ')}`);
    });
  } else if (cycles.length === 0) {
    console.log(`${pkg}: no circular dependencies`);
  } else {
    console.log(`${pkg}: ${cycles.length} circular dependency chain(s)`);
  }
}

if (updateBaseline) {
  const nextBaseline = { ...baseline, ...observed };
  writeFileSync(baselinePath, `${JSON.stringify(nextBaseline, null, 2)}\n`);
  console.log(`\nUpdated ${path.relative(root, baselinePath)}`);
  process.exit(0);
}

for (const pkg of packages) {
  const allowed = baseline[pkg];
  if (allowed === undefined) {
    errors.push(`${pkg}: missing baseline entry in circular-deps.baseline.json`);
    continue;
  }

  const count = observed[pkg];
  if (count > allowed) {
    errors.push(
      `${pkg}: ${count} circular chain(s) found (baseline allows ${allowed}). New cycles were introduced.`
    );
  } else if (count < allowed) {
    errors.push(
      `${pkg}: ${count} circular chain(s) found (baseline allows ${allowed}). Cycles were fixed — run \`yarn check:circular-deps --update-baseline\`.`
    );
  }
}

if (errors.length > 0) {
  console.error('\nCircular dependency check failed:\n');
  for (const error of errors) {
    console.error(`  • ${error}`);
  }
  console.error('\nRe-run with --verbose to print full cycle paths.');
  process.exit(1);
}

console.log('\nCircular dependency check passed (no new cycles).');
process.exit(0);
