import { preferType, preferTypeList } from '../../utils';
import { displayType, displayTypeList, uniqueType, uniqueTypeList } from '../types';
import { splitOnFirstOp } from '../utils';

const uniqueRedirects: Record<string, uniqueType> = {
  c: 'cards',
  card: 'cards',
  p: 'prints',
  print: 'prints',
  // a: 'arts',
  // art: 'arts',
};
const displayRedirects: Record<string, displayType> = {
  i: 'grid',
  image: 'grid',
  images: 'grid',
  visual: 'grid',
  c: 'checklist',
  l: 'checklist',
  check: 'checklist',
  checks: 'checklist',
  list: 'checklist',
  t: 'text',
  textonly: 'text',
  f: 'full',
  card: 'full',
};
const preferRedirects: Record<string, preferType> = {
  n: 'newest',
  new: 'newest',
  newer: 'newest',
  o: 'oldest',
  old: 'oldest',
  older: 'oldest',
};

export const isUniqueType = (text: any): text is uniqueType => uniqueTypeList.includes(text);
export const isDisplayType = (text: any): text is displayType => displayTypeList.includes(text);
export const isPreferType = (text: any): text is preferType => preferTypeList.includes(text);
/**
 * Checks whether text can produce a unique mode (regardless of validity)
 * @param text text to check
 */
export const isUniqueMode = (text: string): boolean => {
  if (text.at(0) == '-') {
    return isUniqueMode(text.slice(1));
  }
  return splitOnFirstOp(text).keyword == 'unique';
};

/**
 * Checks whether text can produce a display mode (regardless of validity)
 * @param text text to check
 */
export const isDisplayMode = (text: string): boolean => {
  if (text.at(0) == '-') {
    return isDisplayMode(text.slice(1));
  }
  return ['display', 'as'].includes(splitOnFirstOp(text).keyword);
};
/**
 * Checks whether text can produce a preference mode (regardless of validity)
 * @param text text to check
 */
export const isPreferMode = (text: string): boolean => {
  if (text.at(0) == '-') {
    return isPreferMode(text.slice(1));
  }
  return splitOnFirstOp(text).keyword == 'prefer';
};

/**
 * Gets the unique mode from a term
 * @param text text to use
 */
export const toUnique = (text: string): uniqueType | undefined =>
  uniqueRedirects[text] ?? (isUniqueType(text) ? text : undefined);

/**
 * Gets the display mode from a term
 * @param text text to use
 */
export const toDisplay = (text: string): displayType | undefined =>
  displayRedirects[text] ?? (isDisplayType(text) ? text : undefined);
/**
 * Gets the preference mode from a term
 * @param text text to use
 */
export const toPrefer = (text: string): preferType | undefined =>
  preferRedirects[text] ?? (isPreferType(text) ? text : undefined);
