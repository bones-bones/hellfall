import { getCatalogResponseBody } from '../lib/catalogCache.ts';
import { withCors } from './lib/cors.ts';
import type { HandlerRequest, HandlerResponse } from './lib/types.ts';

function getCatalogPublicUrl(): string {
  const fromEnv = process.env.CATALOG_PUBLIC_URL?.trim();
  if (fromEnv) return fromEnv;
  const bucket = process.env.CATALOG_GCS_BUCKET?.trim();
  if (bucket) return `https://storage.googleapis.com/${bucket}/catalog.json`;
  return '';
}

/** GET /api/cards/load — full card catalog from Firestore ({ data: HCCard[] }). */
export const loadCardsHandler = async (
  req: HandlerRequest,
  res: HandlerResponse
): Promise<void> => {
  if (req.method !== 'GET') {
    const headers = withCors({ 'Content-Type': 'application/json' }, req);
    Object.assign(headers, { 'Cache-Control': 'public, max-age=' + 3 * 24 * 60 * 60 });
    Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    res.end();
    return;
  }

  const publicUrl = getCatalogPublicUrl();
  const origin = req.headers.origin;
  // Cross-origin fetch following a 302 drops Origin, so GCS won't return CORS headers.
  // Redirect only non-browser clients (curl, etc.); browsers get the body or use CARD_CATALOG_URL.
  if (publicUrl && !origin) {
    const headers = withCors({}, req);
    Object.assign(headers, { Location: publicUrl, 'Cache-Control': 'public, max-age=300' });
    Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
    res.statusCode = 302;
    res.end();
    console.log(`[cards/load] redirect location=${publicUrl}`);
    return;
  }

  const headers = withCors({ 'Content-Type': 'application/json' }, req);
  Object.assign(headers, { 'Cache-Control': 'public, max-age=' + 3 * 24 * 60 * 60 });
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

  const t0 = Date.now();
  const body = await getCatalogResponseBody();
  const catalogMs = Date.now() - t0;
  res.statusCode = 200;
  res.end(body);
  console.log(
    `[cards/load] request complete catalog=${catalogMs}ms write=${
      Date.now() - t0 - catalogMs
    }ms total=${Date.now() - t0}ms bytes=${body.length}`
  );
};
