import { Route, Routes, useLocation } from 'react-router-dom';
import { specialCards } from './specialCards.tsx';
import { useEffect } from 'react';
import { createStyles } from '@workday/canvas-kit-styling';
import { createStyledLink, createStyledListItem } from '../../styling';
import { useAtomValue } from 'jotai';
import { cardsAtom } from '../../hellfall/atoms/cardsAtom.ts';
import { HellsCard } from './HellsCard.tsx';

export const HellsCubeOne = () => {
  const val = useLocation();
  const cards = useAtomValue(cardsAtom);
  
  
  interface SpecialCardPageProps {
    name: string;
    component: React.ReactNode;
  }
  const SpecialCardPage = ({ name, component }: SpecialCardPageProps) => {
    useEffect(() => {
      document.title = `${name} | Hellfall`;
    }, [name]);

    return (
      <>
        <h3>{name}</h3>
        {component}
      </>
    );
  };
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <title>HLC Special Cards | Hellfall</title>
              Devotion to Dreadmaw:
              <ul>
                <li>6 CMC</li>
                <li>The art (only in HLC draft, not constructed)</li>
                <li>Dinosaur</li>
                <li>Trample</li>
                <li>6 Power</li>
                <li>6 Toughness</li>
                <li>Has exactly {'{G}{G}'}</li>
              </ul>
              <ul>
                {specialCards.map(entry => (
                  <StyledLi key={entry.name}>
                    <StyledLink to={val.pathname + entry.path}>{entry.name}</StyledLink>
                  </StyledLi>
                ))}
              </ul>
            </>
          }
        />
        {specialCards.map(entry => {
          if ('component' in entry) {
            return (
              <Route
                key={entry.path}
                path={entry.path}
                element={<SpecialCardPage name={entry.name} component={entry.component} />}
              />
            );
          } else {
            const component = (<HellsCard cardGetter={entry.cardGetter} cardMap={cards}/>)
            return (
              <Route
                key={entry.path}
                path={entry.path}
                element={<SpecialCardPage name={entry.name} component={component} />}
              />
            );
          }
        })}
      </Routes>
    </>
  );
};

// q=oracle:Human
const linkStyles = createStyles({
  // textDecoration: "none",
  color: 'black',
});
const StyledLink = createStyledLink(linkStyles, 'StyledLink');

const liStyles = createStyles({ marginTop: '15px' });
const StyledLi = createStyledListItem(liStyles, 'StyledLi');
