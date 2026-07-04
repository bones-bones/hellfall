import { HCCard, isSetType } from '@hellfall/shared/types';
import {
  equivSetTypes,
  inSetFilter,
  inSetTypeFilter,
  setsNumberFilter,
  printsNumberFilter,
  isUniqueFilter,
  inSetTypeSummary,
  inSetSummary,
  setsNumberSummary,
  printsNumberSummary,
  isUniqueSummary,
} from '../filters';
import { filterObject, printsFilterMaker, looseOpType } from '../types';
import { unescapeText } from '../utils';

export const makeInFilter: printsFilterMaker = (
  value: string,
  op: looseOpType,
  getValueToCompare: (card: HCCard.Any) => HCCard.Any[]
) => {
  return new filterObject<HCCard.Any[], string>(
    'in',
    isSetType(unescapeText(value)) || isSetType(equivSetTypes[unescapeText(value)])
      ? inSetTypeFilter
      : inSetFilter,
    isSetType(unescapeText(value)) || isSetType(equivSetTypes[unescapeText(value)])
      ? inSetTypeSummary
      : inSetSummary,
    value,
    op,
    getValueToCompare
  );
};

export const makeSetsNumberFilter: printsFilterMaker = (
  value: string,
  op: looseOpType,
  getValueToCompare: (card: HCCard.Any) => HCCard.Any[]
) => {
  return new filterObject<HCCard.Any[], string>(
    'sets',
    setsNumberFilter,
    setsNumberSummary,
    value,
    op,
    getValueToCompare
  );
};
export const makePrintsNumberFilter: printsFilterMaker = (
  value: string,
  op: looseOpType,
  getValueToCompare: (card: HCCard.Any) => HCCard.Any[]
) => {
  return new filterObject<HCCard.Any[], string>(
    'sets',
    printsNumberFilter,
    printsNumberSummary,
    value,
    op,
    getValueToCompare
  );
};
export const makeIsUniqueFilter: printsFilterMaker = (
  value: string,
  op: looseOpType,
  getValueToCompare: (card: HCCard.Any) => HCCard.Any[]
) => {
  return new filterObject<HCCard.Any[], string>(
    'sets',
    isUniqueFilter,
    isUniqueSummary,
    value,
    op,
    getValueToCompare
  );
};
