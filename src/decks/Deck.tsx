import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { cardsAtom } from "../hellfall/cardsAtom";
import { HCEntry } from "../types";
import styled from "@emotion/styled";
import { HFCard } from "../hellfall/HFCard";
import { CardEntry } from "./types";
import { useParams } from "react-router-dom";
import { allDecks } from "./allDecks";

const activeCardAtom = atom<HCEntry | undefined>(undefined);

export const Deck = () => {
  const { "*": deckName } = useParams();
  const deck = allDecks.find((e) => e.title == deckName)!;
  const cards = useAtomValue(cardsAtom);
  const setActiveCard = useSetAtom(activeCardAtom);
  const resolvedMainDeck = deck.cards.main.map((entry) => {
    return {
      count: entry.count,
      name: entry.name,
      hcEntry: cards.find((e) => e.Name == entry.name),
    };
  }) as RenderEntry[];

  const resolvedSideBoard = deck.cards.sideboard.map((entry) => {
    return {
      count: entry.count,
      name: entry.name,
      hcEntry: cards.find((e) => e.Name == entry.name),
    };
  }) as RenderEntry[];

  const reduddd = resolvedMainDeck.reduce<Record<string, CardEntry[]>>(
    (curr, next) => {
      if (
        next.hcEntry?.["Card Type(s)"][0]?.includes("Land") ||
        !next.hcEntry
      ) {
        curr["Land"] = (curr["Land"] ?? []).concat(next);
      } else if (next.hcEntry?.["Card Type(s)"][0]?.includes("Creature")) {
        curr["Creature"] = (curr["Creature"] ?? []).concat(next);
      } else if (next.hcEntry?.["Card Type(s)"][0]?.includes("Planeswalker")) {
        curr["Planeswalker"] = (curr["Planeswalker"] ?? []).concat(next);
      } else if (next.hcEntry?.["Card Type(s)"][0]?.includes("Instant")) {
        curr["Instant"] = (curr["Instant"] ?? []).concat(next);
      } else if (next.hcEntry?.["Card Type(s)"][0]?.includes("Sorcery")) {
        curr["Sorcery"] = (curr["Sorcery"] ?? []).concat(next);
      } else if (next.hcEntry?.["Card Type(s)"][0]?.includes("Artifact")) {
        curr["Artifact"] = (curr["Artifact"] ?? []).concat(next);
      } else if (next.hcEntry?.["Card Type(s)"][0]?.includes("Enchantment")) {
        curr["Enchantment"] = (curr["Enchantment"] ?? []).concat(next);
      } else if (next.hcEntry?.["Card Type(s)"][0]?.includes("Battle")) {
        curr["Battle"] = (curr["Battle"] ?? []).concat(next);
      } else {
        curr[next.hcEntry["Card Type(s)"][0] || "????"] = (
          curr[next.hcEntry["Card Type(s)"][0] || "????"] ?? []
        ).concat(next);
      }

      return curr;
    },
    {}
  );
  const redudddS = resolvedSideBoard.reduce<Record<string, CardEntry[]>>(
    (curr, next) => {
      if (next.hcEntry?.["Card Type(s)"][0]?.includes("Creature")) {
        curr["Creature"] = (curr["Creature"] ?? []).concat(next);
      } else if (next.hcEntry?.["Card Type(s)"][0]?.includes("Planeswalker")) {
        curr["Planeswalker"] = (curr["Planeswalker"] ?? []).concat(next);
      } else if (next.hcEntry?.["Card Type(s)"][0]?.includes("Instant")) {
        curr["Instant"] = (curr["Instant"] ?? []).concat(next);
      } else if (next.hcEntry?.["Card Type(s)"][0]?.includes("Sorcery")) {
        curr["Sorcery"] = (curr["Sorcery"] ?? []).concat(next);
      } else if (next.hcEntry?.["Card Type(s)"][0]?.includes("Artifact")) {
        curr["Artifact"] = (curr["Artifact"] ?? []).concat(next);
      } else if (next.hcEntry?.["Card Type(s)"][0]?.includes("Enchantment")) {
        curr["Enchantment"] = (curr["Enchantment"] ?? []).concat(next);
      } else if (next.hcEntry?.["Card Type(s)"][0]?.includes("Battle")) {
        curr["Battle"] = (curr["Battle"] ?? []).concat(next);
      } else if (
        next.hcEntry?.["Card Type(s)"][0]?.includes("Land") ||
        !next.hcEntry
      ) {
        curr["Land"] = (curr["Land"] ?? []).concat(next);
      } else {
        curr[next.hcEntry["Card Type(s)"][0] || "????"] = (
          curr[next.hcEntry["Card Type(s)"][0] || "????"] ?? []
        ).concat(next);
      }

      return curr;
    },
    {}
  );

  return (
    <BiggestContainer>
      <BigContainer>
        <h2>{deck.title}</h2>
        <h3>By: {deck.author}</h3>
        <TextContainer>{deck.text}</TextContainer>
        <DeckCon>
          <div>
            <DeckHeading key="main">Maindeck</DeckHeading>
            {Object.entries(reduddd).map(([key, val]) => {
              return (
                <CategorySection
                  setActive={setActiveCard}
                  title={key}
                  key={key}
                  cards={val}
                />
              );
            })}
            <DeckHeading key="side">Sideboard</DeckHeading>
            {Object.entries(redudddS).map(([key, val]) => {
              return (
                <CategorySection
                  setActive={setActiveCard}
                  title={key}
                  key={key}
                  cards={val}
                />
              );
            })}
          </div>
          <CardContainer></CardContainer>
        </DeckCon>
      </BigContainer>
    </BiggestContainer>
  );
};

