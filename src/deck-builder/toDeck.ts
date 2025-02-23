import { HCEntry } from "../types";
import { getBaseObject } from "./getBaseObject";
import { getCard } from "./getCard";

export const toDeck = (cards: HCEntry[]) => {
  const baseDeck = getBaseObject();

  const deckCards = cards.map((entry, i) => {
    (baseDeck.ObjectStates[0].DeckIDs as number[]).push((i + 1) * 100);

    const thing = {
      FaceURL: entry.Image,
      BackURL:
        "https://ist8-2.filesor.com/pimpandhost.com/2/6/5/8/265896/i/F/z/D/iFzDJ/00_Back_l.jpg",
      NumWidth: 1,
      NumHeight: 1,
      BackIsHidden: true,
      UniqueBack: false,
      Type: 1,
    };
    (baseDeck.ObjectStates[0].CustomDeck as any)[i + 1 + ""] = thing;

    console.log(entry.Name);

    const mainCard = getCard({
      thing: { [i + 1 + ""]: thing },
      name: entry.Name,
      id: (i + 1) * 100,
      description: entry["Text Box"]?.[0] || entry.Name,
    });
    // TODO: don't break lands
    // const sideCount = entry["Card Type(s)"].filter(
    //   (textEntry) => textEntry !== ""
    // ).length;
    // if (sideCount > 1) {
    //   (mainCard as any).States = {};
    //   for (let i = 1; i < sideCount; i++) {
    //     //
    //   }
    // }
    return mainCard;
  });
  (baseDeck.ObjectStates[0].ContainedObjects as any) = deckCards;
  return baseDeck;
};
