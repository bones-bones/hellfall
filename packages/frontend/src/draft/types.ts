import { HCCard } from '@hellfall/shared/types';

export type Pack = HCCard.Any[];

export type Round = [Pack, Pack, Pack, Pack, Pack, Pack, Pack, Pack];

export type TheDraft = Round[];
