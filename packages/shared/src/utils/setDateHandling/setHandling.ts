import { setsData } from '@hellfall/shared/data';
import {
  allSetsList,
  displaySetCode,
  HCCard,
  HCObject,
  HCSet,
  SetCode,
  setPageOrder,
  setPropOrder,
  SetType,
} from '@hellfall/shared/types';
import { cardDateMap } from './cardDateMap';
import { isInteger } from '../numHandling';

const sets = setsData.data;

const allCount = sets.reduce(
  (total, curSet) => (curSet.parent_set_code ? total : total + (curSet.card_count ?? 0)),
  0
);
const allSetObject: HCSet = {
  object: HCObject.ObjectType.Set,
  id: '0075c7d6-96c6-4e26-a8fa-615c8fa23231',
  code: 'All' as SetCode,
  name: 'All Hellscube Sets',
  description: 'All sets!',
  set_type: '' as SetType,
  card_count: allCount,
};

export const setList = [...sets, allSetObject];
/**
 * maps set codes to sets
 */
const setMap = new Map(sets.map(set => [set.code, set]));

/**
 * Checks if a value is a {@linkcode SetCode}
 *
 * Now requires exact use
 * @param value the value to check
 */
export const isSetCode = (code: string): code is SetCode => setMap.has(code as SetCode);

/**
 * Checks if a value is a {@linkcode SetCode}
 *
 * Now requires exact use
 * @param value the value to check
 */
export const isDisplaySetCode = (code: string): code is displaySetCode =>
  !code.includes('_') && isSetCode(code.replaceAll('.', '_'));

/**
 * The list of sets
 */
export const colorOrderSetList = sets.filter(set => set.use_color_order).map(set => set.code);

export const toSetNumber = (code: SetCode) => allSetsList.indexOf(code);
/**
 * Gets the position of a set on the set page
 * @param set set to get the position for
 */
export const getSetPosition = (set: HCSet) => setPageOrder.indexOf(set.code);

/**
 * Fixes valid set code input to actually work
 * @param code input to fix
 */
export const fixSetCodeInput = (code: string) => code?.toUpperCase().replaceAll('.', '_');

/**
 * Gets the backend version of a set code
 * @param code input to fix
 */
export const displayToBackendSetCode = (code: displaySetCode) =>
  code?.replaceAll('.', '_') as SetCode;
/**
 * Gets the display version of a set code
 * @param code input to fix
 */
export const backendToDisplaySetCode = (code: SetCode) =>
  code.replaceAll('_', '.') as displaySetCode;
/**
 * Gets the display version of a set code
 * @param code input to fix
 */
export const backendToDisplaySetCodeMaybe = (code?: SetCode) =>
  code ? (code.replaceAll('_', '.') as displaySetCode) : undefined;
/**
 * Fixes valid set code input to actually work
 * @param code input to fix
 */
export const fixSetCodeInputMaybe = (code?: string) => (code ? fixSetCodeInput(code) : code);

const numRegex = /^\d+$/;

/**
 * Converts a value to a {@linkcode SetCode} if possible
 * @param value the value to convert
 */
export const toSetCode = (value: string): SetCode | undefined => {
  const code = value.trim();
  if (isSetCode(code)) {
    return code;
  }
  if (code.includes(' ')) return;
  const fixed = fixSetCodeInput(value);
  if (isSetCode(fixed)) {
    return fixed;
  }
  // now the more aggressive matching starts
  const splitCode = fixed.split('_');
  if (splitCode[0].length == 1) {
    // convert single chars at start to the appropriate set
    if (splitCode[0] == '1') {
      splitCode[0] = 'HLC';
    } else {
      splitCode[0] = `HC${splitCode[0]}`;
    }
  } else if (numRegex.test(splitCode[0])) {
    // convert numbers at start to the appropriate set
    const num = parseInt(splitCode[0]);
    if (num == 1) {
      splitCode[0] = 'HLC';
    } else {
      splitCode[0] = `HC${parseInt(splitCode[0])}`;
    }
  }
  const start = splitCode[0];
  if (!isSetCode(start)) return;
  if (splitCode.length == 1) {
    return start;
  }
  if (splitCode[1].startsWith('HC')) {
    splitCode[1] = splitCode[1].slice(2);
  } else if (splitCode[1] == 'HLC') {
    splitCode[1] = '1';
  }
  for (let i = 1; i < splitCode.length; i++) {
    if (numRegex.test(splitCode[i])) {
      if (i == 1 && start == 'SCL') {
        splitCode[i] = `${parseInt(splitCode[i])}`.padStart(2, '0');
      } else if (!isInteger(splitCode[i])) {
        splitCode[i] = `${parseInt(splitCode[i])}`;
      }
    }
  }
  const joined = splitCode.join('_');
  return isSetCode(joined) ? joined : undefined;
};

