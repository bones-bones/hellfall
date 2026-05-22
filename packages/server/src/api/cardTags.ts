import { withCors } from './lib/cors.ts';
import { env } from './lib/env.ts';
import type { HandlerRequest, HandlerResponse } from './lib/types.ts';
import { requireTagAuth } from './lib/requireTagAuth.ts';
import { getTagOverrides, setTagOverrides } from './tagsStore.ts';
const useLocalData = env.USE_LOCAL_CARD_DATA;

async function readJsonBody(req: HandlerRequest): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks).toString('utf-8');
  return body ? JSON.parse(body) : {};
}

export type CardTagOverrides = { added: string[]; removed: string[] };

function normalizeTag(t: string): string {
  return t.trim();
}

export const cardTagsHandler = async (
  req: HandlerRequest,
  res: HandlerResponse,
  cardId: string
  // tagFromPath: string | null |undefined
): Promise<void> => {
  const headers = withCors({ 'Content-Type': 'application/json' }, req);
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    if (!cardId || cardId.length > 200) {
      res.statusCode = 400;
      res.end(JSON.stringify({ ok: false, reason: 'invalid_card_id' }));
      return;
    }
    if (req.method === 'GET') {
      const { added, removed } = await getTagOverrides(cardId);
      const payload = { added, removed, persistEnabled: true };
      let body: string;
      try {
        body = JSON.stringify(payload);
      } catch {
        res.statusCode = 500;
        res.end(JSON.stringify({ ok: false, reason: 'invalid_stored_data' }));
        return;
      }
      res.statusCode = 200;
      res.end(body);
      return;
    }
    if (!useLocalData) {
      const auth = await requireTagAuth(req, res);
      if (!auth) return;
    }
    let body: { tag?: string };
    try {
      body = (await readJsonBody(req)) as { tag?: string };
    } catch {
      res.statusCode = 400;
      res.end(JSON.stringify({ ok: false, reason: 'invalid_json' }));
      return;
    }
    const tag = body.tag != null ? String(body.tag) : '';
    const norm = normalizeTag(tag);
    if (!norm) {
      res.statusCode = 400;
      res.end(JSON.stringify({ ok: false, reason: 'tag_required' }));
      return;
    }

    const { added, removed } = await getTagOverrides(cardId);
    const newAdded = [...added];
    const newRemoved = [...removed];

    if (req.method === 'POST') {
      if (newRemoved.includes(norm)) {
        newRemoved.splice(newRemoved.indexOf(norm), 1);
      } else if (!newAdded.includes(norm)) {
        newAdded.push(norm);
      }
      await setTagOverrides(cardId, { added: newAdded, removed: newRemoved });
      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true, added: newAdded, removed: newRemoved }));
      return;
    }

    if (req.method === 'DELETE') {
      if (newAdded.includes(norm)) {
        newAdded.splice(newAdded.indexOf(norm), 1);
      } else if (!newRemoved.includes(norm)) {
        newRemoved.push(norm);
      }
      await setTagOverrides(cardId, { added: newAdded, removed: newRemoved });
      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true, added: newAdded, removed: newRemoved }));
      return;
    }

    res.statusCode = 405;
    res.setHeader('Allow', 'GET, POST, DELETE, OPTIONS');
    res.end();
  } catch (err) {
    console.error('cardTagsHandler', err);

    if (res.writableEnded) return;
    res.statusCode = 500;
    res.end(JSON.stringify({ ok: false, reason: 'server_error' }));
  }
};
