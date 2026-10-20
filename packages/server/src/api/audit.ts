import { withCors, HandlerRequest, HandlerResponse, requireReviewerAuth } from './lib';
import { listAudits } from '../lib/cardAudit.ts';

/** GET /api/audit — recent audit entries. Optional `?cardId=` and `?limit=`. */
export const auditHandler = async (req: HandlerRequest, res: HandlerResponse): Promise<void> => {
  const headers = withCors({ 'Content-Type': 'application/json' }, req);
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, OPTIONS');
    res.end();
    return;
  }

  const auth = await requireReviewerAuth(req, res);
  if (!auth) return;

  const cardIdRaw = req.query?.cardId;
  const cardId = typeof cardIdRaw === 'string' && cardIdRaw.trim() ? cardIdRaw.trim() : undefined;
  if (cardId && cardId.length > 200) {
    res.statusCode = 400;
    res.end(JSON.stringify({ ok: false, reason: 'invalid_card_id' }));
    return;
  }

  const limitRaw = req.query?.limit;
  const limit =
    typeof limitRaw === 'string' && /^\d+$/.test(limitRaw)
      ? Math.min(200, Math.max(1, Number(limitRaw)))
      : 50;

  try {
    const entries = await listAudits(cardId, limit);
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, entries }));
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'audit_query_failed';
    console.error('auditHandler', err);
    res.statusCode = 500;
    res.end(JSON.stringify({ ok: false, reason: 'audit_query_failed', detail }));
  }
};
