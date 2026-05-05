import { HCCard } from '@hellfall/shared/types';
import { funcOp, cardStringFilter, looseOpType, opType } from './types';
import { canBeACommander } from '../canBeACommander';

export const filterIs: cardStringFilter = Object.assign(
  (value1: HCCard.Any, operator: looseOpType, value2: string) => {
    const actualOp = operator === ':' ? filterIs.defaultOp : operator;
    const resolveIs = (criteria: string) => {
      switch (criteria) {
        case 'commander':
          return canBeACommander(value1);
      }
      return false;
    };
    return funcOp(actualOp, resolveIs, value2);
  },
  { defaultOp: '=' as opType }
);
