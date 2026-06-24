import { FieldValue, Firestore, type Timestamp } from '@google-cloud/firestore';
import { withCors } from './lib/cors.ts';
import { env } from './lib/env.ts';
import type { HandlerRequest, HandlerResponse } from './lib/types.ts';
import { requireTagAuth } from './lib/requireTagAuth.ts';
import { requireAdminAuth } from './lib/requireAdminAuth.ts';
import { requireReviewerAuth } from './lib/requireReviewerAuth.ts';
import { recardCardChangeset } from '../lib/cardAudit.ts';
import { scheduleCatalogPublish } from '../lib/publishCatalog.ts';
import {
  anyChange,
  changeIsValid,
  Changeset,
  isChangesetStatus,
  isValidV4UUID,
} from '@hellfall/shared/utils';
import {
  applyFromCollection,
  cardsCollection,
  cardToFirestore,
  changesetCollection,
  firestoreToCard,
  getUpdateObject,
} from '@hellfall/shared/utils/firestore';

const db = new Firestore({ databaseId: env.FIRESTORE_DATABASE_ID });
const changesetsCol: changesetCollection = db.collection(
  env.FIRESTORE_CHANGESETS_COLLECTION
) as changesetCollection;
const cardsCol: cardsCollection = db.collection(env.FIRESTORE_CARDS_COLLECTION);

function timestampToIso(ts: Timestamp | null | undefined): string | null {
  if (!ts || typeof ts.toDate !== 'function') return null;
  return ts.toDate().toISOString();
}

function serializeChangeset(data: Changeset, docId?: string): Changeset {
  return {
    id: data.id || docId || '',
    cardId: data.cardId,
    status: data.status,
    createdAt: timestampToIso(data.createdAt as Timestamp) as string,
    resolvedAt: timestampToIso(data.resolvedAt as Timestamp),
    submittedBy: data.submittedBy,
    resolvedBy: data.resolvedBy,
    changes: data.changes,
    comment: data.comment,
  };
}

async function readJsonBody(req: HandlerRequest): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks).toString('utf-8');
  return body ? JSON.parse(body) : {};
}

/** GET /api/changesets — list changesets, filterable by ?status= and ?cardId= */
async function listChangesets(req: HandlerRequest, res: HandlerResponse): Promise<void> {
  const auth = await requireReviewerAuth(req, res, true);
  const limAuth = await requireTagAuth(req, res);
  if (!auth && !limAuth) return;

  let query = changesetsCol.orderBy('createdAt', 'desc').limit(100);
  const status = req.query?.status;
  if (isChangesetStatus(status)) {
    query = query.where('status', '==', status);
  }
  const cardId = req.query?.cardId;
  if (typeof cardId === 'string' && cardId) {
    query = query.where('cardId', '==', cardId);
  }
  if (!auth && limAuth) {
    query = query.where('submittedBy.userId', '==', limAuth.userId);
  }

  const snap = await query.get();
  const items: Changeset[] = snap.docs.map(doc =>
    serializeChangeset(doc.data() as Changeset, doc.id)
  );
  res.statusCode = 200;
  res.end(JSON.stringify({ ok: true, changesets: items }));
}

