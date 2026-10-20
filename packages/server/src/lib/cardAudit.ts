import {
  FieldValue,
  Firestore,
  type QueryDocumentSnapshot,
  type Timestamp,
} from '@google-cloud/firestore';
import { env } from '../api/lib/env.ts';
// import { tagState } from '@hellfall/shared/types';
// import type { CardTagState } from '@hellfall/shared/cardTags/cardTagMerge';

const db = new Firestore({ databaseId: env.FIRESTORE_DATABASE_ID });

export type AuditAction =
  // | 'tag_add'
  // | 'tag_delete'
  'field_edit' | 'changeset_accept' | 'changeset_reject';

export type AuditActor = {
  userId: string;
  username: string;
};

export type CardAuditEntry = {
  id: string;
  cardId: string;
  at: string | null;
  action: AuditAction;
  field: string | null;
  tag: string | null;
  username: string;
  userId: string;
  changes: { before: unknown; after: unknown };
};

function auditCollection(cardId: string) {
  return db
    .collection(env.FIRESTORE_CARDS_COLLECTION)
    .doc(cardId)
    .collection(env.FIRESTORE_AUDIT_SUBCOLLECTION);
}

function timestampToIso(at: Timestamp | undefined): string | null {
  if (!at || typeof at.toDate !== 'function') return null;
  return at.toDate().toISOString();
}

/** Append-only audit entry; failures are logged and do not block the API. */
export async function recardCardChangeset(params: {
  cardId: string;
  action: AuditAction;
  field: string | null;
  tag: string | null;
  user: AuditActor;
  changes: { before: unknown; after: unknown };
}): Promise<void> {
  try {
    await auditCollection(params.cardId).add({
      cardId: params.cardId,
      at: FieldValue.serverTimestamp(),
      action: params.action,
      field: params.field,
      tag: params.tag,
      username: params.user.username,
      userId: params.user.userId,
      changes: params.changes,
    });
  } catch (err) {
    console.error('recordCardAudit', params.cardId, params.action, err);
  }
}

function cardIdFromDoc(doc: QueryDocumentSnapshot): string {
  const stored = doc.get('cardId');
  if (typeof stored === 'string' && stored) return stored;
  return doc.ref.parent.parent?.id ?? '';
}

function toAuditEntry(doc: QueryDocumentSnapshot, cardId: string): CardAuditEntry {
  const data = doc.data();
  return {
    id: doc.id,
    cardId,
    at: timestampToIso(data.at as Timestamp | undefined),
    action: (data.action ?? 'field_edit') as AuditAction,
    field: data.field != null ? String(data.field) : null,
    tag: data.tag != null ? String(data.tag) : null,
    username: String(data.username ?? ''),
    userId: String(data.userId ?? ''),
    changes: {
      before: data.changes?.before ?? data.before ?? null,
      after: data.changes?.after ?? data.after ?? null,
    },
  };
}

/** Per-card audit trail, newest first. */
export async function listCardChangesets(cardId: string, limit = 50): Promise<CardAuditEntry[]> {
  const snap = await auditCollection(cardId).orderBy('at', 'desc').limit(limit).get();
  return snap.docs.map(doc => toAuditEntry(doc, cardId));
}

/** Recent audits. Pass `cardId` for one card; omit it for a collection-group feed. */
export async function listAudits(
  cardId: string | undefined,
  limit: number
): Promise<CardAuditEntry[]> {
  if (cardId) return listCardChangesets(cardId, limit);
  const snap = await db
    .collectionGroup(env.FIRESTORE_AUDIT_SUBCOLLECTION)
    .orderBy('at', 'desc')
    .limit(limit)
    .get();
  return snap.docs.map(doc => toAuditEntry(doc, cardIdFromDoc(doc)));
}
