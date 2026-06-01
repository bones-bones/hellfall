import { opType, textFilter, invertOptionType } from '../types';
import { funcOp, opToNot } from '../filterUtils';
import { HCKind } from '@hellfall/shared/types';

export const filterKind: textFilter = Object.assign(
  (value1: string, operator: opType, value2: string) =>
    funcOp(operator, (kind: string) => value1 == kind, value2),
  {
    invertOption: 'flip' as invertOptionType,
    toSummary: (operator: opType, value: string) => {
      if (Object.values(HCKind).includes(value as HCKind)) {
        return `the kind is ${opToNot(operator)} "${value}"`;
      } else {
        return `!Unknown kind "${value}"`;
      }
    },
  }
);
