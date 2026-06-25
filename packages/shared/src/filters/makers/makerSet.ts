import {
  filterBlock,
  filterGroup,
  filterIncludeExtras,
  filterSet,
  filterSetType,
} from '../filters';
import {
  CardStringFilter,
  IncludeFilter,
  filterMaker,
  includeFilterMaker,
  looseOpType,
} from '../types';

export const makeIncludeFilter: includeFilterMaker = (value: string, op: looseOpType) => {
  return new IncludeFilter('include', filterIncludeExtras, value, op, '=');
};
export const makeSetFilter: filterMaker = (value: string, op: looseOpType) => {
  return new CardStringFilter('set', filterSet, value, op, '=');
};
export const makeBlockFilter: filterMaker = (value: string, op: looseOpType) => {
  return new CardStringFilter('block', filterBlock, value, op, '=');
};
export const makeGroupFilter: filterMaker = (value: string, op: looseOpType) => {
  return new CardStringFilter('group', filterGroup, value, op, '=');
};
export const makeSetTypeFilter: filterMaker = (value: string, op: looseOpType) => {
  return new CardStringFilter('settype', filterSetType, value, op, '=');
};
