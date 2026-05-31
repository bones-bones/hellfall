import { useParams } from 'react-router-dom';
import { cardsAtom } from '../atoms/cardsAtom.ts';
import { HellfallCard } from './HellfallCard.tsx';
import styled from '@emotion/styled';

import { useEffect } from 'react';
import { useAtomValue } from 'jotai';

export const SingleCard = () => {
  const cards = useAtomValue(cardsAtom);
  const { '*': cardId } = useParams();
  const entryToRender = cards?.find(e => e.hcid === cardId);
  useEffect(() => {
    if (!entryToRender) {
      document.title = `Loading | Hellfall`;
    } else {
      document.title = `${entryToRender.name} | Hellfall`;
    }
  }, [entryToRender]);

  return (
    <Container>
      {!cards.size() ? (
        <></>
      ) : !entryToRender ? (
        <h2>Nothing was found...</h2>
      ) : (
        <CardContainer>
          <HellfallCard data={entryToRender} onSinglePage={true} />
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
