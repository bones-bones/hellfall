import { env } from '../api/lib/env.ts';
import { seedCatalogCache } from './catalogCache.ts';
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

/** Full Firestore export → in-memory cache (+ GCS when configured). */
export async function publishCatalogSnapshot(): Promise<CatalogPublishResult> {
  const t0 = Date.now();
  const data = await loadHellscubeCatalogCards({
    databaseId: env.FIRESTORE_DATABASE_ID,
    collectionName: env.FIRESTORE_CARDS_COLLECTION,
  });
  const body = JSON.stringify({ data });

  seedCatalogCache(data);

  let version: string | undefined;
  const gcs = isCatalogGcsConfigured();
  if (gcs) {
    const manifest = await uploadCatalogToGcs(body, data.length);
    version = manifest.version;
    console.log(
      `[catalog/publish] gcs version=${manifest.version} cards=${manifest.cardCount} bytes=${body.length}`
    );
  }

  const durationMs = Date.now() - t0;
  console.log(
    `[catalog/publish] complete cards=${data.length} gcs=${gcs} total=${durationMs}ms bytes=${body.length}`
  );

  return { cardCount: data.length, gcs, version, bytes: body.length, durationMs };
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
