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

export const getSet = (code: SetCode): HCSet | undefined => sets.find(set => set.code == code);

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
