import { useParams } from 'react-router-dom';
import { cardsAtom } from '../atoms/cardsAtom.ts';
import { HellfallCard } from './HellfallCard.tsx';
import styled from '@emotion/styled';

import { useEffect, useMemo, useState } from 'react';
import { useAtomValue } from 'jotai';
import CardCacheService from './cardCacheService.ts';

export const SingleCard = () => {
  const cards = useAtomValue(cardsAtom);
  const { '*': cardId } = useParams();
  const [isUsingCache, setIsUsingCache] = useState(false);
  const entryToRender = useMemo(() => {
    if (!cardId) return null;
    const fromCache = CardCacheService.getCard(cardId);
    if (fromCache) {
      setIsUsingCache(true);
      return fromCache;
    }

    const fromLoadedCards = cards?.find(e => e.id === cardId);
    if (fromLoadedCards) {
      setIsUsingCache(false);
      return fromLoadedCards;
    }
    return null;
  }, [cards, cardId]);

  useEffect(() => {
    if (!cardId) return;

    const fromLoadedCards = cards?.find(e => e.id === cardId);
    // If we have cached data but global cards just loaded with fresher data
    if (fromLoadedCards && isUsingCache) {
      // Optionally update cache with fresh data
      CardCacheService.saveCard(fromLoadedCards);
      setIsUsingCache(false);
      // Force re-render by triggering a state update if needed
      // The component will re-render automatically due to cards atom change
    }
  }, [cards, cardId, isUsingCache]);

  const getTitle = () => {
    if (!cardId) {
      return 'Card | Hellfall';
    }

    if (entryToRender && entryToRender.name) {
      return `${entryToRender.name} | Hellfall`;
    }

    if (cards.length === 0 && entryToRender) {
      // We have cached card but main cards aren't loaded yet
      return `${entryToRender.name} (Loading) | Hellfall`;
    }

    if (cards.length > 0 && !entryToRender) {
      return 'Card Not Found | Hellfall';
    }

    return 'Loading... | Hellfall';
  };
  const title = getTitle();
  if (document.title != title) {
    document.title = title;
  }
  return (
    <Container>
      {!cards.length ? (
        <></>
      ) : !entryToRender ? (
        <h2>Nothing was found...</h2>
      ) : (
        <CardContainer>
          {/* <title>{`${entryToRender.name} | Hellfall`}</title> */}
          <HellfallCard data={entryToRender} />
        </CardContainer>
      )}
    </Container>
  );
};

const CardContainer = styled.div({
  width: '60vw',
  paddingTop: '50px',
  justifyContent: 'center',
});
const Container = styled.div({
  display: 'flex',
  justifyContent: 'center',
});
