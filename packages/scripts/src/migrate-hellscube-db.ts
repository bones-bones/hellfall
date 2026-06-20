/**
 * Migrate Hellscube-Database.json into Firestore `hellscube` / `cards/{id}`.
 *
//  * Each doc gets the full card JSON plus tag-merge fields:
//  *   baseTags  — JSON tags at migrate time
//  *   added     — contributor overrides (preserved across re-runs)
//  *   removed   — contributor overrides (preserved across re-runs)
//  *   tags      — merge(baseTags, { added, removed })
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
import { resolveGoogleApplicationCredentials } from './lib/resolveGoogleCredentials.ts';
// import {
//   applyAddTag,
//   applyRemoveTag,
//   dedupeOrdered,
//   mergeTags,
//   normalizeTagList,
//   type CardTagOverrides,
//   type CardTagState,
// } from '@hellfall/shared/cardTags/cardTagMerge.ts';
import { HCCard } from '@hellfall/shared/types';
import { CardMap } from '@hellfall/shared/utils';
import {
  cardToFirestore,
  cardUpdate,
  firestoreCard,
  getUpdateObject,
} from '@hellfall/shared/utils/firestore';
import { JsonDataWrapper } from '@hellfall/shared/data';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../../..');
const DEFAULT_DB_PATH = resolve(REPO_ROOT, 'packages/shared/src/data/Hellscube-Database.json');

config({ path: resolve(__dirname, '../.env') });
resolveGoogleApplicationCredentials();

// type HellscubeCard = Record<string, unknown> & {
//   id?: string;
// };

/** Firestore doc ID for a card: all use `id`. */
// function firestoreDocId(card: HCCard.Any): string | undefined {
//   // if (card.isActualToken) {
//   //   return typeof card.token_id === 'string' && card.token_id
//   //     ? `token-${card.token_id}`
//   //     : undefined;
//   // }
//   return typeof card.id === 'string' && card.id ? card.id : undefined;
// }

// unnecessary since we're using uuids now
// function isValidFirestoreDocId(id: string): boolean {
//   if (!id || id.length > 200) return false;
//   if (id.includes('/')) return false;
//   if (id === '.' || id === '..') return false;
//   if (/^__.*__$/.test(id)) return false;
//   return true;
// }

/** Firestore: stringify nested arrays; omit attributes whose value is `""`. */
// const sanitizeForFirestore = (value: unknown): unknown => {
//   if (Array.isArray(value)) {
//     if (value.some(v => Array.isArray(v))) {
//       return JSON.stringify(value);
//     }
//     return value.map(v => sanitizeForFirestore(v));
//   }
//   if (value !== null && typeof value === 'object') {
//     const out: Record<string, unknown> = {};
//     for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
//       if (nested === '') continue;
//       out[key] = sanitizeForFirestore(nested);
//     }
//     return out;
//   }
//   return value;
// };

type CardIndexes = {
  docIdByHcid: Map<string, string>;
  docIdsByName: Map<string, string[]>;
};

function buildCardIndexes(cardMap: CardMap): CardIndexes {
  const docIdByHcid = new Map<string, string>();
  const docIdsByName = new Map<string, string[]>();
  cardMap.forEach(card => {
    if (!card.id) return;
    if (card.hcid) {
      docIdByHcid.set(card.hcid, card.id);
    }
    if (card.name) {
      const name = card.name.trim();
      const list = docIdsByName.get(name) ?? [];
      list.push(card.id);
      docIdsByName.set(name, list);
    }
  });
  return { docIdByHcid, docIdsByName };
}

// function decodeOrphanDocId(orphanId: string): string | undefined {
//   try {
//     return decodeURIComponent(orphanId);
//   } catch {
//     return undefined;
//   }
// }

/** Map a legacy/orphan Firestore doc id to the current JSON card doc id. */
// function targetDocIdForOrphan(
//   orphanId: string,
//   orphan: Record<string, unknown>,
//   indexes: CardIndexes
// ): string | undefined {
//   const { docIdByHcid, docIdsByName } = indexes;

//   if (docIdByHcid.has(orphanId)) return docIdByHcid.get(orphanId);

//   const decoded = decodeOrphanDocId(orphanId);
//   if (decoded && docIdByHcid.has(decoded)) return docIdByHcid.get(decoded);

//   const hcid = orphan.hcid != null ? String(orphan.hcid) : '';
//   if (hcid && docIdByHcid.has(hcid)) return docIdByHcid.get(hcid);

