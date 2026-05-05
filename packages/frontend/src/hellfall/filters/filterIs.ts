import { HCCard } from '@hellfall/shared/types';
import { funcOp, cardStringFilter, looseOpType, opType } from './types';
import { canBeACommander } from '../canBeACommander';
import { filterCardLayout, filterFaceLayout } from './filterPropValue';

export const filterIs: cardStringFilter = Object.assign(
  (value1: HCCard.Any, operator: looseOpType, value2: string) => {
    const actualOp = operator === ':' ? filterIs.defaultOp : operator;
    const resolveIs = (criteria: string) => {
      if (filterCardLayout(value1, actualOp, value2)) {
        return true;
      }
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
export const filterHas: cardStringFilter = Object.assign(
  (value1: HCCard.Any, operator: looseOpType, value2: string) => {
    const actualOp = operator === ':' ? filterHas.defaultOp : operator;
    const resolveHas = (criteria: string) => {
      if (filterFaceLayout(value1, actualOp, value2)) {
        return true;
      }
      switch (criteria) {
        case 'indicator':
          return Boolean(value1.toFaces().find(face => face.color_indicator));
      }
      return false;
    };
    return funcOp(actualOp, resolveHas, value2);
  },
  { defaultOp: '=' as opType }
);
