import { useEffect, useState } from "react";

import { FormField } from "@workday/canvas-kit-react/form-field";
import { Select } from "@workday/canvas-kit-preview-react/select";
import { cardsAtom } from "../hellfall/cardsAtom";
import { Area } from "./Area";
import { useAtom, useAtomValue } from "jotai";
import { deckAtom, draftAtom } from "./draftAtom";
import { DeckConstruction } from "./DeckConstruction";
import { CARDS_PER_PACK } from "./constants";
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import { canBeACommander } from "../hellfall/canBeACommander";

export const Draft = () => {
  const [set, setSet] = useState<
    "HLC" | "HC2" | "HC3" | "HC4" | "HC5" | "HC6" | undefined
  >(undefined);

  const [draft, setDraft] = useAtom(draftAtom);

  const cards = useAtomValue(cardsAtom);

  const deckToBuild = useAtomValue(deckAtom);

  useEffect(() => {
    const draft = [];
    if (set) {
      if (set === "HC6") {
        const filtered = cards.filter(({ Set }) => Set === set);
        const commanders = filtered.filter(canBeACommander);
        const nonManders = filtered.filter((e) => !canBeACommander(e));
        const shuffledManders = commanders.sort(() =>
          Math.random() > Math.random() ? 1 : -1
        );
        const shuffledNonManders = nonManders.sort(() =>
          Math.random() > Math.random() ? 1 : -1
        );

        for (let i = 0; i < 3; i++) {
          draft[i] = [];
          for (let j = 0; j < 8; j++) {
            // eslint-disable-next-line
            // @ts-ignore
            draft[i][j] = shuffledManders.splice(0, 2);
            // @ts-ignore
            draft[i][j] = draft[i][j].concat(shuffledNonManders.splice(0, 18));
          }
        }
        setDraft(draft as any);
      } else {
        const filtered = cards.filter((e) => e.Set === set);
        const shuffled = filtered.sort(() =>
          Math.random() > Math.random() ? 1 : -1
        );

        for (let i = 0; i < 3; i++) {
          draft[i] = [];
          for (let j = 0; j < 8; j++) {
            // eslint-disable-next-line
            // @ts-ignore
            draft[i][j] = shuffled.splice(0, CARDS_PER_PACK);
          }
        }
        setDraft(draft as any);
      }
    }
  }, [set]);

  if (set === "HC5") {
    return (
      <ErrorContainer>
        <ErrorBanner>ERROR</ErrorBanner>
      </ErrorContainer>
    );
  }

  return (
    <>
      <h2>Hellscube draft simulator (the bots are dumb)</h2>
      {cards && !set && (
        <FormField label="Select your set">
          <Select
            value={set}
            onChange={(e) => setSet(e.target.value as any)}
            options={[
              { value: "---", disabled: true },
              { value: "HLC" },
              { value: "HC2" },
              { value: "HC3" },
              { value: "HC4" },
              { value: "HC5" },
              { value: "HC6" },
            ]}
          ></Select>
        </FormField>
      )}
      {deckToBuild.length !== 0 && (
        <DeckConstruction cards={deckToBuild}></DeckConstruction>
      )}
      {draft && deckToBuild.length === 0 && <Area></Area>}
    </>
  );
};
const frames = keyframes({
  "0%": { transform: "translate(0)" },
  "20%": { transform: "translate(-3px, 3px)" },
  "40%": { transform: "translate(-3px, -3px)" },
  "60%": { transform: "translate(3px, 3px)" },
  "80%": { transform: "translate(3px, -3px)" },
  "100%": { transform: "translate(0)" },
});
const ErrorContainer = styled.div({
  display: "flex",
  justifyContent: "center",
});
const ErrorBanner = styled.div({
  color: "red",
  fontSize: "30px",
  fontWeight: "600",
  animation: `${frames} 0.1s linear infinite`,
});