//   const name = typeof orphan.name === 'string' ? orphan.name.trim() : '';
//   const nameCandidates = name ? docIdsByName.get(name) : undefined;
//   if (nameCandidates?.length === 1) return nameCandidates[0];

//   if (decoded) {
//     const decodedCandidates = docIdsByName.get(decoded);
//     if (decodedCandidates?.length === 1) return decodedCandidates[0];
//   }

//   return undefined;
// }

// function overridesFromDoc(doc: Record<string, unknown> | undefined): CardTagOverrides {
//   return {
//     added: normalizeTagList(doc?.added),
//     removed: normalizeTagList(doc?.removed),
//   };
// }

// function hasTagOverrides(overrides: tagState): boolean {
//   return overrides.added || overrides.removed;
// }

// function mergeDonorOverrides(into: CardTagOverrides, donor: CardTagOverrides): CardTagOverrides {
//   let state: CardTagState = {
//     baseTags: [],
//     added: [...into.added],
//     removed: [...into.removed],
//     tags: [],
//   };
//   for (const tag of donor.added) state = applyAddTag(state, tag);
//   for (const tag of donor.removed) state = applyRemoveTag(state, tag);
//   return { added: state.added, removed: state.removed };
// }

// function collectOrphanTagTransfers(
//   existingById: Map<string, firestoreCard>,
//   cardMap: CardMap,
//   indexes: CardIndexes
// ): {
//   transfers: Map<string, tagState>;
//   orphanToTarget: Map<string, string>;
//   stats: { orphansWithOverrides: number; transferred: number; unmatched: number };
// } {
//   const transfers = new Map<string, tagState>();
//   const orphanToTarget = new Map<string, string>();
//   const stats = { orphansWithOverrides: 0, transferred: 0, unmatched: 0 };

//   for (const [orphanId, orphan] of existingById) {
//     if (cardMap.has(orphanId)) continue;
//     const donor = orphan.tag_state;
//     if (!donor?.added && !donor?.removed) continue;
//     stats.orphansWithOverrides++;

//     const targetId = targetDocIdForOrphan(orphanId, orphan, indexes);
//     if (!targetId) {
//       stats.unmatched++;
//       console.warn(
//         `Orphan tag overrides not transferred (no match): ${orphanId}` +
//           (orphan.name ? ` (${orphan.name})` : '')
//       );
//       continue;
//     }
//     const base = cardMap.get(targetId)?.tag_state?.base_tags;
//     if (base) {
//       donor.base_tags = base;
//     } else {
//       delete donor.base_tags;
//     }

//     stats.transferred++;
//     orphanToTarget.set(orphanId, targetId);
//     const prior = transfers.get(targetId);
//     transfers.set(targetId, prior ? mergeTagStates(prior, donor) : donor);
//   }

//   return { transfers, orphanToTarget, stats };
// }

