import styled from "@emotion/styled";
import { useState, useEffect } from "react";

export const HellsCard = ({ queryString }: { queryString: string }) => {
  const [card, setCard] = useState("");
  useEffect(() => {
    fetch(
      `https://api.scryfall.com/cards/random?q=${queryString} game:paper`
    ).then((resp) => {
      resp.json().then(({ image_uris: { normal } }) => {
        setCard(normal);
      });
    });
  }, []);
  return <StyledImage key={card} src={card}></StyledImage>;
};

const StyledImage = styled.img({ maxWidth: "300px", display: "inline-block" });