/** POST /api/changesets — submit a new changeset */
async function createChangeset(req: HandlerRequest, res: HandlerResponse): Promise<void> {
  const auth = await requireTagAuth(req, res);
  if (!auth) {
    return;
  }

  let body: { cardId?: string; changes?: unknown; comment?: string };
  try {
    body = (await readJsonBody(req)) as typeof body;
  } catch {
    res.statusCode = 400;
    res.end(JSON.stringify({ ok: false, reason: 'invalid_json' }));
    return;
  }

  const cardId = typeof body.cardId === 'string' ? body.cardId.trim() : '';
  if (!cardId || !isValidV4UUID(cardId) || cardId.length > 200) {
    res.statusCode = 400;
    res.end(JSON.stringify({ ok: false, reason: 'invalid_card_id' }));
    return;
  }
  const card = firestoreToCard((await cardsCol.doc(cardId).get()).data()!);
  if (!card) {
    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, reason: 'card not found' }));
    return;
  }
  if (card.kind == 'scryfall') {
    res.statusCode = 400;
    res.end(JSON.stringify({ ok: false, reason: 'no_modifying_scryfall' }));
    return;
  }
  try {
    if ((body.changes as anyChange[]).some(change => !changeIsValid(card, change))) {
      res.statusCode = 400;
      res.end(JSON.stringify({ ok: false, reason: 'invalid_changes' }));
      return;
    }
  } catch {
    res.statusCode = 400;
    res.end(JSON.stringify({ ok: false, reason: 'invalid_changes' }));
    return;
  }
  const id = crypto.randomUUID();
  const docRef = await changesetsCol.doc(id).set({
    id,
    cardId,
    status: 'pending',
    createdAt: FieldValue.serverTimestamp(),
    resolvedAt: null,
    submittedBy: { userId: auth.userId, username: auth.username },
    resolvedBy: null,
    changes: body.changes as anyChange[],
    comment: typeof body.comment === 'string' ? body.comment.trim() || null : null,
  });

  const snap = await changesetsCol.doc(id).get();
  res.statusCode = 201;
  res.end(
    JSON.stringify({
      ok: true,
      changeset: serializeChangeset(snap.data() as Changeset, id),
    })
  );
}

/** GET /api/changesets/:id — get single changeset */
async function getChangeset(
  req: HandlerRequest,
  res: HandlerResponse,
  changesetId: string
): Promise<void> {
  const auth = await requireReviewerAuth(req, res);
  if (!auth) {
    return;
  }

  const snap = await changesetsCol.doc(changesetId).get();
  if (!snap.exists) {
    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, reason: 'not_found' }));
    return;
  }

  res.statusCode = 200;
  res.end(
    JSON.stringify({
      ok: true,
      changeset: serializeChangeset(snap.data() as Changeset, changesetId),
    })
  );
}

/** Apply tag changes using the merge helpers so baseTags/added/removed/tags stay consistent. */
// function applyTagChanges(
//   cardData: Record<string, unknown>,
//   afterTags: unknown
// ): Record<string, unknown> {
//   const newTagsList = normalizeTagList(afterTags);
//   const currentState = resolveTagState(cardData);
//   const baseTags = currentState.baseTags;
//   const baseSet = new Set(baseTags);

//   const added: string[] = [];
//   const removed: string[] = [];
//   for (const t of newTagsList) {
//     if (!baseSet.has(t)) added.push(t);
//   }
//   for (const t of baseTags) {
//     if (!newTagsList.includes(t)) removed.push(t);
//   }
//   const overrides: CardTagOverrides = { added, removed };
//   const tags = dedupeOrdered(mergeTags(baseTags, overrides));

//   return {
//     ...cardData,
//     ...tagFieldsForWrite({ baseTags, added, removed, tags }),
//   };
// }

/** POST /api/changesets/:id/accept — admin accepts changeset */
async function acceptChangeset(
  req: HandlerRequest,
  res: HandlerResponse,
  changesetId: string
): Promise<void> {
  const auth = await requireAdminAuth(req, res);
  if (!auth) return;

  const csSnap = await changesetsCol.doc(changesetId).get();
  if (!csSnap.exists) {
    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, reason: 'not_found' }));
    return;
  }

  const cs = csSnap.data() as Changeset;
  if (cs.status !== 'pending') {
    res.statusCode = 409;
    res.end(JSON.stringify({ ok: false, reason: 'already_resolved', status: cs.status }));
    return;
  }

  const cardRef = cardsCol.doc(cs.cardId);
  const fire = (await cardRef.get()).data();
  const card = firestoreToCard(fire!);
  const newCard = structuredClone(card);
  await applyFromCollection(newCard, cs.changes, cardsCol);
  const update = getUpdateObject(fire!, cardToFirestore(newCard));
  if (Object.keys(update).length) {
    await cardRef.update(update);
  }

  await recardCardChangeset({
    cardId: cs.cardId,
    action: 'changeset_accept',
    field: null,
    tag: null,
    user: { userId: auth.userId, username: auth.username },
    changes: { before: { changesetId, submittedBy: cs.submittedBy }, after: cs.changes },
  });

  await changesetsCol.doc(changesetId).delete();

  scheduleCatalogPublish();

  res.statusCode = 200;
  res.end(JSON.stringify({ ok: true, status: 'accepted' }));
}

