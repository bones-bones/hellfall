import { Link } from "react-router-dom";
import styled from "@emotion/styled";
import { toDeck } from "../deck-builder/toDeck";
import { cardsAtom } from "../hellfall/cardsAtom";
import { toCockCube } from "./toCockCube";
import { useAtomValue } from "jotai";

export const CubeResources = () => {
  const cards = useAtomValue(cardsAtom);

  return (
    <Container>
      <h2>This page contains resources to help you play the cubes</h2>

      <h3>HC1</h3>
      <StyledLink to="one">Rules and quick links for weird cards</StyledLink>
      <br></br>
      <br></br>
      <button
        onClick={() => {
          const filtered = cards.filter((e) => e.Set === "HLC");
          const val = toDeck(filtered);
          const url =
            "data:text/plain;base64," +
            btoa(unescape(encodeURIComponent(JSON.stringify(val))));
          const a = document.createElement("a");
          a.style.display = "none";
          a.href = url;
          // the filename you want
          a.download = "Hellscube" + ".json";
          document.body.appendChild(a);
          a.click();
        }}
      >
        Download HC1 cube for TTS
      </button>
      <button
        onClick={() => {
          const val = toCockCube({
            set: "HLC",
            name: "Hellscube",
            cards: cards.filter((e) => e.Set === "HLC"),
          });

          const url =
            "data:text/plain;base64," + btoa(unescape(encodeURIComponent(val)));
          const a = document.createElement("a");
          a.style.display = "none";
          a.href = url;
          // the filename you want
          a.download = "Hellscube" + ".xml";
          document.body.appendChild(a);
          a.click();
        }}
      >
        Download HC1 cube for Cockatrice
      </button>

      <h3>HC2</h3>

      <button
        onClick={() => {
          const filtered = cards.filter((e) => e.Set === "HC2");

          const val = toDeck(filtered);
          const url =
            "data:text/plain;base64," +
            btoa(unescape(encodeURIComponent(JSON.stringify(val))));
          const a = document.createElement("a");
          a.style.display = "none";
          a.href = url;
          // the filename you want
          a.download = "Hellscube 2" + ".json";
          document.body.appendChild(a);
          a.click();
        }}
      >
        Download HC2 cube for TTS
      </button>
      <button
        onClick={() => {
          const val = toCockCube({
            set: "HC2",
            name: "Hellscube 2",
            cards: cards.filter((e) => e.Set === "HC2"),
          });

          const url =
            "data:text/plain;base64," + btoa(unescape(encodeURIComponent(val)));
          const a = document.createElement("a");
          a.style.display = "none";
          a.href = url;
          // the filename you want
          a.download = "Hellscube 2" + ".xml";
          document.body.appendChild(a);
          a.click();
        }}
      >
        Download HC2 cube for Cockatrice
      </button>

      <h3>HC3</h3>

      <button
        onClick={() => {
          const filtered = cards.filter((e) => e.Set === "HC3");

          const val = toDeck(filtered);
          const url =
            "data:text/plain;base64," +
            btoa(unescape(encodeURIComponent(JSON.stringify(val))));
          const a = document.createElement("a");
          a.style.display = "none";
          a.href = url;
          // the filename you want
          a.download = "Hellscube 3" + ".json";
          document.body.appendChild(a);
          a.click();
        }}
      >
        Download HC3 cube for TTS
      </button>
      <button
        onClick={() => {
          const val = toCockCube({
            set: "HC3",
            name: "Hellscube 3",
            cards: cards.filter((e) => e.Set === "HC3"),
          });

          const url =
            "data:text/plain;base64," + btoa(unescape(encodeURIComponent(val)));
          const a = document.createElement("a");
          a.style.display = "none";
          a.href = url;
          // the filename you want
          a.download = "Hellscube 3" + ".xml";
          document.body.appendChild(a);
          a.click();
        }}
      >
        Download HC3 cube for Cockatrice
      </button>
      <h3>HC3</h3>

      <button
        onClick={() => {
          const filtered = cards.filter((e) => e.Set === "HC4");

          const val = toDeck(filtered);
          const url =
            "data:text/plain;base64," +
            btoa(unescape(encodeURIComponent(JSON.stringify(val))));
          const a = document.createElement("a");
          a.style.display = "none";
          a.href = url;
          // the filename you want
          a.download = "Hellscube 4" + ".json";
          document.body.appendChild(a);
          a.click();
        }}
      >
        Download HC4 cube for TTS
      </button>
      <button
        onClick={() => {
          const val = toCockCube({
            set: "HC4",
            name: "Hellscube 4",
            cards: cards.filter((e) => e.Set === "HC4"),
          });

          const url =
            "data:text/plain;base64," + btoa(unescape(encodeURIComponent(val)));
          const a = document.createElement("a");
          a.style.display = "none";
          a.href = url;
          // the filename you want
          a.download = "Hellscube 4" + ".xml";
          document.body.appendChild(a);
          a.click();
        }}
      >
        Download HC4 cube for Cockatrice
      </button>
    </Container>
  );
};

const StyledLink = styled(Link)({
  // textDecoration: "none",
  //color: "black",
});
const Container = styled.div({ padding: "10px" });
