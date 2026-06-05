import { Firestore, type DocumentReference, type DocumentSnapshot } from '@google-cloud/firestore';
import { withCors } from './lib/cors.js';
import { env } from './lib/env.js';
import type { HandlerRequest, HandlerResponse } from './lib/types.js';
import { requireTagAuth } from './lib/requireTagAuth.js';
import { listCardChangesets, recordTagChangeset } from '../lib/cardAudit.js';
import { HCCard, tagState } from '@hellfall/shared/types';
import {
  addTagContributor,
  cardToFirestore,
  deleteTagContributor,
  firestoreCard,
  firestoreToCard,
} from '@hellfall/shared/utils';
// import {
//   applyAddTag,
//   applyRemoveTag,
//   normalizeTag,
//   resolveTagState,
//   tagFieldsForWrite,
// } from '@hellfall/shared/cardTags/cardTagMerge';

const db = new Firestore({ databaseId: env.FIRESTORE_DATABASE_ID });
const collection = db.collection(env.FIRESTORE_CARDS_COLLECTION);

// const EMPTY_TAG_SEED = {
//   baseTags: [] as string[],
//   added: [] as string[],
//   removed: [] as string[],
//   tags: [] as string[],
// };

/** If `cards/{id}` is missing, create empty tag fields (merge-safe). Returns latest snapshot. */
// async function getOrSeedCardDoc(docRef: DocumentReference): Promise<DocumentSnapshot> {
//   let snap = await docRef.get();
//   if (!snap.exists) {
//     await docRef.set(EMPTY_TAG_SEED, { merge: true });
//     snap = await docRef.get();
//   }
//   return snap;
// }

async function readJsonBody(req: HandlerRequest): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks).toString('utf-8');
  return body ? JSON.parse(body) : {};
}

// function tagResponsePayload(state: tagState *) {
//   return {
//     base_tags: state.base_tags,
//     added: state.added,
//     removed: state.removed,
//     persistEnabled: true as const,
//   };
// }

export const cardTagsHandler = async (
  req: HandlerRequest,
  res: HandlerResponse,
  cardId: string,
  // tagFromPath: string | null,
  auditTrail = false
): Promise<void> => {
  const headers = withCors({ 'Content-Type': 'application/json' }, req);
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

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
      const entries = await listCardChangesets(cardId, limit);
      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true, cardId, entries }));
      return;
    }

    if (req.method === 'GET') {
      // const snap = await getOrSeedCardDoc(docRef);
      // const state = resolveTagState(snap.data());
      const card: firestoreCard = await docRef.get();
      const state = card.tag_state ?? {};
      let body: string;
      try {
        body = JSON.stringify({ ...state, persistEnabled: true });
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

    let reqBody: { tag?: string };
    try {
      reqBody = (await readJsonBody(req)) as { tag?: string };
    } catch {
      res.statusCode = 400;
      res.end(JSON.stringify({ ok: false, reason: 'invalid_json' }));
      return;
    }
    const tag = (reqBody.tag != null ? String(reqBody.tag) : '').trim();
    // const norm = normalizeTag(tag);
    if (!tag) {
      res.statusCode = 400;
      res.end(JSON.stringify({ ok: false, reason: 'tag_required' }));
      return;
    }
    // const snap = await getOrSeedCardDoc(docRef);
    // const before = resolveTagState(snap.data());
    // const state = applyAddTag(before, norm);
    const card: HCCard.Any = firestoreToCard(await docRef.get());
    const before = card.tag_state ?? {};
    if (req.method === 'POST') {
      addTagContributor(card, tag);
      await docRef.set(cardToFirestore(card) /*  { merge: true } */);
      await recordTagChangeset({
        cardId,
        action: 'tag_add',
        tag,
        user: { userId: auth.userId, username: auth.username },
        before,
        after: card.tag_state,
      });
      res.statusCode = 200;
      res.end(
        JSON.stringify({
          ok: true,
          base_tags: card.tag_state?.base_tags,
          added: card.tag_state?.added,
          removed: card.tag_state?.removed,
        })
      );
      return;
    }

    if (req.method === 'DELETE') {
      // const norm = tagFromPath ? normalizeTag(tagFromPath) : null;
      // if (!norm) {
      //   res.statusCode = 400;
      //   res.end(JSON.stringify({ ok: false, reason: 'tag_required' }));
      //   return;
      // }
      // const snap = await getOrSeedCardDoc(docRef);
      // const before = resolveTagState(snap.data());
      // const state = applyRemoveTag(before, norm);
      deleteTagContributor(card, tag);
      await docRef.set(cardToFirestore(card) /* { merge: true } */);
      await recordTagChangeset({
        cardId,
        action: 'tag_remove',
        tag,
        user: { userId: auth.userId, username: auth.username },
        before,
        after: card.tag_state,
      });
      res.statusCode = 200;
      res.end(
        JSON.stringify({
          ok: true,
          base_tags: card.tag_state?.base_tags,
          added: card.tag_state?.added,
          removed: card.tag_state?.removed,
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
