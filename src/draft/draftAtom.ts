import { atom } from 'jotai';
import { TheDraft } from './types';
import { HCCard } from '../api-types';

export const draftAtom = atom<TheDraft | undefined>(undefined);

export const deckAtom = atom<HCCard.Any[]>([]);
