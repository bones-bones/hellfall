import styled from "@emotion/styled";
import { HellfallEntry } from "./hellfall/HellfallEntry";
import { useAtomValue } from "jotai";
import { cardsAtom } from "./hellfall/cardsAtom";
import { useEffect, useState } from "react";
import { TeamWolf } from "./TeamWolf";
import { TeamClock } from "./TeamWolf";
import { stringify } from "querystring";

export const Watchwolfwar = () => {
  const RandyRandom = useAtomValue(cardsAtom);
  const FilterCard = RandyRandom.filter((entry) => {
    return entry.isActualToken != true;
  });
  const LeftCard = FilterCard[Math.floor(Math.random() * FilterCard.length)];
  const RightCard = FilterCard[Math.floor(Math.random() * FilterCard.length)];
  const [state, setstate] = useState("bingus");
  const [highState, setHighState] = useState<any>();
  const [scoreState, setScoreState] = useState<{Name:string, Number:number}[]>();
  useEffect(() => {
    if (state == "bingus") {
      //Just trying to make sure everything doesn't break when the first state happens
    } else {
      TeamWolf().then(setScoreState);
    }
      TeamClock(state).then(setHighState);
  }, [state]);
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
          name={LeftCard.Name}
          url={LeftCard.Image[0]!}
          onClick={() => {
            setstate(LeftCard.Name);
          }}
        />
        <HellfallEntry
          name={RightCard.Name}
          url={RightCard.Image[0]!}
          onClick={() => {
            setstate(RightCard.Name);
          }}
        />
      </CardContainer>
      <StyleComponent>
        <ResultsReceptaclePlaceThing>{scoreState?.sort((a,b)=>{return(b.Number - a.Number)}).slice(0, RandyRandom.length).map(entry=>{
          return <div key={entry.Name}><div key={entry.Name}>{entry.Name}</div><div key={entry.Number}>{entry.Number}</div></div>
        })}</ResultsReceptaclePlaceThing>
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
