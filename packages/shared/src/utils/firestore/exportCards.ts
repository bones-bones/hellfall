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

/**
 * Export all documents from the Hellscube cards collection as stored in Firestore.
 * @param options The options to use
 */
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

/**
 * Load the playable catalog in one pass
 * @param options The options to use
 */
export async function loadHellscubeCatalogCards(
  options: HellscubeExportOptions = {}
): Promise<HCCard.Any[]> {
  const databaseId =
    options.databaseId?.trim() || process.env.FIRESTORE_DATABASE_ID?.trim() || 'hellscube';
  const collectionName = resolveCardsCollectionName(options.collectionName);

  const col = getFirestore(databaseId).collection(collectionName);

  let snapshot = await col.where('object', '==', 'card').get();
  if (snapshot.empty) {
    snapshot = await col.get();
  }

  const cards: HCCard.Any[] = [];
  for (const doc of snapshot.docs) {
    const data = doc.data() as firestoreCard;
    if (data.object !== 'card' && !(typeof data.name === 'string' && data.name.length > 0)) {
      continue;
    }
    cards.push(firestoreToCard(data));
  }
  return cards;
}

/**
 * Export all documents from the Hellscube cards collection as stored in Firestore.
 * @param options The options to use
 */
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
