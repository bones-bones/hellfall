import { setsData } from '@hellfall/shared/data';
import { allSetsList, HCSet, isSetCode, SetCode } from '../types';
import { wrapArray } from './listHandling';

const sets = setsData.data;

/**
 * maps set codes to sets
 */
const setMap = new Map(sets.map(set=>[set.code,set]));

/**
 * The list of sets 
 */
export const colorOrderSetList = sets.filter(set => set.use_color_order).map(set => set.code);

export const toSetNumber = (code: SetCode) => allSetsList.indexOf(code);

/**
 * Fixes valid set code input to actually work
 * @param code input to fix
 */
export const fixSetCode = <T extends string>(code: T) =>
  code.toUpperCase().replaceAll('.', '_') as T;
/**
 * Gets the display version of a set code
 * @param code input to fix
 */
export const displaySetCode = <T extends string>(code: T) =>
  code.toUpperCase().replaceAll('_', '.') as T;
/**
 * Fixes valid set code input to actually work
 * @param code input to fix
 */
export const fixSetCodeMaybe = <T extends string>(code?: T) =>
  code ? (fixSetCode(code)) : code;

/**
 * The list of sets that should only be included if include:extras is used
 */
export const extraSetList = sets
  .filter(set => !['main', 'side', 'lair'].includes(set.set_type))
  .map(set => set.code);

/**
 * The list of card sets
 */
export const cardSetList = sets
  .filter(set => ['main', 'side', 'veto', 'lair'].includes(set.set_type))
  .map(set => set.code);

/**
 * The list of all sets except normalcube
 */
export const allExceptNormal = allSetsList.filter(set => set != 'NRM');

/**
 * Gets the set object given a set code
 * @param code the set code to get the set for
 */
export const getSet = (code: SetCode): HCSet | undefined => setMap.get(fixSetCode(code));

/**
 * Gets the src of a set symbol image
 * @param set the set to get the symbol image for
 */
export const setToSrc = (set?: HCSet) => {
  if (!set) return undefined;
  if (set.filename) {
    return `/sets/${set.filename}`;
  }
  const parent = sets.find(s => s.code == set.parent_set_code);
  if (parent?.filename) {
    return `/sets/${parent.filename}`;
  }
  return undefined;
};

/**
 * Gets the src of a set symbol image
 * @param code the set code to get the symbol image for
 */
export const getSetSrc = (code: SetCode) => setToSrc(getSet(code));

/**
 * Gets the set code that is the parent of another set
 * @param code Set code to get the parent of
 */
export const getParentSetCode = (code: SetCode): SetCode | undefined =>
  getSet(code)?.parent_set_code;

/**
 * Gets the set that is the parent of another set
 * @param code Set code to get the parent of
 */
export const getParentSet = (code: SetCode): HCSet | undefined =>
  getSet(getParentSetCode(code) ?? ('' as SetCode));

/**
 * Gets the sets that are the children of another set
 * @param code Set code to get the children of
 */
export const getChildSets = (code: SetCode): SetCode[] | undefined =>
  wrapArray(getSet(code)?.child_set_codes);

/**
 * Gets the sets that are the direct children of another set (i.e. are its children and have the same set type)
 * @param code Set code to get the direct children of
 */
export const getDirectChildSets = (code: SetCode): SetCode[] | undefined =>
  getSet(code)?.child_set_codes?.filter(child => getSet(child)?.set_type == getSet(code)?.set_type);

/**
 * Gets the result of {@linkcode getDirectChildSets} except including the set itself
 * @param code Set code to get the direct children of
 */
export const getSetAndDirectChildSets = (code: SetCode): SetCode[] =>
  isSetCode(code) ? [fixSetCode(code), ...(getDirectChildSets(code) ?? [])] : [];

/**
 * Gets the sets that are in the same block as another set (i.e. are its group and have the same set type)
 * @param code Set code to get the block sets of
 */
export const getBlockSets = (code: SetCode): SetCode[] => [
  fixSetCode(code),
  ...(getSet(code)?.child_set_codes?.filter(
    child => getSet(child)?.set_type == getSet(code)?.set_type
  ) ?? []),
  ...sets
    .filter(
      set =>
        set.child_set_codes?.includes(fixSetCode(code)) && set.set_type == getSet(code)?.set_type
    )
    .flatMap(set => [set.code, ...(set.child_set_codes ?? [])]),
];

/**
 * Gets the sets that share collector numbers with another set, including that set itself
 * @param code Set code to get the sets that share its collector numbers
 */
export const getCollectorNumSets = (code: SetCode): SetCode[] =>
  getSet(code)?.use_color_order ||
  getParentSet(code)?.use_color_order ||
  getSet(code)?.set_type == 'lair'
    ? getBlockSets(code)
    : [fixSetCode(code)];

/**
 * Gets the set that a set uses for collector number sorting
 * @param code Set code to get the collector order set for
 */
export const getCollectorOrderSet = (code: SetCode): SetCode => {
  const parent = getParentSet(code);
  return parent?.use_color_order || parent?.set_type == 'lair' ? parent.code : fixSetCode(code);
};

/**
 * Gets the set that a set uses for accepted order sorting
 * @param code Set code to get the accepted order set for
 */
export const getAcceptedOrderSet = (code: SetCode): SetCode => {
  const parent = getParentSet(code);
  if (parent?.code == 'SCL') {
    return parent.code;
  }
  if (parent?.code.startsWith('HCV_')) {
    const [set, subset] = fixSetCode(code).split('_').slice(1);
    const acceptedSet = `${set == '1' ? 'HLC' : `HC${set}`}_${subset}`;
    return isSetCode(acceptedSet) ? acceptedSet : fixSetCode(code);
  }
  return fixSetCode(code);
};

