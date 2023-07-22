import { Routes, Route } from "react-router";
import { HellsCube } from "./one";
import { Link } from "react-router-dom";
import styled from "@emotion/styled";

export const Hellscubes = () => {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <Container>
              <h2>
                This page contains a list of links to cubes that help you deal
                with the weirder cards of each cube
              </h2>

              <h3>
                <StyledLink to="one">HC1</StyledLink>
              </h3>
            </Container>
          }
        />
        <Route path="/one/*" element={<HellsCube />} />
      </Routes>
    </>
  );
};

// q=oracle:Human

const StyledLink = styled(Link)({
  // textDecoration: "none",
  //color: "black",
});
const Container = styled.div({ padding: "10px" });
