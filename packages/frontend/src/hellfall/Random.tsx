import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { searchCards, toUnique } from '@hellfall/shared/filters';
import { useAtomValue } from 'jotai';
import { cardsAtom } from './atoms/cardsAtom';
import { getRandom } from '@hellfall/shared/utils';
import { canUseServerSearch } from '../auth/isServerSearchEnabled';
import { getAuthApiUrl } from '../auth/getAuthApiUrl';
import { HCCard } from '@hellfall/shared/types';

export const Random = () => (canUseServerSearch() ? <ServerRandom /> : <ClientRandom />);

const ClientRandom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const cards = useAtomValue(cardsAtom).filterToMap(
    e => !e.tags?.includes('offensive') && e.set != 'NRM'
  );
  const params = new URLSearchParams(location.search);
  const query = params.get(/* asRandom ? 'random':  */ 'q') || '';
  const unique = toUnique(params.get('unique') ?? 'cards') ?? 'cards';
  const resultSet = query ? searchCards(cards, query, unique) : undefined;
  const card = resultSet ? getRandom(resultSet) : cards.getRandomCard();
  useEffect(() => {
    navigate(`/card/${encodeURIComponent(card.hcid)}?q=${query || '*'}`, { replace: true });
  }, [card, query, navigate]);

  return null;
};

/**
 * Server-search path: POST/GET `/api/cards/random` instead of local CardMap.
 */
const ServerRandom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [failed, setFailed] = useState(false);
  const params = new URLSearchParams(location.search);
  const query = params.get('q') || '';

  useEffect(() => {
    const base = getAuthApiUrl().replace(/\/$/, '');
    if (!base) {
      setFailed(true);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const search = new URLSearchParams();
        if (query) search.set('q', query);
        search.set('exclude', 'offensive');
        const res = await fetch(`${base}/api/cards/random?${search.toString()}`, {
          method: 'GET',
        });
        if (cancelled) return;
        if (!res.ok) {
          setFailed(true);
          return;
        }
        const card = (await res.json()) as HCCard.Any;
        if (cancelled || !card?.hcid) {
          setFailed(true);
          return;
        }
        navigate(`/card/${encodeURIComponent(card.hcid)}?q=${encodeURIComponent(query || '*')}`, {
          replace: true,
        });
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [query, navigate]);

  if (failed) {
    return <h2>Nothing was found...</h2>;
  }
  return null;
};
