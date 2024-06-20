import { useAtomValue } from "jotai";
import { cardsAtom } from "../hellfall/cardsAtom";
import { HCEntry } from "../types";
import styled from "@emotion/styled";

export const Breakdown = () => {
  const cards = useAtomValue(cardsAtom).filter((e) => e.Set === "HC6");

  const sorted = cards.reduce<Record<string, HCEntry[]>>((curr, next) => {
    if (curr[next["Color(s)"] || "undefined"]) {
      curr[next["Color(s)"] || "undefined"].push(next);
    } else {
      curr[next["Color(s)"] || "undefined"] = [next];
    }

    return curr;
  }, {});

  const canBeCommander = cards
    .filter(
      (e) =>
        (e["Supertype(s)"]?.includes("Legendary") &&
          e["Card Type(s)"].includes("Creature")) ||
        e["Text Box"]?.includes("can be your commander")
    )
    .reduce<Record<string, HCEntry[]>>(
      (curr, next) => {
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

      <ColorTracker cards={sorted} color={"White"} />
      <ColorTracker cards={sorted} color={"Black"} />
      <ColorTracker cards={sorted} color={"Blue"} />
      <ColorTracker cards={sorted} color={"Red"} />
      <ColorTracker cards={sorted} color={"Green"} />

      <h2>Commanders (not ready)</h2>
      {Object.entries(canBeCommander)
        .sort((a, b) => {
          if (a[0].split(";").length > b[0].split(";").length) {
            return 1;
          }
          return -1;
        })
        .map(([key, cards]) => {
          return <div key={key}>{`${key}: ${cards.length}`}</div>;
        })}
    </>
  );
};
const CardColumn = styled.div({ display: "flex", flexDirection: "column" });
const CMCColumn = styled.div({ width: "14vw" });
const Container = styled.div({ display: "flex" });
const CardEntry = styled.div({ paddingTop: "10px" });

const ColorTracker = ({
  cards,
  color,
}: {
  cards: Record<string, HCEntry[]>;
  color: string;
}) => {
  return (
    <div style={{ border: `2px solid ${color}` }}>
      <h2>
        {color} ({cards[color].length})
      </h2>
      <h3>
        Creatures (
        {
          cards[color].filter((e) => e["Card Type(s)"].includes("Creature"))
            .length
        }
        )
      </h3>
      <Container>
        {new Array(7).fill(1).map((_, index) => {
          const uhh = cards[color]
            .filter((e) => e["Card Type(s)"].includes("Creature"))
            .filter(
              (entry) =>
                entry.CMC === index + 1 || (index + 1 == 7 && entry.CMC >= 7)
            );
          return (
            <CMCColumn key={index}>
              <h4>
                {index + 1}
                {index + 1 == 7 ? "+" : ""} ({uhh.length})
              </h4>
              <CardColumn>
                {uhh.map((e) => (
                  <CardEntry key={e.Name}>{e.Name}</CardEntry>
                ))}
              </CardColumn>
            </CMCColumn>
          );
        })}
      </Container>
      <h3>
        Non-creature (
        {
          cards[color].filter((e) => !e["Card Type(s)"].includes("Creature"))
            .length
        }
        )
      </h3>
      <Container>
        {new Array(7).fill(1).map((_, index) => {
          const uhh2 = cards[color]
            .filter((e) => !e["Card Type(s)"].includes("Creature"))
            .filter(
              (entry) =>
                entry.CMC === index + 1 || (index + 1 == 7 && entry.CMC >= 7)
            );
          return (
            <CMCColumn key={index}>
              <h4>
                {index + 1}
                {index + 1 == 7 ? "+" : ""} ({uhh2.length})
              </h4>
              <CardColumn>
                {uhh2.map((e) => (
                  <CardEntry key={e.Name}>{e.Name}</CardEntry>
                ))}
              </CardColumn>
            </CMCColumn>
          );
        })}
      </Container>
    </div>
  );
};
