import { Firestore } from '@google-cloud/firestore';
import { withCors, env, HandlerRequest, HandlerResponse, requireDatabaseRoleAuth } from './lib';
import { applyCardEdit } from '../lib/applyCardEdit.ts';
import { listCardChangesets, recardCardChangeset } from '../lib/cardAudit.ts';
import { HCCard } from '@hellfall/shared/types';
import { addTagToBase, deleteTagFromBase, getChangesFromTag } from '@hellfall/shared/utils';
import { cardsCollection, firestoreCard } from '@hellfall/shared/utils/firestore';

const db = new Firestore({ databaseId: env.FIRESTORE_DATABASE_ID });
const cardsCol: cardsCollection = db.collection(env.FIRESTORE_CARDS_COLLECTION);

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

    const docRef = cardsCol.doc(cardId);

    if (auditTrail) {
      if (req.method !== 'GET') {
        res.statusCode = 405;
        res.setHeader('Allow', 'GET, OPTIONS');
        res.end();
        return;
      }
      const auth = await requireDatabaseRoleAuth(req, res);
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
      const auth = await requireDatabaseRoleAuth(req, res);
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
      if (card.kind == 'scryfall') {
        res.statusCode = 400;
        res.end(JSON.stringify({ ok: false, reason: 'no_modifying_scryfall' }));
        return;
      }
      const base_tags = [...(card.base_tags ?? [])];
      const tagActuallyChanged = (change_type == 'add' ? addTagToBase : deleteTagFromBase)(
        base_tags,
        tag
      );
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

      if (!tagActuallyChanged) {
        res.statusCode = 400;
        res.end(
          JSON.stringify({
            ok: false,
            reason: `tag_${change_type == 'add' ? 'already' : 'not'}_there`,
          })
        );
        return;
      }

      const updated = await applyCardEdit(cardsCol, cardId, changes);
      await recardCardChangeset({
        cardId,
        action: 'field_edit',
        field: 'base_tags',
        tag,
        user: { userId: auth.userId, username: auth.username },
        changes: {
          before: card.base_tags ?? [],
          after: updated.base_tags ?? [],
        },
      });

      res.statusCode = 200;
      res.end(
        JSON.stringify({
          ok: true,
          base_tags: updated.base_tags ?? [],
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
