import { atom } from 'jotai';
import { HCCard } from '@hellfall/shared/types';

/**
 * id → card for the current HellFall search page.
 * Lets ActiveCardPanel open a grid card without reading the full catalog.
 */
export const searchPageCardsAtom = atom<Map<string, HCCard.Any>>(new Map());
