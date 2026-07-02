import {
  colorContentFilter,
  colorContentListFilter,
  colorNumFilter,
  colorNumListFilter,
  colorShortFilter,
  colorShortListFilter,
  hybridContentFilter,
  hybridNumFilter,
  hybridShortFilter,
  invertOptionType,
  opType,
  shorthandType,
  shortToNum,
} from '../types';
import { canContainOp, containsOp, createNumSummary, numOp, opToShorthand } from '../utils';
import { listCanContainList, listContainsList, getHybridColorNumber } from '@hellfall/shared/utils';

/**
 * Compares two sets of colors using an operator and returns a bool.
 * @param value1 The first set of colors to compare (must not include 'C' unless that is its only member; must not be empty)
 * @param operator The operator
 * @param value2 The second set of colors to compare (can include 'C' alongside other members, in which case 'C' is treated as the only member; must not be empty)
 * @returns boolean of whether the comparison is true
 */
export const filterColorContents: colorContentFilter = Object.assign(
  (value1: string[], operator: opType, value2: string[]) =>
    containsOp(operator, listContainsList, value1, value2),
  {
    invertOption: 'negate' as invertOptionType,
    toSummary: (operator: opType, value: string[], invert?: boolean) =>
      `the colors are ${invert ? 'not' : ''} ${operator} ${value.join('')}`,
  }
);

export const filterColorNumber: colorNumFilter = Object.assign(
  (value1: string[], operator: opType, value2: number) => numOp(value1.length, operator, value2),
  {
    invertOption: 'negate' as invertOptionType,
    toSummary: createNumSummary('the number of colors is'),
  }
);

const evalShortNum = (value1: number, operator: opType, value2: shorthandType) => {
  const shortNum = shortToNum(operator, value2);
  if (value2 == 'c') {
    return numOp(value1, operator, shortNum);
  } else {
    switch (operator) {
      case '<':
      case '!=':
        return numOp(value1, '<', shortNum);
      case '<=':
        return true;
      case '=':
      case '>=':
        return numOp(value1, '>=', shortNum);
      case '>':
        return numOp(value1, operator, shortNum);
    }
  }
};
export const filterColorShort: colorShortFilter = Object.assign(
  (value1: string[], operator: opType, value2: shorthandType) =>
    evalShortNum(value1.length, operator, value2),
  {
    invertOption: 'negate' as invertOptionType,
    toSummary: (operator: opType, value: shorthandType, invert?: boolean) =>
      `the cards are${invert ? "n't" : ''} ${opToShorthand(operator, value)}`,
  }
);

/**
 * Compares two sets of colors for a identity search using an operator and returns a bool.
 * @param value1 The first set of colors to compare (must not include 'C' unless that is its only member; must not be empty)
 * @param operator The operator
 * @param value2 The second set of colors to compare (can include 'C' alongside other members, in which case 'C' is treated as the only member; must not be empty)
 * @returns boolean of whether the comparison is true
 */
export const filterColorIdentityContents: colorContentFilter = Object.assign(
  (value1: string[], operator: opType, value2: string[]) =>
    filterColorContents(value1, operator, value2),
  {
    invertOption: 'negate' as invertOptionType,
    toSummary: (operator: opType, value: string[], invert?: boolean) =>
      `the color identity is ${invert ? 'not' : ''} ${operator} ${value.join('')}`,
  }
);

export const filterColorIdentityNumber: colorNumFilter = Object.assign(
  (value1: string[], operator: opType, value2: number) => numOp(value1.length, operator, value2),
  {
    invertOption: 'negate' as invertOptionType,
    toSummary: createNumSummary('the number of identity colors is'),
  }
);

export const filterColorIdentityShort: colorShortFilter = Object.assign(
  (value1: string[], operator: opType, value2: shorthandType) =>
    evalShortNum(value1.length, operator, value2),
  {
    invertOption: 'negate' as invertOptionType,
    toSummary: (operator: opType, value: shorthandType, invert?: boolean) =>
      `the cards ${invert ? "don't" : ''} have ${
        opToShorthand(operator, value) == 'any color' ? '' : 'a'
      } ${opToShorthand(operator, value)} identity`,
  }
);

export const filterColorIndicatorContents: colorContentListFilter = Object.assign(
  (value1: string[][], operator: opType, value2: string[]) =>
    value1.some(set => filterColorContents(set, operator, value2)),
  {
    invertOption: 'negate' as invertOptionType,
    toSummary: (operator: opType, value: string[], invert?: boolean) =>
      `the color indicator is ${invert ? 'not' : ''} ${operator} ${value.join('')}`,
  }
);

export const filterColorIndicatorNumber: colorNumListFilter = Object.assign(
  (value1: string[][], operator: opType, value2: number) =>
    value1.some(set => numOp(set.length, operator, value2)),
  {
    invertOption: 'negate' as invertOptionType,
    toSummary: createNumSummary('the number of indicator colors is'),
  }
);

export const filterColorIndicatorShort: colorShortListFilter = Object.assign(
  (value1: string[][], operator: opType, value2: shorthandType) =>
    value1.some(set => evalShortNum(set.length, operator, value2)),
  {
    invertOption: 'negate' as invertOptionType,
    toSummary: (operator: opType, value: shorthandType, invert?: boolean) =>
      `the cards ${invert ? "don't" : ''} have ${
        opToShorthand(operator, value) == 'any color' ? '' : 'a'
      } ${opToShorthand(operator, value)} indicator`,
  }
);

/**
 * Compares two sets of colors using an operator and returns a bool.
 * @param value1 The set of hybrid colors to compare (must not include 'C'; can be empty)
 * @param operator The operator
 * @param value2 The set of colors to compare (can include 'C' alongside other members, in which case 'C' is treated as the only member; must not be empty)
 * @returns boolean of whether the comparison is true
 */
export const filterHybridIdentityContents: hybridContentFilter = Object.assign(
  (value1: string[][], operator: opType, value2: string[]) =>
    canContainOp(operator, listCanContainList, value1, value2),
  {
    invertOption: 'negate' as invertOptionType,
    toSummary: (operator: opType, value: string[], invert?: boolean) =>
      `the hybrid color identity is ${invert ? 'not' : ''} ${operator} ${value.join('')}`,
  }
);

/**
 * Compares two sets of colors using an operator and returns a bool.
 * @param value1 The set of hybrid colors to compare (must not include 'C'; can be empty)
 * @param operator The operator
 * @param value2 The second set or number of colors to compare
 * @returns boolean of whether the comparison is true
 */
export const filterHybridIdentityNumber: hybridNumFilter = Object.assign(
  (value1: string[][], operator: opType, value2: number) =>
    numOp(getHybridColorNumber(value1), operator, value2),
  {
    invertOption: 'negate' as invertOptionType,
    toSummary: createNumSummary('the number of hybrid identity colors is'),
  }
);

export const filterHybridIdentityShort: hybridShortFilter = Object.assign(
  (value1: string[][], operator: opType, value2: shorthandType) =>
    evalShortNum(getHybridColorNumber(value1), operator, value2),
  {
    invertOption: 'negate' as invertOptionType,
    toSummary: (operator: opType, value: shorthandType, invert?: boolean) =>
      `the cards ${invert ? "don't" : ''} have ${
        opToShorthand(operator, value) == 'any color' ? '' : 'a'
      } ${opToShorthand(operator, value)} hybrid identity`,
  }
);
