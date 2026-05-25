import { exportHellscubeCards } from '@hellfall/shared/export/cards';
import { withCors } from './lib/cors.js';
import { env } from './lib/env.js';
import { requireAdminAuth } from './lib/requireAdminAuth.js';
import type { HandlerRequest, HandlerResponse } from './lib/types.js';

/** GET /api/admin/export-hellscube — full cards collection export (admin only). */
export async function exportHellscubeHandler(
  req: HandlerRequest,
  res: HandlerResponse
): Promise<void> {
  if (req.method !== 'GET') {
    const headers = withCors({ 'Content-Type': 'application/json' }, req);
    Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const auth = await requireAdminAuth(req, res);
  if (!auth) return;

  const payload = await exportHellscubeCards({
    databaseId: env.FIRESTORE_DATABASE_ID,
    collectionName: env.FIRESTORE_CARDS_COLLECTION,
  });

  const date = payload.exportedAt.slice(0, 10);
  const filename = `hellscube-cards-${date}.json`;
  const headers = withCors(
    {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
    req
  );
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
  res.statusCode = 200;
  res.end(JSON.stringify(payload));
}
