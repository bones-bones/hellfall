import { HCEntry } from "../types";

export const getColorIdentity = (card: HCEntry) => {
  const colorIdentity = new Set<string | string[]>();

  // TODO: Account for dumpstergoyf
  card.Cost?.forEach((entry) => {
    const icons = (entry || "").match(/\{.+?\}/g);

    icons?.forEach((icon) => {
      const iconArray = icon.replaceAll(/[{}]/g, "").split("/");
      const nResp = iconArray.map((e) => manaSymbolColorMatching[e[0]]); // TODO: the first char cause skeleton

      if (nResp) {
        //@ts-ignore
        colorIdentity.add(nResp);
      }
    });
  });

  card["Text Box"]?.forEach((entry) => {
    const minusReminderText = (entry || "").replaceAll(/\(.*?\)/g, "");
    const icons = minusReminderText.match(/\{.+?\}/g);
    // if (card.Name.includes("The Big Ban")) {
    //   console.log(icons);
    // }
    icons?.forEach((icon) => {
      const iconArray = icon.replaceAll(/[{}]/g, "").split("/");
      const nResp = iconArray.map((e) => manaSymbolColorMatching[e[0]]); // TODO: the first char cause skeleton

      if (nResp) {
        //@ts-ignore
        colorIdentity.add(nResp);
      }
    });
  });

  card["Subtype(s)"]?.forEach((entry) => {
    const splitSubtypes = (entry || "").split(";");
    splitSubtypes.forEach((typeEntry) => {
      const mappedColor = landToColorMapping[typeEntry];
      if (mappedColor) {
        colorIdentity.add(mappedColor);
      }
    });
  });

  return Array.from(colorIdentity);
};

const manaSymbolColorMatching: Record<
  string,
  | "White"
  | "Black"
  | "Red"
  | "Blue"
  | "Green"
  | "Piss"
  | "Pickle"
  | undefined
  | "Purple"
> = {
  W: "White",
  B: "Black",
  U: "Blue",
  R: "Red",
  G: "Green",
  P: "Purple",
  Piss: "Piss",
};

const landToColorMapping: Record<
  string,
  | "White"
  | "Black"
  | "Red"
  | "Blue"
  | "Green"
  | "Piss"
  | "Pickle"
  | undefined
  | "Purple"
> = {
  Plains: "White",
  Swamp: "Black",
  Island: "Blue",
  IslandGX: "Blue", // TODO: I have sinned
  Mountain: "Red",
  Forest: "Green",
  Nebula: "Purple",
};
//"{3/P}{U}",