/** POST /api/changesets/:id/reject — admin rejects changeset */
async function rejectChangeset(
  req: HandlerRequest,
  res: HandlerResponse,
  changesetId: string
): Promise<void> {
  const auth = await requireAdminAuth(req, res, true);
  const limAuth = await requireTagAuth(req, res);
  if (!auth && !limAuth) return;

  const csSnap = await changesetsCol.doc(changesetId).get();
  if (!csSnap.exists) {
    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, reason: 'not_found' }));
    return;
  }

  const cs = csSnap.data() as Changeset;
  if (cs.status !== 'pending') {
    res.statusCode = 409;
    res.end(JSON.stringify({ ok: false, reason: 'already_resolved', status: cs.status }));
    return;
  }

  if (!auth && cs.submittedBy.userId != limAuth?.userId) {
    res.statusCode = 401;
    res.end(JSON.stringify({ ok: false, reason: 'non_admins_can_only_cancel_own_changes' }));
    return;
  }

  let body: { reason?: string } = {};
  try {
    body = (await readJsonBody(req)) as typeof body;
  } catch {
    // no body is fine
  }

  await changesetsCol.doc(changesetId).update({
    status: 'rejected',
    resolvedAt: FieldValue.serverTimestamp(),
    resolvedBy: {
      userId: auth?.userId ?? limAuth!.userId,
      username: auth?.username ?? limAuth!.username,
    },
    rejectReason: typeof body.reason === 'string' ? body.reason.trim() || null : null,
  });

  await recardCardChangeset({
    cardId: cs.cardId,
    action: 'changeset_reject',
    field: null,
    tag: null,
    user: {
      userId: auth?.userId ?? limAuth!.userId,
      username: auth?.username ?? limAuth!.username,
    },
    changes: { before: { changesetId, submittedBy: cs.submittedBy }, after: cs.changes },
  });

  res.statusCode = 200;
  res.end(JSON.stringify({ ok: true, status: 'rejected' }));
}

/** Main router for /api/changesets paths. */
export async function changesetsHandler(
  req: HandlerRequest,
  res: HandlerResponse,
  changesetId: string | null,
  action: string | null
): Promise<void> {
  const headers = withCors({ 'Content-Type': 'application/json' }, req);
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

  try {
    if (!changesetId && !action) {
      if (req.method === 'GET') return listChangesets(req, res);
      if (req.method === 'POST') return createChangeset(req, res);
      res.statusCode = 405;
      res.setHeader('Allow', 'GET, POST, OPTIONS');
      res.end();
      return;
    }

    if (changesetId && !action) {
      if (req.method === 'GET') return getChangeset(req, res, changesetId);
      res.statusCode = 405;
      res.setHeader('Allow', 'GET, OPTIONS');
      res.end();
      return;
    }

    if (changesetId && action === 'accept' && req.method === 'POST') {
      return acceptChangeset(req, res, changesetId);
    }

    if (changesetId && action === 'reject' && req.method === 'POST') {
      return rejectChangeset(req, res, changesetId);
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, reason: 'not_found' }));
  } catch (err) {
    console.error('changesetsHandler', err);
    if (res.writableEnded) return;
    res.statusCode = 500;
    res.end(JSON.stringify({ ok: false, reason: 'server_error' }));
  }
}
