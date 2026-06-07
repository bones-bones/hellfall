import { atom } from 'jotai';
import { HCCard } from '@hellfall/shared/types';
import { CardMap } from '@hellfall/shared/utils';
import { cardsData } from '@hellfall/shared/data';
import { getAuthApiUrl } from '../../auth/getAuthApiUrl';
import { getCardsCatalogUrl } from '../../auth/getCardsCatalogUrl';

async function fetchCatalogData(): Promise<HCCard.Any[]> {
  const catalogUrl = getCardsCatalogUrl().replace(/\/$/, '');
  const base = getAuthApiUrl().replace(/\/$/, '');
  const url = catalogUrl || (base ? `${base}/api/cards/load` : '');
  if (!url) {
    throw new Error('No catalog URL configured');
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load cards: ${res.status}`);
  }
  const { data } = (await res.json()) as { data: HCCard.Any[] };
  if (!Array.isArray(data)) {
    throw new Error('Invalid catalog response');
  }
  return data;
}

async function loadCards(): Promise<CardMap> {
  try {
    return new CardMap(await fetchCatalogData());
  } catch {
    return new CardMap(cardsData.data);
  }
}

export const cardsAtom = atom<Promise<CardMap>>(loadCards);
