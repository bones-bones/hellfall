import type { HCCard } from '@hellfall/shared/types';
import { downloadCatalogBodyFromGcs } from './catalogGcs.ts';
import { readDataJson } from './loadDataFiles.ts';

/** Default 24h — catalog refreshes via publish on accept, not Firestore on TTL. */
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

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
  const t0 = Date.now();

  try {
    const fromGcs = await downloadCatalogBodyFromGcs();
    if (fromGcs) {
      console.log(
        `[cards/load] buildCatalogBody source=gcs total=${Date.now() - t0}ms bytes=${fromGcs.length}`
      );
      return fromGcs;
    }
  } catch (err) {
    console.error('[cards/load] gcs download failed', err);
  }

  const { data } = readDataJson<{ data: HCCard.Any[] }>('Hellscube-Database.json');
  const body = JSON.stringify({ data });
  console.log(
    `[cards/load] buildCatalogBody source=bundled cards=${data.length} total=${Date.now() - t0}ms bytes=${body.length}`
  );
  return body;
}

/** Cached `{ data: HCCard[] }` JSON for `/api/cards/load` (single-flight refresh). */
export async function getCatalogResponseBody(): Promise<string> {
  const t0 = Date.now();
  const now = Date.now();
  if (cache && now - cache.loadedAt < cacheTtlMs()) {
    const ageMs = now - cache.loadedAt;
    console.log(
      `[cards/load] cache hit age=${ageMs}ms ttl=${cacheTtlMs()}ms bytes=${
        cache.body.length
      } total=${Date.now() - t0}ms`
    );
    return cache.body;
  }

  const waitingOnInflight = inflight !== null;
  if (!inflight) {
    console.log(
      `[cards/load] cache ${cache ? 'stale' : 'empty'} (age=${
        cache ? now - cache.loadedAt : 'n/a'
      }ms), refreshing`
    );
    inflight = (async () => {
      try {
        const body = await buildCatalogBody();
        cache = { body, loadedAt: Date.now() };
        return body;
      } finally {
        inflight = null;
      }
    })();
  } else {
    console.log('[cards/load] cache stale/empty, waiting on inflight refresh');
  }

  const body = await inflight;
  console.log(
    `[cards/load] ${waitingOnInflight ? 'inflight wait' : 'refresh'} complete total=${
      Date.now() - t0
    }ms bytes=${body.length}`
  );
  return body;
}

/** Warm cache after listen so the first browser request is fast. */
export function warmCatalogCache(): void {
  void getCatalogResponseBody().catch(err => {
    console.error('catalog cache warm failed', err);
  });
}
