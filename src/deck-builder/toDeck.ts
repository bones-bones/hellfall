import { HCCard } from '../api-types';
import { getBaseObject } from './getBaseObject';
import { getCard } from './getCard';
// TODO: make dfcs work

export const toDeck = (cards: HCCard.Any[]) => {
  const baseDeck = getBaseObject();

  const deckCards = cards.map((entry, i) => {
    (baseDeck.ObjectStates[0].DeckIDs as number[]).push((i + 1) * 100);

    const thing = {
      FaceURL: 'card_faces' in entry && entry.card_faces[0].image ? entry.card_faces[0].image:entry.image,
      BackURL:
        'https://ist8-2.filesor.com/pimpandhost.com/2/6/5/8/265896/i/F/z/D/iFzDJ/00_Back_l.jpg',
      NumWidth: 1,
      NumHeight: 1,
      BackIsHidden: true,
      UniqueBack: false,
      Type: 1,
    };
    (baseDeck.ObjectStates[0].CustomDeck as any)[i + 1 + ''] = thing;

    console.log(entry.name);

    const mainCard = getCard({
      thing: { [i + 1 + '']: thing },
      name: entry.name,
      id: (i + 1) * 100,
      description: ('card_faces' in entry ? entry.card_faces[0].oracle_text:entry.oracle_text) || entry.name,
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
