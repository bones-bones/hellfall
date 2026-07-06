import { comparisonFilter, comparisonSummary } from '../filters';
import { looseOpType } from '../types';
import {
  ComparisonFilter,
  NumberPropFilter,
  comparisonFilterMaker,
  numberPropFilterMaker,
} from '../utils';

/**
 * Makes a {@linkcode ComparisonFilter}
 * @param value1 the first value from the search
 * @param op the operator from the search
 * @param value2 the second value from the search
 */
export const makeCompFilter: comparisonFilterMaker = (
  value1: string,
  op: looseOpType,
  value2: string
) => {
  return new ComparisonFilter('comp', comparisonFilter, comparisonSummary, value1, op, value2);
};

/**
 * Makes a collector number filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeCollectorNumFilter: numberPropFilterMaker = (value: string, op: looseOpType) => {
  return new NumberPropFilter('number', value, op);
};

/**
 * Makes a mana value filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeManaValueFilter: numberPropFilterMaker = (value: string, op: looseOpType) => {
  return new NumberPropFilter('manavalue', value, op);
};
/**
 * Makes a power filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makePowerFilter: numberPropFilterMaker = (value: string, op: looseOpType) => {
  return new NumberPropFilter('power', value, op);
};
/**
 * Makes a toughness filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeToughnessFilter: numberPropFilterMaker = (value: string, op: looseOpType) => {
  return new NumberPropFilter('toughness', value, op);
};

/**
 * Makes a power + toughness filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makePTFilter: numberPropFilterMaker = (value: string, op: looseOpType) => {
  return new NumberPropFilter('pt', value, op, 'sum of power and toughness');
};

/**
 * Makes a loyalty filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeLoyaltyFilter: numberPropFilterMaker = (value: string, op: looseOpType) => {
  return new NumberPropFilter('loyalty', value, op);
};

/**
 * Makes a defense filter
 * @param value the value from the search
 * @param op the operator from the search
 */
export const makeDefenseFilter: numberPropFilterMaker = (value: string, op: looseOpType) => {
  return new NumberPropFilter('defense', value, op);
};
