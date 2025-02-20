import { canBeACommander } from "../hellfall/canBeACommander";
import { HCEntry } from "../types";
import { DraftmancerCard } from "./types";

export const toDraftmancerCube = ({
  set,
  cards,
}: {
  set: string;
  cards: HCEntry[];
}) => {
  if (set !== "HC6") {
    const cardsToWrite: DraftmancerCard[] = cards.map(getDraftMancerCard);

    const formatted = `[Settings]
{
    "colorBalance": false,
    "cardBack": "https://lh3.googleusercontent.com/d/1p6BQ9NAWpVMY8vPDJjhU2kvC98-P9joA"
}
[CustomCards]\n${JSON.stringify(
      cardsToWrite,
      null,
      "\t"
    )}\n[MainSlot]\n${cardsToWrite
      .map((e) => {
        return `1 ${e.name}`;
      })
      .join("\n")}`;

    return formatted;
  } else {
    const filteredToCommander = cards.filter(canBeACommander);

    const commanderCardsToWrite = filteredToCommander.map(getDraftMancerCard);

    const canNotBeCommander = cards.filter((entry) => {
      return !canBeACommander(entry);
    });

    const otherCardsToWrite = canNotBeCommander.map(getDraftMancerCard);

    const formatted = `[Settings]
{
    "colorBalance": false,
    "cardBack": "https://lh3.googleusercontent.com/d/1p6BQ9NAWpVMY8vPDJjhU2kvC98-P9joA",
    "boosterSettings": [
        {
            "picks": 2
        },
        {
            "picks": 2
        },
        {
            "picks": 2
        }
    ]
}
[CustomCards]\n${JSON.stringify(
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

    return formatted;
  }
};

const getDraftMancerCard = (card: HCEntry) => {
  const cardToReturn: DraftmancerCard = {
    id: card.Name.replace(" :]", "") + "_custom_",
    oracle_id: card.Name.replace(" :]", "").trim(),
    name: card.Name.replace(" :]", "").trim(),
    mana_cost: (card.Cost?.[0] || "")
      .replace(/\{\?\}/g, "{0}")
      .replace("?", "{0}")
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
    subtypes: card["Subtype(s)"]?.[0]!.split(";").filter((e) => e != "") || [],
    rating: 0,
    in_booster: true,
    printed_names: { en: card.Name.replace(" :]", "") },
    image_uris: { en: card.Image[0]! },
    is_custom: true,
    ...(shouldReveal(card) && {
      draft_effects: ["FaceUp"],
    }),
  };
  return cardToReturn;
};

const shouldReveal = (card: HCEntry) => {
  return (
    card["Text Box"]?.[0]?.includes("hen you draft") ||
    card["Text Box"]?.[0]?.includes("raftpartner") ||
    card["Text Box"]?.[0]?.toLowerCase().includes("as you draft")
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
