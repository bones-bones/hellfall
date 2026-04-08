// note: this implementation maintains links and references for all cards except "3" (Id: 819) and "1984" (Id: 5353)
import { useAtom, useAtomValue } from 'jotai';
import { cardsAtom } from './atoms/cardsAtom';
// import { textEquals } from './useSearchResults';
import { textEquals } from '@hellfall/shared/utils/textHandling';

export const useNameToId = (name: string): string | undefined => {
  const cards = useAtomValue(cardsAtom);
  const movedIds: Record<string, string> = {
    '219': '6727',
    '219b': '6728',
    '1121': '6729',
    '1121b': '6730',
    '1121c': '6731',
    '1121d': '6732',
    '1121e': '6733',
    '2035': '6734',
    '2035b': '6735',
  };
  if (name in movedIds) {
    return movedIds[name];
  }
  const filteredCards = cards.filter(e => e.set != 'C');
  if (name == 'random' && filteredCards.length > 0) {
    const theId = filteredCards[Math.floor(Math.random() * filteredCards.length)].id;
    return theId;
  }
  return (
    cards.find(card => textEquals(card.id, name))?.id ??
    cards.find(card => textEquals(card.name, name))?.id ??
    cards.find(card => 'card_faces' in card && textEquals(card.card_faces[0].name, name))?.id ??
    cards.find(
      card => 'card_faces' in card && card.card_faces.some(face => textEquals(face.name, name))
    )?.id
  );
};
export const useIsId = (id: string): boolean => {
  const cards = useAtomValue(cardsAtom);
  return !!cards.find(card => card.id == id);
};
