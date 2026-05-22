import { FieldValue, Firestore, type Timestamp } from '@google-cloud/firestore';
import { env } from '../api/lib/env.js';
import type { CardTagState } from './cardTagMerge.js';

const db = new Firestore({ databaseId: env.FIRESTORE_HELLSCUBE_DATABASE_ID });

export type CardTagAuditAction = 'tag_add' | 'tag_remove';

export type TagAuditActor = {
  userId: string;
  username: string;
};

export type CardTagAuditSnapshot = {
  tags: string[];
  added: string[];
  removed: string[];
  baseTags: string[];
};

export type CardTagAuditEntry = {
  id: string;
  at: string | null;
  action: CardTagAuditAction;
  tag: string;
  username: string;
  userId: string;
  before: CardTagAuditSnapshot;
  after: CardTagAuditSnapshot;
};

function auditCollection(cardId: string) {
  return db
    .collection(env.FIRESTORE_CARDS_COLLECTION)
    .doc(cardId)
    .collection(env.FIRESTORE_TAG_AUDIT_SUBCOLLECTION);
}

function snapshotFromState(state: CardTagState): CardTagAuditSnapshot {
  return {
    tags: state.tags,
    added: state.added,
    removed: state.removed,
    baseTags: state.baseTags,
  };
}

function parseSnapshot(raw: unknown): CardTagAuditSnapshot {
  const data = raw as Record<string, unknown> | undefined;
  return {
    tags: Array.isArray(data?.tags) ? data.tags.map(String) : [],
    added: Array.isArray(data?.added) ? data.added.map(String) : [],
    removed: Array.isArray(data?.removed) ? data.removed.map(String) : [],
    baseTags: Array.isArray(data?.baseTags) ? data.baseTags.map(String) : [],
  };
}

function timestampToIso(at: Timestamp | undefined): string | null {
  if (!at || typeof at.toDate !== 'function') return null;
  return at.toDate().toISOString();
}

/** Append-only audit entry; failures are logged and do not fail the tag API. */
export async function recordCardTagAudit(params: {
  cardId: string;
  action: CardTagAuditAction;
  tag: string;
  user: TagAuditActor;
  before: CardTagState;
  after: CardTagState;
}): Promise<void> {
  try {
    await auditCollection(params.cardId).add({
      at: FieldValue.serverTimestamp(),
      action: params.action,
      tag: params.tag,
      username: params.user.username,
      userId: params.user.userId,
      before: snapshotFromState(params.before),
      after: snapshotFromState(params.after),
    });
  } catch (err) {
    console.error('recordCardTagAudit', params.cardId, params.action, err);
  }
}

export async function listCardTagAudit(
  cardId: string,
  limit = 50
): Promise<CardTagAuditEntry[]> {
  const snap = await auditCollection(cardId)
    .orderBy('at', 'desc')
    .limit(limit)
    .get();

  return snap.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      at: timestampToIso(data.at as Timestamp | undefined),
      action: data.action as CardTagAuditAction,
      tag: String(data.tag ?? ''),
      username: String(data.username ?? ''),
      userId: String(data.userId ?? ''),
      before: parseSnapshot(data.before),
      after: parseSnapshot(data.after),
    };
  });
}
