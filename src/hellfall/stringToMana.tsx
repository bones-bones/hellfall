import styled from "@emotion/styled";
import { pipsAtom } from "./pipsAtom";
import { useAtomValue } from "jotai";
import { getDefaultStore } from "jotai";
const store = getDefaultStore();
// TODO: make sure TGs render correctly
// TODO: add native svgs for other colors and symbols

export const getPipSrc = (name: string) => {
  const pips = store.get(pipsAtom);
  const icon = pips?.find((e) => e.name === name);
  return icon ? "/pips/" + icon.filename : undefined;
};

export const stringToMana = (text: string) => {
  return text
    .split(/({.*?})/)
    .filter((e) => e !== "")
    .map((entry) => {
      if (entry.startsWith("{") && entry.endsWith("}")) {
        const loc = getPipSrc(entry.slice(1, -1));
        return loc ? (
          <PipContainer>
            <PipSymbol src={loc} />
          </PipContainer>
        ) : (
          entry
        );
      }
      return entry;
    });
};

const PipSymbol = styled("img")({ height: "16px" });
const PipContainer = styled("div")({
  display: "inline-flex",
  height: "1.75rem",
  verticalAlign: "-webkit-baseline-middle",
});
