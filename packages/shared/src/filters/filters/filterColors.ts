import { colorFilterFunction, colorListFilterFunction, opType, shortToNum } from '../types';
import { containsOp, createColorSummary, numFilter } from '../utils';
import {
  listCanContainList,
  listContainsList,
  getHybridColorNumber,
  colorSearch,
  shorthandType,
} from '@hellfall/shared/utils';

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
 * Compares a set of colors with a color search
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

/**
 * The summary for a color filter
 * @param operator the operator to use
 * @param value the search value to use
 * @param invert whether the search is inverted
 */
export const colorSummary = createColorSummary('colors', 'colors');

/**
 * The summary for a color identity filter
 * @param operator the operator to use
 * @param value the search value to use
 * @param invert whether the search is inverted
 */
export const colorIdentitySummary = createColorSummary(
  'color identity',
  'identity colors',
  'identity'
);

/**
 * Compares a set of color indicators with a color search
 * @param value1 The set of color indicators from the card
 * @param operator The operator
 * @param value2 The value from the search
 */
export const colorIndicatorFilter: colorListFilterFunction = (
  value1: string[][],
  operator: opType,
  value2: colorSearch
) => value1.some(set => colorFilter(set, operator, value2));

/**
 * The summary for a color indicator filter
 * @param operator the operator to use
 * @param value the search value to use
 * @param invert whether the search is inverted
 */
export const colorIndicatorSummary = createColorSummary(
  'color indicator',
  'indicator colors',
  'indicator'
);

/**
 * Compares a set of hybrid colors with a color search
 * @param value1 The set of hybrid colors from the card
 * @param operator The operator
 * @param value2 The value from the search
 */
export const hybridIdentityFilter: colorListFilterFunction = (
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

/**
 * The summary for a hybrid identity filter
 * @param operator the operator to use
 * @param value the search value to use
 * @param invert whether the search is inverted
 */
export const hybridIdentitySummary = createColorSummary(
  'hybrid color identity',
  'hybrid identity colors',
  'hybrid identity'
);
/**
 * The summary for a misc color filter
 * @param operator the operator to use
 * @param value the search value to use
 * @param invert whether the search is inverted
 */
export const miscColorSummary = createColorSummary('misc colors', 'misc colors');

/**
 * The summary for a misc color identity filter
 * @param operator the operator to use
 * @param value the search value to use
 * @param invert whether the search is inverted
 */
export const miscColorIdentitySummary = createColorSummary(
  'misc color identity',
  'misc identity colors',
  'misc identity'
);
/**
 * The summary for a misc color indicator filter
 * @param operator the operator to use
 * @param value the search value to use
 * @param invert whether the search is inverted
 */
export const miscColorIndicatorSummary = createColorSummary(
  'misc color indicator',
  'misc indicator colors',
  'misc indicator'
);
/**
 * The summary for a misc hybrid identity filter
 * @param operator the operator to use
 * @param value the search value to use
 * @param invert whether the search is inverted
 */
export const miscHybridIdentitySummary = createColorSummary(
  'misc hybrid color identity',
  'misc hybrid identity colors',
  'misc hybrid identity'
);
