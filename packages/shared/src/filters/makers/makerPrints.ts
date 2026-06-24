import { HCCard, isSetType } from '@hellfall/shared/types';
import {
  equivSetTypes,
  filterInSet,
  filterInSetType,
  filterSetsNumber,
  filterPrintsNumber,
  filterIsUnique,
} from '../filters';
import { PassThroughSummaryFilter, printsFilterMaker, looseOpType } from '../types';
import { unescapeText } from '../utils';

export const makeInFilter: printsFilterMaker = (
  value: string,
  op: looseOpType,
  getValueToCompare: (card: HCCard.Any) => HCCard.Any[]
) => {
  return new PassThroughSummaryFilter<HCCard.Any[], string>(
    'in',
    isSetType(unescapeText(value)) || isSetType(equivSetTypes[unescapeText(value)])
      ? filterInSetType
      : filterInSet,
    value,
    op,
    '=',
    getValueToCompare
  );
};

export const makeSetsNumberFilter: printsFilterMaker = (
  value: string,
  op: looseOpType,
  getValueToCompare: (card: HCCard.Any) => HCCard.Any[]
) => {
  return new PassThroughSummaryFilter<HCCard.Any[], string>(
    'sets',
    filterSetsNumber,
    value,
    op,
    '=',
    getValueToCompare
  );
};
export const makePrintsNumberFilter: printsFilterMaker = (
  value: string,
  op: looseOpType,
  getValueToCompare: (card: HCCard.Any) => HCCard.Any[]
) => {
  return new PassThroughSummaryFilter<HCCard.Any[], string>(
    'sets',
    filterPrintsNumber,
    value,
    op,
    '=',
    getValueToCompare
  );
};
export const makeIsUniqueFilter: printsFilterMaker = (
  value: string,
  op: looseOpType,
  getValueToCompare: (card: HCCard.Any) => HCCard.Any[]
) => {
  return new PassThroughSummaryFilter<HCCard.Any[], string>(
    'sets',
    filterIsUnique,
    value,
    op,
    '=',
    getValueToCompare
  );
};
