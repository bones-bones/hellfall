import { filterHasRelated, filterIsRelated } from '../filters';
import { CardStringFilter, looseOpType, filterMaker } from '../types';

export const makeIsRelatedFilter: filterMaker = (value: string, op: looseOpType) => {
  return new CardStringFilter('isrelated', filterIsRelated, value, op, '=');
};
export const makeHasRelatedFilter: filterMaker = (value: string, op: looseOpType) => {
  return new CardStringFilter('hassrelated', filterHasRelated, value, op, '=');
};
