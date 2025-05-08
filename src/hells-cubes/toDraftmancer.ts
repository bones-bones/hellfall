// https://draftmancer.com/cubeformat.html#cube
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
  const componentCards = cards.filter((e) => {
    if (e.Name.includes("Larry")) {
      console.log(e);
    }
    return Boolean(e["Component of"]);
  });
  console.log(componentCards);

  const componentCardsAsDraftmancer = componentCards.map(getDraftMancerCard);

  const noComponentCards = cards.filter((e) => e["Component of"] === "");

  if (set !== "HC6") {
    const cardsToWrite = noComponentCards.map(getDraftMancerCard);

    cardsToWrite.forEach((dmCard) => {
      const cardsThatBelongToThis = componentCards.filter((e) =>
        e["Component of"]?.includes(dmCard.name)
      );

      if (cardsThatBelongToThis.length > 0) {
        const matchingDmCards = componentCardsAsDraftmancer.filter((e) =>
          cardsThatBelongToThis.find((secondE) => secondE.Name === e.name)
        );
        dmCard.related_cards = matchingDmCards.map((e) => e.name);
        dmCard.draft_effects = [
          //@ts-ignore
          ...(dmCard.draft_effects || []),
          //@ts-ignore
          { type: "AddCards", cards: matchingDmCards.map((e) => e.name) },
        ];
      }
    });

    const formatted = `[Settings]
{
    "colorBalance": false,
    "cardBack": "https://lh3.googleusercontent.com/d/1p6BQ9NAWpVMY8vPDJjhU2kvC98-P9joA"
}
[CustomCards]\n${JSON.stringify(
      [...cardsToWrite, ...componentCardsAsDraftmancer],
      null,
      "\t"
    )}\n[MainSlot]\n${cardsToWrite
      .map((e) => {
        return `1 ${e.name}`;
      })
      .join("\n")}`;

    return formatted;
  } else {
    const cardsToWrite = noComponentCards.filter(canBeACommander);

    const commanderCardsToWrite = cardsToWrite.map(getDraftMancerCard);
    console.log(componentCards);
    commanderCardsToWrite.forEach((dmCard) => {
      const cardsThatBelongToThis = componentCards.filter((e) =>
        e["Component of"]?.includes(dmCard.name)
      );

      if (cardsThatBelongToThis.length > 0) {
        const matchingDmCards = componentCardsAsDraftmancer.filter((e) =>
          cardsThatBelongToThis.find((secondE) => secondE.Name === e.name)
        );
        dmCard.related_cards = matchingDmCards.map((e) => e.name);
        dmCard.draft_effects = [
          //@ts-ignore
          ...(dmCard.draft_effects || []),
          //@ts-ignore
          { type: "AddCards", cards: matchingDmCards.map((e) => e.name) },
        ];
      }
    });

    const canNotBeCommander = noComponentCards.filter(
      (entry) => !canBeACommander(entry)
    );

    const otherCardsToWrite = canNotBeCommander.map(getDraftMancerCard);

    otherCardsToWrite.forEach((dmCard) => {
      const cardsThatBelongToThis = componentCards.filter((e) =>
        e["Component of"]?.includes(dmCard.name)
      );

      if (cardsThatBelongToThis.length > 0) {
        const matchingDmCards = componentCardsAsDraftmancer.filter((e) =>
          cardsThatBelongToThis.find((secondE) => secondE.Name === e.name)
        );
        dmCard.related_cards = matchingDmCards.map((e) => e.id);
        dmCard.draft_effects = [
          //@ts-ignore
          ...(dmCard.draft_effects || []),
          //@ts-ignore
          { type: "AddCards", cards: matchingDmCards.map((e) => e.name) },
        ];
      }
    });

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
      [
        ...commanderCardsToWrite,
        ...otherCardsToWrite,
        ...componentCardsAsDraftmancer,
      ],
      null,
      "\t"
    )}\n[CommanderSlot(2)]\n${commanderCardsToWrite
      .filter((e) => e.name != "Prismatic Pardner")
      .map((e) => `1 ${e.name}`)
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
      .replace(/\{Pickle\}/g, "{G}") // Pickle Krrik
      .replace(/\{U\/BB\}/g, "{U/B}")
      .replace("{Brown}", "{1}")
      .replace("{Piss}", "{1}")
      .replace(/\{Blood\}/g, "{0}")
      .replace("{2/Brown}", "{2}") // Blonk
      .replace("Sacrifice a creature:", "{0}")
      .replace("{Discard your hand/RR}", "{R}{R}") // Dumpstergoyf
      .replace("{BB/P}", "{B}") //THE SKELETON
      .replace("{UU/P}", "U")
      .replace("{2/Piss}", "{2}"),

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
    oracle_text: card["Text Box"]?.filter(Boolean).join("\n"),

    printed_names: {
      en: card.Name.replace(" :]", ""), // Six Flags
    },
    image_uris: { en: card.Image[1] || card.Image[0]! },
    is_custom: true,
    ...getDraftEffects(card),
    ...(card.Image[2] &&
      !card.Image[3] && {
        back: {
          name: card.Name.split(" // ")[1] || "",
          image_uris: { en: card.Image[2]! },
          type: `${card["Supertype(s)"]?.[1]?.replace(/;/g, " ")} ${card[
            "Card Type(s)"
          ]?.[1]?.replace(/;/g, " ")}`.trim(),
        },
      }),
  };
  return cardToReturn;
};

const getDraftEffects = (card: HCEntry) => {
  const specificCard = cardSpecificControl(card);
  if (specificCard) {
    return { draft_effects: specificCard };
  }
  if (shouldReveal(card)) {
    return { draft_effects: ["FaceUp"] };
  }
};

const cardSpecificControl = (card: HCEntry) => {
  switch (card.Name) {
    case "Cheatyspace": {
      return ["FaceUp", "CogworkLibrarian"];
    }
    case "Moe, Pursuant of Wisdom": {
      return [
        "FaceUp",
        {
          type: "AddCards",
          cards: ["Larry, Pure of Action", "Curly, Focused of Mind"],
        },
      ];
    }
    case "Draft Horse": {
      return ["FaceUp", "CogworkGrinder"];
    }
  }
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
