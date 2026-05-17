import { atom } from 'jotai';
import { HCCard, HCCardFace } from '@hellfall/shared/types';
// @ts-ignore
export const cardsAtom = atom<HCCard.Any[]>(async () => {
  // @ts-ignore
  const { data } = await import('@hellfall/shared/data/Hellscube-Database.json');
  return data as HCCard.Any[];
});
