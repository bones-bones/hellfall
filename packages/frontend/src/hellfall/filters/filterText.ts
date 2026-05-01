import { textEquals, textSearchIncludes } from '@hellfall/shared/utils/textHandling';
import { looseOpType, opType, textFilter, textListFilter, textRecordFilter } from './types';

export const filterText: textFilter = Object.assign(
  (value1: string, operator: looseOpType, value2: string) => {
    const actualOp = operator === ':' ? filterText.defaultOp : operator;

    switch (actualOp) {
      case '>=':
        return textSearchIncludes(value1, value2);
      case '>':
        return textSearchIncludes(value1, value2) && !textEquals(value1, value2);
      case '=':
        return textEquals(value1, value2);
      case '<':
        return !textSearchIncludes(value1, value2);
      case '<=':
        return !textSearchIncludes(value1, value2) || textEquals(value1, value2);
      case '!=':
        return !textEquals(value1, value2);
    }
  },
  { defaultOp: '>=' as opType }
);
export const filterTextList: textListFilter = Object.assign(
  (value1: string[], operator: looseOpType, value2: string) => {
    const actualOp = operator === ':' ? filterText.defaultOp : operator;

    switch (actualOp) {
      case '>=':
        return value1.some(text => textSearchIncludes(text, value2));
      case '>':
        return (
          value1.some(text => textSearchIncludes(text, value2)) &&
          !value1.some(text => textEquals(text, value2))
        );
      case '=':
        return value1.some(text => textEquals(text, value2));
      case '<':
        return !value1.some(text => textSearchIncludes(text, value2));
      case '<=':
        return (
          !value1.some(text => textSearchIncludes(text, value2)) ||
          value1.some(text => textEquals(text, value2))
        );
      case '!=':
        return !value1.some(text => textEquals(text, value2));
    }
  },
  { defaultOp: '>=' as opType }
);

