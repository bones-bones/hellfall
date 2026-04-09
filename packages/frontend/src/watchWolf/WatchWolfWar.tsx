import styled from '@emotion/styled';
import { HellfallEntry } from '../hellfall/HellfallEntry.tsx';
import { useAtom, useAtomValue } from 'jotai';
import { cardsAtom } from '../hellfall/atoms/cardsAtom.ts';
import { useRef, useState, useEffect } from 'react';
import { TeamClock } from './TeamWolf.tsx';
import {
  SidePanelOpenDirection,
  Card,
  ToolbarIconButton,
  SidePanel,
} from '@workday/canvas-kit-react';
import { Link } from 'react-router-dom';
import { HellfallCard } from '../hellfall/card/HellfallCard.tsx';
import { activeCardAtom } from '../hellfall/atoms/searchAtoms.ts';
import { xIcon } from '@workday/canvas-system-icons-web';
import { HCCard } from '@hellfall/shared/types';
import { useKeyPress } from '../hooks';

//TODO: make results use Id natively on the backend

export const Watchwolfwar = () => {
  const escape = useKeyPress('Escape');
  const cards = useAtomValue(cardsAtom).filter(e => e.isActualToken != true && e.set != 'C');
  const RandyRandom = useAtomValue(cardsAtom);
  const [activeCardFromAtom, setActiveCardFromAtom] = useAtom(activeCardAtom);
  const activeCard = cards.find(entry => entry.id === activeCardFromAtom);
  useEffect(() => {
    if (escape) {
      setActiveCardFromAtom('');
    }
  }, [escape]);

  const submitting = useRef(false);
  const [TwoCardState, SetTwoCardState] = useState<{
    LeftCard: HCCard.Any;
    RightCard: HCCard.Any;
  }>({
    LeftCard: cards[Math.floor(Math.random() * cards.length)],
    RightCard: cards[Math.floor(Math.random() * cards.length)],
  });
  let activeIsRight = true;

  const updateStandings = async (winId: string, loseId: string) => {
    if (!submitting.current) {
      submitting.current = true;

      await TeamClock(winId, loseId);
      SetTwoCardState({
        LeftCard: cards[Math.floor(Math.random() * cards.length)],
        RightCard: cards[Math.floor(Math.random() * cards.length)],
      });
      submitting.current = false;
    }
  };

  return (
    <PageContainer>
      <StyledSidePanel
        openWidth={window.screen.width > 450 ? 810 : 400}
        openDirection={activeIsRight ? SidePanelOpenDirection.Right : SidePanelOpenDirection.Left}
        open={!!activeCard}
      >
        {!!activeCard && (
          <Card>
            <Card.Body padding={'zero'}>
              <SPContainer>
                <ToolbarIconButton icon={xIcon} onClick={() => setActiveCardFromAtom('')} />
                {activeCard && <HellfallCard data={activeCard} />}
              </SPContainer>
            </Card.Body>
          </Card>
        )}
      </StyledSidePanel>
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
          id={TwoCardState.LeftCard.id}
          name={TwoCardState.LeftCard.name}
          url={TwoCardState.LeftCard.image!}
          onClick={(event: React.MouseEvent<HTMLImageElement>) => {
            if (event.button === 1 || event.metaKey || event.ctrlKey) {
              window.open(
                '/hellfall/card/' + encodeURIComponent(TwoCardState.LeftCard.id),
                '_blank'
              );
            } else {
              updateStandings(TwoCardState.LeftCard.id, TwoCardState.RightCard.id);
              activeIsRight = false;
              setActiveCardFromAtom('');
            }
          }}
          onClickTitle={(event: React.MouseEvent<HTMLImageElement>) => {
            if (event.button === 1 || event.metaKey || event.ctrlKey) {
              window.open(
                '/hellfall/card/' + encodeURIComponent(TwoCardState.LeftCard.id),
                '_blank'
              );
            } else {
              setActiveCardFromAtom(TwoCardState.LeftCard.id);
            }
          }}
        />
        <HellfallEntry
          id={TwoCardState.RightCard.id}
          name={TwoCardState.RightCard.name}
          url={TwoCardState.RightCard.image!}
          onClick={(event: React.MouseEvent<HTMLImageElement>) => {
            if (event.button === 1 || event.metaKey || event.ctrlKey) {
              window.open(
                '/hellfall/card/' + encodeURIComponent(TwoCardState.RightCard.id),
                '_blank'
              );
            } else {
              updateStandings(TwoCardState.RightCard.id, TwoCardState.LeftCard.id);
              activeIsRight = true;
              setActiveCardFromAtom('');
            }
          }}
          onClickTitle={(event: React.MouseEvent<HTMLImageElement>) => {
            if (event.button === 1 || event.metaKey || event.ctrlKey) {
              window.open(
                '/hellfall/card/' + encodeURIComponent(TwoCardState.RightCard.id),
                '_blank'
              );
            } else {
              setActiveCardFromAtom(TwoCardState.RightCard.id);
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

const StyledSidePanel = styled(SidePanel)({
  zIndex: 40,
  height: '100%',
  position: 'fixed',
  backgroundColor: 'transparent',
  top: '10px',
});
const SPContainer = styled('div')({
  overflowY: 'scroll',
  height: '90vh',
  overflowX: 'hidden',
});
