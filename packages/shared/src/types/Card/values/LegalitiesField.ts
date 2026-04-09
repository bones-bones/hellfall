import { HCFormat } from './Format.ts';
import { HCLegality } from './Legality.ts';

export type HCLegalitiesField = Record<`${HCFormat}`, `${HCLegality}`>;
