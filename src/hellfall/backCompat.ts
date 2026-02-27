// note: this implementation maintains links and references for all cards except "3" (Id: 819) and "1984" (Id: 5353)
import { useAtom, useAtomValue } from 'jotai';
import { cardsAtom } from './cardsAtom';

export const useNameToId = (name: string): string | undefined => {
  const cards = useAtomValue(cardsAtom);
  const filteredCards = cards.filter(e => e.set != 'C');
  if (name == 'random' && filteredCards.length > 0) {
    const theId = filteredCards[Math.floor(Math.random() * filteredCards.length)].id;
    return theId;
  }
  return cards.find(card => card.name === name)?.id;
};
export const useIsNonTokenName = (name: string): boolean => {
  const cards = useAtomValue(cardsAtom);
  const cardNames = cards.filter(e => !e.isActualToken).map(e => e.name);
  return cardNames.includes(name);
};
