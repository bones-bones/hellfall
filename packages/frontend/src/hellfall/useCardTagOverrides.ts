import React from 'react';
import { getAuthApiUrl } from '../auth/getAuthApiUrl';

export type CardTagOverrides = {
  added: string[];
  removed: string[];
};

export type PendingTagStaging = {
  after: string[];
  toAdd: string[];
  toRemove: string[];
};

function diffTags(current: string[], after: string[]): { toAdd: string[]; toRemove: string[] } {
  const currentSet = new Set(current);
  const afterSet = new Set(after);
  return {
    toAdd: after.filter(t => !currentSet.has(t)),
    toRemove: current.filter(t => !afterSet.has(t)),
  };
}

function mergeTags(baseTags: string[] | undefined, overrides: CardTagOverrides | null): string[] {
  const base = baseTags ?? [];
  if (!overrides) return base;
  const removedSet = new Set(overrides.removed);
  const added = overrides.added.filter(t => !removedSet.has(t));
  return base.filter(t => !removedSet.has(t)).concat(added);
}

type FetchResult = CardTagOverrides & {
  tags?: string[];
  persistEnabled: boolean;
};

async function fetchOverrides(baseUrl: string, cardId: string): Promise<FetchResult> {
  const res = await fetch(`${baseUrl}/api/cards/${encodeURIComponent(cardId)}/tags`, {
    credentials: 'include',
  });
  if (!res.ok) {
    if (res.status === 401 || res.status === 403)
      return { added: [], removed: [], persistEnabled: false };
    throw new Error('Failed to load tag overrides');
  }
  const data = (await res.json()) as {
    tags?: string[];
    added?: string[];
    removed?: string[];
    persistEnabled?: boolean;
  };
  return {
    tags: Array.isArray(data.tags) ? data.tags : undefined,
    added: Array.isArray(data.added) ? data.added : [],
    removed: Array.isArray(data.removed) ? data.removed : [],
    persistEnabled: data.persistEnabled !== false,
  };
}

async function fetchPendingTagAfter(
  baseUrl: string,
  cardId: string
): Promise<string[] | null> {
  const res = await fetch(
    `${baseUrl}/api/changesets?cardId=${encodeURIComponent(cardId)}&status=pending`,
    { credentials: 'include' }
  );
  if (!res.ok) return null;
  const data = (await res.json()) as {
    changesets?: Array<{ changes?: Record<string, { after?: unknown }> }>;
  };
  const cs = data.changesets?.find(c => c.changes?.tags);
  const after = cs?.changes?.tags?.after;
  return Array.isArray(after) ? (after as string[]) : null;
}

/**
 * Loads tag overrides when `authApiUrl` + `cardId` are set.
 * Uses Firestore `tags` from the API when present (post-migrate); otherwise merges JSON base + overrides.
 *
 * Add/remove now submit changesets for admin review instead of mutating directly.
 * Returns: [mergedTags, addTag, removeTag, loading, error, persistEnabled, changesetSubmitted, pendingStaging]
 */
export function useCardTagOverrides(
  cardId: string,
  baseTags: string[] | undefined
): [
  string[],
  (tag: string) => Promise<void>,
  (tag: string) => Promise<void>,
  boolean,
  Error | null,
  boolean,
  boolean,
  PendingTagStaging | null
] {
  const baseUrl = getAuthApiUrl();
  const [overrides, setOverrides] = React.useState<CardTagOverrides | null>(null);
  const [firestoreTags, setFirestoreTags] = React.useState<string[] | null>(null);
  const [persistEnabled, setPersistEnabled] = React.useState(false);
  const [loading, setLoading] = React.useState(!!baseUrl && !!cardId);
  const [error, setError] = React.useState<Error | null>(null);
  const [changesetSubmitted, setChangesetSubmitted] = React.useState(false);
  const [pendingAfter, setPendingAfter] = React.useState<string[] | null>(null);

  const loadPending = React.useCallback(async () => {
    if (!baseUrl || !cardId) {
      setPendingAfter(null);
      return;
    }
    try {
      const after = await fetchPendingTagAfter(baseUrl, cardId);
      setPendingAfter(after);
    } catch {
      setPendingAfter(null);
    }
  }, [baseUrl, cardId]);

  React.useEffect(() => {
    if (!baseUrl || !cardId) {
      setOverrides(null);
      setFirestoreTags(null);
      setPersistEnabled(false);
      setPendingAfter(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setChangesetSubmitted(false);
    Promise.all([fetchOverrides(baseUrl, cardId), fetchPendingTagAfter(baseUrl, cardId)])
      .then(([r, pending]) => {
        const { persistEnabled: pe, tags, ...o } = r;
        setOverrides(o);
        setFirestoreTags(tags ?? null);
        setPersistEnabled(pe);
        setPendingAfter(pending);
      })
      .catch(e => {
        setError(e instanceof Error ? e : new Error(String(e)));
        setOverrides({ added: [], removed: [] });
        setFirestoreTags(null);
        setPersistEnabled(false);
        setPendingAfter(null);
      })
      .finally(() => setLoading(false));
  }, [baseUrl, cardId]);

  const merged =
    firestoreTags ?? mergeTags(baseTags, overrides);

  const pendingStaging = React.useMemo((): PendingTagStaging | null => {
    if (!pendingAfter) return null;
    const { toAdd, toRemove } = diffTags(merged, pendingAfter);
    if (toAdd.length === 0 && toRemove.length === 0) return null;
    return { after: pendingAfter, toAdd, toRemove };
  }, [merged, pendingAfter]);

  const addTag = React.useCallback(
    async (tag: string) => {
      const tagNorm = tag.trim();
      if (!tagNorm || !baseUrl || !cardId) return;
      const currentTags = firestoreTags ?? mergeTags(baseTags, overrides);
      if (currentTags.includes(tagNorm)) return;
      const newTags = [...currentTags, tagNorm];
      const res = await fetch(`${baseUrl}/api/changesets`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId,
          changes: { tags: { before: currentTags, after: newTags } },
          comment: `Add tag: ${tagNorm}`,
        }),
      });
      if (!res.ok) throw new Error('Failed to submit changeset');
      setChangesetSubmitted(true);
      await loadPending();
    },
    [baseUrl, cardId, firestoreTags, baseTags, overrides, loadPending]
  );

  const removeTag = React.useCallback(
    async (tag: string) => {
      const tagNorm = tag.trim();
      if (!tagNorm || !baseUrl || !cardId) return;
      const currentTags = firestoreTags ?? mergeTags(baseTags, overrides);
      const newTags = currentTags.filter(t => t !== tagNorm);
      const res = await fetch(`${baseUrl}/api/changesets`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId,
          changes: { tags: { before: currentTags, after: newTags } },
          comment: `Remove tag: ${tagNorm}`,
        }),
      });
      if (!res.ok) throw new Error('Failed to submit changeset');
      setChangesetSubmitted(true);
      await loadPending();
    },
    [baseUrl, cardId, firestoreTags, baseTags, overrides, loadPending]
  );

  return [
    merged,
    addTag,
    removeTag,
    loading,
    error,
    persistEnabled,
    changesetSubmitted,
    pendingStaging,
  ];
}
