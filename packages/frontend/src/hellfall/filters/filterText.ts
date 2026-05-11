import { textEquals, textSearchIncludes } from '@hellfall/shared/utils/textHandling';
import {
  cardStringFilter,
  invertOptionType,
  looseOpType,
  NOPRINT,
  opType,
  tagFilter,
  textFilter,
  textListFilter,
  textRecordFilter,
} from './types';
import {
  funcOp,
  getActualOp,
  invertOp,
  opToIncludePlural,
  opToIncludeSingular,
  opIsNegative,
  opToNot,
  opToTagged,
  includeEqualsOp,
} from './filterUtils';
import { isNumber } from '@hellfall/shared/utils/isInt';
import { filterNumber } from './filterNumber';
import { HCCard } from '@hellfall/shared/types';
import { getAllNames } from '../getNames';

export const filterEmpty: textFilter = Object.assign(
  (value1: string, operator: looseOpType, value2: string) => true,
  {
    invertOption: 'ignore' as invertOptionType,
    toSummary: (operator: opType, value: string) => '!',
  }
);

export const filterText: textFilter = Object.assign(
  (value1: string, operator: opType, value2: string) =>
    includeEqualsOp(operator, textSearchIncludes, textEquals, value1, value2),
  {
    invertOption: 'negate' as invertOptionType,
    toSummary: (operator: opType, value: string) => NOPRINT,
  }
);

export const filterId: textFilter = Object.assign(
  (value1: string, operator: opType, value2: string) => {
    if (isNumber(value2)) {
      return isNumber(value1) ? filterNumber(parseInt(value1), operator, parseInt(value2)) : false;
    }
    return filterText(value1, operator, value2);
  },
  {
    invertOption: 'negate' as invertOptionType,
    toSummary: (operator: opType, value: string, invert?: boolean) => {
      if (isNumber(value)) {
        return `the id is ${filterNumber.toSummary(operator, parseInt(value), invert)}`;
      }
      return `the id ${opToIncludeSingular(operator, value, invert)}`;
    },
  }
);

const textListIncludes = (value1: string[], value2: string) =>
  value1.some(text => textSearchIncludes(text, value2));
const textListEquals = (value1: string[], value2: string) =>
  value1.some(text => textEquals(text, value2));
export const filterTextList: textListFilter = Object.assign(
  (value1: string[], operator: opType, value2: string) =>
    includeEqualsOp(operator, textListIncludes, textListEquals, value1, value2),
  {
    invertOption: 'negate' as invertOptionType,
    toSummary: (operator: opType, value: string) => NOPRINT,
  }
);
export const filterTag: tagFilter = Object.assign(
  (value1: string[], operator: opType, value2: string, tag_notes?: Record<string, string>) => {
    if (value2.endsWith('<')) {
      const tag = value2.slice(0, -1);
      return Boolean(tag_notes && filterTextList(Object.keys(tag_notes), operator, tag));
    }
    if (value2.endsWith('>') && value2.includes('<')) {
      if (!tag_notes) {
        return false;
      }
      const [tag, note] = [value2.split('<')[0], value2.split('<')[1].slice(0, -1)];
      // return tag_notes && textEquals(tag_notes[tag], note);
      return includeEqualsOp(operator, textSearchIncludes, textEquals, tag_notes[tag], note);
    }
    return includeEqualsOp(operator, textListIncludes, textListEquals, value1, value2);
  },
  {
    invertOption: 'negate' as invertOptionType,
    toSummary: (operator: opType, value: string, invert?: boolean) =>
      `the card is ${opToTagged(operator, value, invert)}`,
  }
);
