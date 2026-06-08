import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth';
import { getAuthApiUrl } from '../auth/getAuthApiUrl';
import { HCCard } from '@hellfall/shared/types';
import { anyChange, setTags } from '@hellfall/shared/utils';

type PendingTagStaging = {
  toAdd: string[];
  toRemove: string[];
};

type FetchResult = {
  base_tags?: string[];
  persistEnabled: boolean;
};

async function fetchOverrides(baseUrl: string, cardId: string): Promise<FetchResult> {
  const res = await fetch(`${baseUrl}/api/cards/${encodeURIComponent(cardId)}/tags`, {
    credentials: 'include',
  });
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) return { persistEnabled: false };
    throw new Error('Failed to load tag overrides');
  }
  return (await res.json()) as FetchResult;
  // return {
  //   tags: Array.isArray(data.tags) ? data.tags : undefined,
  //   added: Array.isArray(data.added) ? data.added : [],
  //   removed: Array.isArray(data.removed) ? data.removed : [],
  //   persistEnabled: data.persistEnabled !== false,
  // };
}


async function fetchPendingTagStaging(
  baseUrl: string,
  cardId: string
): Promise<PendingTagStaging | null> {
  const res = await fetch(
    `${baseUrl}/api/changesets?cardId=${encodeURIComponent(cardId)}&status=pending`,
    { credentials: 'include' }
  );
  if (!res.ok) { return null };
  const data = (await res.json()) as {
    changesets?: Array<{ changes: anyChange[] }>;
  };
  const pending: PendingTagStaging = { toAdd: [], toRemove: [] };
  const tag_changes = data.changesets
    ?.map(c => c.changes)
    .flatMap(c => c.find(change => change.location === 'tag') ?? []);
  tag_changes?.forEach(change => {
    if (change.change_type === 'add') {
      pending.toAdd.push(change.tag);
    } else {
      pending.toRemove.push(change.tag);
    }
  });

  return pending.toAdd.length > 0 || pending.toRemove.length > 0 ? pending : null;
}

/**
 * Loads tag overrides when `authApiUrl` + `cardId` are set.
 * Uses Firestore `tags` from the API when present (post-migrate); otherwise merges JSON base + overrides.
 *
 * Add/remove now submit changesets for admin review instead of mutating directly.
 * Returns: [mergedTags, addTag, removeTag, loading, error, persistEnabled, changesetSubmitted, pendingStaging]
 */
export function useCardTagOverrides(
  card: HCCard.Any
  // cardId: string,
  // baseTags: string[] | undefined
): {
  displayCard: HCCard.Any;
  addTag: (tag: string) => Promise<void>;
  deleteTag: (tag: string) => Promise<void>;
  loading: boolean;
  error: Error | null;
  persistEnabled: boolean;
  changesetSubmitted: boolean;
  pendingTagStaging: PendingTagStaging | null;
} {
  const baseUrl = getAuthApiUrl();
  const { user, loading: authLoading } = useAuth();
  const displayCard = structuredClone(card);

  const [persistEnabled, setPersistEnabled] = useState(false);
  const [loading, setLoading] = useState(!!baseUrl && !!card);
  const [error, setError] = useState<Error | null>(null);
  const [changesetSubmitted, setChangesetSubmitted] = useState(false);
  const [pendingTagStaging, setPendingTagStaging] = useState<PendingTagStaging | null>(null);

  const loadPending = React.useCallback(async () => {
    if (!baseUrl || !card || !user) {
      setPendingTagStaging(null);
      return;
    }
    try {
      const after = await fetchPendingTagStaging(baseUrl, card.id);
      setPendingTagStaging(after);
    } catch {
      setPendingTagStaging(null);
    }
  }, [baseUrl, card, user]);

  useEffect(() => {
    if (!baseUrl || !card.id) {
      // setOverrides(null);
      // setFirestoreTags(null);
      setPersistEnabled(false);
      // setPendingAfter(null);
      setLoading(false);
      return;
    }
    if (authLoading) return;
    setLoading(true);
    setError(null);
    setChangesetSubmitted(false);
    const pendingPromise = user
      ? fetchPendingTagStaging(baseUrl, card.id)
      : Promise.resolve(null);
    Promise.all([fetchOverrides(baseUrl, card.id), pendingPromise])
      .then(([r, pending]) => {
        const { persistEnabled: pe, base_tags } = r;
        // setOverrides(o);
        // setFirestoreTags(tags ?? null);
        if (base_tags) {
          setTags(card, base_tags);
        }
        setPersistEnabled(pe);
        setPendingTagStaging(pending);
      })
      .catch(e => {
        setError(e instanceof Error ? e : new Error(String(e)));
        // setOverrides({ added: [], removed: [] });
        // setFirestoreTags(null);
        setPersistEnabled(false);
        // setPendingAfter(null);
      })
      .finally(() => setLoading(false));
  }, [baseUrl, card, user, authLoading]);

  // const merged = firestoreTags ?? mergeTags(baseTags, overrides);

  // const pendingStaging = React.useMemo((): PendingTagStaging | null => {
  //   if (!pendingAfter) return null;
  //   const { toAdd, toRemove } = diffTags(merged, pendingAfter);
  //   if (toAdd.length === 0 && toRemove.length === 0) return null;
  //   return { after: pendingAfter, toAdd, toRemove };
  // }, [merged, pendingAfter]);

  const addTag = React.useCallback(
    async (tag: string) => {
      const tagNorm = tag.trim();
      if (!tagNorm || !baseUrl || !card.id) return;
      // const currentTags = firestoreTags ?? mergeTags(baseTags, overrides);
      // if (currentTags.includes(tagNorm)) return;
      // const newTags = [...currentTags, tagNorm];
      const res = await fetch(`${baseUrl}/api/cards/${encodeURIComponent(card.id)}/tags`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tag: tagNorm,
          change_type: 'add',
        }),
      });
      if (!res.ok) throw new Error('Failed to submit changeset');
      const base = (await res.json()).base_tags;
      if (base) {
        setTags(displayCard, base);
      }
      setChangesetSubmitted(true);
      await loadPending();
    },
    [baseUrl, card /* cardId, firestoreTags, baseTags, overrides, loadPending */]
  );

  const deleteTag = React.useCallback(
    async (tag: string) => {
      const tagNorm = tag.trim();
      if (!tagNorm || !baseUrl || !card.id) return;
      // const currentTags = firestoreTags ?? mergeTags(baseTags, overrides);
      // const newTags = currentTags.filter(t => t !== tagNorm);
      const res = await fetch(`${baseUrl}/api/cards/${encodeURIComponent(card.id)}/tags`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tag: tagNorm,
          change_type: 'delete',
        }),
      });
      if (!res.ok) throw new Error('Failed to submit changeset');
      const base = (await res.json()).base_tags;
      if (base) {
        setTags(displayCard, base);
      }
      setChangesetSubmitted(true);
      await loadPending();
    },
    [baseUrl, card /* cardId, firestoreTags, baseTags, overrides, loadPending */]
  );

  return {
    displayCard,
    addTag,
    deleteTag,
    loading,
    error,
    persistEnabled,
    changesetSubmitted,
    pendingTagStaging,
  };
}
