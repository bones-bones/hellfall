import { withCors, requireAdminAuth, HandlerRequest, HandlerResponse } from './lib';
import { publishCatalogSnapshot } from '../lib/publishCatalog.ts';

/** POST /api/admin/catalog/sync — republish Firestore catalog to cache (+ GCS when configured). */
export const catalogSyncHandler = async (
  req: HandlerRequest,
  res: HandlerResponse
): Promise<void> => {
  const headers = withCors({ 'Content-Type': 'application/json' }, req);
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    res.end();
    return;
  }

  const auth = await requireAdminAuth(req, res);
  if (!auth) return;

  try {
    const result = await publishCatalogSnapshot();
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, ...result }));
  } catch (err) {
    console.error('catalogSyncHandler', err);
    res.statusCode = 500;
    res.end(JSON.stringify({ ok: false, reason: 'sync_failed' }));
  }
};
