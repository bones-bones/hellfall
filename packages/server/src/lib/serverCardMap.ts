import { gunzipSync } from 'node:zlib';
import { cardsData } from '@hellfall/shared/data';
import { CardMap } from '@hellfall/shared/utils';
import { downloadCatalogGzipFromGcs } from './catalogGcs.ts';

let cardMap: CardMap | null = null;
let inflight: Promise<CardMap> | null = null;

/** Build a CardMap from catalog JSON (fullCache, `{ data }`, or card array). */
export function cardMapFromCatalogJson(parsed: unknown): CardMap {
  // CardMap accepts fullCache / cardCache / array; types are package-private.
  return new CardMap(parsed as never);
}

/** Drop the resident CardMap (call before publish to free heap). */
export function releaseServerCardMap(): void {
  cardMap = null;
}

/** Test-only: seat a map without GCS/bundled load. */
export function seedServerCardMapForTests(map: CardMap): void {
  cardMap = map;
}

function heapMb(): string {
  const { heapUsed, rss } = process.memoryUsage();
  return `heap=${Math.round(heapUsed / 1024 / 1024)}MB rss=${Math.round(rss / 1024 / 1024)}MB`;
}

/**
 * Prefer published GCS gzip (fullCache) over bundled cardsData.
 * Avoids getCatalogResponse() so we do not keep a ~28MB JSON string in the HTTP catalog cache
 * while a CardMap is also resident.
 */
async function loadServerCardMap(): Promise<CardMap> {
  const t0 = Date.now();

  // Tests / local: skip GCS (avoids network + 404 noise). Still loads bundled cardsData.
  if (process.env.SERVER_CARDMAP_FORCE_BUNDLED !== '1') {
    try {
      const gzipBody = await downloadCatalogGzipFromGcs();
      if (gzipBody) {
        const json = gunzipSync(gzipBody).toString('utf-8');
        const parsed: unknown = JSON.parse(json);
        const map = cardMapFromCatalogJson(parsed);
        console.log(
          `[cardMap] loaded source=gcs size=${map.size} total=${Date.now() - t0}ms ${heapMb()}`
        );
        return map;
      }
    } catch (err) {
      console.error('[cardMap] gcs download/parse failed, falling back to bundled', err);
    }
  }

  const map = new CardMap(cardsData.data);
  console.log(
    `[cardMap] loaded source=bundled size=${map.size} total=${Date.now() - t0}ms ${heapMb()}`
  );
  return map;
}

/** Lazy CardMap with single-flight coalesce for concurrent callers. */
export async function getCardMap(): Promise<CardMap> {
  if (cardMap) return cardMap;

  if (!inflight) {
    inflight = loadServerCardMap()
      .then(map => {
        cardMap = map;
        return map;
      })
      .finally(() => {
        inflight = null;
      });
  }

  return inflight;
}

/**
 * Drop any resident map, then load a fresh one.
 * Waits out an in-flight load first so it cannot re-seat a stale instance after release.
 */
export async function reloadServerCardMap(): Promise<CardMap> {
  if (inflight) {
    try {
      await inflight;
    } catch {
      /* ignore; release + reload below */
    }
  }
  releaseServerCardMap();
  return getCardMap();
}

/** Fire-and-forget warm after listen (does not block startup). */
export function warmServerCardMap(): void {
  void getCardMap().catch(err => {
    console.error('[cardMap] warm failed', err);
  });
}
