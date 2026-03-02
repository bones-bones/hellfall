import { HCFormat } from './Format';
import { HCLegality } from './Legality';

export type HCLegalitiesField = Record<`${HCFormat}`, `${HCLegality}`>;