export const toDisplaySetCode = (value: string): displaySetCode | undefined =>
  backendToDisplaySetCodeMaybe(toSetCode(value));
/**
 * The list of sets that should only be included if include:extras is used
 */
export const extraSetList = sets
  .filter(set => !['main', 'side', 'lair', 'land'].includes(set.set_type))
  .map(set => set.code);

/**
 * The list of card sets
 */
export const cardSetList = sets
  .filter(set => ['main', 'side', 'veto', 'lair', 'land'].includes(set.set_type))
  .map(set => set.code);

export const eventSetList: SetCode[] = ['CDC', 'HWN'];

/**
 * The list of all sets except normalcube
 */
export const allExceptNormal = allSetsList.filter(set => set != 'NRM');

/**
 * Gets the set object given a set code
 * @param code the set code to get the set for
 */
export const getSet = (code: SetCode): HCSet | undefined => setMap.get(code);

/**
 * Gets the set object given a set code (is more permissive)
 * @param code the set code to get the set for
 */
export const getSetPermissive = (code: string): HCSet | undefined =>
  setMap.get(toSetCode(code) ?? ('' as SetCode));

/**
 * Gets the filename of a set symbol image
 * @param set the set to get the symbol image for
 */
export const setToFilename = (set?: HCSet): undefined | string => {
  if (!set) return;
  if (set.filename) {
    return set.filename;
  } else if (set.parent_set_code) {
    return setToFilename(getSet(set.parent_set_code));
  }
};

/**
 * Gets the filename of a set symbol image
 * @param code the set code to get the symbol image for
 */
export const getSetFilename = (code: SetCode) => setToFilename(getSet(code));

/**
 * Gets the date of a set
 * @param code the set code to get the date for
 */
export const getSetDate = (code: SetCode) => getSet(getAcceptedOrderSet(code))?.released_at;

/**
 * Gets the set code that is the direct parent of another set
 * @param code Set code to get the parent of
 */
export const getDirectParentSetCode = (code: SetCode): SetCode | undefined =>
  getSet(code)?.parent_set_code;

/**
 * Gets the set that is the direct parent of another set
 * @param code Set code to get the parent of
 */
export const getDirectParentSet = (code: SetCode): HCSet | undefined =>
  getSet(getDirectParentSetCode(code) ?? ('' as SetCode));

/**
 * Gets the set that is the parent of another set
 * @param code Set code to get the parent of
 */
export const getParentSet = (code: SetCode): HCSet | undefined => {
  let set = getSet(code);
  if (!set) return;
  while (set.parent_set_code) {
    set = getSet(set.parent_set_code);
    if (!set) return;
  }
  if (set.code == code) return;
  return set;
};

/**
 * Gets the set code that is the parent of another set
 * @param code Set code to get the parent of
 */
export const getParentSetCode = (code: SetCode): SetCode | undefined => getParentSet(code)?.code;

const getChildVeto = (set: HCSet) => {
  if (set.child_set_codes) {
    for (const child of set.child_set_codes) {
      const childSet = getSet(child);
      if (childSet?.set_type == 'veto') {
        return childSet;
      }
    }
  }
};

/**
 * Gets the set that is the veto set for another set
 * @param code Set code to get the veto set for
 */
