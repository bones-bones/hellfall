import { opType, textFilter, invertOptionType } from '../types';
import { opAsBool, opToNot } from '../filterUtils';
import { HCKind, isKind } from '@hellfall/shared/types';

export const filterKind: textFilter = Object.assign(
  (value1: string, operator: opType, value2: string) => opAsBool(value1 == value2, operator),
  {
    invertOption: 'flip' as invertOptionType,
    toSummary: (operator: opType, value: string) => {
      if (isKind(value)) {
        return `the kind is ${opToNot(operator)} "${value}"`;
      } else {
        return `!Unknown kind "${value}"`;
      }
    },
  }
);
