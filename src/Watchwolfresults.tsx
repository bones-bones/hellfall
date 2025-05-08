import styled from "@emotion/styled";
import { useAtom, useAtomValue } from "jotai";
import { cardsAtom } from "./hellfall/cardsAtom";
import { useState } from "react";
import { TeamWolf as GetCardVotes } from "./TeamWolf";
import { SidePanelOpenDirection, Card, ToolbarIconButton, SidePanel } from "@workday/canvas-kit-react";
import { HellfallCard } from "./hellfall/HellfallCard";
import { activeCardAtom } from "./hellfall/searchAtoms";
import { xIcon } from "@workday/canvas-system-icons-web";

export const Watchwolfresults = () => {
  const RandyRandom = useAtomValue(cardsAtom);
  const activeCard = RandyRandom.find((entry) => {
    return entry.Name === activeCardFromAtom;
  });
  const [activeCardFromAtom, setActiveCardFromAtom] = useAtom(activeCardAtom);
  const [standings, setStandings] =
    useState<{ Name: string; Number: number }[]>();
    GetCardVotes().then(setStandings)
  return (
    <PageContainer>
        <StyledSidePanel
        openWidth={window.screen.width > 450 ? 810 : 400}
        openDirection={SidePanelOpenDirection.Right}
        open={!!activeCard}
      >
        {!!activeCard && (
          <Card>
            <Card.Body padding={"zero"}>
              <SPContainer>
                <ToolbarIconButton
                  icon={xIcon}
                  onClick={() => setActiveCardFromAtom("")}
                />
                {activeCard && <HellfallCard data={activeCard} />}
              </SPContainer>
            </Card.Body>
          </Card>
        )}
      </StyledSidePanel>
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
      <StyleComponent>
        <ResultsReceptaclePlaceThing>
          {standings
            ?.sort((a, b) => {
              return b.Number - a.Number;
            })
            .slice(0, RandyRandom.length)
            .map((entry) => {
              return (
                <div key={entry.Name}>
                  <div key={entry.Name}>{entry.Name} - {entry.Number}</div>
                </div>
              );
            })}
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

const StyledSidePanel = styled(SidePanel)({
    zIndex: 40,
    height: "100%",
    position: "fixed",
    backgroundColor: "transparent",
    top: "10px",
  });
  const SPContainer = styled("div")({
    overflowY: "scroll",
    height: "90vh",
    overflowX: "hidden",
  });