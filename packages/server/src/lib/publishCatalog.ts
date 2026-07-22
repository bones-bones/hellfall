import { gzipSync } from 'node:zlib';
import { env } from '../api/lib/env.ts';
import { seedCatalogCacheBody } from './catalogCache.ts';
import { isCatalogGcsConfigured, uploadCatalogToGcs } from './catalogGcs.ts';
import { loadHellscubeCatalogCards } from '@hellfall/shared/utils/firestore';

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

  let data = await loadHellscubeCatalogCards({
    databaseId: env.FIRESTORE_DATABASE_ID,
    collectionName: env.FIRESTORE_CARDS_COLLECTION,
  });
  const cardCount = data.length;
  console.log(`[catalog/publish] loaded cards=${cardCount} ${heapMb()}`);

  const body = JSON.stringify({ data });
  // Drop the card array so GC can reclaim it before gzip/upload (body holds the copy).
  data = [];
  const gzipBody = gzipSync(body);
  seedCatalogCacheBody(body, gzipBody);
  console.log(
    `[catalog/publish] serialized bytes=${body.length} gzip=${gzipBody.length} ${heapMb()}`
  );

  let version: string | undefined;
  const gcs = isCatalogGcsConfigured();
  if (gcs) {
    const manifest = await uploadCatalogToGcs(body, cardCount, gzipBody);
    version = manifest.version;
    console.log(
      `[catalog/publish] gcs version=${manifest.version} cards=${manifest.cardCount} bytes=${body.length}`
    );
  }

  const durationMs = Date.now() - t0;
  console.log(
    `[catalog/publish] complete cards=${cardCount} gcs=${gcs} total=${durationMs}ms bytes=${
      body.length
    } ${heapMb()}`
  );

  return { cardCount, gcs, version, bytes: body.length, durationMs };
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
