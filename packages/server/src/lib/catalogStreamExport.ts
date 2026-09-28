import { createGzip } from 'node:zlib';
import { once } from 'node:events';
import { pipeline } from 'node:stream/promises';
import { Writable } from 'node:stream';
import { FieldPath, type QueryDocumentSnapshot } from '@google-cloud/firestore';
import type { HCCard } from '@hellfall/shared/types';
import {
  addCardToLookup,
  CardLookupObject,
  LookupCacheObject,
  lookupCacheToJSON,
} from '@hellfall/shared/utils';
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

async function writeWithBackpressure(dest: Writable, data: string): Promise<void> {
  if (!dest.write(data)) await once(dest, 'drain');
}

function isCatalogCard(card: unknown): card is HCCard.Any {
  return (
    typeof card === 'object' &&
    card !== null &&
    typeof (card as HCCard.Any).id === 'string' &&
    typeof (card as HCCard.Any).oracle_id === 'string'
  );
}

/**
 * JSON fullCache (`idMap` + lookup/oracle maps) → gzip into `dest`.
 * Streams `idMap` card-by-card; keeps only lightweight lookup maps in RAM.
 * Does not buffer the gzip or materialize `CardMap.toJSON()`.
 */
export async function gzipCatalogCardsToStream(
  cards: AsyncIterable<unknown>,
  dest: Writable,
  onProgress?: (cardCount: number) => void
): Promise<{ cardCount: number }> {
  const gzipStream = createGzip();
  const pipeDone = pipeline(gzipStream, dest);
  const lookupObject: LookupCacheObject = {
    oracleMap: new Map<string, Set<string>>(),
    aliasMap: new Map<string, string>(),
    hcidMap: new Map<string, string>(),
    nameMap: new Map<string, CardLookupObject>(),
  };
  let cardCount = 0;

  try {
    await writeWithBackpressure(gzipStream, '{"idMap":{');
    let first = true;
    for await (const raw of cards) {
      if (!isCatalogCard(raw)) {
        throw new Error('catalog stream received a card without id/oracle_id');
      }
      if (!first) await writeWithBackpressure(gzipStream, ',');
      await writeWithBackpressure(gzipStream, `${JSON.stringify(raw.id)}:${JSON.stringify(raw)}`);
      first = false;
      addCardToLookup(raw, lookupObject, (card, lookup) => !!card.has_default_id);

      cardCount++;
      if (onProgress && cardCount % 500 === 0) onProgress(cardCount);
    }
    await writeWithBackpressure(gzipStream, '}');

    const { oracleMap, nameMap, aliasMap, hcidMap } = lookupCacheToJSON(lookupObject);

    await writeWithBackpressure(gzipStream, `,"nameMap":${JSON.stringify(nameMap)}`);
    await writeWithBackpressure(gzipStream, `,"aliasMap":${JSON.stringify(aliasMap)}`);
    await writeWithBackpressure(gzipStream, `,"hcidMap":${JSON.stringify(hcidMap)}`);
    await writeWithBackpressure(gzipStream, `,"oracleMap":${JSON.stringify(oracleMap)}`);
    await writeWithBackpressure(gzipStream, '}');

    gzipStream.end();
    await pipeDone;
  } catch (err) {
    gzipStream.destroy(err instanceof Error ? err : new Error(String(err)));
    throw err;
  }
  return { cardCount };
}

/**
 * Firestore cards → fullCache JSON → gzip into `dest`.
 * Does not buffer the gzip; callers must honor Writable backpressure.
 */
export async function streamCatalogGzipFromFirestore(
  dest: Writable,
  options: {
    databaseId?: string;
    collectionName?: string;
  },
  onProgress?: (cardCount: number) => void
): Promise<{ cardCount: number }> {
  return gzipCatalogCardsToStream(iterateCatalogCards(options), dest, onProgress);
}

/** Same export as `streamCatalogGzipFromFirestore`, collected into a Buffer (local / no GCS). */
export async function buildCatalogGzipFromFirestore(
  options: {
    databaseId?: string;
    collectionName?: string;
  },
  onProgress?: (cardCount: number) => void
): Promise<StreamedCatalogGzip> {
  const chunks: Buffer[] = [];
  const dest = new Writable({
    write(chunk, _enc, cb) {
      chunks.push(chunk as Buffer);
      cb();
    },
  });
  const { cardCount } = await streamCatalogGzipFromFirestore(dest, options, onProgress);
  return { gzipBody: Buffer.concat(chunks), cardCount };
}
