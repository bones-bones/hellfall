import { useEffect, useRef, useState, useMemo, startTransition } from 'react';
import { HellfallEntry } from './HellfallEntry.tsx';
import { xIcon, extLinkIcon } from '@workday/canvas-system-icons-web';

import { styled, Card, ToolbarIconButton, space } from '@workday/canvas-kit-react';
import { SidePanel, useSidePanel } from '@workday/canvas-kit-preview-react/side-panel';
import { PaginationComponent } from './inputs';

import { HellfallCard } from './card/HellfallCard.tsx';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  activeCardAtom,
  invalidAtom,
  pageAtom,
  queryAtom,
  summaryAtom,
} from './atoms/searchAtoms.ts';
import { useSearchResults } from './hooks/useSearchResults.ts';
import { SortComponent } from './search-controls/SortComponent.tsx';
import { CHUNK_SIZE } from './constants.ts';
import { useKeyPress } from '../hooks';
import { cardsAtom } from './atoms/cardsAtom.ts';
import { useUpdateURL, useUrlSync } from './hooks/useUrlSync.ts';
import { getOtherNames } from '@hellfall/shared/utils';
import { SearchBar } from './search-controls/SearchBar.tsx';
import { ActiveCardPanel } from './ActiveCardPanel.tsx';

export const HellFall = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const summary = useAtomValue(summaryAtom);
  const invalids = useAtomValue(invalidAtom);
  const query = useAtomValue(queryAtom);

  useUpdateURL();

  const setActiveCardFromAtom = useSetAtom(activeCardAtom);

  const [page, setPage] = useAtom(pageAtom);
  const { resultSet, paginationModel } = useSearchResults();

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxWidth = useMemo(() => {
    const cardWidth = 350 / 1.4 + 10;
    const cardNum = Math.floor(windowWidth / cardWidth);
    return cardWidth * cardNum + 5;
  }, [windowWidth]);

  useEffect(() => {
    document.title = `${query || 'Search'} | Hellfall`;
  }, [query]);

  return (
    <div>
      <ActiveCardPanel />
      <br />
      <SearchBar />
      <Separator />
      <SortComponent />
      <SortSeparator />

      <Summary ref={containerRef}>
        <strong>{`${
          resultSet.length > CHUNK_SIZE ? `${page + 1} - ${page + CHUNK_SIZE} of ` : ''
        } ${resultSet.length} card${resultSet.length != 1 ? 's' : ''}`}</strong>
        {summary && ` ${summary}`}
      </Summary>
      <Separator />
      {invalids.map(invalid => {
        return (
          <>
            <Invalid>{`Invalid expression "${invalid[0]}" was ignored. ${invalid[1]}`}</Invalid>
            <Separator />
          </>
        );
      })}

      <Container>
        <CardsGrid $maxWidth={maxWidth}>
          {resultSet.slice(page, page + CHUNK_SIZE).map((entry, i) => (
            <HellfallEntry
              onClick={(event: React.MouseEvent<HTMLImageElement>) => {
                if (event.button === 1 || event.metaKey || event.ctrlKey) {
                  window.open(`/card/${encodeURIComponent(entry.id)}`, '_blank');
                } else {
                  setActiveCardFromAtom(entry.id);
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
const SortSeparator = styled('hr')({
  height: '1px',
  backgroundColor: '#ccc',
  border: 'none',
  marginTop: '-20px',
});
const Separator = styled('hr')({ height: '1px', backgroundColor: '#ccc', border: 'none' });
const Summary = styled('div')({
  display: 'inline-block',
  paddingLeft: space.l,
  paddingRight: space.l,
});
const Invalid = styled('div')({
  display: 'inline-block',
  paddingLeft: space.l,
  paddingRight: space.l,
});
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
