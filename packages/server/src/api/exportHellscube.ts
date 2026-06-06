import { exportHellscubeCards } from '../lib/exportHellscubeCards.ts';
import { withCors } from './lib/cors.ts';
import { env } from './lib/env.ts';
import { requireAdminAuth } from './lib/requireAdminAuth.ts';
import type { HandlerRequest, HandlerResponse } from './lib/types.ts';

/** GET /api/admin/export-hellscube — full cards collection export (admin only). */
export const exportHellscubeHandler = async (
  req: HandlerRequest,
  res: HandlerResponse
): Promise<void> => {
  const headers = withCors({ 'Content-Type': 'application/json' }, req);
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    res.end();
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
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.statusCode = 200;
  res.end(JSON.stringify(payload));
};
