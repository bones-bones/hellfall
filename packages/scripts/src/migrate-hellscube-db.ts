/**
 * Migrate Hellscube-Database.json into Firestore `hellscube` / `cards/{id}`.
 *
 * Each doc gets the full card JSON plus tag-merge fields:
 *   baseTags  — JSON tags at migrate time
 *   added     — contributor overrides (preserved across re-runs)
 *   removed   — contributor overrides (preserved across re-runs)
 *   tags      — merge(baseTags, { added, removed })
 *
 * Rerunnable: card fields + baseTags refresh from JSON; overrides survive via merge.
 *
 * Usage: see packages/scripts/README.md
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
} from '@hellfall/shared/cardTags/cardTagMerge.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../../..');
const DEFAULT_DB_PATH = resolve(REPO_ROOT, 'packages/shared/src/data/Hellscube-Database.json');

config({ path: resolve(__dirname, '../.env') });

type HellscubeCard = Record<string, unknown> & {
  id?: string;
  token_id?: string;
  isActualToken?: boolean;
  tags?: string[];
};

/** Firestore doc ID for a card: tokens use `token-<token_id>`, others use `id`. */
function firestoreDocId(card: HellscubeCard): string | undefined {
  if (card.isActualToken) {
    return typeof card.token_id === 'string' && card.token_id
      ? `token-${card.token_id}`
      : undefined;
  }
  return typeof card.id === 'string' && card.id ? card.id : undefined;
}

function isValidFirestoreDocId(id: string): boolean {
  if (!id || id.length > 200) return false;
  if (id.includes('/')) return false;
  if (id === '.' || id === '..') return false;
  if (/^__.*__$/.test(id)) return false;
  return true;
}

/** Firestore forbids nested arrays — stringify any array-of-arrays fields. */
function sanitizeForFirestore(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value) && value.some(v => Array.isArray(v))) {
      out[key] = JSON.stringify(value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

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
  return sanitizeForFirestore({
    ...card,
    baseTags,
    tags: mergedTags,
    added: overrides.added,
    removed: overrides.removed,
  });
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
    else if (arg === '--report' || (arg === '--mode' && argv[i + 1] === 'report')) {
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
  console.log(`migrate-hellscube-db — upload Hellscube-Database.json to Firestore

Usage:
  yarn migrate-hellscube-db [options]

Writes each card to Firestore cards/{id} with the full JSON object. Tag fields
(baseTags, added, removed, tags) are merged so contributor overrides survive.

Options:
  --report          Stats only (no writes)
  --dry-run         Show summary without writing
  --prune-orphans   Delete Firestore docs whose id is not in the JSON
  --db-path <path>  Path to Hellscube-Database.json
  --limit <n>       Migrate only the first n cards (testing)

Env (packages/scripts/.env):
  GOOGLE_APPLICATION_CREDENTIALS
  FIRESTORE_DATABASE_ID       (default: hellscube)
  FIRESTORE_CARDS_COLLECTION  (default: cards)
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
  const { dryRun, dbPath, pruneOrphans, reportOnly, limit } = parseArgs(process.argv.slice(2));

  if (!reportOnly && !dryRun && !process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim()) {
    console.error('GOOGLE_APPLICATION_CREDENTIALS is required (path to service account JSON).');
    process.exit(1);
  }

  const databaseId = process.env.FIRESTORE_DATABASE_ID?.trim() || 'hellscube';
  const collectionName = process.env.FIRESTORE_CARDS_COLLECTION?.trim() || 'cards';

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

  let cards = parsed.data.filter(c => {
    const docId = firestoreDocId(c);
    return docId != null && isValidFirestoreDocId(docId);
  });

  const skippedInvalidId = parsed.data.length - cards.length;
  if (skippedInvalidId > 0) {
    console.warn(`Skipped ${skippedInvalidId} cards with missing/invalid Firestore doc id`);
  }

  if (limit != null) {
    cards = cards.slice(0, limit);
  }

  const allDocIds = new Set(
    parsed.data
      .map(c => firestoreDocId(c))
      .filter((id): id is string => id != null && isValidFirestoreDocId(id))
  );

  console.log(`Cards to migrate: ${cards.length} (of ${allDocIds.size} in JSON)`);

  const db = new Firestore({ databaseId });
  const collection = db.collection(collectionName);

  console.log('Loading existing docs...');
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
    const docId = firestoreDocId(card)!;
    const existing = existingById.get(docId);
    const hadOverrides =
      normalizeTagList(existing?.added).length > 0 ||
      normalizeTagList(existing?.removed).length > 0;
    const doc = buildFirestoreDoc(card, existing);
    const jsonOnlyTags = dedupeOrdered(normalizeTagList(card.tags));
    const mergedTags = doc.tags as string[];
    if (hadOverrides && JSON.stringify(mergedTags) !== JSON.stringify(jsonOnlyTags)) {
      stats.tagsMergedFromOverrides++;
    }
    if (!reportOnly) stats.writes++;
  }

  if (pruneOrphans) {
    for (const id of existingById.keys()) {
      if (!allDocIds.has(id)) stats.pruneDeletes++;
    }
  }

  console.log('\n--- Summary ---');
  console.log(`JSON cards: ${cards.length}`);
  console.log(`JSON cards with tags: ${stats.jsonWithTags}`);
  console.log(`Firestore docs (before): ${existingById.size}`);
  console.log(`Cards with merged tags (overrides applied): ${stats.tagsMergedFromOverrides}`);

  const orphanCount = [...existingById.keys()].filter(id => !allDocIds.has(id)).length;
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
  bulkWriter.onWriteError(error => error.failedAttempts < 5);

  for (const card of cards) {
    const docId = firestoreDocId(card)!;
    const existing = existingById.get(docId);
    const doc = buildFirestoreDoc(card, existing);
    bulkWriter.set(collection.doc(docId), doc, { merge: true });
  }

  if (pruneOrphans) {
    for (const id of existingById.keys()) {
      if (!allDocIds.has(id)) {
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
