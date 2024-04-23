import { useEffect, useRef } from "react";
import { HellfallEntry } from "./HellfallEntry";
import { xIcon } from "@workday/canvas-system-icons-web";

import { styled } from "@workday/canvas-kit-react/common";
import {
  SidePanel,
  SidePanelOpenDirection,
} from "@workday/canvas-kit-react/side-panel";
import { PaginationComponent } from "./inputs";

import { HFCard } from "./HFCard";
import { Card } from "@workday/canvas-kit-react/card";
import { ToolbarIconButton } from "@workday/canvas-kit-react/button";
import { useAtom } from "jotai";
import { activeCardAtom, offsetAtom } from "./searchAtoms";
import { useSearchResults } from "./useSearchResults";
import { SearchControls } from "./SearchControls";
import { SortComponent } from "./SortComponent";
import { CHUNK_SIZE } from "./constants";
import { useKeyPress } from "../hooks";
import { useCards } from "./useCards";

import { Header } from "../header";

export const HellFall = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cards = useCards();
  const escape = useKeyPress("Escape");

  const [activeCardFromAtom, setActiveCardFromAtom] = useAtom(activeCardAtom);

  const activeCard = cards.find((entry) => {
    return entry.Name === activeCardFromAtom;
  });

  useEffect(() => {
    if (escape) {
      setActiveCardFromAtom("");
    }
  }, [escape]);
  const [offset, setOffset] = useAtom(offsetAtom);
  const resultSet = useSearchResults();
  console.log(resultSet, offset);
  return (
    <div>
      <Header></Header>
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
                {activeCard && <HFCard data={activeCard}></HFCard>}
              </SPContainer>
            </Card.Body>
          </Card>
        )}
      </StyledSidePanel>
      <br />
      <SearchControls />
      <br />
      <SortComponent />
      <ResultCount>{`${resultSet.length} card(s)`}</ResultCount>
      <Container ref={containerRef}>
        {resultSet.slice(offset, offset + CHUNK_SIZE).map((entry, i) => (
          <HellfallEntry
            onClick={() => {
              setActiveCardFromAtom(entry.Name);
            }}
            key={"" + entry.Name + i}
            name={entry.Name}
            url={entry.Image}
          />
        ))}
      </Container>
      <PaginationComponent
        onChange={(val) => {
          setOffset(val);
          containerRef.current?.scrollIntoView({ behavior: "smooth" });
        }}
        initialCurrentPage={offset}
        chunkSize={CHUNK_SIZE}
        total={resultSet.length}
      />
    </div>
  );
};
const ResultCount = styled("h5")({ display: "flex", justifyContent: "center" });
const Container = styled("div")({
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
});

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
