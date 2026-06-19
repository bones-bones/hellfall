import { Link, matchPath, Route, Routes, useLocation } from 'react-router-dom';
import styled from '@emotion/styled';
import { specialCards } from './specialCards.tsx';
import { useEffect } from 'react';

export const HellsCubeOne = () => {
  const val = useLocation();
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
                <li>The art</li>
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
          return (
            <Route
              key={entry.path}
              path={entry.path}
              element={<SpecialCardPage name={entry.name} component={entry.component} />}
            />
          );
        })}
      </Routes>
    </>
  );
};

// q=oracle:Human

const StyledLink = styled(Link)({
  // textDecoration: "none",
  color: 'black',
});

const StyledLi = styled.li({ marginTop: '15px' });
