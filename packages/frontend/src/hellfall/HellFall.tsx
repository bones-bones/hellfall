import { useEffect, useRef, useState, useMemo } from 'react';
import { HellfallEntry } from './entry/HellfallEntry.tsx';

import { styled, space } from '@workday/canvas-kit-react';

import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  activeCardAtom,
  invalidAtom,
  pageAtom,
  queryAtom,
  summaryAtom,
} from './atoms/searchAtoms.ts';
import { useSearchResults } from './hooks/useSearchResults.ts';
import { ControlBar } from './search-controls/ControlBar.tsx';
import { CHUNK_SIZE } from './constants.ts';
import { useUpdateURL, useUrlSync } from './hooks/useUrlSync.ts';
import { getOtherNames, toPlainText } from '@hellfall/shared/utils';
import { SearchBar } from './search-controls/SearchBar.tsx';
import { ActiveCardPanel } from './ActiveCardPanel.tsx';
import { Link } from 'react-router-dom';
import { HellfallCard } from './card/HellfallCard.tsx';

export const HellFall = () => {
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
      <SearchBar alreadyOnSearch={true} />
      <Separator />
      {resultSet.length != 1 && (
        <>
          <ControlBar model={paginationModel} />
          <SortSeparator />
        </>
      )}

      <Summary>
        <strong>
          {resultSet.length == 1 ? (
            <Link to={`/card/${encodeURIComponent(resultSet[0].hcid)}`}>Showing the one card</Link>
          ) : (
            `${resultSet.length > CHUNK_SIZE ? `${page + 1} - ${page + CHUNK_SIZE} of ` : ''} ${
              resultSet.length
            } cards`
          )}
        </strong>
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
        {resultSet.length == 1 ? (
          <div style={{ width: '60vw', margin: '0 auto' }}>
            <HellfallCard data={resultSet[0]} onSinglePage={true} />
          </div>
        ) : (
          <div>
            <CardsGrid $maxWidth={maxWidth}>
              {resultSet.slice(page, page + CHUNK_SIZE).map((entry, i) => (
                <HellfallEntry
                  onClick={(event: React.MouseEvent<HTMLImageElement>) => {
                    if (event.button === 1 || event.metaKey || event.ctrlKey) {
                      window.open(`/card/${encodeURIComponent(entry.hcid)}`, '_blank');
                    } else {
                      setActiveCardFromAtom(entry.id);
                    }
                  }}
                  key={'' + entry.id + '-' + i}
                  id={entry.hcid}
                  name={entry.name}
                  otherNames={getOtherNames(entry)}
                  plainText={toPlainText(entry)}
                  url={
                    'card_faces' in entry &&
                    entry.layout == 'meld_part' &&
                    entry.card_faces[0].image
                      ? entry.card_faces[0].image
                      : entry.image!
                  }
                />
              ))}
            </CardsGrid>
          </div>
        )}
      </Container>
      {resultSet.length != 1 && (
        <>
          <Separator />
          <ControlBar model={paginationModel} />
        </>
      )}
      {/* <PaginationComponent model={paginationModel} /> */}
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
