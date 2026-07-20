import { useEffect, useState, useMemo, useRef } from 'react';
import { HellfallEntry } from './entry/HellfallEntry.tsx';

import { BoxProps, Card } from '@workday/canvas-kit-react';

import { useAtomValue, useSetAtom } from 'jotai';
import {
  activeCardAtom,
  inputDisplayAtom,
  invalidAtom,
  pageAtom,
  queryAtom,
  queryDisplayAtom,
  summaryAtom,
} from './atoms/searchAtoms.ts';
import { useSearchResults } from './hooks/useSearchResults.ts';
import { ControlBar } from './search-controls/ControlBar.tsx';
import { CHUNK_SIZE } from './constants.ts';
import { useUpdateURL } from './hooks/useUrlSync.ts';
import { getOtherNames, toFaces, toPlainText } from '@hellfall/shared/utils';
import { SearchBar } from './search-controls/SearchBar.tsx';
import { ActiveCardPanel } from './ActiveCardPanel.tsx';
import { Link } from 'react-router-dom';
import { HellfallCard } from './card/HellfallCard.tsx';
import { createStencil, createStyles } from '@workday/canvas-kit-styling';
import { createStenciledDiv, createStyledDiv, createStyledHR } from '../styling';
import { PaginationBar } from './search-controls/PaginationBar.tsx';
import { Checklist } from './Checklist.tsx';
import { CardFaceContainer } from './card/hellfall-card-components/CardFace.tsx';

