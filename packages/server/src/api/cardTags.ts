import { Firestore, type DocumentReference, type DocumentSnapshot } from '@google-cloud/firestore';
import { withCors } from './lib/cors.js';
import { env } from './lib/env.js';
import type { HandlerRequest, HandlerResponse } from './lib/types.js';
import { requireTagAuth } from './lib/requireTagAuth.js';
import { listCardTagAudit, recordCardTagAudit } from '../lib/cardTagAudit.js';
import {
  applyAddTag,
  applyRemoveTag,
  normalizeTag,
  resolveTagState,
  tagFieldsForWrite,
} from '../lib/cardTagMerge.js';

const db = new Firestore({ databaseId: env.FIRESTORE_HELLSCUBE_DATABASE_ID });
const collection = db.collection(env.FIRESTORE_CARDS_COLLECTION);

const EMPTY_TAG_SEED = {
  baseTags: [] as string[],
  added: [] as string[],
  removed: [] as string[],
  tags: [] as string[],
};

/** If `cards/{id}` is missing, create empty tag fields (merge-safe). Returns latest snapshot. */
async function getOrSeedCardDoc(docRef: DocumentReference): Promise<DocumentSnapshot> {
  let snap = await docRef.get();
  if (!snap.exists) {
    await docRef.set(EMPTY_TAG_SEED, { merge: true });
    snap = await docRef.get();
  }
  return snap;
}

async function readJsonBody(req: HandlerRequest): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks).toString('utf-8');
  return body ? JSON.parse(body) : {};
}

function tagResponsePayload(state: ReturnType<typeof resolveTagState>) {
  return {
    tags: state.tags,
    added: state.added,
    removed: state.removed,
    persistEnabled: true as const,
  };
}

export const cardTagsHandler = async (
  req: HandlerRequest,
  res: HandlerResponse,
  cardId: string,
  tagFromPath: string | null,
  auditTrail = false
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

    const docRef = collection.doc(cardId);

    if (auditTrail) {
      if (req.method !== 'GET') {
        res.statusCode = 405;
        res.setHeader('Allow', 'GET, OPTIONS');
        res.end();
        return;
      }
      const auth = await requireTagAuth(req, res);
      if (!auth) return;
      const limitRaw = req.query?.limit;
      const limit =
        typeof limitRaw === 'string' && /^\d+$/.test(limitRaw)
          ? Math.min(200, Math.max(1, Number(limitRaw)))
          : 50;
      const entries = await listCardTagAudit(cardId, limit);
      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true, cardId, entries }));
      return;
    }

    if (req.method === 'GET') {
      const snap = await getOrSeedCardDoc(docRef);
      const state = resolveTagState(snap.data());
      let body: string;
      try {
        body = JSON.stringify(tagResponsePayload(state));
      } catch {
        res.statusCode = 500;
        res.end(JSON.stringify({ ok: false, reason: 'invalid_stored_data' }));
        return;
      }
      res.statusCode = 200;
      res.end(body);
      return;
    }

    const auth = await requireTagAuth(req, res);
    if (!auth) return;

    if (req.method === 'POST') {
      let reqBody: { tag?: string };
      try {
        reqBody = (await readJsonBody(req)) as { tag?: string };
      } catch {
        res.statusCode = 400;
        res.end(JSON.stringify({ ok: false, reason: 'invalid_json' }));
        return;
      }
      const tag = reqBody.tag != null ? String(reqBody.tag) : '';
      const norm = normalizeTag(tag);
      if (!norm) {
        res.statusCode = 400;
        res.end(JSON.stringify({ ok: false, reason: 'tag_required' }));
        return;
      }
      const snap = await getOrSeedCardDoc(docRef);
      const before = resolveTagState(snap.data());
      const state = applyAddTag(before, norm);
      await docRef.set(tagFieldsForWrite(state), { merge: true });
      await recordCardTagAudit({
        cardId,
        action: 'tag_add',
        tag: norm,
        user: { userId: auth.userId, username: auth.username },
        before,
        after: state,
      });
      res.statusCode = 200;
      res.end(
        JSON.stringify({
          ok: true,
          tags: state.tags,
          added: state.added,
          removed: state.removed,
        })
      );
      return;
    }

    if (req.method === 'DELETE') {
      const norm = tagFromPath ? normalizeTag(tagFromPath) : null;
      if (!norm) {
        res.statusCode = 400;
        res.end(JSON.stringify({ ok: false, reason: 'tag_required' }));
        return;
      }
      const snap = await getOrSeedCardDoc(docRef);
      const before = resolveTagState(snap.data());
      const state = applyRemoveTag(before, norm);
      await docRef.set(tagFieldsForWrite(state), { merge: true });
      await recordCardTagAudit({
        cardId,
        action: 'tag_remove',
        tag: norm,
        user: { userId: auth.userId, username: auth.username },
        before,
        after: state,
      });
      res.statusCode = 200;
      res.end(
        JSON.stringify({
          ok: true,
          tags: state.tags,
          added: state.added,
          removed: state.removed,
        })
      );
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
