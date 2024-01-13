import { useAtom } from "jotai";

import { draftAtom } from "./draftAtom";
import { useState } from "react";
import { HCEntry } from "../types";
import styled from "@emotion/styled";
import { TheDraft } from "./types";

export const Area = () => {
  const [draft, setDraft] = useAtom(draftAtom);

  const [draftedCards, setDraftedCards] = useState<HCEntry[]>([]);

  const activePack = (draftedCards.length % 15) % 8;
  return (
    <>
      {draft && (
        <>
          <h3>
            Pack {4 - draft.length}, Pick {(draftedCards.length % 15) + 1}
          </h3>

          <Container>
            <PackContainer>
              <h4>Pack</h4>
              <div>
                {draft[0][activePack].map((entry, i) => {
                  return (
                    <Card
                      width="200px"
                      title={entry.Name}
                      key={entry.Name + i}
                      src={entry.Image}
                      crossOrigin="anonymous"
                      onClick={() => {
                        setDraftedCards([...draftedCards, entry]);

                        setDraft(
                          (
                            [
                              draft[0].map((packEntry, index) => {
                                if (index === activePack) {
                                  return packEntry.filter(
                                    (packCard) => packCard.Name !== entry.Name
                                  );
                                }
                                const randomPick = Math.floor(
                                  Math.random() * packEntry.length
                                );
                                console.log(randomPick);
                                return packEntry.filter(
                                  (_, i) => i !== randomPick
                                );
                              }),
                              ...draft.slice(1),
                            ] as TheDraft
                          ).filter((draftEntry) => draftEntry[0].length > 0)
                        );
                      }}
                    />
                  );
                })}
              </div>
            </PackContainer>
            <DraftedContainer>
              <h4>drafted</h4>
              <div>
                {draftedCards.map((entry, i) => {
                  return (
                    <CardContainer key={entry.Name + i}>
                      <Card
                        width="210px"
                        title={entry.Name}
                        key={entry.Name + i}
                        src={entry.Image}
                        crossOrigin="anonymous"
                      />
                    </CardContainer>
                  );
                })}
              </div>
            </DraftedContainer>
          </Container>
        </>
      )}
    </>
  );
};

const CardContainer = styled.div({
  height: "40px",
  ":hover": { width: "260px", zIndex: 2, height: "auto" },
});

const Container = styled.div({ display: "flex", flexDirection: "row" });
const DraftedContainer = styled.div({ width: "20vw" });
const PackContainer = styled.div({ width: "80vw" });

const Card = styled.img({ width: "260px" });
