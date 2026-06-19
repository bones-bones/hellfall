import { HellfallEntry } from '../hellfall/entry/HellfallEntry.tsx';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { cardsAtom } from '../hellfall/atoms/cardsAtom.ts';
import { useRef, useState, useEffect } from 'react';
import { TeamClock } from './TeamWolf.tsx';
import { Link } from 'react-router-dom';
import { activeCardAtom } from '../hellfall/atoms/searchAtoms.ts';
import { HCCard } from '@hellfall/shared/types';
import { ActiveCardPanel } from '../hellfall/ActiveCardPanel.tsx';
import { cardSetList, toPlainText } from '@hellfall/shared/utils';
import { PageContainer, StyleComponent, Subtitle, Title } from './Components.tsx';
import { createStyledDiv } from '../styling/StyledElements.tsx';
import { createStyles } from '@workday/canvas-kit-styling';

export const WatchwolfWar = () => {
  const cards = useAtomValue(cardsAtom).getAllInSetListExact(cardSetList);
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
          plainText={toPlainText(TwoCardState.LeftCard)}
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
          plainText={toPlainText(TwoCardState.RightCard)}
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

const cardContainerStyles = createStyles({
  display: 'flex',
  justifyContent: 'center',
  gap: '40px',
  marginBottom: '30px',
  width: '100%',
  maxWidth: '800px',
});
const CardContainer = createStyledDiv(cardContainerStyles);

const resultsReceptaclePlaceThingStyles = createStyles({
  width: '100%',
  maxWidth: '600px',
  padding: '20px',
  backgroundColor: 'grey',
  border: '1px solid #ccc',
  boxShadow: '0 2px 8px rgb(164, 45, 168)',
  textAlign: 'center',
});
const ResultsReceptaclePlaceThing = createStyledDiv(resultsReceptaclePlaceThingStyles);
