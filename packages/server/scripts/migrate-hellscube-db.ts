/**
 * Migrate the full Hellscube-Database.json into Firestore cards/{cardId} documents.
 * Merges JSON base tags with any existing `added` / `removed` overrides into `tags`.
 *
 * Usage: see packages/server/scripts/README.md
 */
import { config } from 'dotenv';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Firestore, type CollectionReference } from '@google-cloud/firestore';
import {
  dedupeOrdered,
  mergeTags,
  normalizeTagList,
  type CardTagOverrides,
} from '../src/lib/cardTagMerge.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../../..');
const DEFAULT_DB_PATH = resolve(
  REPO_ROOT,
  'packages/shared/src/data/Hellscube-Database.json'
);

config({ path: resolve(__dirname, '../.env') });

type HellscubeCard = Record<string, unknown> & { id?: string; tags?: string[] };

function buildFirestoreDoc(
  card: HellscubeCard,
  existing: Record<string, unknown> | undefined
): Record<string, unknown> {
  const baseTags = dedupeOrdered(normalizeTagList(card.tags));
  const overrides: CardTagOverrides = {
    added: normalizeTagList(existing?.added),
    removed: normalizeTagList(existing?.removed),
  };
  const mergedTags = dedupeOrdered(mergeTags(baseTags, overrides));
  return {
    ...card,
    baseTags,
    tags: mergedTags,
    added: overrides.added,
    removed: overrides.removed,
  };
}

function parseArgs(argv: string[]) {
  let dryRun = false;
  let dbPath = DEFAULT_DB_PATH;
  let pruneOrphans = false;
  let reportOnly = false;
  let limit: number | undefined;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--dry-run') dryRun = true;
    else if (arg === '--prune-orphans') pruneOrphans = true;
    else if (arg === '--report' || arg === '--mode' && argv[i + 1] === 'report') {
      if (arg === '--mode') i++;
      reportOnly = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else if (arg === '--db-path' && argv[i + 1]) {
      dbPath = resolve(argv[++i]);
    } else if (arg === '--limit' && argv[i + 1]) {
      limit = Number(argv[++i]);
      if (!Number.isFinite(limit) || limit < 1) {
        console.error('--limit must be a positive number');
        process.exit(1);
      }
    } else if (arg.startsWith('--')) {
      console.error(`Unknown flag: ${arg}`);
      process.exit(1);
    }
  }

  return { dryRun, dbPath, pruneOrphans, reportOnly, limit };
}

function printHelp() {
  console.log(`migrate-hellscube-db — upload full Hellscube-Database.json to Firestore

Usage:
  yarn migrate-hellscube-db [options]

Writes each card to Firestore cards/{id} with the full JSON object. The \`tags\`
field is merged from JSON base tags plus any existing added/removed overrides.
baseTags (JSON tags), merged tags, and added/removed are written on each document.

Options:
  --report          Stats only (no writes)
  --dry-run         Show summary without writing
  --prune-orphans   Delete Firestore docs whose id is not in the JSON
  --db-path <path>  Path to Hellscube-Database.json
  --limit <n>       Migrate only the first n cards (testing)

Env (packages/server/.env):
  GOOGLE_APPLICATION_CREDENTIALS
  FIRESTORE_HELLSCUBE_DATABASE_ID (default: hellscube)
  FIRESTORE_CARDS_COLLECTION (default: cards)
`);
}

async function loadExistingDocs(
  collection: CollectionReference
): Promise<Map<string, Record<string, unknown>>> {
  const map = new Map<string, Record<string, unknown>>();
  const snapshot = await collection.get();
  for (const doc of snapshot.docs) {
    map.set(doc.id, doc.data());
  }
  return map;
}