const buildFirestoreDoc = (card: HCCard.Any, existing: firestoreCard | undefined): cardUpdate => {
  const newCard = cardToFirestore(structuredClone(card));
  // const state: tagState = existing?.tag_state ?? {};
  // if (newCard.tag_state?.base_tags) {
  //   state.base_tags = newCard.tag_state?.base_tags;
  // }
  // const merged = updateTags(newCard, state);
  return existing ? getUpdateObject(existing, newCard) : (newCard as cardUpdate);
  // return { doc: cardToFirestore(newCard), merged: false /* merged */ };

  // const baseTags = dedupeOrdered(normalizeTagList(card.tags));
  // const overrides: CardTagOverrides = {
  //   added: normalizeTagList(existing?.added),
  //   removed: normalizeTagList(existing?.removed),
  // };
  // const mergedTags = dedupeOrdered(mergeTags(baseTags, overrides));
  // const { tag_state: _tagState, ...cardFields } = card;
  // return sanitizeForFirestore({
  //   ...cardFields,
  //   baseTags,
  //   tags: mergedTags,
  //   added: overrides.added,
  //   removed: overrides.removed,
  // }) as Record<string, unknown>;
};

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
  --prune-orphans   Delete orphan docs; move tag overrides (and pending changesets) to the matching JSON card by hcid/name
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
): Promise<Map<string, firestoreCard>> {
  const map = new Map<string, firestoreCard>();
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
  const parsed = JSON.parse(raw) as JsonDataWrapper<HCCard.Any>;
  if (!Array.isArray(parsed.data)) {
    console.error('Expected Hellscube-Database.json shape: { "data": [ ... ] }');
    process.exit(1);
  }
  const cardMap = new CardMap(parsed.data);

  // let cards = parsed.data.filter(c => {
  //   const docId = firestoreDocId(c);
  //   return docId != null && isValidFirestoreDocId(docId);
  // });

  const skippedInvalidId = parsed.data.length - cardMap.size();
  if (skippedInvalidId > 0) {
    console.warn(`Skipped ${skippedInvalidId} cards with missing/invalid Firestore doc id`);
  }

  // if (limit != null) {
  //   cards = cards.slice(0, limit);
  // }

  // const allDocIds = new Set(
  //   parsed.data
  //     .map(c => c.id)
  //     .filter((id): id is string => id != null && isValidFirestoreDocId(id))
  // );

  console.log(`Cards to migrate: ${cardMap.size()} (of ${cardMap.size()} in JSON)`);

  const db = new Firestore({ databaseId });
  const collection = db.collection(collectionName);
  const indexes = buildCardIndexes(cardMap);

  console.log('Loading existing docs...');
  const existingById = await loadExistingDocs(collection);
  console.log(`Existing Firestore docs: ${existingById.size}`);

  // const orphanTransfers = pruneOrphans
  //   ? collectOrphanTagTransfers(existingById, cardMap, indexes)
  //   : null;

  // if (orphanTransfers) {
  //   console.log(
  //     `Orphan tag overrides: ${orphanTransfers.stats.orphansWithOverrides} found, ` +
  //       `${orphanTransfers.stats.transferred} transferred, ${orphanTransfers.stats.unmatched} unmatched`
  //   );
  // }

  const stats = {
    writes: 0,
    tagsMergedFromOverrides: 0,
    pruneDeletes: 0,
    changesetsReassigned: 0,
    jsonWithTags: 0,
  };

  const docMap = new Map<string, cardUpdate>();

  for (const [docId, card] of cardMap) {
    if ((card.tags?.length ?? 0) > 0) stats.jsonWithTags++;
    const existing = existingById?.get(docId);
    // const transferred = orphanTransfers?.transfers.get(docId);
    const existingForBuild: firestoreCard | undefined = /*       transferred != null
        ? {
            ...existing,
            ...mergeTagStates(existing?.tag_state ?? {}, transferred),
          }
        :  */ existing;
    // const hadOverrides =
    //   normalizeTagList(existingForBuild?.added).length > 0 ||
    //   normalizeTagList(existingForBuild?.removed).length > 0;
    const doc = buildFirestoreDoc(card, existingForBuild);
    // const jsonOnlyTags = dedupeOrdered(normalizeTagList(card.tags));
    // const mergedTags = doc.tags as string[];
    // if ((existingForBuild?.tag_state?.added || existingForBuild?.tag_state?.removed) && merged) {
    //   stats.tagsMergedFromOverrides++;
    // }
    if (!Object.keys(doc).length) {
      continue;
    }
    if (!reportOnly) stats.writes++;
    docMap.set(docId, doc);
  }

  if (pruneOrphans && existingById) {
    for (const id of existingById.keys()) {
      if (!cardMap.has(id)) stats.pruneDeletes++;
    }
  }

  console.log('\n--- Summary ---');
  console.log(`JSON cards: ${cardMap.size()}`);
  console.log(`JSON cards with tags: ${stats.jsonWithTags}`);
  console.log(`Firestore docs (before): ${existingById?.size}`);
  console.log(`Cards with merged tags (overrides applied): ${stats.tagsMergedFromOverrides}`);

  const orphanCount = [...(existingById?.keys() ?? [])].filter(id => !cardMap.has(id)).length;
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
  docMap.forEach((doc, docId) => {
    const docRef = collection.doc(docId);
    if (existingById.has(docId)) {
      bulkWriter.update(docRef, doc)
    } else {
      bulkWriter.set(docRef, doc)
    }
    // (existingById.has(docId) ? bulkWriter.update : bulkWriter.set)(docRef, doc)
  }
  );

  if (pruneOrphans) {
    for (const id of existingById.keys()) {
      if (!cardMap.has(id)) {
        bulkWriter.delete(collection.doc(id));
      }
    }
  }

  await bulkWriter.close();
  if (stats.changesetsReassigned > 0) {
    console.log(`Pending changesets reassigned: ${stats.changesetsReassigned}`);
  }
  console.log('\nMigration complete.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
