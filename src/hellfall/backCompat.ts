// note: this implementation maintains links and references for all cards except "3" (Id: 819) and "1984" (Id: 5353)
// TODO: add compatibility for subids
import { useAtom, useAtomValue } from 'jotai';
import { cardsAtom } from './atoms/cardsAtom';

export const useNameToId = (name: string): string | undefined => {
  const cards = useAtomValue(cardsAtom);
  const filteredCards = cards.filter(e => e.set != 'C');
  if (name == 'random' && filteredCards.length > 0) {
    const theId = filteredCards[Math.floor(Math.random() * filteredCards.length)].id;
    return theId;
  }
  return (
    cards.find(card => card.id.toLowerCase() == name.toLowerCase())?.id ??
    cards.find(card => card.name.toLowerCase() == name.toLowerCase())?.id ??
    cards.find(
      card => 'card_faces' in card && card.card_faces[0].name.toLowerCase() == name.toLowerCase()
    )?.id ??
    cards.find(
      card =>
        'card_faces' in card &&
        card.card_faces.some(face => face.name.toLowerCase() == name.toLowerCase())
    )?.id
  );
};
export const useIsId = (id: string): boolean => {
  const cards = useAtomValue(cardsAtom);
  return !!cards.find(card => card.id == id);
};
