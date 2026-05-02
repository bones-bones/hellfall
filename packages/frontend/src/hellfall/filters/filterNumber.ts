import { toNumber } from "../inputs/NumberSelector";
import { looseOpType, numFilter, numStringFilter, opType, textFilter } from "./types";
import {isNumber} from "@hellfall/shared/utils/isInt.ts"

export const filterNumber:numFilter = Object.assign(
  (value1: number, operator: looseOpType, value2: number) => {
    const actualOp = operator === ':' ? filterNumber.defaultOp : operator;

    switch (actualOp) {
      case '>=':
        return value1 >= value2;
      case '>':
        return value1 > value2;
      case '=':
        return value1 == value2;
      case '<':
        return value1 < value2;
      case '<=':
        return value1 <= value2;
      case '!=':
        return value1 != value2;
    }
  },
  { defaultOp: '=' as opType }
);

export const filterNumberString:numStringFilter = Object.assign(
  (value1: number|string|undefined, operator: looseOpType, value2: number|string|undefined) => {
  const actualOp = operator === ':' ? filterNumberString.defaultOp : operator;
  const num1 = typeof value1 == 'string' ? toNumber(value1) : value1;
  const num2 = typeof value2 == 'string' ? toNumber(value2) : value2;
  if (num1 == undefined || num2 == undefined) {
    return false;
  }
  return filterNumber(num1,actualOp,num2);
  },
  { defaultOp: '=' as opType }
);
export const filterCollectorNumber:textFilter = Object.assign(
  (value1: string, operator: looseOpType, value2: string) => {
  const actualOp = operator === ':' ? filterCollectorNumber.defaultOp : operator;
  // if (actualOp == '=' && (!isNumber(value1) || !isNumber(value2))) {
  //   return value1 == value2
  // }
  // if (actualOp == '!=' && (!isNumber(value1) || !isNumber(value2))) {
  //   return value1 != value2
  // }
  return filterNumberString(value1,actualOp,value2);
  },
  { defaultOp: '=' as opType }
);
