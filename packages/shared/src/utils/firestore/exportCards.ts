import { getFirestore, resolveCardsCollectionName } from './firestoreClient';
import { CardMap } from '../cardHandling';
import { firestoreToCard } from './cardConversion';
import { firestoreCard } from './firestoreTypes';
import { HCCard } from '@hellfall/shared/types';

// export type HellscubeExportCard = Record<string, unknown> & { _docId: string };

export type HellscubeExportPayload = {
  exportedAt: string;
  databaseId: string;
  collection: string;
  data: HCCard.Any[];
};

export type HellscubeExportOptions = {
  databaseId?: string;
  collectionName?: string;
};

// function serializeValue(value: unknown): unknown {
//   if (value == null) return value;
//   if (typeof value === 'object' && value !== null && 'toDate' in value) {
//     const ts = value as Timestamp;
//     if (typeof ts.toDate === 'function') {
//       return ts.toDate().toISOString();
//     }
//   }
//   if (Array.isArray(value)) {
//     return value.map(serializeValue);
//   }
//   if (typeof value === 'object' && value.constructor === Object) {
//     const out: Record<string, unknown> = {};
//     for (const [k, v] of Object.entries(value)) {
//       out[k] = serializeValue(v);
//     }
//     return out;
//   }
//   return value;
// }

// function docToExportRow(docId: string, data: Record<string, unknown>): HellscubeExportCard {
//   const serialized = serializeValue(data) as Record<string, unknown>;
//   return { _docId: docId, ...serialized };
// }

/** Export all documents from the Hellscube cards collection as stored in Firestore. */

export async function exportCardMap(options: HellscubeExportOptions = {}): Promise<CardMap> {
  const databaseId =
    options.databaseId?.trim() || process.env.FIRESTORE_DATABASE_ID?.trim() || 'hellscube';
  const collectionName = resolveCardsCollectionName(options.collectionName);

  const snapshot = await getFirestore(databaseId).collection(collectionName).get();

  const data = new CardMap(
    snapshot.docs.map(doc => firestoreToCard(/* doc.id,  */ doc.data() as firestoreCard))
  );
  return data;
}


export async function loadHellscubeCatalogCards(options: HellscubeExportOptions = {}): Promise<HCCard.Any[]> {
  const databaseId =
    options.databaseId?.trim() || process.env.FIRESTORE_DATABASE_ID?.trim() || 'hellscube';
  const collectionName = resolveCardsCollectionName(options.collectionName);

  const snapshot = await getFirestore(databaseId).collection(collectionName).get();

  const data = snapshot.docs.map(doc => firestoreToCard(/* doc.id,  */ doc.data() as firestoreCard))
  return data;
}


export async function exportHellscubeCards(
  options: HellscubeExportOptions = {}
): Promise<HellscubeExportPayload> {
  const databaseId =
    options.databaseId?.trim() || process.env.FIRESTORE_DATABASE_ID?.trim() || 'hellscube';
  const collectionName = resolveCardsCollectionName(options.collectionName);

  const data = (await exportCardMap(options)).cards();

  return {
    exportedAt: new Date().toISOString(),
    databaseId,
    collection: collectionName,
    data,
  };
}
