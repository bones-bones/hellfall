import { opType, textFilterFunction, invertOptionType } from '../types';
import { createSummary, opAsBool, opToNot } from '../utils';
import { isKind } from '@hellfall/shared/types';

export const kindFilter: textFilterFunction = (value1: string, operator: opType, value2: string) =>
  opAsBool(value1 == value2, operator);
export const kindSummary = createSummary(
  isKind,
  (operator, value) => `the kind is ${opToNot(operator)} "${value}"`,
  (operator, value) => `!Unknown kind "${value}"`
);
