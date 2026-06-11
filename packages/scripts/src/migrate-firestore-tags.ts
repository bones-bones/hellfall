/**
 * Migrate Firestore card docs from legacy tag fields to `base_tags`.
 *
 * Legacy shape (pre-refactor):
 *   baseTags  — canonical tags from JSON migrate
 *   added     — contributor tag additions
 *   removed   — contributor tag removals
 *   tags      — merge(baseTags, { added, removed })
 *
 * New shape:
 *   base_tags — merged effective tag list (contributor overrides baked in)
 *
 * Usage: see packages/scripts/README.md
 */
import { config } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FieldValue, Firestore } from '@google-cloud/firestore';
import { resolveGoogleApplicationCredentials } from './lib/resolveGoogleCredentials.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

config({ path: resolve(__dirname, '../.env') });
resolveGoogleApplicationCredentials();

const LEGACY_FIELDS = ['baseTags', 'added', 'removed', 'tag_state'] as const;

function normalizeTagList(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  return tags
    .map(String)
    .map(t => t.trim())
    .filter(Boolean);
}

function dedupeOrdered(tags: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of tags) {
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

function mergeLegacyTags(baseTags: string[], added: string[], removed: string[]): string[] {
  const removedSet = new Set(removed);
  const addedNorm = added.filter(t => !removedSet.has(t));
  return dedupeOrdered(baseTags.filter(t => !removedSet.has(t)).concat(addedNorm));
}

function inferBaseTags(storedTags: string[], added: string[], removed: string[]): string[] {
  const base: string[] = [];
  for (const t of storedTags) {
    if (!added.includes(t)) base.push(t);
  }
  for (const t of removed) {
    if (!base.includes(t)) base.push(t);
  }
  return dedupeOrdered(base);
}

function resolveBaseTags(data: Record<string, unknown>): string[] {
  const added = normalizeTagList(data.added);
  const removed = normalizeTagList(data.removed);

  let baseTags: string[];
  if ('baseTags' in data) {
    baseTags = normalizeTagList(data.baseTags);
  } else if (Array.isArray(data.base_tags)) {
    baseTags = normalizeTagList(data.base_tags);
  } else {
    const storedTags = normalizeTagList(data.tags);
    baseTags =
      added.length === 0 && removed.length === 0
        ? storedTags
        : inferBaseTags(storedTags, added, removed);
  }

  return mergeLegacyTags(baseTags, added, removed);
}

function hasLegacyFields(data: Record<string, unknown>): boolean {
  return LEGACY_FIELDS.some(field => field in data);
}

function parseArgs(argv: string[]) {
  let dryRun = false;
  let reportOnly = false;
  let limit: number | undefined;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else if (arg === '--dry-run') {
      dryRun = true;
    } else if (arg === '--report') {
      reportOnly = true;
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

  return { dryRun, reportOnly, limit };
}

function printHelp() {
  console.log(`migrate-firestore-tags — convert legacy tag fields to base_tags

Usage:
  yarn migrate-firestore-tags [options]

Rewrites each cards/{id} doc that still has baseTags/added/removed/tag_state:
  - sets base_tags = merge(baseTags, { added, removed })
  - deletes legacy tag fields

Options:
  --report    Count docs needing migration (no writes)
  --dry-run   Log planned updates without writing
  --limit <n> Process only the first n matching docs (testing)

Env (packages/scripts/.env):
  GOOGLE_APPLICATION_CREDENTIALS
  FIRESTORE_DATABASE_ID       (default: hellscube)
  FIRESTORE_CARDS_COLLECTION  (default: cards)
`);
}

async function main() {
  const { dryRun, reportOnly, limit } = parseArgs(process.argv.slice(2));

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim()) {
    console.error('GOOGLE_APPLICATION_CREDENTIALS is required (path to service account JSON).');
    process.exit(1);
  }

  const databaseId = process.env.FIRESTORE_DATABASE_ID?.trim() || 'hellscube';
  const collectionName = process.env.FIRESTORE_CARDS_COLLECTION?.trim() || 'cards';

  console.log(`Database: ${databaseId}`);
  console.log(`Collection: ${collectionName}`);
  if (reportOnly) console.log('Mode: report');
  else if (dryRun) console.log('Mode: dry-run');
  else console.log('Mode: migrate');

  const db = new Firestore({ databaseId });
  const collection = db.collection(collectionName);
  const snapshot = await collection.get();

  let scanned = 0;
  let needsMigration = 0;
  let updated = 0;
  let batch = db.batch();
  let batchCount = 0;

  const flushBatch = async () => {
    if (batchCount === 0) return;
    if (!dryRun && !reportOnly) {
      await batch.commit();
    }
    updated += batchCount;
    batch = db.batch();
    batchCount = 0;
  };

  for (const doc of snapshot.docs) {
    scanned++;
    const data = doc.data() as Record<string, unknown>;
    if (!hasLegacyFields(data)) continue;

    needsMigration++;
    if (limit != null && needsMigration > limit) break;

    const base_tags = resolveBaseTags(data);
    const patch: Record<string, unknown> = {};
    for (const field of LEGACY_FIELDS) {
      patch[field] = FieldValue.delete();
    }
    if (base_tags.length > 0) {
      patch.base_tags = base_tags;
    } else {
      patch.base_tags = FieldValue.delete();
    }

    if (dryRun) {
      console.log(
        `[dry-run] ${doc.id}: base_tags=${JSON.stringify(base_tags)} (remove ${LEGACY_FIELDS.join(
          ', '
        )})`
      );
    }

    if (!reportOnly) {
      batch.update(doc.ref, patch);
      batchCount++;
      if (batchCount >= 400) {
        await flushBatch();
      }
    }
  }

  await flushBatch();

  console.log(`Scanned: ${scanned}`);
  console.log(`Needs migration: ${needsMigration}`);
  if (!reportOnly) {
    console.log(`${dryRun ? 'Would update' : 'Updated'}: ${updated}`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
