import { Link, Route, Routes, useLocation } from "react-router-dom";
import styled from "@emotion/styled";
import { specialCards } from "./specialCards";

export const HellsCube = () => {
  const val = useLocation();

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <>
              Devotion to Dreadmaw:
              <br />- 6 CMC
              <br />- The art
              <br />- Dinosaur
              <br />- Trample
              <br />- 6 Power
              <br />- 6 Toughness
              <br />- Has exactly {"{G}{G}"}
              <br />
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
