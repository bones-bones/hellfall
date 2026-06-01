import { atom } from 'jotai';
import { HCCard, HCCardFace } from '@hellfall/shared/types';
import { addToJSONToCards, CardMap } from '@hellfall/shared/utils';
import { cardsData } from '@hellfall/shared/data';

export const cardsAtom = atom<Promise<CardMap>>(async () => {
  const { data } = cardsData;
  return new CardMap(data);
});
