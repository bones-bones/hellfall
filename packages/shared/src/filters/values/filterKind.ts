import { opType, textFilter, invertOptionType } from '../types';
import { createSummary, opAsBool, opToNot } from '../filterUtils';
import { isKind } from '@hellfall/shared/types';

export const filterKind: textFilter = Object.assign(
  (value1: string, operator: opType, value2: string) => opAsBool(value1 == value2, operator),
  {
    invertOption: 'flip' as invertOptionType,
    toSummary: createSummary(
      isKind,
      (operator, value) => `the kind is ${opToNot(operator)} "${value}"`,
      (operator, value) => `!Unknown kind "${value}"`
    ),
  }
);
