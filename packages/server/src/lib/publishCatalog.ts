import { env } from '../api/lib/env.ts';
import { releaseCatalogCache, seedCatalogCacheGzip } from './catalogCache.ts';
import { isCatalogGcsConfigured, uploadCatalogGzipStreamToGcs } from './catalogGcs.ts';
import {
  buildCatalogGzipFromFirestore,
  streamCatalogGzipFromFirestore,
} from './catalogStreamExport.ts';

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let pendingPublish = false;
let inflightPublish: Promise<void> | null = null;

export type CatalogPublishResult = {
  cardCount: number;
  gcs: boolean;
  version?: string;
  bytes: number;
  durationMs: number;
};

function heapMb(): string {
  const { heapUsed, rss } = process.memoryUsage();
  return `heap=${Math.round(heapUsed / 1024 / 1024)}MB rss=${Math.round(rss / 1024 / 1024)}MB`;
}

/** Full Firestore export → GCS stream (or in-memory cache when GCS is unset). */
export async function publishCatalogSnapshot(): Promise<CatalogPublishResult> {
  const t0 = Date.now();
  console.log(`[catalog/publish] start ${heapMb()}`);

  releaseCatalogCache();
  console.log(`[catalog/publish] cache released ${heapMb()}`);

  const exportOptions = {
    databaseId: env.FIRESTORE_DATABASE_ID,
    collectionName: env.FIRESTORE_CARDS_COLLECTION,
  };
  const onProgress = (count: number) =>
    console.log(`[catalog/publish] streaming cards=${count} ${heapMb()}`);

  let version: string | undefined;
  let bytes = 0;
  let cardCount = 0;
  const gcs = isCatalogGcsConfigured();

  if (gcs) {
    const uploaded = await uploadCatalogGzipStreamToGcs(dest =>
      streamCatalogGzipFromFirestore(dest, exportOptions, onProgress)
    );
    cardCount = uploaded.cardCount;
    bytes = uploaded.bytes;
    version = uploaded.manifest.version;
    // Leave cache empty — seeding gzip (~14MB) next to CardMap is what OOMs 512Mi.
    // Next Origin /api/cards/load downloads from GCS lazily.
    console.log(
      `[catalog/publish] gcs version=${version} cards=${cardCount} gzip=${bytes} cache=empty ${heapMb()}`
    );
  } else {
    const built = await buildCatalogGzipFromFirestore(exportOptions, onProgress);
    cardCount = built.cardCount;
    bytes = built.gzipBody.length;
    seedCatalogCacheGzip(built.gzipBody);
    console.log(`[catalog/publish] cache seeded cards=${cardCount} gzip=${bytes} ${heapMb()}`);
  }

  const durationMs = Date.now() - t0;
  console.log(
    `[catalog/publish] complete cards=${cardCount} gcs=${gcs} total=${durationMs}ms gzip=${bytes} ${heapMb()}`
  );

  return { cardCount, gcs, version, bytes, durationMs };
}

async function flushCatalogPublish(): Promise<void> {
  if (!pendingPublish) return;
  if (inflightPublish) {
    await inflightPublish;
    if (pendingPublish) return flushCatalogPublish();
    return;
  }

  pendingPublish = false;
  inflightPublish = publishCatalogSnapshot()
    .then(() => undefined)
    .catch(err => {
      console.error('[catalog/publish] failed', err);
    })
    .finally(() => {
      inflightPublish = null;
    });
  await inflightPublish;
  if (pendingPublish) return flushCatalogPublish();
}

/** Debounced publish (used by postcard ingest; coalesces rapid writes). */
export function scheduleCatalogPublish(): void {
  pendingPublish = true;

  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    void flushCatalogPublish();
  }, env.CATALOG_PUBLISH_DEBOUNCE_MS);
}