async function main() {
  const { dryRun, dbPath, pruneOrphans, reportOnly, limit } = parseArgs(
    process.argv.slice(2)
  );

  if (!reportOnly && !dryRun && !process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim()) {
    console.error(
      'GOOGLE_APPLICATION_CREDENTIALS is required (path to service account JSON).'
    );
    process.exit(1);
  }

  const databaseId =
    process.env.FIRESTORE_HELLSCUBE_DATABASE_ID?.trim() || 'hellscube';
  const collectionName =
    process.env.FIRESTORE_CARDS_COLLECTION?.trim() || 'cards';

  console.log(`Database: ${databaseId}`);
  console.log(`Collection: ${collectionName}`);
  console.log(`JSON: ${dbPath}`);
  if (reportOnly) console.log('Mode: report');
  else if (dryRun) console.log('Mode: migrate (dry-run)');
  else console.log('Mode: migrate');

  const raw = readFileSync(dbPath, 'utf-8');
  const parsed = JSON.parse(raw) as { data?: HellscubeCard[] };
  if (!Array.isArray(parsed.data)) {
    console.error('Expected Hellscube-Database.json shape: { "data": [ ... ] }');
    process.exit(1);
  }

  let cards = parsed.data.filter(
    (c): c is HellscubeCard & { id: string } =>
      typeof c.id === 'string' && c.id.length > 0 && c.id.length <= 200
  );

  const skippedInvalidId = parsed.data.length - cards.length;
  if (skippedInvalidId > 0) {
    console.warn(`Skipped ${skippedInvalidId} cards with missing/invalid id`);
  }

  if (limit != null) {
    cards = cards.slice(0, limit);
  }

  const allJsonIds = new Set(
    parsed.data
      .filter(
        (c): c is HellscubeCard & { id: string } =>
          typeof c.id === 'string' && c.id.length > 0 && c.id.length <= 200
      )
      .map(c => c.id)
  );

  console.log(`Cards to migrate: ${cards.length} (of ${allJsonIds.size} in JSON)`);

  const db = new Firestore({ databaseId });
  const collection = db.collection(collectionName);
  const existingById = await loadExistingDocs(collection);
  console.log(`Existing Firestore docs: ${existingById.size}`);

  const stats = {
    writes: 0,
    tagsMergedFromOverrides: 0,
    pruneDeletes: 0,
    jsonWithTags: 0,
  };

  for (const card of cards) {
    if ((card.tags?.length ?? 0) > 0) stats.jsonWithTags++;
    const existing = existingById.get(card.id);
    const hadOverrides =
      normalizeTagList(existing?.added).length > 0 ||
      normalizeTagList(existing?.removed).length > 0;
    const doc = buildFirestoreDoc(card, existing);
    const jsonOnlyTags = dedupeOrdered(normalizeTagList(card.tags)); // same as baseTags
    const mergedTags = doc.tags as string[];
    if (
      hadOverrides &&
      JSON.stringify(mergedTags) !== JSON.stringify(jsonOnlyTags)
    ) {
      stats.tagsMergedFromOverrides++;
    }
    if (!reportOnly) stats.writes++;
  }

  if (pruneOrphans) {
    for (const id of existingById.keys()) {
      if (!allJsonIds.has(id)) stats.pruneDeletes++;
    }
  }

  console.log('\n--- Summary ---');
  console.log(`JSON cards: ${cards.length}`);
  console.log(`JSON cards with tags: ${stats.jsonWithTags}`);
  console.log(`Firestore docs (before): ${existingById.size}`);
  console.log(`Cards with merged tags (overrides applied): ${stats.tagsMergedFromOverrides}`);

  const orphanCount = [...existingById.keys()].filter(id => !allJsonIds.has(id)).length;
  console.log(`Firestore orphans (id not in JSON): ${orphanCount}`);

  if (reportOnly) return;

  console.log(`Docs to write: ${stats.writes}`);
  if (pruneOrphans) {
    console.log(`Orphan docs to delete: ${stats.pruneDeletes}`);
  }

  if (dryRun) {
    console.log('\nDry run — no writes were made.');
    return;
  }

  const bulkWriter = db.bulkWriter();
  bulkWriter.onWriteError(error => {
    if (error.failedAttempts < 5) return true;
    return false;
  });

  for (const card of cards) {
    const existing = existingById.get(card.id);
    const doc = buildFirestoreDoc(card, existing);
    bulkWriter.set(collection.doc(card.id), doc, { merge: true });
  }

  if (pruneOrphans) {
    for (const id of existingById.keys()) {
      if (!allJsonIds.has(id)) {
        bulkWriter.delete(collection.doc(id));
      }
    }
  }

  await bulkWriter.close();
  console.log('\nMigration complete.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
