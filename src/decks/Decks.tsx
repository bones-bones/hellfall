import { Routes, Route, useLocation } from 'react-router';

import { Deck } from './Deck';
import { allDecks } from './allDecks';
import styled from '@emotion/styled';
import { Link } from 'react-router-dom';
import { Suspense } from 'react';

//decks
export const Decks = () => {
  debugger;
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
