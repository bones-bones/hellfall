import { listsAreLooselyEqual } from '@hellfall/shared/utils';
import { formatList, HCFormat } from './Format.ts';
import { HCLegality, isLegality } from './Legality.ts';

export type HCLegalitiesField = Record<HCFormat, HCLegality>;

export const isLegalitiesField = (value: any): value is HCLegalitiesField => {
  if (typeof value != 'object') return false;
  if (!listsAreLooselyEqual(Object.keys(value), formatList)) return false;
  return Object.values(value).every(legality => isLegality(legality));
};
