import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { searchCards } from '@hellfall/shared/filters';
import { useAtomValue } from 'jotai';
import { cardsAtom } from './atoms/cardsAtom';
import { tagsData } from '@hellfall/shared/data';
import { allExceptNormal } from '@hellfall/shared/utils';

export const Random = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const cards = useAtomValue(cardsAtom)
    .filter(e => !e.tags?.includes('offensive'))
    .getAllInSetListExact(allExceptNormal);
  const params = new URLSearchParams(location.search);
  const query = params.get(/* asRandom ? 'random':  */ 'q') || '';
  // const parsedQuery = parseSearchQuery(query);
  const resultSet = query ? searchCards(cards, query, tagsData.data) : cards;
  const card = resultSet.getRandomCard();
  useEffect(() => {
    navigate(`/card/${encodeURIComponent(card.hcid)}?q=${query || '*'}`, { replace: true });
  }, [card, query, navigate]); // Dependencies ensure navigation happens when needed

  // Return null or a loading indicator while redirecting
  return null;
};
