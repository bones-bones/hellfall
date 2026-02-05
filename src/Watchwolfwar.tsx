import styled from "@emotion/styled";
import { HellfallEntry } from "./hellfall/HellfallEntry";
import { useAtom, useAtomValue } from "jotai";
import { cardsAtom } from "./hellfall/cardsAtom";
import { useRef, useState, useEffect } from "react";
import { TeamClock } from "./TeamWolf";
import {
  SidePanelOpenDirection,
  Card,
  ToolbarIconButton,
  SidePanel,
} from "@workday/canvas-kit-react";
import { Link } from "react-router-dom";
import { HellfallCard } from "./hellfall/HellfallCard";
import { activeCardAtom } from "./hellfall/searchAtoms";
import { xIcon } from "@workday/canvas-system-icons-web";
import { HCEntry } from "./types";
import { useKeyPress } from "./hooks";

//TODO: make results use Id natively on the backend

export const Watchwolfwar = () => {
  const escape = useKeyPress("Escape");
  const RandyRandom = useAtomValue(cardsAtom);
  const [activeCardFromAtom, setActiveCardFromAtom] = useAtom(activeCardAtom);
  const activeCard = RandyRandom.find((entry) => {
    return entry.Id === activeCardFromAtom;
  });
  useEffect(() => {
    if (escape) {
      setActiveCardFromAtom("");
    }
  }, [escape]);

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
  var activeIsRight = true;

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
      <StyledSidePanel
        openWidth={window.screen.width > 450 ? 810 : 400}
        openDirection={
          activeIsRight
            ? SidePanelOpenDirection.Right
            : SidePanelOpenDirection.Left
        }
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
      <CardContainer>
        <HellfallEntry
          id={TwoCardState.LeftCard.Id}
          name={TwoCardState.LeftCard.Name}
          url={TwoCardState.LeftCard.Image[0]!}
          onClick={(event: React.MouseEvent<HTMLImageElement>) => {
            if (event.button === 1 || event.metaKey || event.ctrlKey) {
              window.open(
                "/hellfall/card/" +
                  encodeURIComponent(TwoCardState.LeftCard.Id),
                "_blank"
              );
            } else {
              updateStandings(TwoCardState.LeftCard.Name);
              activeIsRight = false;
              setActiveCardFromAtom("");
            }
          }}
          onClickTitle={(event: React.MouseEvent<HTMLImageElement>) => {
            if (event.button === 1 || event.metaKey || event.ctrlKey) {
              window.open(
                "/hellfall/card/" +
                  encodeURIComponent(TwoCardState.LeftCard.Id),
                "_blank"
              );
            } else {
              setActiveCardFromAtom(TwoCardState.LeftCard.Id);
            }
          }}
        />
        <HellfallEntry
          id={TwoCardState.RightCard.Id}
          name={TwoCardState.RightCard.Name}
          url={TwoCardState.RightCard.Image[0]!}
          onClick={(event: React.MouseEvent<HTMLImageElement>) => {
            if (event.button === 1 || event.metaKey || event.ctrlKey) {
              window.open(
                "/hellfall/card/" +
                  encodeURIComponent(TwoCardState.RightCard.Id),
                "_blank"
              );
            } else {
              updateStandings(TwoCardState.RightCard.Name);
              activeIsRight = true;
              setActiveCardFromAtom("");
            }
          }}
          onClickTitle={(event: React.MouseEvent<HTMLImageElement>) => {
            if (event.button === 1 || event.metaKey || event.ctrlKey) {
              window.open(
                "/hellfall/card/" +
                  encodeURIComponent(TwoCardState.RightCard.Id),
                "_blank"
              );
            } else {
              setActiveCardFromAtom(TwoCardState.RightCard.Id);
            }
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
