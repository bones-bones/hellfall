import {
  setsNumberSummary,
  printsNumberSummary,
  inSummary,
  getSetNumber,
  isUniqueSummary,
  toIn,
} from '../filters';
import { looseOpType, allPrintsGetterType } from '../types';
import { printsFilterMaker, InFilter, PrintsNumberFilter } from '../utils';
/**
 * Makes an {@linkcode InFilter}
 * @param value the value from the search
 * @param op the operator from the search
 * @param getAllPrints a function that gets all prints of a card
 */
export const makeInFilter: printsFilterMaker = (
  value: string,
  op: looseOpType,
  getAllPrints: allPrintsGetterType
) => {
  return new InFilter('in', inSummary, value, op, getAllPrints, toIn);
};

/**
 * Makes a sets number filter
 * @param value the value from the search
 * @param op the operator from the search
 * @param getAllPrints a function that gets all prints of a card
 */
export const makeSetsNumberFilter: printsFilterMaker = (
  value: string,
  op: looseOpType,
  getAllPrints: allPrintsGetterType
) => {
  return new PrintsNumberFilter('sets', value, op, setsNumberSummary, getAllPrints, getSetNumber);
};
/**
 * Makes a prints number filter
 * @param value the value from the search
 * @param op the operator from the search
 * @param getAllPrints a function that gets all prints of a card
 */
export const makePrintsNumberFilter: printsFilterMaker = (
  value: string,
  op: looseOpType,
  getAllPrints: allPrintsGetterType
) => {
  return new PrintsNumberFilter('prints', value, op, printsNumberSummary, getAllPrints);
};
/**
 * Makes a uniqueness filter
 * @param value dummy
 * @param op the operator from the search
 * @param getAllPrints a function that gets all prints of a card
 */
export const makeIsUniqueFilter: printsFilterMaker = (
  value: string,
  op: looseOpType,
  getAllPrints: allPrintsGetterType
) => {
  return new PrintsNumberFilter('is', '1', op, isUniqueSummary, getAllPrints, getSetNumber);
};
