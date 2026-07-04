import { HCCard } from '../../types';
import {
  blockFilter,
  blockSummary,
  groupFilter,
  groupSummary,
  includeFilter,
  includeSummary,
  setFilter,
  setSummary,
  setTypeFilter,
  setTypeSummary,
} from '../filters';
import {
  CardStringFilter,
  IncludeFilter,
  filterMaker,
  includeFilterMaker,
  looseOpType,
} from '../types';

export const makeIncludeFilter: includeFilterMaker = (value: string, op: looseOpType) => {
  return new IncludeFilter('include', includeFilter, includeSummary, value, op);
};
export const makeSetFilter: filterMaker<HCCard.Any> = (value: string, op: looseOpType) => {
  return new CardStringFilter('set', setFilter, setSummary, value, op);
};
export const makeBlockFilter: filterMaker<HCCard.Any> = (value: string, op: looseOpType) => {
  return new CardStringFilter('block', blockFilter, blockSummary, value, op);
};
export const makeGroupFilter: filterMaker<HCCard.Any> = (value: string, op: looseOpType) => {
  return new CardStringFilter('group', groupFilter, groupSummary, value, op);
};
export const makeSetTypeFilter: filterMaker<HCCard.Any> = (value: string, op: looseOpType) => {
  return new CardStringFilter('settype', setTypeFilter, setTypeSummary, value, op);
};