export const getVetoSet = (code: SetCode): HCSet | undefined => {
  let set = getSet(code);
  if (!set || set.set_type == 'veto') return;
  let veto = getChildVeto(set);
  while (!veto && set.parent_set_code) {
    set = getSet(set.parent_set_code);
    if (!set) return;
    veto = getChildVeto(set);
  }
  return veto;
};

/**
 * Gets the set code that is the veto set code of another set
 * @param code Set code to get the veto set code for
 */
export const getVetoSetCode = (code: SetCode): SetCode | undefined => getVetoSet(code)?.code;

/**
 * Gets the block set code of a set
 * @param code Set code to get the block set code of
 */
export const getBlockSetCode = (code: SetCode): SetCode | undefined => {
  let set = getSet(code);
  if (!set) return;
  if (!set?.parent_set_code) return set.code;
  while (set.parent_set_code) {
    set = getSet(set.parent_set_code);
    if (!set) return;
  }
  return set.code;
};
/**
 * Gets the block set code of a set
 * @param set Set to get the block set code of
 */
export const getBlockSetCodeForSet = (set: HCSet): SetCode | undefined => getBlockSetCode(set.code);

/**
 * Gets the sets that are the children of another set
 * @param code Set code to get the children of
 */
export const getChildSets = (code: SetCode): SetCode[] | undefined =>
  getSet(code)?.child_set_codes?.flatMap(child =>
    getSet(child)?.child_set_codes ? [child, ...(getChildSets(child) ?? [])] : child
  );

const setTypesAreSame = (code1: SetCode, code2: SetCode) =>
  getSet(code1)?.set_type == getSet(code2)?.set_type;

/**
 * Gets the sets that are the direct children of another set (i.e. are its children and have the same set type)
 * @param code Set code to get the direct children of
 */
export const getDirectChildSets = (code: SetCode): SetCode[] | undefined =>
  getSet(code)
    ?.child_set_codes?.filter(child => setTypesAreSame(code, child))
    .flatMap(child =>
      getSet(child)?.child_set_codes ? [child, ...(getDirectChildSets(child) ?? [])] : child
    );

/**
 * Gets the result of {@linkcode getChildSets} except including the set itself
 * @param code Set code to get the direct children of
 */
export const getSetAndChildSets = (code: SetCode): SetCode[] =>
  isSetCode(code) ? [code, ...(getChildSets(code) ?? [])] : [];

/**
 * Gets the result of {@linkcode getDirectChildSets} except including the set itself
 * @param code Set code to get the direct children of
 */
export const getSetAndDirectChildSets = (code: SetCode): SetCode[] =>
  isSetCode(code) ? [code, ...(getDirectChildSets(code) ?? [])] : [];

/**
 * Gets the sets that are in the same block as another set (i.e. are its group and have the same set type)
 * @param code Set code to get the block sets of
 */
export const getBlockSets = (code: SetCode): SetCode[] => [
  code,
  ...(getDirectChildSets(code) ?? []),
  ...sets
    .filter(set => getChildSets(set.code)?.includes(code) && set.set_type == getSet(code)?.set_type)
    .flatMap(set => getSetAndDirectChildSets(set.code)),
];
/**
 * Gets the sets that are in the same group as another set (i.e. are its children or its parent)
 * @param code Set code to get the group sets of
 */
