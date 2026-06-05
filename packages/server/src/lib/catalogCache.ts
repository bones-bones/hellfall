import type { HCCard } from '@hellfall/shared/types';
// import { loadHellscubeCatalogCards } from '@hellfall/shared/export/loadHellscubeCatalog';
import { env } from '../api/lib/env.ts';
import { exportCardMap } from '@hellfall/shared/utils';

const DEFAULT_TTL_MS = 15 * 60 * 1000;

type CacheEntry = { body: string; loadedAt: number };

let cache: CacheEntry | null = null;
let inflight: Promise<string> | null = null;

/** Reuse cards already loaded at server startup (avoids a second full Firestore read). */
export function seedCatalogCache(cards: HCCard.Any[]): void {
  if (cards.length === 0) return;
  cache = { body: JSON.stringify({ data: cards }), loadedAt: Date.now() };
}

function cacheTtlMs(): number {
  const fromEnv = Number(process.env.CATALOG_CACHE_TTL_MS);
  return Number.isFinite(fromEnv) && fromEnv > 0 ? fromEnv : DEFAULT_TTL_MS;
}

async function buildCatalogBody(): Promise<string> {
  const data = await exportCardMap({
    databaseId: env.FIRESTORE_DATABASE_ID,
    collectionName: env.FIRESTORE_CARDS_COLLECTION,
  });
  return JSON.stringify({ data });
}

/** Cached `{ data: HCCard[] }` JSON for `/api/cards/load` (single-flight refresh). */
export async function getCatalogResponseBody(): Promise<string> {
  const now = Date.now();
  if (cache && now - cache.loadedAt < cacheTtlMs()) {
    return cache.body;
  }

  if (!inflight) {
    inflight = (async () => {
      try {
        const body = await buildCatalogBody();
        cache = { body, loadedAt: Date.now() };
        return body;
      } finally {
        inflight = null;
      }
    })();
  }

  return inflight;
}

/** Warm cache after listen so the first browser request is fast. */
export function warmCatalogCache(): void {
  void getCatalogResponseBody().catch(err => {
    console.error('catalog cache warm failed', err);
  });
}
