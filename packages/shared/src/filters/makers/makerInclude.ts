import { includeFilter, includeSummary } from '../filters';
import { looseOpType } from '../types';
import { IncludeFilter, includeFilterMaker } from '../utils';

/**
 * Makes an {@linkcode IncludeFilter}
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeIncludeFilter: includeFilterMaker = (value: string, op: looseOpType) => {
  return new IncludeFilter('include', includeFilter, includeSummary, value, op);
};
