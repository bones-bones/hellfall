import { formatList, HCFormat } from './Format.ts';
import { HCLegality, isLegality } from './Legality.ts';

export type HCLegalitiesField = Record<HCFormat, HCLegality>;

export const isLegalitiesField = (value: any): value is HCLegalitiesField => {
  if (typeof value != 'object' || value == null) return false;
  if (!formatList.every(format => format in value)) return false;
  if (Object.keys(value).length != 3) return false;
  return Object.values(value).every(legality => isLegality(legality));
};
