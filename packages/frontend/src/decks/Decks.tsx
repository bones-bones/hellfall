import { Routes, Route, useLocation } from 'react-router-dom';

import { Deck } from './Deck.tsx';
import { allDecks } from './allDecks.ts';
import { Suspense } from 'react';
import { createStyles } from '@workday/canvas-kit-styling';
import { createStyledLink, createStyledListItem } from '../styling';

export const Decks = () => {
  const val = useLocation();
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div>
            <title>Decks | Hellfall</title>
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

const linkStyles = createStyles({
  // textDecoration: "none",
  color: 'black',
});
const StyledLink = createStyledLink(linkStyles);

const liStyles = createStyles({ marginTop: '15px' });
const StyledLi = createStyledListItem(liStyles);
