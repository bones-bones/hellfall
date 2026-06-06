/**
 * Export Firestore hellscube / cards collection to JSON (faithful snapshot).
 *
 * Usage: see packages/scripts/README.md
 */
import { exportHellscubeCards } from './lib/exportCards.js';
import { config } from 'dotenv';
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
// import { exportHellscubeCards } from '@hellfall/shared/export/cards';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../../..');
const DEFAULT_OUT_PATH = resolve(
  REPO_ROOT,
  'packages/shared/src/data/hellscube-firestore-export.json'
);

config({ path: resolve(__dirname, '../.env') });

function parseArgs(argv: string[]) {
  let outPath = DEFAULT_OUT_PATH;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else if (arg === '--out' && argv[i + 1]) {
      outPath = resolve(argv[++i]);
    } else if (arg.startsWith('--')) {
      console.error(`Unknown flag: ${arg}`);
      process.exit(1);
    }
  }

  return { outPath };
}

function printHelp() {
  console.log(`export-hellscube-db — download Hellscube cards from Firestore

Usage:
  yarn export-hellscube-db [options]

Exports every document in the cards collection as JSON (values as stored,
including tag-merge fields and Firestore doc ids in _docId).

Options:
  --out <path>  Output file (default: packages/shared/src/data/hellscube-firestore-export.json)

Env (packages/scripts/.env):
  GOOGLE_APPLICATION_CREDENTIALS
  FIRESTORE_DATABASE_ID       (default: hellscube)
  FIRESTORE_CARDS_COLLECTION  (default: cards)
`);
}

async function main() {
  const { outPath } = parseArgs(process.argv.slice(2));

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim()) {
    console.error('GOOGLE_APPLICATION_CREDENTIALS is required (path to service account JSON).');
    process.exit(1);
  }

  console.log('Exporting Firestore cards...');
  const payload = await exportHellscubeCards();

  console.log(`Database: ${payload.databaseId}`);
  console.log(`Collection: ${payload.collection}`);
  console.log(`Documents: ${payload.data.length}`);

  writeFileSync(outPath, JSON.stringify(payload, null, '\t'), 'utf-8');
  console.log(`Wrote ${outPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
