import { useCallback, useEffect, useMemo } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { useAuth } from '../auth';
import { getAuthApiUrl } from '../auth/getAuthApiUrl';
import {
  emptyPendingChangesetsAtom,
  emptyPendingChangesetsState,
  fetchPendingChangesets,
  pendingChangesetsAtomFamily,
  PendingChangesetsState,
} from './atoms/pendingChangesetsAtom';

export type {
  ChangesetUser,
  PendingChangeset,
  PendingTagStaging,
  PendingChangesetsState,
} from './atoms/pendingChangesetsAtom';
export { derivePendingTagStaging } from './atoms/pendingChangesetsAtom';

export function usePendingChangesetsState(cardId: string | undefined): PendingChangesetsState {
  const stateAtom = useMemo(
    () => (cardId ? pendingChangesetsAtomFamily(cardId) : emptyPendingChangesetsAtom),
    [cardId]
  );
  return useAtomValue(stateAtom);
}

/** Loads pending changesets into the shared atom for `cardId`. Returns `reload`. */
export function useSyncPendingChangesets(cardId: string | undefined): () => Promise<void> {
  const baseUrl = getAuthApiUrl();
  const { user, loading: authLoading } = useAuth();
  const stateAtom = useMemo(
    () => (cardId ? pendingChangesetsAtomFamily(cardId) : null),
    [cardId]
  );
  const setState = useSetAtom(stateAtom ?? emptyPendingChangesetsAtom);

  const reload = useCallback(async () => {
    if (!baseUrl || !cardId || !user) {
      setState(emptyPendingChangesetsState);
      return;
    }
    try {
      const data = await fetchPendingChangesets(baseUrl, cardId);
      setState({ changesets: data, loading: false });
    } catch {
      setState(emptyPendingChangesetsState);
    }
  }, [baseUrl, cardId, user, setState]);

  useEffect(() => {
    if (!stateAtom || !baseUrl || !cardId || authLoading) return;
    if (!user) {
      setState(emptyPendingChangesetsState);
      return;
    }

    let cancelled = false;
    setState(prev => ({ ...prev, loading: true }));

    fetchPendingChangesets(baseUrl, cardId)
      .then(data => {
        if (!cancelled) setState({ changesets: data, loading: false });
      })
      .catch(() => {
        if (!cancelled) setState(emptyPendingChangesetsState);
      });

    return () => {
      cancelled = true;
    };
  }, [stateAtom, baseUrl, cardId, user, authLoading, setState]);

  return reload;
}
