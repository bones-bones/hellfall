import React from 'react';
import { getAuthApiUrl } from '../auth/getAuthApiUrl';

export type CardTagOverrides = {
  added: string[];
  removed: string[];
};

function mergeTags(baseTags: string[] | undefined, overrides: CardTagOverrides | null): string[] {
  const base = baseTags ?? [];
  if (!overrides) return base;
  const removedSet = new Set(overrides.removed);
  const added = overrides.added.filter(t => !removedSet.has(t));
  return base.filter(t => !removedSet.has(t)).concat(added);
}

async function fetchOverrides(baseUrl: string, cardId: string): Promise<CardTagOverrides> {
  const res = await fetch(`${baseUrl}/api/cards/${encodeURIComponent(cardId)}/tags`, {
    credentials: 'include',
  });
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) return { added: [], removed: [] };
    throw new Error('Failed to load tag overrides');
  }
  const data = (await res.json()) as { added?: string[]; removed?: string[] };
  return {
    added: Array.isArray(data.added) ? data.added : [],
    removed: Array.isArray(data.removed) ? data.removed : [],
  };
}

/** React hook: loads overrides from server when logged in (baseUrl + cardId), returns [mergedTags, addTag, removeTag, loading, error]. */
export function useCardTagOverrides(
  cardId: string,
  baseTags: string[] | undefined
): [string[], (tag: string) => Promise<void>, (tag: string) => Promise<void>, boolean, Error | null] {
  const baseUrl = getAuthApiUrl();
  const [overrides, setOverrides] = React.useState<CardTagOverrides | null>(null);
  const [loading, setLoading] = React.useState(!!baseUrl && !!cardId);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (!baseUrl || !cardId) {
      setOverrides(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetchOverrides(baseUrl, cardId)
      .then(setOverrides)
      .catch(e => {
        setError(e instanceof Error ? e : new Error(String(e)));
        setOverrides({ added: [], removed: [] });
      })
      .finally(() => setLoading(false));
  }, [baseUrl, cardId]);

  const merged = mergeTags(baseTags, overrides);

  const addTag = React.useCallback(
    async (tag: string) => {
      const tagNorm = tag.trim();
      if (!tagNorm || !baseUrl || !cardId) return;
      const res = await fetch(`${baseUrl}/api/cards/${encodeURIComponent(cardId)}/tags`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag: tagNorm }),
      });
      if (!res.ok) throw new Error('Failed to add tag');
      const data = (await res.json()) as { added?: string[]; removed?: string[] };
      setOverrides({
        added: Array.isArray(data.added) ? data.added : [],
        removed: Array.isArray(data.removed) ? data.removed : [],
      });
    },
    [baseUrl, cardId]
  );

  const removeTag = React.useCallback(
    async (tag: string) => {
      const tagNorm = tag.trim();
      if (!tagNorm || !baseUrl || !cardId) return;
      const res = await fetch(
        `${baseUrl}/api/cards/${encodeURIComponent(cardId)}/tags/${encodeURIComponent(tagNorm)}`,
        { method: 'DELETE', credentials: 'include' }
      );
      if (!res.ok) throw new Error('Failed to remove tag');
      const data = (await res.json()) as { added?: string[]; removed?: string[] };
      setOverrides({
        added: Array.isArray(data.added) ? data.added : [],
        removed: Array.isArray(data.removed) ? data.removed : [],
      });
    },
    [baseUrl, cardId]
  );

  return [merged, addTag, removeTag, loading, error];
}
