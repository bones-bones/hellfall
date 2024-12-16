import { Link, Route, Routes, useLocation } from "react-router-dom";
import styled from "@emotion/styled";
import { specialCards } from "./specialCards";

export const HellsCubeOne = () => {
  const val = useLocation();

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <>
              Devotion to Dreadmaw:
              <ul>
                <li>6 CMC</li>
                <li>The art</li>
                <li>Dinosaur</li>
                <li>Trample</li>
                <li>6 Power</li>
                <li>6 Toughness</li>
                <li>Has exactly {"{G}{G}"}</li>
              </ul>
              <ul>
                {specialCards.map((entry) => (
                  <StyledLi key={entry.name}>
                    <StyledLink to={val.pathname + entry.path}>
                      {entry.name}
                    </StyledLink>
                  </StyledLi>
                ))}
              </ul>
            </>
          }
        />
        {specialCards.map((entry) => {
          return (
            <Route
              key={entry.path}
              path={entry.path}
              element={
                <>
                  <h3>{entry.name}</h3>
                  {entry.component}
                </>
              }
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
  color: "black",
});

const StyledLi = styled.li({ marginTop: "15px" });
