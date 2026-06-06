import type { HCCard } from '@hellfall/shared/types';
import { firestoreToCard, type firestoreCard } from '@hellfall/shared/utils/firestore';
import type { HellscubeExportOptions } from './exportHellscubeCards.ts';
import { getFirestore, resolveCardsCollectionName } from './firestoreClient.ts';

/**
 * Load the playable catalog from Firestore in one pass (no deep export serialize).
 * Uses `object == 'card'` when possible to skip tag-only stub documents.
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
