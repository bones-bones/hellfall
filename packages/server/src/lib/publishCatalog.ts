import { env } from '../api/lib/env.ts';
import { releaseCatalogCache, seedCatalogCacheGzip } from './catalogCache.ts';
import { isCatalogGcsConfigured, uploadCatalogGzipToGcs } from './catalogGcs.ts';
import { buildCatalogGzipFromFirestore } from './catalogStreamExport.ts';

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

/** Full Firestore export → in-memory cache (+ GCS when configured). */
export async function publishCatalogSnapshot(): Promise<CatalogPublishResult> {
  const t0 = Date.now();
  console.log(`[catalog/publish] start ${heapMb()}`);

  releaseCatalogCache();
  console.log(`[catalog/publish] cache released ${heapMb()}`);

  const { gzipBody, cardCount } = await buildCatalogGzipFromFirestore(
    {
      databaseId: env.FIRESTORE_DATABASE_ID,
      collectionName: env.FIRESTORE_CARDS_COLLECTION,
    },
    count => console.log(`[catalog/publish] streaming cards=${count} ${heapMb()}`)
  );
  console.log(
    `[catalog/publish] serialized cards=${cardCount} gzip=${gzipBody.length} ${heapMb()}`
  );

  let version: string | undefined;
  const gcs = isCatalogGcsConfigured();
  if (gcs) {
    const manifest = await uploadCatalogGzipToGcs(gzipBody, cardCount);
    version = manifest.version;
    console.log(
      `[catalog/publish] gcs version=${manifest.version} cards=${manifest.cardCount} gzip=${gzipBody.length}`
    );
  }

  seedCatalogCacheGzip(gzipBody);
  console.log(`[catalog/publish] cache seeded ${heapMb()}`);

  const durationMs = Date.now() - t0;
  console.log(
    `[catalog/publish] complete cards=${cardCount} gcs=${gcs} total=${durationMs}ms gzip=${
      gzipBody.length
    } ${heapMb()}`
  );

  return { cardCount, gcs, version, bytes: gzipBody.length, durationMs };
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
