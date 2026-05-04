import { Routes, Route, useLocation } from 'react-router-dom';

import { Deck } from './Deck.tsx';
import { allDecks } from './allDecks.ts';
import styled from '@emotion/styled';
import { Link } from 'react-router-dom';
import { Suspense } from 'react';

//decks
export const Decks = () => {
  const val = useLocation();
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div>
            Look at all these decks
            <ul>
              {allDecks.map(entry => {
                return (
                  <StyledLi key={entry.title}>
                    <StyledLink to={val.pathname + '/' + entry.title}>
                      {entry.title} — {entry.author}
                    </StyledLink>
                  </StyledLi>
                );
              })}
            </ul>
          </div>
        }
      />
      <Route
        path="/*"
        element={
          <Suspense fallback="shuffling">
            <Deck />
          </Suspense>
        }
      />
    </Routes>
  );
};

const StyledLink = styled(Link)({
  // textDecoration: "none",
  color: 'black',
});

const StyledLi = styled.li({ marginTop: '15px' });
