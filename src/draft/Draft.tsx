import { useEffect, useState } from "react";

import { FormField } from "@workday/canvas-kit-react/form-field";
import { Select } from "@workday/canvas-kit-preview-react/select";
import { useCards } from "../hellfall/useCards";
import { Area } from "./Area";
import { useAtom } from "jotai";
import { draftAtom } from "./draftAtom";

export const Draft = () => {
  const [set, setSet] = useState<"HLC" | "HC2" | "HC3" | "H4" | undefined>(
    undefined
  );

  const [draft, setDraft] = useAtom(draftAtom);

  const cards = useCards();

  useEffect(() => {
    const draft = [];
    if (set) {
      const filtered = cards.filter((e) => e.Set === set);
      const shuffled = filtered.sort(() =>
        Math.random() > Math.random() ? 1 : -1
      );

      for (let i = 0; i < 3; i++) {
        draft[i] = [];
        for (let j = 0; j < 8; j++) {
          // eslint-disable-next-line
          // @ts-ignore
          draft[i][j] = shuffled.splice(0, 15);
        }
      }
      setDraft(draft as any);
    }
  }, [set]);

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
            ]}
          ></Select>
        </FormField>
      )}
      {draft && <Area></Area>}
    </>
  );
};