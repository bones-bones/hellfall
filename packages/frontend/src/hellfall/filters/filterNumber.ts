import { toNumber } from '../inputs/NumberSelector';
import { invertOptionType, numFilter, numStringFilter, numStringListFilter, opType } from './types';

export const filterNumber: numFilter = Object.assign(
  (value1: number, operator: opType, value2: number) => {
    switch (operator) {
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
    toSummary: (operator: opType, value: number, invert?: boolean) =>
      `${invert ? 'not' : ''} ${operator} ${value}`,
  }
);

export const filterNumberString: numStringFilter = Object.assign(
  (value1: number | string | undefined, operator: opType, value2: number | string | undefined) => {
    const num1 = typeof value1 == 'string' ? toNumber(value1) : value1;
    const num2 = typeof value2 == 'string' ? toNumber(value2) : value2;
    if (num1 == undefined || num2 == undefined) {
      return false;
    }
    return filterNumber(num1, operator, num2);
  },
  {
    invertOption: 'flip' as invertOptionType,
    toSummary: (operator: opType, value: number | string | undefined, invert?: boolean) => {
      const num = typeof value == 'string' ? toNumber(value) : value;
      if (num == undefined) {
        return `!The value must be a number (or convertible to one)`;
      }
      return `${invert ? 'not' : ''} ${operator} ${num}`;
    },
  }
);
export const filterNumberStringList: numStringListFilter = Object.assign(
  (
    value1: (number | string | undefined)[],
    operator: opType,
    value2: number | string | undefined
  ) => value1.some(value => filterNumberString(value, operator, value2)),
  {
    invertOption: 'flip' as invertOptionType,
    toSummary: (operator: opType, value: number | string | undefined, invert?: boolean) => {
      const num = typeof value == 'string' ? toNumber(value) : value;
      if (num == undefined) {
        return `!The value must be a number (or convertible to one)`;
      }
      return `${invert ? 'not' : ''} ${operator} ${num}`;
    },
  }
);
