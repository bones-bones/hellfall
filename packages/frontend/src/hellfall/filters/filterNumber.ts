import { toNumber } from '../inputs/NumberSelector';
import {
  getActualOp,
  looseOpType,
  NOPRINT,
  numFilter,
  numStringFilter,
  numStringListFilter,
  opType,
  textFilter,
} from './types';
import { isNumber } from '@hellfall/shared/utils/isInt.ts';

export const filterNumber: numFilter = Object.assign(
  function (this: numFilter, value1: number, operator: looseOpType, value2: number) {
    const actualOp = getActualOp(this, operator);

    switch (actualOp) {
      case '<':
        return value1 < value2;
      case '<=':
        return value1 <= value2;
      case '=':
        return value1 == value2;
      case '>=':
        return value1 >= value2;
      case '>':
        return value1 > value2;
      case '!=':
        return value1 != value2;
    }
  },
  {
    defaultOp: '=' as opType,
    toSummary: (value: number, operator: looseOpType) =>
      `${getActualOp(filterNumber, operator)} ${value}`,
  }
);

export const filterNumberString: numStringFilter = Object.assign(
  function (
    this: numStringFilter,
    value1: number | string | undefined,
    operator: looseOpType,
    value2: number | string | undefined
  ) {
    const actualOp = getActualOp(this, operator);
    const num1 = typeof value1 == 'string' ? toNumber(value1) : value1;
    const num2 = typeof value2 == 'string' ? toNumber(value2) : value2;
    if (num1 == undefined || num2 == undefined) {
      return false;
    }
    return filterNumber(num1, actualOp, num2);
  },
  {
    defaultOp: '=' as opType,
    toSummary: (value: number | string | undefined, operator: looseOpType) => {
      const num = typeof value == 'string' ? toNumber(value) : value;
      if (num == undefined) {
        return '!';
      }
      return `${getActualOp(filterNumber, operator)} ${num}`;
    },
  }
);
export const filterNumberStringList: numStringListFilter = Object.assign(
  function (
    this: numStringListFilter,
    value1: (number | string | undefined)[],
    operator: looseOpType,
    value2: number | string | undefined
  ) {
    const actualOp = getActualOp(this, operator);
    return value1.some(value => filterNumberString(value, actualOp, value2));
  },
  {
    defaultOp: '=' as opType,
    toSummary: (value: number | string | undefined, operator: looseOpType) => {
      const num = typeof value == 'string' ? toNumber(value) : value;
      if (num == undefined) {
        return '!';
      }
      return `${getActualOp(filterNumber, operator)} ${num}`;
    },
  }
);
export const filterCollectorNumber: textFilter = Object.assign(
  function (this: textFilter, value1: string, operator: looseOpType, value2: string) {
    const actualOp = getActualOp(this, operator);
    // if (actualOp == '=' && (!isNumber(value1) || !isNumber(value2))) {
    //   return value1 == value2
    // }
    // if (actualOp == '!=' && (!isNumber(value1) || !isNumber(value2))) {
    //   return value1 != value2
    // }
    return filterNumberString(value1, actualOp, value2);
  },
  { defaultOp: '=' as opType, toSummary: (value: string, operator: looseOpType) => NOPRINT }
);
