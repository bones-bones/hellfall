import { setsData } from '@hellfall/shared/data';
import { allSetsList, HCSet, SetCode } from '../types';

const sets = setsData.data;

export const extraSetList = sets
  .filter(set => !['main', 'side'].includes(set.set_type))
  .map(set => set.code);

export const cardSetList = sets
  .filter(set => ['main', 'side', 'veto'].includes(set.set_type))
  .map(set => set.code);

export const allExceptNormal = allSetsList.filter(set => set != 'NRM');

export const getSet = (code: SetCode): HCSet | undefined =>
  sets.find(set => set.code == code.toUpperCase());

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

export const getSetSrc = (code: SetCode) => setToSrc(getSet(code));

export const getChildSets = (code: SetCode): SetCode[] | undefined => getSet(code)?.child_set_codes;

export const getDirectChildSets = (code: SetCode): SetCode[] | undefined =>
  getSet(code)?.child_set_codes?.filter(child => getSet(child)?.set_type == getSet(code)?.set_type);

export const getBlockSets = (code: SetCode): SetCode[] => [
  code.toUpperCase() as SetCode,
  ...(getSet(code)?.child_set_codes?.filter(
    child => getSet(child)?.set_type == getSet(code)?.set_type
  ) ?? []),
  ...sets
    .filter(set => set.child_set_codes?.includes(code) && set.set_type == getSet(code)?.set_type)
    .map(set => set.code),
];

export const getGroupSets = (code: SetCode): SetCode[] => [
  code.toUpperCase() as SetCode,
  ...(getSet(code)?.child_set_codes ?? []),
  ...sets.filter(set => set.child_set_codes?.includes(code)).map(set => set.code),
];

/**
 * To use in filters when need to check if one set is in another
 * @param value1 the value of the card's set
 * @param value2 the value of the search's set
 * @returns
 */
export const inDirectChildSets = (value1: SetCode, value2: SetCode) =>
  getDirectChildSets(value2)?.some(code => code == value1.toUpperCase()) ?? false;

export const inSetOrDirectChildren = (value1: SetCode, value2: SetCode) =>
  value1.toUpperCase() == value2.toUpperCase() || inDirectChildSets(value1, value2);

export const inSetBlock = (value1: SetCode, value2: SetCode) =>
  getBlockSets(value2).some(code => code == value1.toUpperCase());

export const inSetGroup = (value1: SetCode, value2: SetCode) =>
  getGroupSets(value2).some(code => code == value1.toUpperCase());
