import { HCEntry } from "../types";
import { HCCard } from "../../../src/api-types";
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
    const cardsForSet = data.data.filter((entry) => entry.set === set.id);
    //@ts-ignore
    const cards = cardsForSet.map(toCard);

    const tokensForCube = tokens.data.filter(
      (tokenEntry) =>
        //@ts-ignore
        !!data.data.find((card) => {
          return tokenEntry.all_parts?.map(part=>part.name).includes(
            card.name
          );
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

// <card>
// <name>Treasure1</name>
// <set picURL="https://lh3.googleusercontent.com/d/1XiGumHRh-DBAGSTBcmO--QGJ_um72uZ7">HLCT4</set>
// <type>Artifact</type>
// <reverse-related>Big Money</reverse-related>
// <reverse-related>Constantinople</reverse-related>
// <reverse-related>Devil Enriches</reverse-related>
// <reverse-related>Item Block</reverse-related>
// <reverse-related> One with Everything</reverse-related>
// <reverse-related count="10">Revelin' Rich</reverse-related>
// <reverse-related>Traffic Court</reverse-related>
// <reverse-related>Vhat, Sponsored Champion</reverse-related>
// </card>

const tokenToCard = (token: HCCard.AnySingleFaced, set: string) => {
  const cCard: CockCard = {
    card: {
      name: {
        "#text": token.name,
      },
      set: { "@rarity": "common", "@picURL": token.image!, "#text": set + "" },
      type: {
        "#text": token.type_line,
      },

      ...(token.power &&
        token.toughness && {
        pt: { "#text": `${token.power}/${token.toughness}` },
      }),
      cmc: { "#text": "" },
      color: { "#text": "" },
      manacost: { "#text": "" },
      text: { "#text": "" },
      "reverse-related": token.all_parts?.map(part=>part.name)
        .map((entry) => ({ "#text": entry })),
    },
  };
  return cCard;
};

const toCard = (card: HCCard.Any) => {
  const front = 'card_faces' in card ? card.card_faces[0] : card;
  //   // @ts-ignore
  // const { data } = await import('../data/Hellscube-Database.json');
  // return (data as HCCard.Any[]).map(card => ({
  //   ...card,
  //   toFaces(): HCCardFace.MultiFaced[] | [HCCard.AnySingleFaced] {
  //     return 'card_faces' in this ? this.card_faces : [this];
  //   },
  // }));

  const cCard: CockCard = {
    card: {
      name: { "#text": card.name },
      set: { "@rarity": "common", "@picURL": card.image!, "#text": card.set },
      color: {
        "#text": front.colors.filter(e=>e!='C').join(""),
      },
      manacost: { "#text": front.mana_cost.replace(/[{}]/g, "") },
      cmc: { "#text": card.cmc.toString() },
      type: {
        "#text": front.type_line,
      },
      ...(front.types?.includes("Creature") && {
        pt: { "#text": `${front.power}/${front.toughness}` },
      }),
      text: {
        "#text": ('card_faces' in card? card.card_faces: [card]).map(e=>e.oracle_text).filter(Boolean)
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
    "reverse-related"?: { "#text": string }[];
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