/**
 * Gets the sets that are in the same group as another set (i.e. are its children or its parent)
 * @param code Set code to get the group sets of
 */
export const getGroupSets = (code: SetCode): SetCode[] => [
  fixSetCode(code),
  ...(getSet(code)?.child_set_codes ?? []),
  ...sets
    .filter(set => set.child_set_codes?.includes(fixSetCode(code)))
    .flatMap(set => [set.code, ...(set.child_set_codes ?? [])]),
];

/**
 * Checks if one set is included in another set's direct children
 * @param value1 the set to look for
 * @param value2 the set in whose direct children to look
 */
export const inDirectChildSets = (value1: SetCode, value2: SetCode) =>
  getDirectChildSets(value2)?.some(code => code == fixSetCode(value1)) ?? false;

/**
 * Checks if one set is equal to another set or is included in that set's direct children
 * @param value1 the set to look for
 * @param value2 the set in whose direct children to look
 */
export const inSetOrDirectChildren = (value1: SetCode, value2: SetCode) =>
  getSetAndDirectChildSets(value2).some(code => code == fixSetCode(value1));

/**
 * Checks if one set is included in another set's block
 * @param value1 the set to look for
 * @param value2 the set in whose block to look
 */
export const inSetBlock = (value1: SetCode, value2: SetCode) =>
  getBlockSets(value2).some(code => code == fixSetCode(value1));

/**
 * Checks if one set is included in another set's group
 * @param value1 the set to look for
 * @param value2 the set in whose group to look
 */
export const inSetGroup = (value1: SetCode, value2: SetCode) =>
  getGroupSets(value2).some(code => code == fixSetCode(value1));

const fixMaster = (t: string[]) =>
  t.length > 1 && typeof t[1] == 'string' ? [t[0].toUpperCase(), t[1]] : t;
/**
 * Splits a name that starts with a masterpiece code into the name and the set code.
 * Can handle lowercase set codes.
 * @param text text to split
 */
export const splitMasterpiece = (text: string): { name: string; code?: SetCode } => {
  const [code, name] = fixMaster(text.match(/^([^:]+): (.*)$/)?.slice(1) ?? ['', text]);
  if (!code) {
    return { name };
  }
  if (isSetCode(code)) {
    return { name, code };
  }
  return { name: text };
};
const fixCode = (t: string[]) =>
  t.length > 1 && typeof t[1] == 'string' ? [t[0], fixSetCode(t[1])] : t;
/**
 * Splits a name that ends with a set code into the name and the set code.
 * Can handle lowercase set codes.
 * @param text text to split
 */
export const splitSetCode = (text: string): { name: string; code?: string } => {
  const [name, code] = fixCode(text.match(/^(.*) <([^>]+)>$/)?.slice(1) ?? [text]);
  if (!code) {
    return { name };
  }
  if (code == 'HC' || isSetCode(code)) {
    return { name, code };
  }
  return { name: text };
};

const stripParens = (text: string) =>
  text.startsWith('(') && text.endsWith(')') ? text.slice(1, -1) : text;

/**
 * Splits a name of a card from input into the card's name, set (if any), and collector num (if any)
 * @param text text to split
 */
export const splitCardName = (
  text: string
): { name: string; code?: SetCode; collector_number?: string } => {
  const { name, code } = splitMasterpiece(text);
  if (code) {
    return { name, code };
  }
  const splitText = text.split(' ');
  if (splitText.length > 2 && isSetCode(stripParens(splitText.at(-2)!))) {
    return {
      name: splitText.slice(0, -2).join(' '),
      code: fixSetCode(stripParens(splitText.at(-2)!) as SetCode),
      collector_number: splitText.at(-1)?.toLowerCase(),
    };
  }
  if (splitText.length > 1 && isSetCode(stripParens(splitText.at(-1)!))) {
    return {
      name: splitText.slice(0, -1).join(' '),
      code: fixSetCode(stripParens(splitText.at(-1)!) as SetCode),
    };
  }
  return { name: text };
};

const hardCardNames: string[] = [
  'Crypt of u/Em9500',
  '1d6',
  'Avatar of BallsJr123',
  'Sekiro for the PS4',
  'Avatar of Discord v2',
  'That One Time in WW1',
  'Plagiarism by doomclaw9',
  'Carrion Feeder from MH8',
];

export const hardTokenIds: string[] = [
  'Clue© 19861',
  '+21',
  '+41',
  'AKKI-471',
  'Bolt M41',
  'Rock 191',
  "Baldur's Gate 31",
];

/**
 * Parses the parameters for a related card
 * @param oldName name from the google sheet
 */
export const parseRelatedReferenceName = (
  oldName: string
): { name: string; hcid: string; code?: SetCode; count?: string } => {
  const { name: intName, code } = splitCardName(oldName);
  const groups = intName.match(/(?<name>.*)(?<count>\*(?:\d+|x))$/);
  const match = groups?.groups?.name ?? intName;
  const count = groups?.groups?.count ?? ('' as SetCode);
  const base = hardTokenIds.includes(match) ? match.slice(0, -1) : match.replace(/\d+$/, '');
  const shouldUseBase =
    hardTokenIds.includes(match) ||
    (/\d/.test(match.at(-1)!) &&
      !hardCardNames.includes(match) &&
      base.length > 0 &&
      ![' ', '-', '^', '.', '/', '+', ',', "'"].includes(base.at(-1)!));
  const name = shouldUseBase ? base : match;
  const hcid = shouldUseBase ? match : '';
  return { name, hcid, code, count };
};
