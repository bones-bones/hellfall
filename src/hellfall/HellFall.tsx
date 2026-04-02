import { useEffect, useRef } from 'react';
import { HellfallEntry } from './HellfallEntry';
import { xIcon } from '@workday/canvas-system-icons-web';

import { styled } from '@workday/canvas-kit-react/common';
import { SidePanel, SidePanelOpenDirection } from '@workday/canvas-kit-react/side-panel';
import { PaginationComponent } from './inputs';

import { HellfallCard } from './card/HellfallCard';
import { Card } from '@workday/canvas-kit-react/card';
import { ToolbarIconButton } from '@workday/canvas-kit-react/button';
import { useAtom, useAtomValue } from 'jotai';
import { activeCardAtom, pageAtom } from './atoms/searchAtoms';
import { useSearchResults } from './hooks/useSearchResults';
import { SearchControls } from './search-controls/SearchControls';
import { SortComponent } from './search-controls/SortComponent';
import { CHUNK_SIZE } from './constants';
import { useKeyPress } from '../hooks';
import { cardsAtom } from './atoms/cardsAtom';
import { startTransition } from 'react';
import { useUrlSync } from './hooks/useUrlSync';

export const HellFall = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cards = useAtomValue(cardsAtom).filter(e => e.set != 'C');
  const escape = useKeyPress('Escape');

  useUrlSync();

  const [activeCardFromAtom, setActiveCardFromAtom] = useAtom(activeCardAtom);
  const [page, setPage] = useAtom(pageAtom);

  const activeCard = cards.find(entry => {
    return entry.id === activeCardFromAtom;
  });

  useEffect(() => {
    if (escape) {
      setActiveCardFromAtom('');
    }
  }, [escape]);
  const resultSet = useSearchResults();

  return (
    <div>
      <StyledSidePanel
        openWidth={window.screen.width > 450 ? 810 : 400}
        openDirection={SidePanelOpenDirection.Right}
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
      <br />
      <SearchControls />
      <br />
      <SortComponent />
      <ResultCount ref={containerRef}>{`${resultSet.length} card(s)`}</ResultCount>
      <Container>
        <CardsGrid>
          {resultSet.slice(page, page + CHUNK_SIZE).map((entry, i) => (
            <HellfallEntry
              onClick={(event: React.MouseEvent<HTMLImageElement>) => {
                if (event.button === 1 || event.metaKey || event.ctrlKey) {
                  window.open('/hellfall/card/' + encodeURIComponent(entry.id), '_blank');
                } else {
                  startTransition(() => {
                    setActiveCardFromAtom(entry.id);
                  });
                }
              }}
              // onClickTitle={(event: React.MouseEvent<HTMLImageElement>) => {
              //   if (event.button === 1 || event.metaKey || event.ctrlKey) {
              //     window.open('/hellfall/card/' + encodeURIComponent(entry.id), '_blank');
              //   } else {
              //     startTransition(() => {
              //       setActiveCardFromAtom(entry.id);
              //     });
              //   }
              // }}
              key={'' + entry.id + '-' + i}
              id={entry.id}
              name={entry.name}
              url={
                'card_faces' in entry && entry.layout == 'meld_part' && entry.card_faces[0].image
                  ? entry.card_faces[0].image
                  : entry.image!
              }
            />
          ))}
        </CardsGrid>
      </Container>
      <PaginationComponent
        onChange={val => {
          setPage(val);
          containerRef.current?.scrollIntoView({ behavior: 'smooth' });
        }}
        initialCurrentPage={page}
        chunkSize={CHUNK_SIZE}
        total={resultSet.length}
      />
    </div>
  );
};
const ResultCount = styled('h5')({ display: 'flex', justifyContent: 'center' });
const Container = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  // flexWrap: 'wrap',
  width: '100%',
  padding: '0 16px',
});

const CardsGrid = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  alignItems: 'center',
  maxWidth: '1300px', // Maximum row width: 5 cards at average width (243px * 5 = 1215px)
  width: '100%',
  gap: '0px',
  margin: '0 auto',

  // When the viewport is smaller, allow the container to shrink
  '@media (max-width: 1300px)': {
    maxWidth: '100%',
  },
});

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
