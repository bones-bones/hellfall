import { Firestore } from '@google-cloud/firestore';

const clients = new Map<string, Firestore>();

/** Reuse Firestore clients (avoids connection setup per request). */
export function getFirestore(databaseId?: string): Firestore {
  const id = databaseId?.trim() || process.env.FIRESTORE_DATABASE_ID?.trim() || 'hellscube';
  let db = clients.get(id);
  if (!db) {
    db = new Firestore({ databaseId: id });
    clients.set(id, db);
  }
  return db;
}

export function resolveCardsCollectionName(collectionName?: string): string {
  return collectionName?.trim() || process.env.FIRESTORE_CARDS_COLLECTION?.trim() || 'cards';
}
