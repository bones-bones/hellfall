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

type FetchResult = CardTagOverrides & {
  tags?: string[];
  persistEnabled: boolean;
};

async function fetchOverrides(baseUrl: string, cardId: string): Promise<FetchResult> {
  const res = await fetch(`${baseUrl}/api/cards/${encodeURIComponent(cardId)}?format=tags`, {
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

function parseTagResponse(data: {
  tags?: string[];
  added?: string[];
  removed?: string[];
}): { tags: string[] | undefined; overrides: CardTagOverrides } {
  return {
    tags: Array.isArray(data.tags) ? data.tags : undefined,
    overrides: {
      added: Array.isArray(data.added) ? data.added : [],
      removed: Array.isArray(data.removed) ? data.removed : [],
    },
  };
}

/**
 * Loads tag overrides when `authApiUrl` + `cardId` are set.
 * Uses Firestore `tags` from the API when present (post-migrate); otherwise merges JSON base + overrides.
 * Sixth value is server `persistEnabled` (hides edit UI when false).
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
  boolean
] {
  const baseUrl = getAuthApiUrl();
  const [overrides, setOverrides] = React.useState<CardTagOverrides | null>(null);
  const [firestoreTags, setFirestoreTags] = React.useState<string[] | null>(null);
  const [persistEnabled, setPersistEnabled] = React.useState(false);
  const [loading, setLoading] = React.useState(!!baseUrl && !!cardId);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (!baseUrl || !cardId) {
      setOverrides(null);
      setFirestoreTags(null);
      setPersistEnabled(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetchOverrides(baseUrl, cardId)
      .then(r => {
        const { persistEnabled: pe, tags, ...o } = r;
        setOverrides(o);
        setFirestoreTags(tags ?? null);
        setPersistEnabled(pe);
      })
      .catch(e => {
        setError(e instanceof Error ? e : new Error(String(e)));
        setOverrides({ added: [], removed: [] });
        setFirestoreTags(null);
        setPersistEnabled(false);
      })
      .finally(() => setLoading(false));
  }, [baseUrl, cardId]);

  const merged =
    firestoreTags ?? mergeTags(baseTags, overrides);

  const addTag = React.useCallback(
    async (tag: string) => {
      const tagNorm = tag.trim();
      if (!tagNorm || !baseUrl || !cardId) return;
      const res = await fetch(`${baseUrl}/api/cards/${encodeURIComponent(cardId)}?format=tags`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag: tagNorm }),
      });
      if (!res.ok) throw new Error('Failed to add tag');
      const data = (await res.json()) as {
        tags?: string[];
        added?: string[];
        removed?: string[];
      };
      const { tags, overrides: o } = parseTagResponse(data);
      setOverrides(o);
      if (tags) setFirestoreTags(tags);
    },
    [baseUrl, cardId]
  );

  const removeTag = React.useCallback(
    async (tag: string) => {
      const tagNorm = tag.trim();
      if (!tagNorm || !baseUrl || !cardId) return;
      const res = await fetch(`${baseUrl}/api/cards${encodeURIComponent(cardId)}?format=tags`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag: tagNorm }),
      });
      if (!res.ok) throw new Error('Failed to remove tag');
      const data = (await res.json()) as {
        tags?: string[];
        added?: string[];
        removed?: string[];
      };
      const { tags, overrides: o } = parseTagResponse(data);
      setOverrides(o);
      if (tags) setFirestoreTags(tags);
    },
    [baseUrl, cardId]
  );

  return [merged, addTag, removeTag, loading, error, persistEnabled];
}
