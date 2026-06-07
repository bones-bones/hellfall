import { getCatalogPublicUrl } from '../lib/catalogGcs.ts';
import { getCatalogResponse } from '../lib/catalogCache.ts';
import { withCors } from './lib/cors.ts';
import type { HandlerRequest, HandlerResponse } from './lib/types.ts';

/** GET /api/cards/load — redirects to public catalog URL when configured, else serves cached JSON. */
export const loadCardsHandler = async (
  req: HandlerRequest,
  res: HandlerResponse
): Promise<void> => {
  if (req.method !== 'GET') {
    const headers = withCors({}, req);
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
  const { body, gzipBody } = await getCatalogResponse();
  const catalogMs = Date.now() - t0;
  const acceptsGzip = req.headers['accept-encoding']?.includes('gzip');
  res.statusCode = 200;
  if (acceptsGzip) {
    res.setHeader('Content-Encoding', 'gzip');
    res.setHeader('Vary', 'Accept-Encoding');
    res.end(gzipBody);
  } else {
    res.end(body);
  }
  console.log(
    `[cards/load] request complete catalog=${catalogMs}ms write=${
      Date.now() - t0 - catalogMs
    }ms total=${Date.now() - t0}ms bytes=${acceptsGzip ? gzipBody.length : body.length} gzip=${acceptsGzip}`
  );
};
