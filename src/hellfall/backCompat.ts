// note: this implementation maintains links and references for all cards except "3" (Id: 819) and "1984" (Id: 5353)
// TODO: add compatibility for subids
import { useAtom, useAtomValue } from 'jotai';
import { cardsAtom } from './atoms/cardsAtom';
import { textEquals } from './useSearchResults';

export const useNameToId = (name: string): string | undefined => {
  const cards = useAtomValue(cardsAtom);
  const filteredCards = cards.filter(e => e.set != 'C');
  if (name == 'random' && filteredCards.length > 0) {
    const theId = filteredCards[Math.floor(Math.random() * filteredCards.length)].id;
    return theId;
  }
  return (
    cards.find(card => textEquals(card.id,name))?.id ??
    cards.find(card => textEquals(card.name,name))?.id ??
    cards.find(card => 'card_faces' in card && textEquals(card.card_faces[0].name, name))?.id ??
    cards.find(card =>'card_faces' in card && card.card_faces.some(face => textEquals(face.name,name)))?.id
  );
};
export const useIsId = (id: string): boolean => {
  const cards = useAtomValue(cardsAtom);
  return !!cards.find(card => card.id == id);
};
