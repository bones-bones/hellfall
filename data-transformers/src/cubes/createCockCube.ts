import { HCEntry } from "../types";
import data from "../../../src/data/Hellscube-Database.json";
import fs from "fs";
import xmlbuilder from "xmlbuilder";

export const createCockCube = () => {
  for (const set of [
    { id: "HLC", name: "Hellscube" },
    { id: "HC2", name: "Hellscube 2" },
    { id: "HC3", name: "Hellscube 3" },
    { id: "HC4", name: "Hellscube 4" },
  ]) {
    console.log("!");
    const cardsForSet = data.data.filter((entry) => entry.Set === set.id);
    //@ts-ignore
    const cards = cardsForSet.map(toCard);

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
            cards,
          },
        },
        { encoding: "utf-8" }
      )
      .end({ pretty: true });
    fs.writeFileSync(`./${set.id}xml.xml`, output);
  }
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
  return {
    card: {
      name: { "#text": Name },
      set: { "@rarity": "common", "@picURL": Image, "#text": Set },
      color: {
        "#text": Color.replace("Blue", "U")
          .replace("Red", "R")
          .replace("Green", "G")
          .replace("Black", "B")
          .replace("White", "W")
          .replace("Purple", "P")
          .replace(/;/g, ""),
      },
      manacost: { "#text": Cost[0].replace(/[{}]/g, "") },
      cmc: { "#text": CMC },
      type: {
        "#text": [
          (Super[0] ?? "").replace(/;/g, " "),
          [
            (Types[0] ?? "").replace(/;/g, " "),
            (Sub[0] ?? "").replace(/;/g, " "),
          ]
            .filter(Boolean)
            .join(" — "),
        ]
          .filter(Boolean)
          .join(" "),
      },
      ...(Types[0].includes("Creature") && {
        pt: { "#text": `${power[0]}/${toughness[0]}` },
      }),
      text: {
        "#text": Text.filter(Boolean)
          .join("\n//\n")
          .replace(/\\n/g, "\n")
          .replace(/[{}]/g, ""),
      },
    },
  };

  //   `\t<card>
  //             <name>${Name}</name>
  //             <set rarity="common"
  //             picURL="${Image}">${Set}</set>
  //             <color>${Color}</color>
  //             <manacost>${Cost[0]}</manacost>
  //             <cmc>${CMC}</cmc>
  //             <type>${(Types[0] ?? "").replace(/;/g, " ")}</type>
  //             <text>${Text.filter(Boolean)
  //               .join("\n//\n")
  //               .replace(/\\n/g, "\n")}</text>
  //     </card>`;
};
createCockCube();
