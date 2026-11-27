import { atom } from 'jotai';
import { CardMap } from '@hellfall/shared/utils';
import { loadCardsData } from '@hellfall/shared/data';
import { getAuthApiUrl } from '../../auth/getAuthApiUrl';
import { getCardsCatalogUrl } from '../../auth/getCardsCatalogUrl';

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
    return new CardMap(await loadCardsData());
  }
}

/** Sync empty map for call sites that must not trigger a catalog download. */
export const emptyCardsAtom = atom(new CardMap());

let cardsPromise: Promise<CardMap> | undefined;

/**
 * Full CardMap. Fetch starts on first read (Draft, SetList, Cube, panel prints, etc.).
 * HellFall home with server search must not read this atom.
 */
export const cardsAtom = atom(() => {
  if (!cardsPromise) {
    cardsPromise = loadCards();
  }
  return cardsPromise;
});
