import { FieldValue, Firestore, type Timestamp } from '@google-cloud/firestore';
import { env } from '../api/lib/env.js';
import type { CardTagState } from '@hellfall/shared/cardTags/cardTagMerge';

const db = new Firestore({ databaseId: env.FIRESTORE_DATABASE_ID });

export type AuditAction =
  | 'tag_add'
  | 'tag_remove'
  | 'field_edit'
  | 'changeset_accept'
  | 'changeset_reject';

export type AuditActor = {
  userId: string;
  username: string;
};

export type CardAuditEntry = {
  id: string;
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
export async function recordCardAudit(params: {
  cardId: string;
  action: AuditAction;
  field: string | null;
  tag: string | null;
  user: AuditActor;
  changes: { before: unknown; after: unknown };
}): Promise<void> {
  try {
    await auditCollection(params.cardId).add({
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

function tagChangesFromState(before: CardTagState, after: CardTagState) {
  return {
    before: {
      tags: before.tags,
      added: before.added,
      removed: before.removed,
      baseTags: before.baseTags,
    },
    after: {
      tags: after.tags,
      added: after.added,
      removed: after.removed,
      baseTags: after.baseTags,
    },
  };
}

/** Convenience wrapper for tag add/remove — keeps cardTags.ts callsites clean. */
export async function recordTagAudit(params: {
  cardId: string;
  action: 'tag_add' | 'tag_remove';
  tag: string;
  user: AuditActor;
  before: CardTagState;
  after: CardTagState;
}): Promise<void> {
  return recordCardAudit({
    cardId: params.cardId,
    action: params.action,
    field: 'tags',
    tag: params.tag,
    user: params.user,
    changes: tagChangesFromState(params.before, params.after),
  });
}

export async function listCardAudit(cardId: string, limit = 50): Promise<CardAuditEntry[]> {
  const snap = await auditCollection(cardId).orderBy('at', 'desc').limit(limit).get();

  return snap.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
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
  });
}
