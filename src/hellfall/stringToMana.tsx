import styled from "@emotion/styled";
import { colorToSvgMapping } from "./colorToSvgMapping";
import { MANA_REGEX } from "./constants";

export const stringToMana = (text: string) => {
  return text
    .split(MANA_REGEX)
    .filter((e) => e !== "")
    .map((entry) => {
      if (entry.startsWith("{") && entry.endsWith("}")) {
        const icon = colorToSvgMapping(entry.replaceAll(/[{}]/g, ""));
        return icon ? (
          <ManaContainer>
            <ManaSymbol src={icon} />
          </ManaContainer>
        ) : (
          entry
        );
      }
      return entry;
    });
};

const ManaSymbol = styled("img")({ height: "16px" });
const ManaContainer = styled("div")({
  display: "inline-flex",
  height: "1.75rem",
  verticalAlign: "-webkit-baseline-middle",
});