export const HellFall = () => {
  const summary = useAtomValue(summaryAtom);
  const invalids = useAtomValue(invalidAtom);
  const query = useAtomValue(queryAtom);

  useUpdateURL();

  const setActiveCardFromAtom = useSetAtom(activeCardAtom);

  const page = useAtomValue(pageAtom);

  const { resultSet, paginationModel } = useSearchResults();

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const inputDisplay = useAtomValue(inputDisplayAtom);
  const queryDisplay = useAtomValue(queryDisplayAtom);
  const display = queryDisplay ?? inputDisplay;

  // Track current and previous page numbers. this is so we can scroll users to the card list, or scroll them to the top
  const pageNumberRef = useRef<number>(0);
  const scrollPointRef = useRef<HTMLHRElement>(null);
  useEffect(() => {
    if (scrollPointRef.current && pageNumberRef.current < page) {
      scrollPointRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    pageNumberRef.current = page;
  }, [page]);

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
    // note: leave this, there's some weird react version stuff going on
    document.title = `${query || 'Search'} | Hellfall`;
  }, [query]);

  return (
    <div>
      <ActiveCardPanel />
      <br />
      <SearchBar alreadyOnSearch={true} />
      <Separator ref={scrollPointRef} />
      {resultSet.length != 1 && (
        <>
          <ControlBar>
            <PaginationBar model={paginationModel} />
          </ControlBar>
          <SortSeparator />
        </>
      )}

      <Summary>
        <strong>
          {resultSet.length == 1 ? (
            <Link to={`/card/${encodeURIComponent(resultSet[0].hcid)}`}>Showing the one card</Link>
          ) : (
            `${
              resultSet.length > CHUNK_SIZE
                ? `${page + 1} - ${Math.min(page + CHUNK_SIZE, resultSet.length)} of `
                : ''
            } ${resultSet.length} cards`
          )}
        </strong>
        {summary && ` ${summary}`}
      </Summary>
      <Separator />
      {invalids.map(invalid => {
        return (
          <>
            <Invalid>{`${
              invalid[0].startsWith('invalid')
                ? ''
                : `Invalid expression "${invalid[0]}" was ignored.`
            } ${invalid[1]}`}</Invalid>
            <Separator />
          </>
        );
      })}

      {resultSet.length == 1 ? (
        <Container>
          <div style={{ width: '60vw', margin: '0 auto' }}>
            <HellfallCard data={resultSet[0]} onSinglePage={true} />
          </div>
        </Container>
      ) : (
        <div>
          {display == 'checklist' ? (
            <Checklist cards={resultSet.slice(page, page + CHUNK_SIZE)} />
          ) : display == 'text' ? (
            <Container>
              <TextGrid>
                {resultSet.slice(page, page + CHUNK_SIZE).map((entry, i) => (
                  <Card key={`${entry.id}-${i}`} cs={cardStyles}>
                    <Card.Body cs={cardBodyStyles}>
                      {toFaces(entry).map((face, j) => (
                        <CardFaceContainer key={`face-${j}`} face={face} i={j} />
                      ))}
                    </Card.Body>
                  </Card>
                ))}
              </TextGrid>
            </Container>
          ) : display == 'full' ? (
            <Container>
              <div style={{ display: 'block', width: '100%' }}>
                {resultSet.slice(page, page + CHUNK_SIZE).map((entry, i) => (
                  <>
                    <div
                      key={`${entry.id}-${i}`}
                      style={{ width: '60vw', margin: '0 auto', display: 'block' }}
                    >
                      <HellfallCard data={entry} onSinglePage={true} />
                    </div>
                    <Separator />
                  </>
                ))}
              </div>
            </Container>
          ) : (
            <Container>
              <CardsGrid maxWidth={`${maxWidth}px`}>
                {resultSet.slice(page, page + CHUNK_SIZE).map((entry, i) => (
                  <HellfallEntry
                    onClick={(event: React.MouseEvent<HTMLImageElement>) => {
                      if (event.button === 1 || event.metaKey || event.ctrlKey) {
                        window.open(`/card/${encodeURIComponent(entry.hcid)}`, '_blank');
                      } else {
                        setActiveCardFromAtom(entry.id);
                      }
                    }}
                    key={`${entry.id}-${i}`}
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
            </Container>
          )}
        </div>
      )}
      {resultSet.length != 1 && (
        <>
          <Separator />
          <ControlBar>
            <PaginationBar model={paginationModel} />
          </ControlBar>
        </>
      )}
    </div>
  );
};
const sortSeparatorStyles = createStyles({
  height: '1px',
  backgroundColor: '#ccc',
  border: 'none',
  marginTop: '-20px',
});
const SortSeparator = createStyledHR(sortSeparatorStyles, 'SortSeparator');

const separatorStyles = createStyles({ height: '1px', backgroundColor: '#ccc', border: 'none' });
const Separator = createStyledHR(separatorStyles, 'Separator');

const summaryStyles = createStyles({
  display: 'inline-block',
  paddingLeft: '36px',
  paddingRight: '36px',
});
const Summary = createStyledDiv(summaryStyles, 'Summary');
const Invalid = createStyledDiv(summaryStyles, 'Invalid');

const containerStyles = createStyles({
  display: 'flex',
  justifyContent: 'center',
  // flexWrap: 'wrap',
  width: '100%',
});
const Container = createStyledDiv(containerStyles, 'Container');

const cardsGridStencil = createStencil({
  vars: {
    maxWidth: '1215px',
  },
  base: ({ maxWidth }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: maxWidth, // Maximum row width: 5 cards at average width (243px * 5 = 1215px)
    width: '100%',
    gap: '0px',
    margin: '0 auto',
  }),
});
interface CardsGridProps extends BoxProps {
  maxWidth?: string;
}
const CardsGrid = createStenciledDiv<CardsGridProps>(cardsGridStencil, 'CardsGrid');

const textGridStyles = createStyles({
  display: 'grid',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  gap: '10px',
  margin: '0 auto',
  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
});

const TextGrid = createStyledDiv(textGridStyles, 'TextGrid');

const cardStyles = createStyles({
  display: 'inline-block',
  position: 'relative',
  width: '100%',
  height: '100%',
  alignItems: 'top',
  borderRadius: '4px',
  borderTop: '3px solid black',
  borderBottom: '3px solid black',
  paddingTop: '10px',
  paddingBottom: '5px',
  margin: '5px',
});
const cardBodyStyles = createStyles({});
