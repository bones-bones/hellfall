import styled from "@emotion/styled";
import { HCEntry } from "../types";
import { useState } from "react";

export const DeckConstruction = ({ cards }: { cards: HCEntry[] }) => {
  const [localCards, setLocalCards] = useState([...cards]);
  const [deck, setDeck] = useState<HCEntry[]>([]);
  const draftedCmcColumns = localCards.reduce<Record<number, HCEntry[]>>(
    (curr, next) => {
      curr[next.CMC] = curr[next.CMC] ? [...curr[next.CMC], next] : [next];
      return curr;
    },
    []
  );

  const deckCmcColumns = deck.reduce<Record<number, HCEntry[]>>(
    (curr, next) => {
      curr[next.CMC] = curr[next.CMC] ? [...curr[next.CMC], next] : [next];
      return curr;
    },
    []
  );

  return (
    <>
      <h3>drafted</h3>
      <DraftedCardsContainer>
        {Object.entries(draftedCmcColumns).map((entry) => {
          return (
            <DeckColumn key={entry[0]}>
              <h5>{entry[0]}</h5>
              <div>
                {entry[1].map((entry, i) => {
                  return (
                    <CardContainer key={entry.Name + i}>
                      <Card
                        width="210px"
                        title={entry.Name}
                        key={entry.Name + i}
                        src={entry.Image}
                        crossOrigin="anonymous"
                        onClick={() => {
                          setLocalCards(
                            localCards.filter(
                              (localEntry) => localEntry.Name !== entry.Name
                            )
                          );
                          setDeck([entry, ...deck]);
                        }}
                      />
                    </CardContainer>
                  );
                })}
              </div>
            </DeckColumn>
          );
        })}
      </DraftedCardsContainer>
      <h3>deck ({deck.length} cards)</h3>
      <DeckContainer>
        {Object.entries(deckCmcColumns).map(([cmc, cmcCards]) => {
          return (
            <DeckColumn key={cmc}>
              <h5>{cmc}</h5>
              <div>
                {cmcCards.map((entry, i) => {
                  return (
                    <CardContainer key={entry.Name + i}>
                      <Card
                        width="210px"
                        title={entry.Name}
                        key={entry.Name + i}
                        src={entry.Image}
                        crossOrigin="anonymous"
                        onClick={() => {
                          setDeck(
                            deck.filter(
                              (localEntry) => localEntry.Name !== entry.Name
                            )
                          );
                          setLocalCards([entry, ...localCards]);
                        }}
                      />
                    </CardContainer>
                  );
                })}
              </div>
            </DeckColumn>
          );
        })}
      </DeckContainer>
      <div>{deck.map((e) => e.Name).join("\n")}</div>
    </>
  );
};

const DraftedCardsContainer = styled.div({
  display: "flex",
  overflowY: "hidden",
});
const DeckContainer = styled.div({ display: "flex" });

const DeckColumn = styled.div();

const Card = styled.img({ width: "220px" });

const CardContainer = styled.div({
  height: "40px",
  ":hover": { width: "220px", zIndex: 2, height: "auto" },
});
