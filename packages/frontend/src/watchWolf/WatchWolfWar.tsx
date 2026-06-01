import styled from '@emotion/styled';
import { HellfallEntry } from '../hellfall/HellfallEntry.tsx';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { cardsAtom } from '../hellfall/atoms/cardsAtom.ts';
import { useRef, useState, useEffect } from 'react';
import { TeamClock } from './TeamWolf.tsx';
import { Link } from 'react-router-dom';
import { activeCardAtom } from '../hellfall/atoms/searchAtoms.ts';
import { HCCard } from '@hellfall/shared/types';
import { ActiveCardPanel } from '../hellfall/ActiveCardPanel.tsx';
import { cardSetList } from '@hellfall/shared/utils';

export const WatchwolfWar = () => {
  const cards = useAtomValue(cardsAtom).getAllInSetList(cardSetList);
  const setActiveCardFromAtom = useSetAtom(activeCardAtom);

  const submitting = useRef(false);
  const [TwoCardState, SetTwoCardState] = useState<{
    LeftCard: HCCard.Any;
    RightCard: HCCard.Any;
  }>({
    LeftCard: cards.getRandomCard(),
    RightCard: cards.getRandomCard(),
  });
  const [origin, setOrigin] = useState<'right' | 'left'>('right');

  const updateStandings = async (winId: string, loseId: string) => {
    if (!submitting.current) {
      submitting.current = true;

      await TeamClock(winId, loseId);
      SetTwoCardState({
        LeftCard: cards.getRandomCard(),
        RightCard: cards.getRandomCard(),
      });
      submitting.current = false;
    }
  };

  return (
    <PageContainer>
      <title>WatchWolfWar | Hellfall</title>
      <ActiveCardPanel origin={origin} />
      <StyleComponent>
        <Title>
          Welcome to the WatchWolfWar, the place to be to determine the Hellsiest card of All!
        </Title>
      </StyleComponent>
      <StyleComponent>
        <Subtitle>Brought to you by goldcrackle, with odes of help from llllll.</Subtitle>
      </StyleComponent>
      <CardContainer>
        <HellfallEntry
          id={TwoCardState.LeftCard.hcid}
          name={TwoCardState.LeftCard.name}
          url={TwoCardState.LeftCard.image!}
          onClick={(event: React.MouseEvent<HTMLImageElement>) => {
            if (event.button === 1 || event.metaKey || event.ctrlKey) {
              window.open(`/card/${encodeURIComponent(TwoCardState.LeftCard.hcid)}`, '_blank');
            } else {
              updateStandings(TwoCardState.LeftCard.id, TwoCardState.RightCard.id);
              setActiveCardFromAtom('');
            }
          }}
          onClickTitle={(event: React.MouseEvent<HTMLImageElement>) => {
            if (event.button === 1 || event.metaKey || event.ctrlKey) {
              window.open(`/card/${encodeURIComponent(TwoCardState.LeftCard.hcid)}`, '_blank');
            } else {
              setActiveCardFromAtom(TwoCardState.LeftCard.id);
              setOrigin('left');
            }
          }}
        />
        <HellfallEntry
          id={TwoCardState.RightCard.hcid}
          name={TwoCardState.RightCard.name}
          url={TwoCardState.RightCard.image!}
          onClick={(event: React.MouseEvent<HTMLImageElement>) => {
            if (event.button === 1 || event.metaKey || event.ctrlKey) {
              window.open(`/card/${encodeURIComponent(TwoCardState.RightCard.hcid)}`, '_blank');
            } else {
              updateStandings(TwoCardState.RightCard.id, TwoCardState.LeftCard.id);
              setActiveCardFromAtom('');
            }
          }}
          onClickTitle={(event: React.MouseEvent<HTMLImageElement>) => {
            if (event.button === 1 || event.metaKey || event.ctrlKey) {
              window.open(`/card/${encodeURIComponent(TwoCardState.RightCard.hcid)}`, '_blank');
            } else {
              setActiveCardFromAtom(TwoCardState.RightCard.id);
              setOrigin('right');
            }
          }}
        />
      </CardContainer>
      <StyleComponent>
        <ResultsReceptaclePlaceThing>
          <Link to={'/Watchwolfresults'}>Results!</Link>{' '}
        </ResultsReceptaclePlaceThing>
      </StyleComponent>
    </PageContainer>
  );
};

const PageContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '40px',
  fontFamily: 'Arial, sans-serif',
  backgroundColor: '#f9f9f9',
  minHeight: '100vh',
});
const Title = styled('h1')({ textAlign: 'center', marginBottom: '10px' });
const Subtitle = styled('h3')({ textAlign: 'center', marginBottom: '30px' });
const CardContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  gap: '40px',
  marginBottom: '30px',
  width: '100%',
  maxWidth: '800px',
});
const ResultsReceptaclePlaceThing = styled('div')({
  width: '100%',
  maxWidth: '600px',
  padding: '20px',
  backgroundColor: 'grey',
  border: '1px solid #ccc',
  boxShadow: '0 2px 8px rgb(164, 45, 168)',
  textAlign: 'center',
});

const StyleComponent = styled('div')({ color: 'purple', display: 'flex' });
