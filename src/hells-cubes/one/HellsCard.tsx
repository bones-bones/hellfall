import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";
import { useState, useEffect } from "react";

export const HellsCard = ({ queryString }: { queryString: string }) => {
  const [card, setCard] = useState(undefined);

  useEffect(() => {
    let ignore = false;
    (async () => {
      console.log("oi", card);

      const resp = await fetch(
        `https://api.scryfall.com/cards/random?q=${queryString} game:paper`
      );
      const {
        image_uris: { normal },
      } = await resp.json();
      if (!ignore) {
        setCard(normal);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  if (!card) {
    return <LoadingSkeleton></LoadingSkeleton>;
  }

  return <StyledImage src={card}></StyledImage>;
};

const StyledImage = styled.img({ maxWidth: "300px", display: "inline-block" });

const LoadingSkeleton = () => {
  return <Frame></Frame>;
};

const bounce = keyframes({ "50%": { backgroundColor: "black" } });

const Frame = styled.div({
  width: "300px",
  height: "411px",
  display: "inline-block",
  border: "3px solid black",
  borderRadius: "10px",
  animation: `${bounce} 1.5s ease infinite`,
});
