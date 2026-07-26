import { looseOpType } from '../types';
import { IncludeFilter, includeFilterMaker } from '../makerLib';

/**
 * Makes an {@linkcode IncludeFilter}
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeIncludeFilter: includeFilterMaker = (value: string, op: looseOpType) => {
  return new IncludeFilter('include', value, op);
};
