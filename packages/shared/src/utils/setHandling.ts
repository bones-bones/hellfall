import { setsData } from '@hellfall/shared/data';
import { allSetsList, HCSet, isSetCode, SetCode } from '../types';
import { wrapArray } from './listHandling';

const sets = setsData.data;

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
export const getSet = (code: SetCode): HCSet | undefined =>
  sets.find(set => set.code == code.toUpperCase());

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
 * Gets the set that is the parent of another set
 * @param code Set code to get the parent of
 */
export const getParentSet = (code: SetCode): SetCode | undefined => getSet(code)?.parent_set_code;

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
  isSetCode(code) ? [code.toUpperCase() as SetCode, ...(getDirectChildSets(code) ?? [])] : [];

/**
 * Gets the sets that are in the same block as another set (i.e. are its group and have the same set type)
 * @param code Set code to get the block sets of
 */
export const getBlockSets = (code: SetCode): SetCode[] => [
  code.toUpperCase() as SetCode,
  ...(getSet(code)?.child_set_codes?.filter(
    child => getSet(child)?.set_type == getSet(code)?.set_type
  ) ?? []),
  ...sets
    .filter(
      set =>
        set.child_set_codes?.includes(code.toUpperCase() as SetCode) &&
        set.set_type == getSet(code)?.set_type
    )
    .flatMap(set => [set.code, ...(set.child_set_codes ?? [])]),
];

/**
 * Gets the sets that are in the same group as another set (i.e. are its children or its parent)
 * @param code Set code to get the group sets of
 */
export const getGroupSets = (code: SetCode): SetCode[] => [
  code.toUpperCase() as SetCode,
  ...(getSet(code)?.child_set_codes ?? []),
  ...sets
    .filter(set => set.child_set_codes?.includes(code.toUpperCase() as SetCode))
    .flatMap(set => [set.code, ...(set.child_set_codes ?? [])]),
];

/**
 * Checks if one set is included in another set's direct children
 * @param value1 the set to look for
 * @param value2 the set in whose direct children to look
 */
export const inDirectChildSets = (value1: SetCode, value2: SetCode) =>
  getDirectChildSets(value2)?.some(code => code == value1.toUpperCase()) ?? false;

/**
 * Checks if one set is equal to another set or is included in that set's direct children
 * @param value1 the set to look for
 * @param value2 the set in whose direct children to look
 */
export const inSetOrDirectChildren = (value1: SetCode, value2: SetCode) =>
  getSetAndDirectChildSets(value2).some(code => code == value1.toUpperCase());

/**
 * Checks if one set is included in another set's block
 * @param value1 the set to look for
 * @param value2 the set in whose block to look
 */
export const inSetBlock = (value1: SetCode, value2: SetCode) =>
  getBlockSets(value2).some(code => code == value1.toUpperCase());

/**
 * Checks if one set is included in another set's group
 * @param value1 the set to look for
 * @param value2 the set in whose group to look
 */
export const inSetGroup = (value1: SetCode, value2: SetCode) =>
  getGroupSets(value2).some(code => code == value1.toUpperCase());
