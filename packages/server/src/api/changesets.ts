import { FieldValue, Firestore, type Timestamp } from '@google-cloud/firestore';
import { withCors } from './lib/cors.js';
import { env } from './lib/env.js';
import type { HandlerRequest, HandlerResponse } from './lib/types.js';
import { requireTagAuth } from './lib/requireTagAuth.js';
import { requireAdminAuth } from './lib/requireAdminAuth.js';
import { requireReviewerAuth } from './lib/requireReviewerAuth.js';
import { recardCardChangeset } from '../lib/cardAudit.js';
import {
  anyChange,
  applyFromCollection,
  cardToFirestore,
  changeIsValid,
  firestoreToCard,
  isValidV4UUID,
} from '@hellfall/shared/utils';
// import {
//   resolveTagState,
//   tagFieldsForWrite,
//   dedupeOrdered,
//   mergeTags,
//   normalizeTagList,
//   type CardTagOverrides,
// } from '@hellfall/shared/cardTags/cardTagMerge';

const db = new Firestore({ databaseId: env.FIRESTORE_DATABASE_ID });
const changesetsCol = db.collection(env.FIRESTORE_CHANGESETS_COLLECTION);
const cardsCol = db.collection(env.FIRESTORE_CARDS_COLLECTION);

// type FieldChange = { before: unknown; after: unknown };
// type ChangesMap = Record<string, anyChange>;

type ChangesetStatus = 'pending' | 'accepted' | 'rejected';

interface ChangesetDoc {
  cardId: string;
  status: ChangesetStatus;
  createdAt: Timestamp;
  resolvedAt: Timestamp | null;
  submittedBy: { userId: string; username: string };
  resolvedBy: { userId: string; username: string } | null;
  // changes: ChangesMap;
  changes: anyChange[];
  comment: string | null;
}

function timestampToIso(ts: Timestamp | null | undefined): string | null {
  if (!ts || typeof ts.toDate !== 'function') return null;
  return ts.toDate().toISOString();
}

function serializeChangeset(id: string, data: ChangesetDoc) {
  return {
    id,
    cardId: data.cardId,
    status: data.status,
    createdAt: timestampToIso(data.createdAt),
    resolvedAt: timestampToIso(data.resolvedAt),
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

// function isValidChanges(changes: unknown): changes is ChangesMap {
//   if (!changes || typeof changes !== 'object' || Array.isArray(changes)) return false;
//   for (const [key, val] of Object.entries(changes as Record<string, unknown>)) {
//     if (typeof key !== 'string') return false;
//     if (!val || typeof val !== 'object' || Array.isArray(val)) return false;
//     const v = val as Record<string, unknown>;
//     if (!('before' in v) || !('after' in v)) return false;
//   }
//   return Object.keys(changes).length > 0;
// }

/** GET /api/changesets — list changesets, filterable by ?status= and ?cardId= */
async function listChangesets(req: HandlerRequest, res: HandlerResponse): Promise<void> {
  const auth = await requireReviewerAuth(req, res);
  if (!auth) return;

  let query = changesetsCol.orderBy('createdAt', 'desc').limit(100);
  const status = req.query?.status;
  if (typeof status === 'string' && ['pending', 'accepted', 'rejected'].includes(status)) {
    query = query.where('status', '==', status);
  }
  const cardId = req.query?.cardId;
  if (typeof cardId === 'string' && cardId) {
    query = query.where('cardId', '==', cardId);
  }

  const snap = await query.get();
  const items = snap.docs.map(doc => serializeChangeset(doc.id, doc.data() as ChangesetDoc));
  res.statusCode = 200;
  res.end(JSON.stringify({ ok: true, changesets: items }));
}

/** POST /api/changesets — submit a new changeset */
async function createChangeset(req: HandlerRequest, res: HandlerResponse): Promise<void> {
  const auth = await requireTagAuth(req, res);
  if (!auth) return;

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
  const card = firestoreToCard(await cardsCol.doc(cardId).get());
  if (!cardId || cardId.length > 200) {
    res.statusCode = 400;
    res.end(JSON.stringify({ ok: false, reason: 'card not found' }));
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

  const docRef = await changesetsCol.add({
    cardId,
    status: 'pending',
    createdAt: FieldValue.serverTimestamp(),
    resolvedAt: null,
    submittedBy: { userId: auth.userId, username: auth.username },
    resolvedBy: null,
    changes: body.changes,
    comment: typeof body.comment === 'string' ? body.comment.trim() || null : null,
  });

  const snap = await docRef.get();
  res.statusCode = 201;
  res.end(
    JSON.stringify({
      ok: true,
      changeset: serializeChangeset(docRef.id, snap.data() as ChangesetDoc),
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
  if (!auth) return;

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
      changeset: serializeChangeset(snap.id, snap.data() as ChangesetDoc),
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

  const cs = csSnap.data() as ChangesetDoc;
  if (cs.status !== 'pending') {
    res.statusCode = 409;
    res.end(JSON.stringify({ ok: false, reason: 'already_resolved', status: cs.status }));
    return;
  }

  const cardRef = cardsCol.doc(cs.cardId);
  const card = firestoreToCard(await cardRef.get());
  applyFromCollection(card, cs.changes, cardsCol);

  // let cardData = (cardSnap.data() ?? {}) as Record<string, unknown>;

  // for (const [field, change] of Object.entries(cs.changes)) {
  //   if (field === 'tags') {
  //     // cardData = applyTagChanges(cardData, change.after);
  //   } else {
  //     cardData[field] = change.after;
  //   }
  // }

  await cardRef.set(cardToFirestore(card) /* , { merge: true } */);

  await recardCardChangeset({
    cardId: cs.cardId,
    action: 'changeset_accept',
    field: null,
    tag: null,
    user: { userId: auth.userId, username: auth.username },
    changes: { before: { changesetId, submittedBy: cs.submittedBy }, after: cs.changes },
  });

  await changesetsCol.doc(changesetId).delete();

  res.statusCode = 200;
  res.end(JSON.stringify({ ok: true, status: 'accepted' }));
}

/** POST /api/changesets/:id/reject — admin rejects changeset */
async function rejectChangeset(
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

  const cs = csSnap.data() as ChangesetDoc;
  if (cs.status !== 'pending') {
    res.statusCode = 409;
    res.end(JSON.stringify({ ok: false, reason: 'already_resolved', status: cs.status }));
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
    resolvedBy: { userId: auth.userId, username: auth.username },
    rejectReason: typeof body.reason === 'string' ? body.reason.trim() || null : null,
  });

  await recardCardChangeset({
    cardId: cs.cardId,
    action: 'changeset_reject',
    field: null,
    tag: null,
    user: { userId: auth.userId, username: auth.username },
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
