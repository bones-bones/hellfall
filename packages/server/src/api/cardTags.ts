import {
  FieldValue,
  Firestore,
  type DocumentReference,
  type DocumentSnapshot,
} from '@google-cloud/firestore';
import { withCors } from './lib/cors.js';
import { env } from './lib/env.js';
import type { HandlerRequest, HandlerResponse } from './lib/types.js';
import { requireTagAuth } from './lib/requireTagAuth.js';
import { listCardChangesets } from '../lib/cardAudit.js';
import { HCCard } from '@hellfall/shared/types';
import {
  addTagToBase,
  anyChange,
  changeIsValid,
  deleteTagFromBase,
  getChangesFromDifferences,
  getChangesFromTag,
  tagChange,
  tagChangeIsValid,
  tagChangesAnyProps,
} from '@hellfall/shared/utils';
import { cardToFirestore, firestoreCard, firestoreToCard } from '@hellfall/shared/utils/firestore';
// import {
//   applyAddTag,
//   applyRemoveTag,
//   normalizeTag,
//   resolveTagState,
//   tagFieldsForWrite,
// } from '@hellfall/shared/cardTags/cardTagMerge';

const db = new Firestore({ databaseId: env.FIRESTORE_DATABASE_ID });
const collection = db.collection(env.FIRESTORE_CARDS_COLLECTION);
const changesetsCol = db.collection(env.FIRESTORE_CHANGESETS_COLLECTION);

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
      const snap = await docRef.get();
      const card = (snap.data() ?? {}) as firestoreCard;
      res.statusCode = 200;
      res.end(JSON.stringify({ base_tags: card.base_tags ?? [], persistEnabled: true }));
      return;
    }

    if (req.method === 'POST') {
      const auth = await requireTagAuth(req, res);
      if (!auth) {
        return;
      }

      let reqBody: { tag?: string; change_type: 'add' | 'delete' };
      try {
        reqBody = (await readJsonBody(req)) as { tag?: string; change_type: 'add' | 'delete' };
        if (reqBody.change_type != 'add' && reqBody.change_type != 'delete') {
          res.statusCode = 400;
          res.end(JSON.stringify({ ok: false, reason: 'invalid_json' }));
          return;
        }
      } catch {
        res.statusCode = 400;
        res.end(JSON.stringify({ ok: false, reason: 'invalid_json' }));
        return;
      }
      const tag = (reqBody.tag != null ? String(reqBody.tag) : '').trim();
      const change_type = reqBody.change_type;
      // const norm = normalizeTag(tag);
      if (!tag) {
        res.statusCode = 400;
        res.end(JSON.stringify({ ok: false, reason: 'tag_required' }));
        return;
      }

      const snap = await docRef.get();
      if (!snap.exists) {
        res.statusCode = 404;
        res.end(JSON.stringify({ ok: false, reason: 'card_not_found' }));
        return;
      }
      const card: firestoreCard = { ...(snap.data() as firestoreCard) };
      const base_tags = [...(card.base_tags ?? [])];
      if (change_type == 'add') {
        addTagToBase(base_tags, tag);
      } else {
        deleteTagFromBase(base_tags, tag);
      }
      const changes = getChangesFromTag(card as unknown as HCCard.Any, change_type, tag);
      // const changes: anyChange[] = [{ location: 'tag', change_type, tag } as tagChange];
      // if (tagChangesAnyProps(tag)) {
      //   const hcCard = firestoreToCard(card);
      //   const newCard = structuredClone(hcCard);
      //   setTags(newCard, base_tags);
      //   changes.push(...getChangesFromDifferences(hcCard, newCard));
      //   if (changes.some(change => !changeIsValid(hcCard, change))) {
      //     res.statusCode = 400;
      //     res.end(JSON.stringify({ ok: false, reason: 'invalid_tag_change' }));
      //     return;
      //   }
      // }
      await changesetsCol.add({
        cardId,
        status: 'pending',
        createdAt: FieldValue.serverTimestamp(),
        resolvedAt: null,
        submittedBy: { userId: auth.userId, username: auth.username },
        resolvedBy: null,
        changes,
        comment: `${change_type == 'add' ? 'Added' : 'Deleted'} tag: "${tag}"`,
      });

      // if (base_tags.length) {
      //   card.base_tags = base_tags;
      // } else {
      //   delete card.base_tags;
      // }

      // await docRef.set(card /* { merge: true } */);

      res.statusCode = 200;
      res.end(
        JSON.stringify({
          ok: true,
          base_tags,
        })
      );
      return;
    }

    res.statusCode = 405;
    res.setHeader('Allow', 'GET, POST, OPTIONS');
    res.end();
  } catch (err) {
    console.error('cardTagsHandler', err);

    if (res.writableEnded) return;
    res.statusCode = 500;
    res.end(JSON.stringify({ ok: false, reason: 'server_error' }));
  }
};
