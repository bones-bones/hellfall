import { useEffect, useRef, useState, useMemo, startTransition } from 'react';
import { HellfallEntry } from './HellfallEntry.tsx';
import { xIcon } from '@workday/canvas-system-icons-web';

import {
  styled,
  SidePanel,
  SidePanelOpenDirection,
  Card,
  ToolbarIconButton,
} from '@workday/canvas-kit-react';
import { PaginationComponent } from './inputs';

import { HellfallCard } from './card/HellfallCard.tsx';
import { useAtom, useAtomValue } from 'jotai';
import { activeCardAtom, pageAtom } from './atoms/searchAtoms.ts';
import { useSearchResults } from './hooks/useSearchResults.ts';
import { SearchControls } from './search-controls/SearchControls.tsx';
import { SortComponent } from './search-controls/SortComponent.tsx';
import { CHUNK_SIZE } from './constants.ts';
import { useKeyPress } from '../hooks';
import { cardsAtom } from './atoms/cardsAtom.ts';
import { useUrlSync } from './hooks/useUrlSync.ts';
import { getOtherNames } from './getOtherNames.ts';

export const HellFall = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cards = useAtomValue(cardsAtom).filter(e => e.set != 'C');
  const escape = useKeyPress('Escape');

  useUrlSync();

  const [activeCardFromAtom, setActiveCardFromAtom] = useAtom(activeCardAtom);

  const activeCard = cards.find(entry => {
    return entry.id === activeCardFromAtom;
  });

  useEffect(() => {
    if (escape) {
      setActiveCardFromAtom('');
    }
  }, [escape]);

  const [page, setPage] = useAtom(pageAtom);
  const { resultSet, paginationModel } = useSearchResults();

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxWidth = useMemo(() => {
    const cardWidth = 340 / 1.4 + 10;
    const cardNum = Math.floor(windowWidth / cardWidth);
    return cardWidth * cardNum + 5;
  }, [windowWidth]);

  return (
    <div>
      <StyledSidePanel
        openWidth={Math.max(windowWidth * 0.535, 350)}
        openDirection={SidePanelOpenDirection.Right}
        open={!!activeCard}
      >
        {activeCard && (
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
      <br />
      <SearchControls />
      <br />
      <SortComponent />
      <ResultCount ref={containerRef}>{`${resultSet.length} card(s)`}</ResultCount>
      <Container>
        <CardsGrid $maxWidth={maxWidth}>
          {resultSet.slice(page, page + CHUNK_SIZE).map((entry, i) => (
            <HellfallEntry
              onClick={(event: React.MouseEvent<HTMLImageElement>) => {
                if (event.button === 1 || event.metaKey || event.ctrlKey) {
                  window.open('/hellfall/card/' + encodeURIComponent(entry.id), '_blank');
                } else {
                  // startTransition(() => {
                  setActiveCardFromAtom(entry.id);
                  // });
                }
              }}
              key={'' + entry.id + '-' + i}
              id={entry.id}
              name={entry.name}
              otherNames={getOtherNames(entry)}
              url={
                'card_faces' in entry && entry.layout == 'meld_part' && entry.card_faces[0].image
                  ? entry.card_faces[0].image
                  : entry.image!
              }
            />
          ))}
        </CardsGrid>
      </Container>
      <PaginationComponent model={paginationModel} />
    </div>
  );
};
const ResultCount = styled('h5')({ display: 'flex', justifyContent: 'center' });
const Container = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  // flexWrap: 'wrap',
  width: '100%',
});

const CardsGrid = styled('div')<{ $maxWidth: number }>(({ $maxWidth }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  alignItems: 'center',
  maxWidth: $maxWidth + 'px', // Maximum row width: 5 cards at average width (243px * 5 = 1215px)
  width: '100%',
  gap: '0px',
  margin: '0 auto',
}));

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
