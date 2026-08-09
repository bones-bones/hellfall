import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gunzipSync, gzipSync } from 'node:zlib';
import type { HCCard } from '@hellfall/shared/types';
import { downloadCatalogGzipFromGcs } from './catalogGcs.ts';
import { resolveDataDir } from './loadDataFiles.ts';

/** Default 24h — catalog refreshes via publish on accept, not Firestore on TTL. */
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

type CacheEntry = { gzipBody: Buffer; body?: string; loadedAt: number };

let cache: CacheEntry | null = null;
let inflight: Promise<CacheEntry> | null = null;

function makeCacheEntry(gzipBody: Buffer): CacheEntry {
  return { gzipBody, loadedAt: Date.now() };
}

function bodyFromEntry(entry: CacheEntry): string {
  if (!entry.body) {
    entry.body = gunzipSync(entry.gzipBody).toString('utf-8');
  }
  return entry.body;
}

/** Drop cached catalog bytes (call before publish to free heap for Firestore export). */
export function releaseCatalogCache(): void {
  cache = null;
}

/** Seed cache from gzip bytes only (keeps ~20MB JSON string off the heap until needed). */
export function seedCatalogCacheGzip(gzipBody: Buffer): void {
  if (!gzipBody.length) return;
  cache = makeCacheEntry(gzipBody);
}

/** Seed cache from an already-serialized `{ data: HCCard[] }` JSON string. */
export function seedCatalogCacheBody(body: string, gzipBody?: Buffer): void {
  if (!body) return;
  seedCatalogCacheGzip(gzipBody ?? gzipSync(body));
}

/** Reuse cards already loaded at server startup (avoids a second full Firestore read). */
export function seedCatalogCache(cards: HCCard.Any[]): void {
  if (cards.length === 0) return;
  seedCatalogCacheBody(JSON.stringify({ data: cards }));
}

function cacheTtlMs(): number {
  const fromEnv = Number(process.env.CATALOG_CACHE_TTL_MS);
  return Number.isFinite(fromEnv) && fromEnv > 0 ? fromEnv : DEFAULT_TTL_MS;
}

async function buildCatalogGzip(): Promise<Buffer> {
  const t0 = Date.now();

  try {
    const fromGcs = await downloadCatalogGzipFromGcs();
    if (fromGcs) {
      console.log(
        `[cards/load] buildCatalogGzip source=gcs total=${Date.now() - t0}ms gzip=${fromGcs.length}`
      );
      return fromGcs;
    }
  } catch (err) {
    console.error('[cards/load] gcs download failed', err);
  }

  const bundledPath = join(resolveDataDir(), 'Hellscube-Database.json');
  const gzipBody = gzipSync(readFileSync(bundledPath));
  console.log(
    `[cards/load] buildCatalogGzip source=bundled total=${Date.now() - t0}ms gzip=${
      gzipBody.length
    }`
  );
  return gzipBody;
}

/** Cached `{ data: HCCard[] }` JSON (lazy) and pre-gzipped bytes for `/api/cards/load`. */
export async function getCatalogResponse(): Promise<{ body: string; gzipBody: Buffer }> {
  const t0 = Date.now();
  const now = Date.now();
  if (cache && now - cache.loadedAt < cacheTtlMs()) {
    const ageMs = now - cache.loadedAt;
    console.log(
      `[cards/load] cache hit age=${ageMs}ms ttl=${cacheTtlMs()}ms gzip=${
        cache.gzipBody.length
      } total=${Date.now() - t0}ms`
    );
    return { body: bodyFromEntry(cache), gzipBody: cache.gzipBody };
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
        const gzipBody = await buildCatalogGzip();
        cache = makeCacheEntry(gzipBody);
        return cache;
      } finally {
        inflight = null;
      }
    })();
  } else {
    console.log('[cards/load] cache stale/empty, waiting on inflight refresh');
  }

  const entry = await inflight;
  console.log(
    `[cards/load] ${waitingOnInflight ? 'inflight wait' : 'refresh'} complete total=${
      Date.now() - t0
    }ms gzip=${entry.gzipBody.length}`
  );
  return { body: bodyFromEntry(entry), gzipBody: entry.gzipBody };
}

export async function getCatalogResponseBody(): Promise<string> {
  return (await getCatalogResponse()).body;
}

/** Warm cache after listen so the first browser request is fast. */
export function warmCatalogCache(): void {
  void getCatalogResponse().catch(err => {
    console.error('catalog cache warm failed', err);
  });
}