export const getGroupSets = (code: SetCode): SetCode[] => [
  code,
  ...(getChildSets(code) ?? []),
  ...sets
    .filter(set => getChildSets(set.code)?.includes(code))
    .flatMap(set => getSetAndChildSets(set.code)),
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
    : [code];

/**
 * Gets the set that a set uses for collector number sorting
 * @param code Set code to get the collector order set for
 */
export const getCollectorOrderSet = (code: SetCode): SetCode => {
  const parent = getParentSet(code);
  return parent?.use_color_order || parent?.set_type == 'lair' ? parent.code : code;
};

/**
 * Gets the set that a set uses for accepted order sorting
 * @param code Set code to get the accepted order set for
 */
export const getAcceptedOrderSet = (code: SetCode): SetCode => {
  const parent = getDirectParentSet(code);
  if (parent?.code == 'SCL') {
    return parent.code;
  }
  if (parent?.code.startsWith('HCV_')) {
    const [set, subset] = code.split('_').slice(1);
    const acceptedSet = `${set == '1' ? 'HLC' : `HC${set}`}_${subset}`;
    return isSetCode(acceptedSet) ? acceptedSet : code;
  }
  return code;
};

/**
 * Checks if one set is included in another set's direct children
 * @param value1 the set to look for
 * @param value2 the set in whose direct children to look
 */
export const inDirectChildSets = (value1: SetCode, value2: SetCode) =>
  getDirectChildSets(value2)?.some(code => code == value1) ?? false;

/**
 * Checks if one set is equal to another set or is included in that set's direct children
 * @param value1 the set to look for
 * @param value2 the set in whose direct children to look
 */
export const inSetOrDirectChildren = (value1: SetCode, value2: SetCode) =>
  getSetAndDirectChildSets(value2).some(code => code == value1);

/**
 * Checks if one set is included in another set's block
 * @param value1 the set to look for
 * @param value2 the set in whose block to look
 */
export const inSetBlock = (value1: SetCode, value2: SetCode) =>
  getBlockSets(value2).some(code => code == value1);

/**
 * Checks if one set is included in another set's group
 * @param value1 the set to look for
 * @param value2 the set in whose group to look
 */
export const inSetGroup = (value1: SetCode, value2: SetCode) =>
  getGroupSets(value2).some(code => code == value1);

const collNumRegex = /^\d+[A-Za-z]?$/;
const isCollectorNum = (text?: string) => text && collNumRegex.test(text);

const angleSetCodeRegex = /^(.*) <([^>]+)>$/;

export type angleSetCode = SetCode | 'HC';

/**
 * Splits a name that ends with a set code into the name and the set code.
 * Can handle lowercase set codes.
 * Only for use with `<HCX>` type notation for dealing with card names
 * @param text text to split
 */
export const splitAngleSetCode = (text: string): { name: string; code?: angleSetCode } => {
  const match = text.match(angleSetCodeRegex)?.slice(1);
  if (match) {
    const [name, _code] = match.map(t => t.trim());
    const code = _code.toUpperCase() == 'HC' ? 'HC' : toSetCode(_code);
    if (code) {
      return { name, code };
    }
  }
  return { name: text };
};

const masterpieceNumRegex = /^([^:]+):(.*)\|\s*(\d+[A-Za-z]?)$/;
const masterpieceRegex = /^([^:]+):(.*)$/;
/**
 * Splits a name that starts with a masterpiece code into the name, the set code, and the collector number.
 * Can handle lowercase set codes.
 * @param text text to split
 * @param noCollector whether to skip looking for a collector number
 */
const splitMasterpiece = (
  text: string,
  noCollector?: boolean
): { name: string; code: SetCode; collector_number?: string } | undefined => {
  if (!noCollector) {
    const numMatch = text.match(masterpieceNumRegex)?.slice(1);
    if (numMatch) {
      const [_code, name, _collector_number] = numMatch.map(t => t.trim());
      const code = toSetCode(_code);
      if (isCollectorNum(_collector_number) && code) {
        const collector_number = _collector_number.toLowerCase();
        return { name, code, collector_number };
      }
    }
  }
  const match = text.match(masterpieceRegex)?.slice(1);
  if (match) {
    const [_code, name] = match.map(t => t.trim());
    const code = toSetCode(_code);
    if (code) {
      return { name, code };
    }
  }
};

/**
 * Splits a name that starts with a masterpiece code into the name, the set code, and the collector number.
 * Can handle lowercase set codes.
 * @param text text to split
 */
export const splitMasterpiecePostcard = (text: string): { name: string; code?: SetCode } =>
  splitMasterpiece(text, true) ?? { name: text };

const setCodeNumRegex = /^(.*)(?:\|\s*\(|[(|])\s*([^\s)|]+)\s*(?:\)\s*\||[\s)|])\s*(\d+[A-Za-z]?)$/;
const setCodeRegex = /^(.*)(?:\|\s*\(|[(|])\s*([^\s)|]+)\s*[)|]?$/;
/**
 * Splits a name that ends with a set code into the name and the set code.
 * Can handle lowercase set codes.
 * Only for use with `(HCX)` or pipe-separated type notation for dealing with fetching
 * @param text text to split
 * @param noCollector whether to skip looking for a collector number
 */
