import { atom } from 'jotai';
import { TheDraft } from './types.ts';
import { HCCard } from '@hellfall/shared/types';

export const draftAtom = atom<TheDraft | undefined>(undefined);

export const deckAtom = atom<HCCard.Any[]>([]);
