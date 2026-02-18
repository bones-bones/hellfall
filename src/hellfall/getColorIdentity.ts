import { HCEntry } from "../types";
import { pipsAtom } from "./pipsAtom";
import { useAtomValue } from "jotai";

export const getColorIdentity = (card: HCEntry) => {
  const colorIdentity = new Set<string[]>();
  const pips = useAtomValue(pipsAtom);
  // TODO: make color indicators work
  // TODO: special cases for Crypticspire Mantis (must be at least 2), Draft Dodger (Canada = Red and White)
  card.Cost?.forEach((entry) => {
    const names = (entry || "")
      .match(/{([^}]+)}/g)
      ?.map((match) => match.slice(1, -1));

    names?.forEach((name) => {
      const pip = pips?.find((e) => e.name === name);
      if (pip && pip?.isMana) {
        colorIdentity.add(pip.colors as string[]);
      } else {
        const mappedColor = manaSymbolColorMatching[name];
        if (mappedColor) {
          colorIdentity.add([mappedColor]);
        }
      }
    });
  });

  card["Text Box"]?.forEach((entry) => {
    const minusReminderText = (entry || "").replaceAll(/\(.*?\)/g, "");
    const names = (minusReminderText || "")
      .match(/{([^}]+)}/g)
      ?.map((match) => match.slice(1, -1));

    names?.forEach((name) => {
      const pip = pips?.find((e) => e.name === name);
      if (pip && pip?.isMana) {
        colorIdentity.add(pip.colors as string[]);
      } else {
        const mappedColor = manaSymbolColorMatching[name];
        if (mappedColor) {
          colorIdentity.add([mappedColor]);
        }
      }
    });
  });

  card["Subtype(s)"]?.forEach((entry) => {
    const splitSubtypes = (entry || "").split(";");
    splitSubtypes.forEach((typeEntry) => {
      const mappedColor = landToColorMapping[typeEntry];
      if (mappedColor) {
        colorIdentity.add([mappedColor]);
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
  | "Purple"
  | "Pickle"
  | "Yellow"
  | "Brown"
  | "Pink"
  | "Teal"
  | "Orange"
> = {
  TEMU: "Orange",
  Stab: "Red",
  Microwave: "Red",
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
