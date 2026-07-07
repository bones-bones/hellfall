#!/usr/bin/env node
/**
 * Detect circular TypeScript imports across workspace packages.
 * Uses madge with each package tsconfig for path alias resolution.
 *
 * Circular dependencies can be selectively ignored by adding a comment:
 * // @circular-ignore
 * or
 * /* @circular-ignore *\/
 * above the import statement that would cause the cycle.
 */
// import { readFileSync, /* writeFileSync */ } from 'fs';
// import path from 'node:path';
// import { fileURLToPath } from 'node:url';

import madge from 'madge';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// const baselinePath = path.join(__dirname, 'circular-deps.baseline.json');

const scriptDir = __dirname;
const srcDir = path.dirname(scriptDir); // src/
const packagesDir = path.dirname(srcDir); // packages/
const root = path.dirname(packagesDir); // root (where package.json with workspaces is)

console.log(`Monorepo root detected: ${root}`);

// Read package.json to find workspace packages
const rootPackageJson = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));

let workspacePackages: string[] = [];
if (rootPackageJson.workspaces) {
  if (Array.isArray(rootPackageJson.workspaces)) {
    workspacePackages = rootPackageJson.workspaces;
  } else if (rootPackageJson.workspaces.packages) {
    workspacePackages = rootPackageJson.workspaces.packages;
  }
}
const defaultPackages = [
  'packages/shared',
  // 'packages/backend',
  // 'packages/frontend',
  // 'packages/server',
  // 'packages/scripts',
];
const intPackages =
  // workspacePackages.length > 0
  // ? workspacePackages
  // :
  defaultPackages;

const packages = intPackages.filter(pkg => {
  const pkgPath = path.join(root, pkg);
  const exists = existsSync(pkgPath);
  if (!exists) {
    console.warn(`Warning: Package ${pkg} not found at ${pkgPath}`);
  }
  return exists;
});

const verbose = process.argv.includes('--verbose');

const errors: string[] = [];

const escapeRegExp = (str: string) =>
  str
    .split('/')
    .at(-1)!
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/(\\\.tsx?)/, '($1)?');

const findLastImport = (lines: string[], start: number) => {
  for (let i = start; i >= 0; i--) {
    if (lines[i].startsWith('import ')) {
      return i;
    }
  }
  return -1;
};
/**
 * Check if a file has a circular-ignore comment for a specific import
 */
const hasIgnoreComment = (filePath: string, importPath: string) => {
  try {
    const content = readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    // Find the line containing the import
    const importEndPattern = new RegExp(`from\\s+.*${escapeRegExp(importPath)}['"]`);
    const importEndIndex = lines.findIndex(line => importEndPattern.test(line));

    if (importEndIndex === -1) return false;
    const importStartIndex = findLastImport(lines, importEndIndex);
    if (importStartIndex === -1) return false;

    // Check the lines in and before the import for the ignore comment
    for (let i = importEndIndex; i >= importStartIndex; i--) {
      const line = lines[i].trim();
      if (line.includes('@circular-ignore')) {
        return true;
      }
    }
    if (
      lines[importStartIndex - 1]?.includes('@circular-ignore') &&
      !importEndPattern.test(lines[importStartIndex - 1])
    ) {
      return true;
    }
    return false;
  } catch {
    if (verbose) {
      console.warn(`Warning: Could not read ${filePath} for ignore comment check`);
    }
    return false;
  }
};

/**
 * Filter out circular dependencies that have ignore comments
 */
const filterIgnoredCycles = (cycles: string[][], srcDir: string) => {
  for (let i = cycles.length - 1; i >= 0; i--) {
    const cycle = cycles[i];

    // Check each edge in the cycle
    for (let j = 0; j < cycle.length; j++) {
      const fromFile = cycle[j];
      const toFile = cycle[(j + 1) % cycle.length];

      // Resolve full file paths
      const fromPath = path.join(srcDir, fromFile);

      // Check if the import from -> to has an ignore comment
      if (hasIgnoreComment(fromPath, toFile)) {
        if (verbose) {
          console.log(`  ⚠️ Ignoring edge: ${fromFile} → ${toFile} (has @circular-ignore)`);
        }
        cycles.splice(i, 1);
        break;
      }
    }
  }
};

console.log(`\nChecking ${packages.length} packages...`);
for (const pkg of packages) {
  const srcDir = path.join(root, pkg, 'src');
  const tsConfig = path.join(root, pkg, 'tsconfig.json');

  if (!existsSync(srcDir)) {
    console.log(`  ⚠️ Skipping ${pkg}: src directory not found`);
    continue;
  }
  if (!existsSync(tsConfig)) {
    console.log(`  ⚠️ Skipping ${pkg}: tsconfig.json not found`);
    continue;
  }
  console.log(`\nChecking ${pkg}...`);
  try {
    const result = await madge(srcDir, {
      fileExtensions: ['ts', 'tsx'],
      tsConfig,
    });
    const cycles = result.circular();
    filterIgnoredCycles(cycles, srcDir);
    if (cycles.length > 0) {
      if (verbose) {
        console.log(`\n${pkg} (${cycles.length} chain(s)):`);
        cycles.forEach((cycle, index) => {
          console.log(`  ${index + 1}) ${cycle.join(' → ')}`);
        });
      } else {
        console.log(`${pkg}: no circular dependencies`);
      }
      errors.push(`${pkg}: ${cycles.length} circular dependency chain(s) found`);
      if (!verbose) {
        errors.push(`  Run with --verbose to see full cycle paths`);
      }
    } else {
      console.log(`${pkg}: ${cycles.length} circular dependency chain(s)`);
    }
  } catch (error) {
    console.error(`  ❌ Error checking ${pkg}:`, (error as Error)?.message);
    errors.push(`${pkg}: Error during circular dependency check`);
  }
}
if (errors.length > 0) {
  console.error('\n❌ Circular dependency check failed:\n');
  for (const error of errors) {
    console.error(`  • ${error}`);
  }
  console.error('\nTo ignore a specific circular dependency, add this comment above the import:');
  console.error('  // @circular-ignore');
  console.error('  import { something } from "./path";');
  console.error('\nOr use: /* @circular-ignore */ on the same line');
  process.exit(1);
}
console.log('\n✅ Circular dependency check passed (no unignored cycles).');
process.exit(0);
