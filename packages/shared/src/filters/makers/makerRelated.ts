import { HCCard } from '@hellfall/shared/types';
import { hasRelatedFilter, hasRelatedSummary, isRelatedFilter, isRelatedSummary } from '../filters';
import { CardStringFilter, looseOpType, filterMaker } from '../types';

export const makeIsRelatedFilter: filterMaker<HCCard.Any> = (value: string, op: looseOpType) => {
  return new CardStringFilter('isrelated', isRelatedFilter, isRelatedSummary, value, op);
};
export const makeHasRelatedFilter: filterMaker<HCCard.Any> = (value: string, op: looseOpType) => {
  return new CardStringFilter('hassrelated', hasRelatedFilter, hasRelatedSummary, value, op);
};
