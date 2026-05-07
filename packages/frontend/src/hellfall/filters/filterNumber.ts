import { toNumber } from '../inputs/NumberSelector';
import {
  getActualOp,
  invertOptionType,
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
    invertOption: 'flip' as invertOptionType,
    defaultOp: '=' as opType,
    toSummary: (operator: looseOpType, value: number, invert?: boolean) =>
      `${invert ? 'not' : ''} ${getActualOp(filterNumber, operator)} ${value}`,
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
    invertOption: 'flip' as invertOptionType,
    defaultOp: '=' as opType,
    toSummary: (operator: looseOpType, value: number | string | undefined, invert?: boolean) => {
      const num = typeof value == 'string' ? toNumber(value) : value;
      if (num == undefined) {
        return '!';
      }
      return `${invert ? 'not' : ''} ${getActualOp(filterNumberString, operator)} ${num}`;
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
    invertOption: 'flip' as invertOptionType,
    defaultOp: '=' as opType,
    toSummary: (operator: looseOpType, value: number | string | undefined, invert?: boolean) => {
      const num = typeof value == 'string' ? toNumber(value) : value;
      if (num == undefined) {
        return '!';
      }
      return `${invert ? 'not' : ''} ${getActualOp(filterNumberStringList, operator)} ${num}`;
    },
  }
);
