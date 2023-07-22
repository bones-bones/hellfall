import fs from "fs";
import data from "../../src/data/Hellscube-Database.json";
import { HCEntry } from "./types";

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
console.log(types);

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

(data as { data: HCEntry[] }).data.map((entry) => {
  creatorSet.add(entry.Creator);
});

const creators = Array.from(creatorSet);
console.log(types);

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
