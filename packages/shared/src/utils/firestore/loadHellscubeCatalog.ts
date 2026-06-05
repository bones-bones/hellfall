// import { CardMap } from '../cardHandling';
// import type { HCCard } from '../types';
// import type { HellscubeExportOptions } from './exportCards';
// import { getFirestore, resolveCardsCollectionName } from './firestoreClient';
// // import { firestoreDocToCatalogCard } from './firestoreToCatalog';

// /**
//  * Load the playable catalog from Firestore in one pass (no deep export serialize).
//  * Uses `object == 'card'` when possible to skip tag-only stub documents.
//  */
// export async function loadHellscubeCatalogCards(
//   options: HellscubeExportOptions = {}
// ): Promise<CardMap> {
//   const databaseId =
//     options.databaseId?.trim() || process.env.FIRESTORE_DATABASE_ID?.trim() || 'hellscube';
//   const collectionName = resolveCardsCollectionName(options.collectionName);

//   const col = getFirestore(databaseId).collection(collectionName);

//   let snapshot = await col.where('object', '==', 'card').get();
//   if (snapshot.empty) {
//     snapshot = await col.get();
//   }

//   const cards: HCCard.Any[] = [];
//   for (const doc of snapshot.docs) {
//     const card = firestoreDocToCatalogCard(doc.data() as Record<string, unknown>);
//     if (card) cards.push(card);
//   }
//   return cards;
// }
