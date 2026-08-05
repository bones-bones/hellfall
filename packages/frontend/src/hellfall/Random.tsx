import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isUniqueMode, searchCards, toUnique } from '@hellfall/shared/filters';
import { useAtomValue } from 'jotai';
import { cardsAtom } from './atoms/cardsAtom';
import { tagsData } from '@hellfall/shared/data';
import { allExceptNormal, getRandom } from '@hellfall/shared/utils';

export const Random = () => {
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
  }, [card, query, navigate]); // Dependencies ensure navigation happens when needed

  // Return null or a loading indicator while redirecting
  return null;
};
