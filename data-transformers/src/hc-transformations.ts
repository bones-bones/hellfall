import fs from "fs";
import data from "../../src/data/Hellscube-Database.json";
import tokens from "../../src/data/tokens.json";

import { HCEntry, Token, TokenForImport } from "./types";
import { downloadImage } from "./downloadImage";
import { tokenToCard } from "./tokenToCard";

const tokenMap = (tokens.data as TokenForImport[]).reduce<
  Record<string, Token[]>
>((current, entry) => {
  entry["Related Cards (Read Comment)"].split(";").forEach((cardEntry) => {
    if (current[cardEntry.replace(/\*\d*$/, "")]) {
      current[cardEntry.replace(/\*\d*$/, "")].push({
        Name: entry.Name.replace(/(\d*)$/, " $1"),
        Power: entry.Power,
        Toughness: entry.Toughness,
        Type: entry.Type,
        Image: entry.Image,
        FIELD7: entry.FIELD7,
      });
    } else {
      current[cardEntry.replace(/\*\d*$/, "")] = [
        {
          Name: entry.Name.replace(/(\d*)$/, " $1"),
          Power: entry.Power,
          Toughness: entry.Toughness,
          Type: entry.Type,
          Image: entry.Image,
          FIELD7: entry.FIELD7,
        },
      ];
    }
  });
  return current;
}, {});

const typeSet = new Set<string>();
const creatorSet = new Set<string>();

const fileList = fs.readdirSync("./pics");

(data as { data: HCEntry[] }).data
  .filter((entry) => {
    const parts = entry.Image.split(".");

    return !fileList.includes(
      `${entry.Name.replace(/\//g, "|")}.${parts[parts.length - 1]}`
    );
  })
  .forEach(async (entry, i) => {
    const parts = entry.Image.split(".");

    await new Promise<void>((resolve) =>
      setTimeout(() => {
        console.log(
          `${entry.Name.replace(/\//g, "|")}.${parts[parts.length - 1]}`
        );
        resolve();
      }, i * 1000)
    );
    await downloadImage(
      entry.Image,
      `./pics/${entry.Name.replace(/\//g, "|")}.${parts[parts.length - 1]}`
    );

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

    creatorSet.add(entry.Creator);

    if (tokenMap[entry.Name]) {
      // Debug unused tokens
      // (tokenMap[entry.Name] as any).used = true;

      entry.tokens = tokenMap[entry.Name];
    }
  });

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

  creatorSet.add(entry.Creator);

  if (tokenMap[entry.Name]) {
    // Debug unused tokens
    // (tokenMap[entry.Name] as any).used = true;

    entry.tokens = tokenMap[entry.Name];
  }
});

const types = Array.from(typeSet);
const creators = Array.from(creatorSet);

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

fs.writeFileSync(
  "./src/data/creators.json",
  JSON.stringify(
    {
      data: creators.sort((a, b) => {
        if (a.toLowerCase() > b.toLowerCase()) {
          return 1;
        }
        return -1;
      }),
    },
    null,
    "\t"
  )
);

fs.writeFileSync(
  "./src/data/Hellscube-Database.json",
  JSON.stringify(
    {
      data: (data as { data: HCEntry[] }).data
        .concat(tokens.data.map(tokenToCard))
        .sort((a, b) => {
          if (a.Name > b.Name) {
            return 1;
          }
          return -1;
        }),
    },
    null,
    "\t"
  )
);
