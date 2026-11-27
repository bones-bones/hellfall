import { useEffect, useState } from 'react';
import { HCCard } from '@hellfall/shared/types';
import { getAuthApiUrl } from '../../auth/getAuthApiUrl';

type PrintsResponse = {
  object?: string;
  total_cards?: number;
  data?: HCCard.Any[];
};

/**
 * Fetch a single card by HCID (or name / print UUID) from the auth API.
 * Used when server search is on so CardRoute / SingleCard skip cardsAtom.
 */
export function useServerCard(identifier: string | undefined): {
  card: HCCard.Any | null;
  loading: boolean;
  error: boolean;
} {
  const [card, setCard] = useState<HCCard.Any | null>(null);
  const [loading, setLoading] = useState(Boolean(identifier));
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!identifier) {
      setCard(null);
      setLoading(false);
      setError(false);
      return;
    }

    const base = getAuthApiUrl().replace(/\/$/, '');
    if (!base) {
      setCard(null);
      setLoading(false);
      setError(true);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);
    setCard(null);

    (async () => {
      try {
        const res = await fetch(`${base}/api/cards/hcid/${encodeURIComponent(identifier)}`);
        if (cancelled) return;
        if (!res.ok) {
          setCard(null);
          setError(true);
          setLoading(false);
          return;
        }
        const data = (await res.json()) as HCCard.Any;
        if (cancelled) return;
        setCard(data);
        setLoading(false);
      } catch {
        if (cancelled) return;
        setCard(null);
        setError(true);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [identifier]);

  return { card, loading, error };
}

/**
 * Fetch related prints for a card id when the client has no CardMap.
 */
export function useServerCardPrints(
  cardId: string | undefined,
  enabled: boolean
): HCCard.Any[] | null {
  const [prints, setPrints] = useState<HCCard.Any[] | null>(null);

  useEffect(() => {
    if (!enabled || !cardId) {
      setPrints(null);
      return;
    }

    const base = getAuthApiUrl().replace(/\/$/, '');
    if (!base) {
      setPrints(null);
      return;
    }

    let cancelled = false;
    setPrints(null);

    (async () => {
      try {
        const res = await fetch(`${base}/api/cards/${encodeURIComponent(cardId)}/prints`);
        if (cancelled || !res.ok) return;
        const body = (await res.json()) as PrintsResponse;
        if (cancelled) return;
        setPrints(body.data ?? []);
      } catch {
        if (!cancelled) setPrints([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [cardId, enabled]);

  return prints;
}

/**
 * Lightweight total for SingleCard summary when server search is on
 * (avoids useSearchResults → cardsAtom).
 */
export function useServerSearchTotal(query: string | undefined): number | null {
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    if (!query || query === '*') {
      setTotal(null);
      return;
    }

    const base = getAuthApiUrl().replace(/\/$/, '');
    if (!base) {
      setTotal(null);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const params = new URLSearchParams({
          q: query,
          limit: '1',
          offset: '0',
          exclude: 'offensive',
        });
        const res = await fetch(`${base}/api/cards/search?${params.toString()}`);
        if (cancelled || !res.ok) return;
        const body = (await res.json()) as { total_cards?: number };
        if (cancelled) return;
        setTotal(typeof body.total_cards === 'number' ? body.total_cards : null);
      } catch {
        if (!cancelled) setTotal(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [query]);

  return total;
}
