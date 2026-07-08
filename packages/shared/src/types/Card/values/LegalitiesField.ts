import { formatList, HCFormat } from './Format.ts';
import { HCLegality, isLegality } from './Legality.ts';

/**
 * An object containing all {@link HCFormat formats} and their corresponding {@link HCLegality legalities}
 */
export type HCLegalitiesField = Record<HCFormat, HCLegality>;

/**
 * Checks if a value is a {@linkcode HCLegalitiesField}
 * @param value the value to check
 */
export const isLegalitiesField = (value: any): value is HCLegalitiesField => {
  if (typeof value != 'object' || value == null) return false;
  if (!formatList.every(format => format in value)) return false;
  if (Object.keys(value).length != 3) return false;
  return Object.values(value).every(legality => isLegality(legality));
};
