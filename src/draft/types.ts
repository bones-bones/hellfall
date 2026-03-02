import { HCCard } from '../api-types';

type Pack = HCCard.Any[];

type Round = [Pack, Pack, Pack, Pack, Pack, Pack, Pack, Pack];

export type TheDraft = Round[];
