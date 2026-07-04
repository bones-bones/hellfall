import { looseOpType, LegalityFilter, legalityFilterMaker } from '../types';
import { legalityFilter, legalitySummary } from '../filters';

export const makeLegalFilter: legalityFilterMaker = (value: string, op: looseOpType) => {
  return new LegalityFilter('legal', legalityFilter, legalitySummary, value, op);
};
export const makeBannedFilter: legalityFilterMaker = (value: string, op: looseOpType) => {
  return new LegalityFilter('banned', legalityFilter, legalitySummary, value, op);
};
export const makeNotLegalFilter: legalityFilterMaker = (value: string, op: looseOpType) => {
  return new LegalityFilter('notlegal', legalityFilter, legalitySummary, value, op);
};
