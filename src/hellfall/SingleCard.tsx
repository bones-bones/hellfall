import { useNavigate, useParams } from "react-router-dom";
import { cardsAtom } from "./cardsAtom";
import { HellfallCard } from "./HellfallCard";
import styled from "@emotion/styled";

import { useEffect } from "react";
import { useAtomValue } from "jotai";

export const SingleCard = () => {
  const cards = useAtomValue(cardsAtom);
  const nav = useNavigate();
  const { "*": cardName } = useParams();

  useEffect(() => {
    if (cards.length > 0 && cardName == "random") {
      const theName = cards[Math.floor(Math.random() * cards.length)].Name;

      nav("/card/" + encodeURIComponent(theName));
    }
  }, [cards.length, cardName]);

  const entryToRender = cards?.find((e) => e.Name === cardName);

  return (
    <Container>
      {cards.length === 0 ? (
        <></>
      ) : !entryToRender ? (
        <h2>Nothing was found...</h2>
      ) : (
        <CardContainer>
          <HellfallCard data={entryToRender} />
        </CardContainer>
      )}
    </Container>
  );
};

const CardContainer = styled.div({
  width: "60vw",
  paddingTop: "50px",
  justifyContent: "center",
});
const Container = styled.div({
  display: "flex",
  justifyContent: "center",
});
