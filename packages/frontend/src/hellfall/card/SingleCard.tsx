import { Link, useLocation, useParams } from 'react-router-dom';
import { cardsAtom } from '../atoms/cardsAtom.ts';
import { HellfallCard } from './HellfallCard.tsx';
// import styled from '@emotion/styled';

import { useEffect, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { useUpdateURL } from '../hooks/useUrlSync.ts';
import { useSearchResults } from '../hooks/useSearchResults.ts';
import { invalidAtom, queryAtom, summaryAtom } from '../atoms/searchAtoms.ts';
import { SearchBar } from '../search-controls/SearchBar.tsx';
import { space } from '@workday/canvas-kit-react';
import { createStyles } from '@workday/canvas-kit-styling';

export const SingleCard = () => {
  const cards = useAtomValue(cardsAtom);
  const { '*': cardId } = useParams();

  const summary = useAtomValue(summaryAtom);
  const invalids = useAtomValue(invalidAtom);
  const query = useAtomValue(queryAtom);
  const entryToRender = cards?.find(e => e.hcid === cardId);

  const { resultSet } = useSearchResults(true);

  useUpdateURL(true);
  useEffect(() => {
    if (!entryToRender) {
      document.title = `Loading | Hellfall`;
    } else {
      document.title = `${entryToRender.name} | Hellfall`;
    }
  }, [entryToRender]);

  return (
    <div>
      {!cards.size() ? (
        <></>
      ) : !entryToRender ? (
        <h2>Nothing was found...</h2>
      ) : (
        <div style={{ display: 'block', justifyContent: 'center' }}>
          <br />
          <SearchBar />
          <hr className={separator} />
          <div className={containerStyles}>
            {query && (
              <>
                <div className={summaryStyles}>
                  <strong>
                    <Link to={`/card/${encodeURIComponent(cardId!)}`}>One random card</Link> from{' '}
                    {query == '*' ? (
                      'all of Hellscube'
                    ) : (
                      <Link to={`/?q=${query}`}>{resultSet.length} cards</Link>
                    )}
                  </strong>
                  {query != '*' && ` ${summary}`}.{' '}
                  <Link to={`/random${query == '*' ? '' : `?q=${query}`}`}>
                    Repeat this random search
                  </Link>
                </div>
                <hr className={separator} />
                {invalids.map(invalid => {
                  return (
                    <>
                      <div className={summaryStyles}>{`Invalid expression "${invalid[0]}" was ignored. ${invalid[1]}`}</div>
                      <hr className={separator} />
                    </>
                  );
                })}
              </>
            )}
            <div style={{ width: '60vw', margin: '0 auto' }}>
              <HellfallCard data={entryToRender} onSinglePage={true} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// const CardContainer = styled.div({
//   // width: '60vw',
//   // paddingTop: '50px',
//   justifyContent: 'center',
// });
const containerStyles = createStyles({
  display: 'flex',
  justifyContent: 'center',
});

// const Container = styled.div({
//   display: 'flex',
//   justifyContent: 'center',
// });
const separator = createStyles({ height: '1px', backgroundColor: '#ccc', border: 'none' });
// const Separator = styled('hr')({ height: '1px', backgroundColor: '#ccc', border: 'none' });
const summaryStyles = createStyles({
  display: 'inline-block',
  paddingLeft: space.l,
  paddingRight: space.l,
})
// const Summary = styled('div')({
//   display: 'inline-block',
//   paddingLeft: space.l,
//   paddingRight: space.l,
// });
// const Invalid = styled('div')({
//   display: 'inline-block',
//   paddingLeft: space.l,
//   paddingRight: space.l,
// });
