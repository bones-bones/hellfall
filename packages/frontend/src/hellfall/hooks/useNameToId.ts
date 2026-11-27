import { useAtomValue } from 'jotai';
import { cardsAtom } from '../atoms/cardsAtom.ts';

/**
 * Only for use with client-catalog CardRoute redirects.
 * When `canUseServerSearch()`, CardRoute resolves via `/api/cards/hcid/:hcid` instead
 * (do not call these hooks on that path — they read cardsAtom and load the catalog).
 * @param name
 */
export const useNameToHCID = (name: string): string | undefined => {
  const cards = useAtomValue(cardsAtom);
  return (cards.get(name) ?? cards.getFromHCID(name) ?? cards.getFromName(name))?.hcid;
};

export const useIsHCID = (id: string): boolean => {
  const cards = useAtomValue(cardsAtom);
  return cards.hasHCID(id);
};
