import { Routes, Route } from "react-router";
import { HellsCube } from "./one";
import { Link } from "react-router-dom";
import styled from "@emotion/styled";
import { Header } from "../header";
import { toDeck } from "../deck-builder/toDeck";
import { useCards } from "../hellfall/useCards";

export const Hellscubes = () => {
  const cards = useCards();
  return (
    <>
      <Header></Header>
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
              <button
                onClick={() => {
                  const filtered = cards.filter((e) => e.Set === "HC3");
                  const toSaveNumbers: number[] = [];
                  while (toSaveNumbers.length < 90) {
                    const toPick = Math.floor(Math.random() * filtered.length);
                    if (!toSaveNumbers.includes(toPick)) {
                      toSaveNumbers.push(toPick);
                    }
                  }
                  console.log(toSaveNumbers);
                  const val = toDeck(toSaveNumbers.map((e) => filtered[e]));
                  const url =
                    "data:text/plain;base64," +
                    btoa(unescape(encodeURIComponent(JSON.stringify(val))));
                  const a = document.createElement("a");
                  a.style.display = "none";
                  a.href = url;
                  // the filename you want
                  a.download = "HC3 90 cards" + ".json";
                  document.body.appendChild(a);
                  a.click();
                }}
              >
                download 90 cards for winston HC3
              </button>
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
