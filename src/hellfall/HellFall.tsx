import { useEffect, useRef } from "react";
import { HellfallEntry } from "./HellfallEntry";
import { xIcon } from "@workday/canvas-system-icons-web";

import { styled } from "@workday/canvas-kit-react/common";
import {
  SidePanel,
  SidePanelOpenDirection,
} from "@workday/canvas-kit-react/side-panel";
import { PaginationComponent } from "./inputs";

import { HellfallCard } from "./HellfallCard";
import { Card } from "@workday/canvas-kit-react/card";
import { ToolbarIconButton } from "@workday/canvas-kit-react/button";
import { useAtom, useAtomValue } from "jotai";
import { activeCardAtom, offsetAtom } from "./searchAtoms";
import { useSearchResults } from "./useSearchResults";
import { SearchControls } from "./SearchControls";
import { SortComponent } from "./SortComponent";
import { CHUNK_SIZE } from "./constants";
import { useKeyPress } from "../hooks";
import { cardsAtom } from "./cardsAtom";

export const HellFall = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cards = useAtomValue(cardsAtom);
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

  return (
    <div>
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
                {activeCard && <HellfallCard data={activeCard}></HellfallCard>}
              </SPContainer>
            </Card.Body>
          </Card>
        )}
      </StyledSidePanel>
      <br />
      <SearchControls />
      <br />
      <SortComponent />
      <ResultCount
        ref={containerRef}
      >{`${resultSet.length} card(s)`}</ResultCount>
      <Container>
        {resultSet.slice(offset, offset + CHUNK_SIZE).map((entry, i) => (
          <HellfallEntry
            onClick={(event: React.MouseEvent<HTMLImageElement>) => {
              if (event.button === 1 || event.metaKey || event.ctrlKey) {
                window.open(
                  "/hellfall/card/" + encodeURIComponent(entry.Name),
                  "_blank"
                );
              } else {
                setActiveCardFromAtom(entry.Name);
              }
            }}
            key={"" + entry.Name + i}
            name={entry.Name}
            url={entry.Image[0]!}
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
