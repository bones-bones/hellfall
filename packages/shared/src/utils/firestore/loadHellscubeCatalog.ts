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
//   console.log(
//     `[cards/load] firestore query object==card ${Date.now() - tQuery}ms docs=${snapshot.size}`
//   );
//   if (snapshot.empty) {
//     const tFallback = Date.now();
//     snapshot = await col.get();
//     console.log(
//       `[cards/load] firestore fallback full collection ${Date.now() - tFallback}ms docs=${snapshot.size}`
//     );
//   }

//   const tConvert = Date.now();
//   const cards: HCCard.Any[] = [];
//   for (const doc of snapshot.docs) {
//     const card = firestoreDocToCatalogCard(doc.data() as Record<string, unknown>);
//     if (card) cards.push(card);
//   }
//   console.log(
//     `[cards/load] firestore doc conversion ${Date.now() - tConvert}ms cards=${cards.length}/${snapshot.size}`
//   );
//   return cards;
// }
