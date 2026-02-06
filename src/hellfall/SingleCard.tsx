import { useNavigate, useParams } from "react-router-dom";
import { cardsAtom } from "./cardsAtom";
import { HellfallCard } from "./HellfallCard";
import styled from "@emotion/styled";

import { useEffect } from "react";
import { useAtomValue } from "jotai";

export const SingleCard = () => {
  const cards = useAtomValue(cardsAtom);
  const nav = useNavigate();
  const { "*": cardId } = useParams();
  const entryToRender = cards?.find((e) => e.Id === cardId);

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
