import { HCEntry } from "../types";
import data from "../../../src/data/Hellscube-Database.json";
import tokens from "../../../src/data/tokens.json";
import fs from "fs";
import xmlbuilder from "xmlbuilder";

export const createCockCube = () => {
  for (const set of [
    { id: "HLC", name: "Hellscube" },
    { id: "HC2", name: "Hellscube 2" },
    { id: "HC3", name: "Hellscube 3" },
    { id: "HC4", name: "Hellscube 4" },
    { id: "HC6", name: "Hellscube 6" },
  ]) {
    //@ts-ignore
    const cardsForSet = data.data.filter((entry) => entry.Set === set.id);
    //@ts-ignore
    const cards = cardsForSet.map(toCard);

    const tokensForCube = tokens.data.filter(
      (entry) =>
        //@ts-ignore
        !!data.data.find((card) => {
          //@ts-ignore
          return entry["Related Cards (Read Comment)"].includes(card.Name);
        })
    );
    const combined = cards.concat(
      //@ts-ignore
      tokensForCube.map((e) => tokenToCard(e, set.id))
    );

    const output = xmlbuilder
      .create(
        {
          cockatrice_carddatabase: {
            "@version": "3",
            sets: {
              set: {
                name: { "#text": set.id },
                longname: { "#text": set.name },
                settype: { "#text": "Custom" },
                releasedate: {},
              },
            },
            combined,
          },
        },
        { encoding: "utf-8" }
      )
      .end({ pretty: true });
    fs.writeFileSync(`./${set.id}xml.xml`, output);
  }
};

const tokenToCard = (token: TokenType, set: string) => {
  const cCard: CockCard = {
    card: {
      name: {
        "#text": token.Name,
      },
      set: { "@rarity": "common", "@picURL": token.Image, "#text": set + "" },
      type: {
        "#text": token.Type,
      },
      ...(token.Power &&
        token.Toughness && {
          pt: { "#text": `${token.Power}/${token.Toughness}` },
        }),
      cmc: { "#text": "" },
      color: { "#text": "" },
      manacost: { "#text": "" },
      text: { "#text": "" },
    },
  };
  return cCard;
};

const toCard = ({
  Name,
  Set,
  "Color(s)": Color,
  CMC,
  Cost,
  "Card Type(s)": Types,
  "Supertype(s)": Super,
  "Subtype(s)": Sub,
  "Text Box": Text,
  power,
  toughness,
  Image,
}: HCEntry) => {
  const cCard: CockCard = {
    card: {
      name: { "#text": Name },
      set: { "@rarity": "common", "@picURL": Image, "#text": Set },
      color: {
        "#text": Color?.replace("Blue", "U")
          .replace("Red", "R")
          .replace("Green", "G")
          .replace("Black", "B")
          .replace("White", "W")
          .replace("Purple", "P")
          .replace(/;/g, ""),
      },
      manacost: { "#text": Cost?.[0].replace(/[{}]/g, "") },
      cmc: { "#text": CMC?.toString() },
      type: {
        "#text": [
          (Super?.[0] ?? "").replace(/;/g, " "),
          [
            (Types?.[0] ?? "").replace(/;/g, " "),
            (Sub?.[0] ?? "").replace(/;/g, " "),
          ]
            .filter(Boolean)
            .join(" — "),
        ]
          .filter(Boolean)
          .join(" "),
      },
      ...(Types?.[0].includes("Creature") && {
        pt: { "#text": `${power[0]}/${toughness[0]}` },
      }),
      text: {
        "#text": Text?.filter(Boolean)
          .join("\n//\n")
          .replace(/\\n/g, "\n")
          .replace(/[{}]/g, ""),
      },
    },
  };
  return cCard;
};
createCockCube();

type CockCard = {
  card: {
    name: { "#text": string };
    set: { "@rarity": "common"; "@picURL": string; "#text": string };
    color: {
      "#text": string;
    };
    manacost: { "#text": string };
    cmc: { "#text": string };
    type: {
      "#text": string;
    };

    pt?: { "#text": string };

    text: {
      "#text": string;
    };
  };
};

type TokenType = {
  Name: string;
  Image: string;
  Type: string;
  Power: string;
  Toughness: string;
  "Related Cards (Read Comment)": string;
};