const splitSetCode = (
  text: string,
  noCollector?: boolean
): { name: string; code: SetCode; collector_number?: string } | undefined => {
  if (!noCollector) {
    const numMatch = text.match(setCodeNumRegex)?.slice(1);
    if (numMatch) {
      const [name, _code, _collector_number] = numMatch.map(t => t.trim());
      const code = toSetCode(_code);
      if (isCollectorNum(_collector_number) && code) {
        const collector_number = _collector_number.toLowerCase();
        return { name, code, collector_number };
      }
    }
  }
  const match = text.match(setCodeRegex)?.slice(1);
  if (match) {
    const [name, _code] = match.map(t => t.trim());
    const code = toSetCode(_code);
    if (code) {
      return { name, code };
    }
  }
};

/**
 * Splits a name of a card from input into the card's name, set (if any), and collector num (if any)
 * @param text text to split
 */
export const splitCardName = (
  text: string
): { name: string; code?: SetCode; collector_number?: string } => {
  const match = splitMasterpiece(text) ?? splitSetCode(text);
  if (match) {
    return match;
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

const refRegex = /(?<name>.*)(?<count>\*(?:\d+|x))$/;
/**
 * Parses the parameters for a related card
 * @param oldName name from the google sheet
 */
export const parseRelatedReferenceName = (
  oldName: string
): { name: string; hcid: string; code?: SetCode; collector_number?: string; count?: string } => {
  const { name: intName, code, collector_number } = splitCardName(oldName);
  const groups = intName.match(refRegex);
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
  return { name, hcid, code, collector_number, count };
};

/**
 * Gets the correct date for a card
 * @param card card to get the date for
 */
export const getDateForCard = (card: HCCard.Any) =>
  cardDateMap.get(getAcceptedOrderSet(card.set), card.accepted_order) ?? getSetDate(card.set);

/**
 * Gets the correct date for a set code and an accepted order
 * @param code set code to get the date for
 * @param accepted_order accepted order to get the date for
 */
export const getDateForCodeNum = (code: SetCode, accepted_order: string) =>
  cardDateMap.get(getAcceptedOrderSet(code), accepted_order) ?? getSetDate(code);

/**
 * Adds `toJSON()` to a set. Uses a predefined prop order.
 * @param set set to add `toJSON()` to
 */
export const addToJSONToSet = (set: HCSet): HCSet => {
  if (Object.prototype.hasOwnProperty.call(set, 'toJSON')) {
    return set;
  }
  const ignoreLeftovers = ['toJSON'];
  Object.defineProperty(set, 'toJSON', {
    value(this: Record<string, any>) {
      const ordered: Record<string, any> = {};
      setPropOrder.forEach(prop => {
        if (prop in this) {
          ordered[prop] = this[prop];
        }
      });
      const leftovers = (Object.keys(this) as (typeof setPropOrder)[number][]).filter(
        left => !setPropOrder.includes(left) && !ignoreLeftovers.includes(left)
      );
      if (leftovers.length) {
        // You forgot a prop.
        throw new Error(`You forgot one or more card props: ${leftovers}`);
      }
      return ordered;
    },
    enumerable: false,
    configurable: true,
    writable: true,
  });
  return set as HCSet;
};

/**
 * Adds `toJSON()` to sets. Uses a predefined prop order.
 * @param sets sets to add `toJSON()` to
 */
export const addToJSONToSets = (sets: HCSet[]): HCSet[] => sets.map(set => addToJSONToSet(set));
