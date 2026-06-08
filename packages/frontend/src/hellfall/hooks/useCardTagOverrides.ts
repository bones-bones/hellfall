import React, { useEffect, useMemo, useState } from 'react';
import { getAuthApiUrl } from '../../auth/getAuthApiUrl';
import { HCCard } from '@hellfall/shared/types';
import { setTags } from '@hellfall/shared/utils';
import { derivePendingTagStaging, PendingTagStaging } from '../atoms/pendingChangesetsAtom';
import { usePendingChangesetsState, useSyncPendingChangesets } from './usePendingChangesets';

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
}

/**
 * Loads tag overrides when `authApiUrl` + `cardId` are set.
 * Uses Firestore `tags` from the API when present (post-migrate); otherwise merges JSON base + overrides.
 *
 * Add/remove now submit changesets for admin review instead of mutating directly.
 */
export function useCardTagOverrides(card: HCCard.Any): {
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

  const [persistEnabled, setPersistEnabled] = useState(false);
  const [loading, setLoading] = useState(!!baseUrl && !!card);
  const [error, setError] = useState<Error | null>(null);
  const [changesetSubmitted, setChangesetSubmitted] = useState(false);

  const reloadPendingChangesets = useSyncPendingChangesets(card.id);
  const { changesets: pendingChangesets } = usePendingChangesetsState(card.id);

  const pendingTagStaging = useMemo(
    () => derivePendingTagStaging(pendingChangesets),
    [pendingChangesets]
  );

  useEffect(() => {
    if (!baseUrl || !card.id) {
      setPersistEnabled(false);
      setLoading(false);
      return;
    }

    let cancelled = false;

    setLoading(true);
    setError(null);
    setChangesetSubmitted(false);

    fetchOverrides(baseUrl, card.id)
      .then(r => {
        if (cancelled) return;
        const { persistEnabled: pe, base_tags } = r;
        if (base_tags !== undefined) {
          setTags(card, base_tags);
        }
        setPersistEnabled(pe);
      })
      .catch(e => {
        if (cancelled) return;
        setError(e instanceof Error ? e : new Error(String(e)));
        setPersistEnabled(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [baseUrl, card.id]);

  const addTag = React.useCallback(
    async (tag: string) => {
      const tagNorm = tag.trim();
      if (!tagNorm || !baseUrl || !card.id) return;
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
      await reloadPendingChangesets();
    },
    [baseUrl, card.id, displayCard, reloadPendingChangesets]
  );

  const deleteTag = React.useCallback(
    async (tag: string) => {
      const tagNorm = tag.trim();
      if (!tagNorm || !baseUrl || !card.id) return;
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
      await reloadPendingChangesets();
    },
    [baseUrl, card.id, displayCard, reloadPendingChangesets]
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
