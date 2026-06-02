import { exportHellscubeCards } from '@hellfall/shared/export/cards';
import { firestoreDocsToCatalogCards } from '@hellfall/shared/export/firestoreToCatalog';
import { withCors } from './lib/cors.ts';
import { env } from './lib/env.ts';
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

  const payload = await exportHellscubeCards({
    databaseId: env.FIRESTORE_DATABASE_ID,
    collectionName: env.FIRESTORE_CARDS_COLLECTION,
  });

  const data = firestoreDocsToCatalogCards(
    payload.data.map(({ _docId, ...card }) => card)
  );

  res.statusCode = 200;
  res.end(JSON.stringify({ data }));
};
