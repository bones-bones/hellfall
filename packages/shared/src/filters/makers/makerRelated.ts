import { hasRelatedFilter, hasRelatedSummary, isRelatedFilter, isRelatedSummary } from '../filters';
import { StateFilter, looseOpType, stateFilterMaker } from '../types';

/**
 * Makes a filter that uses {@linkcode isRelatedFilter}
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeIsRelatedFilter: stateFilterMaker = (value: string, op: looseOpType) => {
  return new StateFilter('isrelated', isRelatedFilter, isRelatedSummary, value, op);
};
/**
 * Makes a filter that uses {@linkcode hasRelatedFilter}
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeHasRelatedFilter: stateFilterMaker = (value: string, op: looseOpType) => {
  return new StateFilter('hasrelated', hasRelatedFilter, hasRelatedSummary, value, op);
};
