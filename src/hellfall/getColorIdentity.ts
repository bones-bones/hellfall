import { HCEntry } from "../types";

export const getColorIdentity = (card: HCEntry) => {
  const colorIdentity = new Set<string>();
  const obviousColors = card["Color(s)"].split(";");
  obviousColors
    .filter((entry) => entry !== "")
    .forEach((entry) => colorIdentity.add(entry));

  card["Text Box"].forEach((entry) => {
    const minusReminderText = entry.replaceAll(/\(.*?\)/g, "");
    const icons = minusReminderText.match(/\{.\}/g);
    icons?.forEach((icon) => {
      const colorIcon = manaSymbolColorMatching[icon];
      if (colorIcon) {
        colorIdentity.add(colorIcon);
      }
    });
  });

  card["Subtype(s)"].forEach((entry) => {
    const splitSubtypes = entry.split(";");
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
  "{W}": "White",
  "{B}": "Black",
  "{U}": "Blue",
  "{R}": "Red",
  "{G}": "Green",
  "{P}": "Purple",
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
