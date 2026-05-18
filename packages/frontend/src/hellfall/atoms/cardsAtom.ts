import { atom } from 'jotai';
import { HCCard, HCCardFace } from '@hellfall/shared/types';
import { addToJSONToCards } from '@hellfall/shared/utils';
import cardsData from '@hellfall/shared/data/Hellscube-Database.json';

export const cardsAtom = atom<Promise<HCCard.Any[]>>(async () => {
  const { data } = cardsData as { data: HCCard.Any[] };
  return addToJSONToCards(data);
});
