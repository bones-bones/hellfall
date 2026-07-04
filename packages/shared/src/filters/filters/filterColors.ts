import {
  colorFilterFunction,
  colorListFilterFunction,
  colorSearch,
  opType,
  shorthandType,
  shortToNum,
} from '../types';
import { containsOp, createColorSummary, numFilter } from '../utils';
import { listCanContainList, listContainsList, getHybridColorNumber } from '@hellfall/shared/utils';

const evalShortNum = (value1: number, operator: opType, value2: shorthandType) => {
  const shortNum = shortToNum(operator, value2);
  if (value2 == 'c') {
    return numFilter(value1, operator, shortNum);
  } else {
    switch (operator) {
      case '<':
      case '!=':
        return numFilter(value1, '<', shortNum);
      case '<=':
        return true;
      case '=':
      case '>=':
        return numFilter(value1, '>=', shortNum);
      case '>':
        return numFilter(value1, operator, shortNum);
    }
  }
};

/**
 * Compares a set of colors with a color search using an operator and returns a bool.
 * @param value1 The set of colors from the card
 * @param operator The operator
 * @param value2 The value from the search
 */
export const colorFilter: colorFilterFunction = (
  value1: string[],
  operator: opType,
  value2: colorSearch
) => {
  if (Array.isArray(value2)) {
    return containsOp(operator, listContainsList, value1, value2);
  }
  if (typeof value2 == 'number') {
    return numFilter(value1.length, operator, value2);
  }
  return evalShortNum(value1.length, operator, value2);
};

export const colorSummary = createColorSummary('colors', 'colors');

export const colorIdentitySummary = createColorSummary(
  'color identity',
  'identity colors',
  'identity'
);

/**
 * Compares a set of color indicators with a color search using an operator and returns a bool.
 * @param value1 The set of color indicators from the card
 * @param operator The operator
 * @param value2 The value from the search
 */
export const colorIndicatorFilter: colorListFilterFunction = (
  value1: string[][],
  operator: opType,
  value2: colorSearch
) => {
  if (Array.isArray(value2)) {
    return containsOp(operator, listCanContainList, value1, value2);
  }
  if (typeof value2 == 'number') {
    return numFilter(getHybridColorNumber(value1), operator, value2);
  }
  return evalShortNum(getHybridColorNumber(value1), operator, value2);
};

export const colorIndicatorSummary = createColorSummary(
  'color indicator',
  'indicator colors',
  'indicator'
);

/**
 * Compares a set of hybrid colors with a color search using an operator and returns a bool.
 * @param value1 The set of hybrid colors from the card
 * @param operator The operator
 * @param value2 The value from the search
 */
export const hybridIdentityFilter: colorListFilterFunction = (
  value1: string[][],
  operator: opType,
  value2: colorSearch
) => value1.some(set => colorFilter(set, operator, value2));

export const hybridIdentitySummary = createColorSummary(
  'hybrid color identity',
  'hybrid identity colors',
  'hybrid identity'
);