const DeckHeading = styled.h3({ marginTop: "40px", marginBottom: "0px" });
const BigContainer = styled.div({
  width: "80vw",
  maxWidth: "1600px",
  backgroundColor: "white",
  marginLeft: "10vw",
  marginRight: "10vw",
  height: "100vw",
});
const BiggestContainer = styled.div({
  backgroundColor: "grey",
  display: "flex",
  justifyContent: "center",
  height: "100vw",
});
const TextContainer = styled.div({
  marginLeft: "80px",
  marginRight: "80px",
  whiteSpace: "pre-wrap",
  marginTop: "40px",
});
const CardContainer = () => {
  const [activeCard] = useAtom(activeCardAtom);

  return (
    <>
      {activeCard && (
        <ActiveCardContainer>
          <HFCard data={activeCard}></HFCard>
        </ActiveCardContainer>
      )}
    </>
  );
};

const DeckCon = styled.div({
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  minHeight: "600px",
  paddingLeft: "20px",
});

const ActiveCardContainer = styled.div({
  width: "380px",
  height: "600px",
  overflowY: "scroll",
});
const CategorySection = ({
  cards,
  title,
  setActive,
}: {
  cards: RenderEntry[];
  title: string;
  setActive: (val?: HCEntry) => void;
}) => {
  return (
    <CatCon key={title}>
      <h4>{`${title} (${cards.reduce((curr, next) => {
        return curr + next.count;
      }, 0)})`}</h4>
      <CatSecCon>
        {cards.map((entry) => {
          return (
            <CardLineContainer key={entry.name}>
              <div onMouseOver={() => setActive(entry.hcEntry)}>
                {entry.count}{" "}
                <BoldSpan href={"/hellfall/card/" + entry.hcEntry?.Name}>
                  {entry.name}
                </BoldSpan>
              </div>{" "}
              <div key={entry.name + "cash"}>
                ${Math.floor(Math.random() * 100 * 100) / 100}
              </div>
            </CardLineContainer>
          );
        })}
      </CatSecCon>
    </CatCon>
  );
};
const CatCon = styled.div({
  display: "flex",
  flexDirection: "column",
  width: "100%",
});
const CatSecCon = styled.div({ width: "40vw" });
const BoldSpan = styled.a({
  fontWeight: "bold",
  color: "black",
  ":hover": { textDecoration: "underline" },
  ":visited": { color: "darkgrey" },
});
const CardLineContainer = styled.div({
  display: "flex",
  justifyContent: "space-between",
});

type RenderEntry = { name: string; count: number; hcEntry?: HCEntry };
