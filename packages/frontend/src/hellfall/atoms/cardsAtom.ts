import { atom } from 'jotai';
import { HCCard } from '@hellfall/shared/types';
import { CardMap } from '@hellfall/shared/utils';
import { loadCardsData } from '@hellfall/shared/data';
import { getAuthApiUrl } from '../../auth/getAuthApiUrl';
import { getCardsCatalogUrl } from '../../auth/getCardsCatalogUrl';
import { unescapeCardNewlines } from './unescapeCardNewlines';

async function fetchCatalogData(): Promise<CardMap> {
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
  return new CardMap(await res.json());
}

async function loadCards(): Promise<CardMap> {
  try {
    return await fetchCatalogData();
  } catch {
    return new CardMap((await loadCardsData()).data);
  }
}

export const cardsAtom = atom<Promise<CardMap>>(loadCards);
