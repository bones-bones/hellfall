import { HCCardSymbol } from '@hellfall/shared/types';
import {
  ensurePips,
  pipMap,
  pipsContainPips,
  pipsContainPipsGeneric,
  pipSearch,
  pipsEqualPips,
} from '@hellfall/shared/utils';
import { opType, pipFilterFunction, pipListFilterFunction, summaryFunction } from '../types';
import {
  containEqualsOp,
  containsOp,
  createNumSummary,
  includeEqualsOp,
  numFilter,
} from '../utils';

/**
 * Compares a set of pips with a pip search
 * @param value1 The set of pips from the card
 * @param operator The operator
 * @param value2 The value from the search
 */
export const pipFilter: pipFilterFunction = (
  value1: HCCardSymbol[],
  operator: opType,
  value2: pipSearch
) => {
  if (typeof value2 == 'number') {
    return numFilter(value1.length, operator, value2);
  }
  return containsOp(operator, pipsContainPipsGeneric, value1, value2);
};
/**
 * Compares a list of sets of pips with a pip search
 * @param value1 The list of sets of pips from the card
 * @param operator The operator
 * @param value2 The value from the search
 */
export const pipListFilter: pipListFilterFunction = (
  value1: HCCardSymbol[][],
  operator: opType,
  value2: pipSearch
) => value1.some(set => pipFilter(set, operator, value2));

/**
 * The summary for a mana cost filter
 * @param operator the operator to use
 * @param value the search value to use
 * @param invert whether the search is inverted
 */
export const manaSummary: summaryFunction<pipSearch> = (
  operator: opType,
  value: pipSearch,
  invert?: boolean
) => {
  if (typeof value == 'number') {
    return createNumSummary('the number of pips in the mana cost')(operator, value, invert);
  }
  if (typeof value == 'string') {
    const invalids = pipMap.getNonPipsFromSearch(value);
    if (invalids.length) {
      return `!Unknown pips ${invalids.map(s => `{${s}}`).join(', ')}`;
    }
  }
  return createNumSummary('the mana cost', true)(
    operator,
    ensurePips(value)
      .map(p => `{${p.symbol}}`)
      .join(''),
    invert
  );
};
// /**
//  * Compares a set of pips with a pip search
//  * @param value1 The set of pips from the card
//  * @param operator The operator
//  * @param value2 The value from the search
//  */
// export const pipDevotionFilter: pipFilterFunction = (
//   value1: HCCardSymbol[],
//   operator: opType,
//   value2: pipSearch
// ) => {
//   if (typeof value2 == 'number') {
//     return numFilter(value1.length, operator, value2);
//   }
//   return containsOp(operator, pipsContainPips, value1, value2);
// };
