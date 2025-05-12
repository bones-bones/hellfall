import styled from "@emotion/styled";
import { HellfallEntry } from "./hellfall/HellfallEntry";
import { useAtomValue } from "jotai";
import { cardsAtom } from "./hellfall/cardsAtom";
import { useRef, useState } from "react";
import { TeamClock } from "./TeamWolf";
import { Link } from "react-router-dom";
import { HCEntry } from "./types";

export const Watchwolfwar = () => {
  const RandyRandom = useAtomValue(cardsAtom);
  const submitting = useRef(false);
  const FilterCard = RandyRandom.filter((entry) => {
    return entry.isActualToken != true && entry.Set != "C";
  });
  const [TwoCardState, SetTwoCardState] = useState<{
    LeftCard: HCEntry;
    RightCard: HCEntry;
  }>({
    LeftCard: FilterCard[Math.floor(Math.random() * FilterCard.length)],
    RightCard: FilterCard[Math.floor(Math.random() * FilterCard.length)],
  });

  const updateStandings = async (cardName: string) => {
    if (!submitting.current) {
      submitting.current = true;

      await TeamClock(cardName);
      SetTwoCardState({
        LeftCard: FilterCard[Math.floor(Math.random() * FilterCard.length)],
        RightCard: FilterCard[Math.floor(Math.random() * FilterCard.length)],
      });
      submitting.current = false;
    }
  };

  return (
    <PageContainer>
      <StyleComponent>
        <Title>
          Welcome to the WatchWolfWar, the place to be to determine the
          Hellsiest card of All!
        </Title>
      </StyleComponent>
      <StyleComponent>
        <Subtitle>
          Brought to you by goldcrackle, with odes of help from llllll.
        </Subtitle>
      </StyleComponent>
      <CardContainer>
        <HellfallEntry
          name={TwoCardState.LeftCard.Name}
          url={TwoCardState.LeftCard.Image[0]!}
          onClick={() => {
            updateStandings(TwoCardState.LeftCard.Name);
          }}
        />
        <HellfallEntry
          name={TwoCardState.RightCard.Name}
          url={TwoCardState.RightCard.Image[0]!}
          onClick={() => {
            updateStandings(TwoCardState.RightCard.Name);
          }}
        />
      </CardContainer>
      <StyleComponent>
        <ResultsReceptaclePlaceThing>
          <Link to={"/Watchwolfresults"}>Results!</Link>{" "}
        </ResultsReceptaclePlaceThing>
      </StyleComponent>
    </PageContainer>
  );
};

const PageContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "40px",
  fontFamily: "Arial, sans-serif",
  backgroundColor: "#f9f9f9",
  minHeight: "100vh",
});
const Title = styled("h1")({ textAlign: "center", marginBottom: "10px" });
const Subtitle = styled("h3")({ textAlign: "center", marginBottom: "30px" });
const CardContainer = styled("div")({
  display: "flex",
  justifyContent: "center",
  gap: "40px",
  marginBottom: "30px",
  width: "100%",
  maxWidth: "800px",
});
const ResultsReceptaclePlaceThing = styled("div")({
  width: "100%",
  maxWidth: "600px",
  padding: "20px",
  backgroundColor: "grey",
  border: "1px solid #ccc",
  boxShadow: "0 2px 8px rgb(164, 45, 168)",
  textAlign: "center",
});

const StyleComponent = styled("div")({ color: "purple", display: "flex" });
