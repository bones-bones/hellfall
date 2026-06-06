import React from 'react';
import { getAuthApiUrl } from '../auth/getAuthApiUrl';
import { HCCard } from '@hellfall/shared/types';
import { addTagToBase, anyChange, setTags } from '@hellfall/shared/utils';

// export type CardTagOverrides = {
//   added: string[];
//   removed: string[];
// };

export type PendingTagStaging = {
  // after: string[];
  toAdd: string[];
  toRemove: string[];
};

// function diffTags(current: string[], after: string[]): { toAdd: string[]; toRemove: string[] } {
//   const currentSet = new Set(current);
//   const afterSet = new Set(after);
//   return {
//     toAdd: after.filter(t => !currentSet.has(t)),
//     toRemove: current.filter(t => !afterSet.has(t)),
//   };
// }

// function mergeTags(baseTags: string[] | undefined, overrides: CardTagOverrides | null): string[] {
//   const base = baseTags ?? [];
//   if (!overrides) return base;
//   const removedSet = new Set(overrides.removed);
//   const added = overrides.added.filter(t => !removedSet.has(t));
//   return base.filter(t => !removedSet.has(t)).concat(added);
// }

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

// async function fetchPendingTagAfter(baseUrl: string, cardId: string): Promise<string[] | null> {
//   const res = await fetch(
//     `${baseUrl}/api/changesets?cardId=${encodeURIComponent(cardId)}?status=pending`,
//     { credentials: 'include' }
//   );
//   if (!res.ok) return null;
//   const data = (await res.json()) as {
//     changesets?: Array<{ changes?: Record<string, { after?: unknown }> }>;
//   };
//   const cs = data.changesets?.find(c => c.changes?.tags);
//   const after = cs?.changes?.tags?.after;
//   return Array.isArray(after) ? (after as string[]) : null;
// }

async function fetchPendingTagStaging(
  baseUrl: string,
  cardId: string
): Promise<PendingTagStaging | null> {
  const res = await fetch(
    `${baseUrl}/api/changesets?cardId=${encodeURIComponent(cardId)}?status=pending`,
    { credentials: 'include' }
  );
  if (!res.ok) return null;
  const data = (await res.json()) as {
    changesets?: Array<{ changes: anyChange[] }>;
  };
  const pending: PendingTagStaging = { toAdd: [], toRemove: [] };
  const tag_changes = data.changesets
    ?.map(c => c.changes)
    .flatMap(c => c.find(change => change.location == 'tag') ?? []);
  tag_changes?.forEach(change => {
    if (change.change_type == 'add') {
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
  const displayCard = structuredClone(card);
  // const [overrides, setOverrides] = React.useState<CardTagOverrides | null>(null);
  // const [firestoreTags, setFirestoreTags] = React.useState<string[] | null>(null);
  const [persistEnabled, setPersistEnabled] = React.useState(false);
  const [loading, setLoading] = React.useState(!!baseUrl && !!card);
  const [error, setError] = React.useState<Error | null>(null);
  const [changesetSubmitted, setChangesetSubmitted] = React.useState(false);
  // const [pendingAfter, setPendingAfter] = React.useState<string[] | null>(null);
  const [pendingTagStaging, setPendingTagStaging] = React.useState<PendingTagStaging | null>(null);

  const loadPending = React.useCallback(async () => {
    if (!baseUrl || !card) {
      setPendingTagStaging(null);
      return;
    }
    try {
      const after = await fetchPendingTagStaging(baseUrl, card.id);
      setPendingTagStaging(after);
    } catch {
      setPendingTagStaging(null);
    }
  }, [baseUrl, card]);

  React.useEffect(() => {
    if (!baseUrl || !card.id) {
      // setOverrides(null);
      // setFirestoreTags(null);
      setPersistEnabled(false);
      // setPendingAfter(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setChangesetSubmitted(false);
    Promise.all([fetchOverrides(baseUrl, card.id), fetchPendingTagStaging(baseUrl, card.id)])
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
  }, [baseUrl, card]);

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
      const res = await fetch(`${baseUrl}/api/tags`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // cardId:card.id,
          // changes: { tags: { before: currentTags, after: newTags } },
          // comment: `Add tag: ${tagNorm}`,
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
      const res = await fetch(`${baseUrl}/api/changesets`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // cardId,
          // changes: { tags: { before: currentTags, after: newTags } },
          // comment: `Remove tag: ${tagNorm}`,
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
