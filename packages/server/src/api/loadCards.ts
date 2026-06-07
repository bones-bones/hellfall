import { getCatalogResponseBody } from '../lib/catalogCache.ts';
import { withCors } from './lib/cors.ts';
import type { HandlerRequest, HandlerResponse } from './lib/types.ts';

/** GET /api/cards/load — full card catalog from Firestore ({ data: HCCard[] }). */
export const loadCardsHandler = async (
  req: HandlerRequest,
  res: HandlerResponse
): Promise<void> => {
  const headers = withCors({ 'Content-Type': 'application/json' }, req);
  Object.assign(headers, { 'Cache-Control': 'public, max-age=' + 3 * 24 * 60 * 60 });
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    res.end();
    return;
  }

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
