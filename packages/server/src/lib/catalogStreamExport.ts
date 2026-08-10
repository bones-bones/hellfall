import { createGzip } from 'node:zlib';
import { once } from 'node:events';
import { FieldPath, type QueryDocumentSnapshot } from '@google-cloud/firestore';
import { getFirestore, resolveCardsCollectionName } from '@hellfall/shared/utils/firestore';
import { firestoreToCard } from '@hellfall/shared/utils/firestore';
import type { firestoreCard } from '@hellfall/shared/utils/firestore';

const PAGE_SIZE = 200;

function includeFirestoreDoc(data: firestoreCard): boolean {
  return data.object === 'card' || (typeof data.name === 'string' && data.name.length > 0);
}

/** Paginate Firestore cards without loading the full collection into memory. */
async function* iterateCatalogCards(options: {
  databaseId?: string;
  collectionName?: string;
}): AsyncGenerator<ReturnType<typeof firestoreToCard>> {
  const databaseId =
    options.databaseId?.trim() || process.env.FIRESTORE_DATABASE_ID?.trim() || 'hellscube';
  const collectionName = resolveCardsCollectionName(options.collectionName);
  const col = getFirestore(databaseId).collection(collectionName);

  let lastDoc: QueryDocumentSnapshot | undefined;

  while (true) {
    let query = col.orderBy(FieldPath.documentId()).limit(PAGE_SIZE);
    if (lastDoc) query = query.startAfter(lastDoc);
    const snapshot = await query.get();
    if (snapshot.empty) break;

    for (const doc of snapshot.docs) {
      lastDoc = doc;
      const data = doc.data() as firestoreCard;
      if (!includeFirestoreDoc(data)) continue;
      yield firestoreToCard(data);
    }

    if (snapshot.size < PAGE_SIZE) break;
  }
}

export type StreamedCatalogGzip = {
  gzipBody: Buffer;
  cardCount: number;
};

/** Stream Firestore cards → JSON `{ data: [...] }` → gzip without holding all cards in memory. */
export async function buildCatalogGzipFromFirestore(
  options: {
    databaseId?: string;
    collectionName?: string;
  },
  onProgress?: (cardCount: number) => void
): Promise<StreamedCatalogGzip> {
  const chunks: Buffer[] = [];
  const gzipStream = createGzip();
  gzipStream.on('data', (chunk: Buffer) => chunks.push(chunk));

  gzipStream.write('{"data":[');
  let cardCount = 0;
  let first = true;

  for await (const card of iterateCatalogCards(options)) {
    if (!first) gzipStream.write(',');
    gzipStream.write(JSON.stringify(card));
    first = false;
    cardCount++;
    if (onProgress && cardCount % 500 === 0) onProgress(cardCount);
  }

  gzipStream.write(']}');
  gzipStream.end();
  await once(gzipStream, 'end');

  return { gzipBody: Buffer.concat(chunks), cardCount };
}
