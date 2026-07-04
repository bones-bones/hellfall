import { HCCard, isFormat } from '@hellfall/shared/types';
import { comparisonFilterFunction, comparisonSummaryFunction, opType } from '../types';
import { opAsBool, opToNot, unescapeText } from '../utils';

/**
 *
 * @param value1
 * @param operator
 * @param value2 the legality to check for
 * @param value3 the format to check for
 * @returns
 */
export const legalityFilter: comparisonFilterFunction = (
  value1: HCCard.Any,
  operator: opType,
  value2: string,
  value3: string
) => opAsBool(unescapeText(value1.legalities[value3]) == unescapeText(value2), operator);
export const legalitySummary: comparisonSummaryFunction = (
  operator: opType,
  value1: string,
  invert?: boolean,
  value2?: string
) =>
  isFormat(value2)
    ? `it's ${opToNot(operator)} ${unescapeText(value1)} in ${value2}`
    : `!Unknown format "${value2}"`;
