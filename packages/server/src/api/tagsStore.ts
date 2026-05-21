// packages/server/src/api/tagsStore.ts
import { readFileSync, writeFileSync } from 'node:fs';
import type { CardTagOverrides } from './cardTags.js';
import { env } from './lib/env.js';
import {
  CollectionReference,
  DocumentReference,
  DocumentSnapshot,
  Firestore,
} from '@google-cloud/firestore';
const useLocalData = env.USE_LOCAL_CARD_DATA;

const TAGS_FILE_PATH = '../shared/src/data/local-tags.json';

let db: Firestore | null = null;
let collection: CollectionReference | null = null;
let tagOverrides: Map<string, CardTagOverrides> | null = null;

function loadTagOverrides() {
  try {
    const data = readFileSync(TAGS_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    tagOverrides = new Map(Object.entries(parsed));
    console.log(`📝 Loaded ${tagOverrides.size} card tag overrides from local file`);
  } catch (error) {
    console.log('📝 No existing tag overrides found, starting fresh');
    tagOverrides = new Map();
  }
}

if (useLocalData) {
  loadTagOverrides();
} else {
  db = new Firestore({ databaseId: env.FIRESTORE_HELLSCUBE_DATABASE_ID });
  collection = db.collection(env.FIRESTORE_CARDS_COLLECTION);
}

function saveTagOverrides() {
  const obj = Object.fromEntries(tagOverrides!);
  writeFileSync(TAGS_FILE_PATH, JSON.stringify(obj, null, 2));
  console.log(`💾 Saved ${tagOverrides?.size} card tag overrides to local file`);
}

export const getLocalTagOverrides = (cardId: string): CardTagOverrides => {
  return tagOverrides?.get(cardId) || { added: [], removed: [] };
};

export const setLocalTagOverrides = (cardId: string, overrides: CardTagOverrides) => {
  tagOverrides?.set(cardId, overrides);
  saveTagOverrides();
};

async function getOrSeedCardTagsDoc(docRef: DocumentReference): Promise<DocumentSnapshot> {
  let snap = await docRef.get();
  if (!snap.exists) {
    await docRef.set({ added: [], removed: [] }, { merge: true });
    snap = await docRef.get();
  }
  return snap;
}

export async function getTagOverrides(cardId: string): Promise<CardTagOverrides> {
  if (useLocalData) {
    return getLocalTagOverrides(cardId);
  } else {
    const docRef = collection?.doc(cardId);
    const snap = await getOrSeedCardTagsDoc(docRef!);
    const data = snap.data() as CardTagOverrides | undefined;
    return {
      added: Array.isArray(data?.added) ? data.added.map(String) : [],
      removed: Array.isArray(data?.removed) ? data.removed.map(String) : [],
    };
  }
}

export async function setTagOverrides(cardId: string, overrides: CardTagOverrides): Promise<void> {
  if (useLocalData) {
    setLocalTagOverrides(cardId, overrides);
  } else {
    const docRef = collection?.doc(cardId);
    await docRef?.set(overrides, { merge: true });
  }
}
