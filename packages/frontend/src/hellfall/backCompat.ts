import { useAtom, useAtomValue } from 'jotai';
import { cardsAtom } from './atoms/cardsAtom.ts';
import { textEquals } from '@hellfall/shared/utils/textHandling.ts';
import { HCCard } from '@hellfall/shared/types';

export const useNameToId = (name: string, inCards?: HCCard.Any[]): string | undefined => {
  const cards = inCards || useAtomValue(cardsAtom);
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
  const filteredCards = cards.filter(e => e.set != 'NRM');
  if (name == 'random' && filteredCards.length > 0) {
    const theId = filteredCards[Math.floor(Math.random() * filteredCards.length)].id;
    return theId;
  }
  return (
    cards.find(card => textEquals(card.id, name))?.id ??
    cards.find(card => textEquals(card.name, name))?.id ??
    cards.find(card => card.flavor_name && textEquals(card.flavor_name, name))?.id ??
    cards.find(card => 'card_faces' in card && textEquals(card.card_faces[0].name, name))?.id ??
    cards.find(
      card => 'card_faces' in card && card.card_faces.some(face => textEquals(face.name, name))
    )?.id ??
    cards.find(
      card =>
        'card_faces' in card &&
        card.card_faces.some(face => face.flavor_name && textEquals(face.flavor_name, name))
    )?.id
  );
};
export const useIsId = (id: string): boolean => {
  const cards = useAtomValue(cardsAtom);
  return !!cards.find(card => card.id == id);
};
