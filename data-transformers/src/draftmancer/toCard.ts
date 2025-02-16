import fs from "fs";
import { HCEntry } from "../types";
import data from "../../../src/data/Hellscube-Database.json";

const canBeACommander = (card: HCEntry) => {
  return (
    (card["Supertype(s)"]?.[0]?.includes("Legendary") &&
      card["Card Type(s)"][0]?.includes("Creature")) ||
    (card["Text Box"]?.[0]?.includes("can be your commander") &&
      !card["Text Box"]?.[0]?.includes("Irresponsible"))
  );
};

const getDraftmancerCube = () => {
  for (const set of [
    { id: "HLC", name: "Hellscube" },
    { id: "HC2", name: "Hellscube 2" },
    { id: "HC3", name: "Hellscube 3" },
    { id: "HC4", name: "Hellscube 4" },
    { id: "HC6", name: "Hellscube 6" },
  ]) {
    const filteredToSet = (data as { data: HCEntry[] }).data.filter((e) => {
      return e.Set == set.id;
    });

    if (set.id !== "HC6") {
      const cardsToWrite: DraftmancerCard[] =
        filteredToSet.map(getDraftMancerCard);

      const formatted = `[CustomCards]\n${JSON.stringify(
        cardsToWrite,
        null,
        "\t"
      )}\n[MainSlot]\n${cardsToWrite
        .map((e) => {
          return `1 ${e.name}`;
        })
        .join("\n")}`;

      fs.writeFileSync(`./${set.id}Cube.txt`, formatted);
    } else {
      const filteredToCommander = filteredToSet.filter(canBeACommander);

      const commanderCardsToWrite: DraftmancerCard[] =
        filteredToCommander.map(getDraftMancerCard);

      const canNotBeCommander = filteredToSet.filter((entry) => {
        return !canBeACommander(entry);
      });

      const otherCardsToWrite: DraftmancerCard[] =
        canNotBeCommander.map(getDraftMancerCard);

      const formatted = `[CustomCards]\n${JSON.stringify(
        [...commanderCardsToWrite, ...otherCardsToWrite],
        null,
        "\t"
      )}\n[CommanderSlot(2)]\n${commanderCardsToWrite
        .filter((e) => e.name != "Prismatic Pardner")
        .map((e) => {
          return `1 ${e.name}`;
        })
        .join("\n")}\n[OtherSlot(18)]\n${otherCardsToWrite
        .map((e) => {
          return `1 ${e.name}`;
        })
        .join("\n")}`;
      fs.writeFileSync(`./${set.id}Cube.txt`, formatted);
    }
  }
};

type DraftmancerCard = {
  id: string; //"Discount Sol Ring_custom_",
  oracle_id: string; // "Discount Sol Ring",
  name: string; // "Discount Sol Ring",
  mana_cost: string; //"{1}",
  colors: string[]; // [],
  set: string; //"custom",
  collector_number: string; //"",
  rarity: string; //"rare",
  type: string; //"Artifact",
  subtypes: string[];
  rating: number; //0,
  in_booster: boolean; // true,
  printed_names: {
    en: string; //"Discount Sol Ring"
  };
  image_uris: {
    en: string; //"https://lh3.googleusercontent.com/d/1PNd-reLsF8mypuQW9oiLu1N2GDuPCv7B"
  };
  is_custom: boolean; // true
  draft_effects?: string[];
};

const getDraftMancerCard = (card: HCEntry) => {
  const cardToReturn: DraftmancerCard = {
    id: card.Name.replace(" :]", "") + "_custom_",
    oracle_id: card.Name.replace(" :]", "").trim(),
    name: card.Name.replace(" :]", "").trim(),
    mana_cost: (card.Cost?.[0] || "")
      .replace(/\{\?\}/g, "{0}")
      .replace("?", "{0")
      .replace(/\{H\/.\}/g, "")
      .replace(/\{(.)\/(.)(\/(.))+\}/g, "{$1/$2}")
      .replace("{9/3}", "{3}")
      .replace("{-1}", "{0}")
      .replace(/\{.\/(.)\}/g, "{$1}")
      .replace(/\{Pickle\}/g, "{G}")
      .replace(/\{U\/BB\}/g, "{U/B}")
      .replace("{Brown}", "{1}")
      .replace(/\{Blood\}/g, "{0}")
      .replace("{2/Brown}", "{2}")
      .replace("Sacrifice a creature:", "{0}")
      .replace("{Discard your hand/RR}", "{R}{R}")
      .replace("{BB/P}", "{B}"),

    // @ts-ignore
    colors: card["Color(s)"]?.split(";").map(colorToDraftMancerColor),
    set: "custom",
    collector_number: "",
    rarity: "rare",
    type: `${card["Supertype(s)"]?.[0]?.replace(/;/g, " ")} ${card[
      "Card Type(s)"
    ]?.[0]?.replace(/;/g, " ")}`.trim(),
    subtypes: card["Subtype(s)"]?.[0].split(";").filter((e) => e != ""),
    rating: 0,
    in_booster: true,
    printed_names: { en: card.Name.replace(" :]", "") },
    image_uris: { en: card.Image },
    is_custom: true,
    ...(shouldReveal(card) && {
      draft_effects: ["FaceUp"],
    }),
  };
  return cardToReturn;
};

const shouldReveal = (card: HCEntry) => {
  return (
    card["Text Box"]?.[0].includes("hen you draft") ||
    card["Text Box"]?.[0].includes("raftpartner") ||
    card["Text Box"]?.[0].toLowerCase().includes("as you draft")
  );
};

const colorToDraftMancerColor = (color: string) => {
  switch (color) {
    case "Red":
      return "R";
    case "White":
      return "W";
    case "Blue":
      return "U";
    case "Black":
      return "B";
    case "Green":
      return "G";
    default:
      return "";
  }
};
getDraftmancerCube();
