import { HCCard } from '@hellfall/shared/types';

type Pack = HCCard.Any[];

type Round = [Pack, Pack, Pack, Pack, Pack, Pack, Pack, Pack];

export type TheDraft = Round[];
