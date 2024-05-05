import fs from "fs";

import { Token, TokenForImport } from "./types";
// import { downloadImage } from "./downloadImage";
import { tokenToCard } from "./tokenToCard";
import { fetchTokens } from "./fetchTokens";
import { fetchDatabase } from "./fetchdatabase";

const typeSet = new Set<string>();
const creatorSet = new Set<string>();
const tagSet = new Set<string>();

const main = async () => {
  const { data } = { data: await fetchDatabase() };

  const tokens = await fetchTokens();
  const tokensWithBetterName = tokens.map((e) => {
    const {
      //@ts-ignore
      ["Name (number tokens with the same name, if only one token has that name still add a 1.)"]:
        Name,
      ...rest
    } = e;
    return { Name, ...rest };
  });
  const tokenMap = (tokensWithBetterName as TokenForImport[]).reduce<
    Record<string, Token[]>
  >((current, entry) => {
    (entry["Related Cards (Read Comment)"] || "")
      .split(";")
      .forEach((cardEntry) => {
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

  data.forEach((entry) => {
    [
      ...(entry["Supertype(s)"] || []),
      ...(entry["Card Type(s)"] || []),
      ...(entry["Subtype(s)"] || []),
    ].forEach((typeEntry) => {
      if (typeEntry) {
        const splitTypes = typeEntry.split(";");
        splitTypes.forEach((splitEntry) => {
          typeSet.add(splitEntry);
        });
      }
    });

    creatorSet.add(entry.Creator);
    if (entry.Tags && entry.Tags !== "") {
      entry.Tags.split(";").forEach((e) => tagSet.add(e));
    }

    if (tokenMap[entry.Name]) {
      // Debug unused tokens
      // (tokenMap[entry.Name] as any).used = true;

      entry.tokens = tokenMap[entry.Name];
    }
  });

  const types = Array.from(typeSet);
  const creators = Array.from(creatorSet);
  const tags = Array.from(tagSet);

  fs.writeFileSync(
    "./src/data/types.json",
    JSON.stringify(
      {
        data: types.sort((a, b) => {
          if (a > b) {
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
    "./src/data/tokens.json",
    JSON.stringify(
      {
        data: tokensWithBetterName.sort((a, b) => {
          if (a > b) {
            return -1;
          }
          return 1;
        }),
      },
      null,
      "\t"
    )
  );
  fs.writeFileSync(
    "./src/data/tags.json",
    JSON.stringify(
      {
        data: tags.sort((a, b) => {
          if (a > b) {
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
        data: data
          //@ts-ignore
          .concat({ data: tokensWithBetterName }.data.map(tokenToCard)),
      },
      null,
      "\t"
    )
  );
};

main();
