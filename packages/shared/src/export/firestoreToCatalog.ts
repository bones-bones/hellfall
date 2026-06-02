import type { HCCard } from '../types';
import type { tagRecord, tagState } from '../types/Card/values/Tag';
import { normalizeTagList } from '../cardTags/cardTagMerge';
import { hydrateCatalogCard } from './catalogHydrate';

const FIRESTORE_ONLY_KEYS = new Set(['baseTags', 'added', 'removed']);

/** Docs that only exist for tag overrides with no card payload. */
export function isFirestoreTagStub(doc: Record<string, unknown>): boolean {
  const keys = Object.keys(doc);
  if (keys.length === 0) return true;
  return keys.every(
    key => FIRESTORE_ONLY_KEYS.has(key) || (key === 'tags' && Array.isArray(doc.tags))
  );
}

export function isHellscubeCatalogCard(doc: Record<string, unknown>): boolean {
  if (isFirestoreTagStub(doc)) return false;
  if (doc.object === 'card') return true;
  return typeof doc.name === 'string' && doc.name.length > 0;
}

function normalizeFirestoreValue(value: unknown): unknown {
  if (value == null) return value;
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    const ts = value as { toDate?: () => Date };
    if (typeof ts.toDate === 'function') {
      return ts.toDate().toISOString();
    }
  }
  if (Array.isArray(value)) {
    return value.map(normalizeFirestoreValue);
  }
  if (typeof value === 'object' && value.constructor === Object) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = normalizeFirestoreValue(v);
    }
    return out;
  }
  return value;
}

/** Firestore stores nested arrays as JSON strings (see migrate-hellscube-db). */
function deserializeFirestoreFields(doc: Record<string, unknown>): Record<string, unknown> {
  const normalized = normalizeFirestoreValue(doc) as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(normalized)) {
    if (typeof value === 'string' && value.length > 0 && value[0] === '[') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          out[key] = parsed;
          continue;
        }
      } catch {
        // keep string
      }
    }
    out[key] = value;
  }
  return out;
}

function tagsToTagRecord(tags: string[]): tagRecord {
  const record: tagRecord = {};
  for (const fullTag of tags) {
    const tag = fullTag.includes('<') ? fullTag.split('<')[0]! : fullTag;
    if (!record[tag]) record[tag] = [];
    if (!record[tag]!.includes(fullTag)) record[tag]!.push(fullTag);
  }
  return record;
}

function buildTagStateFromFirestore(
  doc: Record<string, unknown>
): tagState | undefined {
  const baseTags = normalizeTagList(doc.baseTags);
  const added = normalizeTagList(doc.added);
  const removed = normalizeTagList(doc.removed);

  if (baseTags.length === 0 && added.length === 0 && removed.length === 0) {
    return doc.tag_state as tagState | undefined;
  }

  const base_tags = tagsToTagRecord(baseTags);
  const addedRecord = tagsToTagRecord(added);

  return {
    ...(Object.keys(base_tags).length > 0 ? { base_tags } : {}),
    ...(Object.keys(addedRecord).length > 0 ? { added: addedRecord } : {}),
    ...(removed.length > 0 ? { removed } : {}),
  };
}

/** Map a Firestore card document to Hellscube-Database.json card shape. */
export function firestoreDocToCatalogCard(
  doc: Record<string, unknown>
): HCCard.Any | null {
  if (!isHellscubeCatalogCard(doc)) return null;

  const raw = deserializeFirestoreFields(doc);
  const { baseTags: _b, added: _a, removed: _r, ...rest } = raw;

  const card = { ...rest } as Record<string, unknown>;

  if (!card.kind && card.object === 'card') {
    card.kind = 'card';
  }

  const tag_state = buildTagStateFromFirestore(raw);
  if (tag_state && Object.keys(tag_state).length > 0) {
    card.tag_state = tag_state;
  }

  if (!Array.isArray(card.tags)) {
    const merged = normalizeTagList(raw.tags);
    if (merged.length > 0) card.tags = merged;
  }

  hydrateCatalogCard(card);

  return card as HCCard.Any;
}

export function firestoreDocsToCatalogCards(
  docs: Record<string, unknown>[]
): HCCard.Any[] {
  return docs
    .map(doc => firestoreDocToCatalogCard(doc))
    .filter((card): card is HCCard.Any => card != null);
}
