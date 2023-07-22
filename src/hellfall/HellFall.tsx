import { useEffect, useRef, useState } from "react";
import { HellfallEntry } from "./HellfallEntry";
import { xIcon } from "@workday/canvas-system-icons-web";

import { styled } from "@workday/canvas-kit-react/common";
import {
  SidePanel,
  SidePanelOpenDirection,
} from "@workday/canvas-kit-react/side-panel";
import { PaginationComponent } from "./inputs";
import { HCEntry } from "../types";
import { Heading } from "@workday/canvas-kit-react/text";
import { HFCard } from "./HFCard";
import { Card } from "@workday/canvas-kit-react/card";
import { ToolbarIconButton } from "@workday/canvas-kit-react/button";
import { useAtom } from "jotai";
import { offsetAtom } from "./searchAtoms";
import { useSearchResults } from "./useSearchResults";
import { SearchControls } from "./SearchControls";
import { SortComponent } from "./SortComponent";
import { CHUNK_SIZE } from "./constants";
import { useKeyPress } from "../hooks";

export const HellFall = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const escape = useKeyPress("Escape");
  const [activeCard, setActiveCard] = useState<HCEntry | undefined>();
  useEffect(() => {
    if (escape) {
      setActiveCard(undefined);
    }
  }, [escape]);
  const [offset, setOffset] = useAtom(offsetAtom);
  const resultSet = useSearchResults();
  return (
    <div>
      <StyledHeading size="medium"> {" > it's hellfall"}</StyledHeading>
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
                  onClick={() => setActiveCard(undefined)}
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
              setActiveCard(entry);
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

const StyledHeading = styled(Heading)({
  backgroundColor: "#C690FF",
  borderBottom: "2px solid lightgray",
  marginTop: "0px",
});
