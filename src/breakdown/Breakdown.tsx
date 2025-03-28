import { useAtom, useAtomValue } from "jotai";
import { cardsAtom } from "../hellfall/cardsAtom";
import { HCEntry } from "../types";
import styled from "@emotion/styled";
import { xIcon } from "@workday/canvas-system-icons-web";

import {
  SidePanel,
  SidePanelOpenDirection,
} from "@workday/canvas-kit-react/side-panel";
import {
  Card,
  TertiaryButton,
  ToolbarIconButton,
} from "@workday/canvas-kit-react";
import { HellfallCard } from "../hellfall/HellfallCard";
import { activeCardAtom } from "../hellfall/searchAtoms";
import { getColorIdentity } from "../hellfall/getColorIdentity";
import { canBeACommander } from "../hellfall/canBeACommander";
export const Breakdown = () => {
  const cards = useAtomValue(cardsAtom).filter((e) => e.Set === "HC7.0");
  const [activeCardFromAtom, setActiveCardFromAtom] = useAtom(activeCardAtom);
  const activeCard = cards.find((entry) => {
    return entry.Name === activeCardFromAtom;
  });

  const sorted = cards.reduce<Record<string, HCEntry[]>>((curr, next) => {
    if (curr[next["Color(s)"] || "undefined"]) {
      curr[next["Color(s)"] || "undefined"].push(next);
    } else {
      curr[next["Color(s)"] || "undefined"] = [next];
    }

    return curr;
  }, {});

  const canBeCommander = cards
    .filter((e) => canBeACommander(e))
    .reduce<Record<string, HCEntry[]>>(
      (curr, next) => {
        const colorSet = Array.from(
          new Set(getColorIdentity(next).flat().filter(Boolean))
        ).sort();
        console.log(colorSet);
        if (curr[next["Color(s)"] || "undefined"]) {
          curr[next["Color(s)"] || "undefined"].push(next);
        } else {
          curr[next["Color(s)"] || "undefined"] = [next];
        }

        return curr;
      },
      {
        Black: [],
        Red: [],
        Blue: [],
        White: [],
        Green: [],
        "White;Blue": [],
        "White;Black": [],
        "White;Red": [],
        "White;Green": [],
        "Blue;Black": [],
        "Blue;Red": [],
        "Blue;Green": [],
        "Black;Red": [],
        "Black;Green": [],
        "Red;Green": [],
        "White;Blue;Black": [],
        "White;Blue;Red": [],
        "White;Blue;Green": [],
        "White;Black;Red": [],
        "White;Black;Green": [],
        "White;Red;Green": [],
      }
    );

  return (
    <>
      {cards.length}
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

      <ColorTracker cards={sorted} color={"White"} />
      <ColorTracker cards={sorted} color={"Black"} />
      <ColorTracker cards={sorted} color={"Blue"} />
      <ColorTracker cards={sorted} color={"Red"} />
      <ColorTracker cards={sorted} color={"Green"} />
      <ColorTracker cards={sorted} color={"Purple"} />
      {/* <h2>Commanders (not ready)</h2>
      {Object.entries(canBeCommander)
        .sort((a, b) => {
          if (a[0].split(";").length > b[0].split(";").length) {
            return 1;
          }
          return -1;
        })
        .map(([key, cards]) => {
          return <div key={key}>{`${key}: ${cards.length}`}</div>;
        })} */}
    </>
  );
};
const CardColumn = styled.div({ display: "flex", flexDirection: "column" });
const CMCColumn = styled.div({ width: "14vw" });
const Container = styled.div({ display: "flex" });
const CardEntry = styled.div(
  ({
    isCreature,
    cardColor,
  }: {
    isCreature: boolean;
    cardColor:
      | "White"
      | "Blue"
      | "Black"
      | "Red"
      | "Green"
      | "Purple"
      | "Colorless"
      | "Multicolor";
  }) => ({
    height: "40px",
    border: "1px solid black",
    overflow: "hidden",
    boxSizing: "border-box",
    backgroundColor: cardColor + (isCreature ? "EE" : "99"),
  })
);

const hexForColor = (
  color:
    | "White"
    | "Blue"
    | "Black"
    | "Red"
    | "Green"
    | "Colorless"
    | "Purple"
    | "Multicolor"
) => {
  switch (color) {
    case "White": {
      return "#f8e7b9";
    }
    case "Blue": {
      return "#0e67ab";
    }
    case "Black": {
      return "#a69f9d";
    }
    case "Red": {
      return "#eba082";
    }
    case "Green": {
      return "#00733d";
    }
    case "Colorless": {
      return "#Colorless";
    }
    case "Purple": {
      return "#702963";
    }
    default:
      return "#c2ae00";
  }
};

const ColorTracker = ({
  cards,
  color,
}: {
  cards: Record<string, HCEntry[]>;
  color: string;
}) => {
  const [_activeCardFromAtom, setActiveCardFromAtom] = useAtom(activeCardAtom);

  return (
    <div style={{ border: `2px solid ${color}` }}>
      <h2>
        {color} ({cards[color].length})
      </h2>

      <Container>
        {new Array(7).fill(1).map((_, index) => {
          const uhh = cards[color]
            .sort((a, b) => {
              if (
                a["Card Type(s)"][0]?.includes("Creature") &&
                b["Card Type(s)"][0]?.includes("Creature")
              ) {
                return a["Name"][0] > b["Name"][0] ? 1 : -1;
              }
              if (
                a["Card Type(s)"][0]?.includes("Creature") &&
                !b["Card Type(s)"][0]?.includes("Creature")
              ) {
                return -1;
              }

              return 1;
            })
            .filter((entry) => {
              if (!entry.CMC && index == 0) {
                return true;
              }

              return (
                entry.CMC === index + 1 || (index + 1 == 7 && entry.CMC >= 7)
              );
            });
          return (
            <CMCColumn key={index}>
              <h4>
                {index + 1 == 1 ? "0-1" : index + 1 == 7 ? "7+" : index + 1} (
                {uhh.length})
              </h4>
              <CardColumn>
                {uhh.map((e) => (
                  <CardEntry
                    key={e.Name}
                    isCreature={Boolean(
                      e["Card Type(s)"][0]?.includes("Creature")
                    )}
                    cardColor={
                      hexForColor(
                        (e["Color(s)"] == undefined
                          ? "Colorless"
                          : e["Color(s)"].split(";").length > 1
                          ? "Multicolor"
                          : e["Color(s)"]) as any
                      ) as any
                    }
                  >
                    <TertiaryButton
                      color="black"
                      onClick={() => {
                        setActiveCardFromAtom(e.Name);
                      }}
                    >
                      {e.Name}
                    </TertiaryButton>
                  </CardEntry>
                ))}
              </CardColumn>
            </CMCColumn>
          );
        })}
      </Container>
    </div>
  );
};
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
