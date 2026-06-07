import { atom } from 'jotai';
import { HCCard } from '@hellfall/shared/types';
import { CardMap } from '@hellfall/shared/utils';
import { cardsData } from '@hellfall/shared/data';
import { getAuthApiUrl } from '../../auth/getAuthApiUrl';

async function loadCards(): Promise<CardMap> {
  const base = getAuthApiUrl().replace(/\/$/, '');
  try {
    if (base) {
      const res = await fetch(`${base}/api/cards/load`);
      if (!res.ok) {
        throw new Error(`Failed to load cards: ${res.status}`);
      }
      const { data } = (await res.json()) as { data: HCCard.Any[] };
      return new CardMap(data);
    }
    return new CardMap(cardsData.data);
  } catch {
    return new CardMap(cardsData.data);
  }
}

export const cardsAtom = atom<Promise<CardMap>>(loadCards);
