import fs from "fs";
import data from "../../src/data/Hellscube-Database.json";
import tokens from "../../src/data/tokens.json";

import { HCEntry, Token, TokenForImport } from "./types";

const tokenMap = (tokens.data as TokenForImport[]).reduce<
  Record<string, Token>
>((current, entry) => {
  entry["Related Cards (Read Comment)"].split(";").forEach((cardEntry) => {
    current[cardEntry.replace(/\*.*$/, "")] = {
      Name: entry.Name.replace(/\d*$/, ""),
      Power: entry.Power,
      Toughness: entry.Toughness,
      Type: entry.Type,
      Image: entry.Image,
      FIELD7: entry.FIELD7,
    };
  });
  return current;
}, {});

const typeSet = new Set<string>();
(data as { data: HCEntry[] }).data.forEach((entry) => {
  [
    ...entry["Supertype(s)"],
    ...entry["Card Type(s)"],
    ...entry["Subtype(s)"],
  ].forEach((typeEntry) => {
    if (typeEntry) {
      const splitTypes = typeEntry.split(";");
      splitTypes.forEach((splitEntry) => {
        typeSet.add(splitEntry);
      });
    }
  });
});

const types = Array.from(typeSet);

fs.writeFileSync(
  "./src/data/types.json",
  JSON.stringify({
    data: types.sort((a, b) => {
      if (a > b) {
        return 1;
      }
      return -1;
    }),
  })
);

const creatorSet = new Set<string>();

(data as { data: HCEntry[] }).data.forEach((entry) => {
  creatorSet.add(entry.Creator);
});

const creators = Array.from(creatorSet);

fs.writeFileSync(
  "./src/data/creators.json",
  JSON.stringify({
    data: creators.sort((a, b) => {
      if (a > b) {
        return 1;
      }
      return -1;
    }),
  })
);
