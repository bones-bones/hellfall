import { HCColors, HCMiscColors } from '../../types';
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
import { canContainOp, containsOp, opToShorthand } from '../filterUtils';
import { filterNumber } from '../filterNumber';
import { canContain, contains } from '../../utils';
const MISC_BULLSHIT = 'Misc';

/**
 * Compares two sets of colors using an operator and returns a bool.
 * @param value1 The first set of colors to compare (must not include 'C' unless that is its only member; must not be empty)
 * @param operator The operator
 * @param value2 The second set of colors to compare (can include 'C' alongside other members, in which case 'C' is treated as the only member; must not be empty)
 * @returns boolean of whether the comparison is true
 */
export const filterColorContents: colorContentFilter = Object.assign(
  (value1: string[], operator: opType, value2: string[]) =>
    containsOp(operator, contains, value1, value2),
  {
    invertOption: 'negate' as invertOptionType,
    toSummary: (operator: opType, value: string[], invert?: boolean) =>
      `the colors are ${invert ? 'not' : ''} ${operator} ${value.join('')}`,
  }
);

export const filterColorNumber: colorNumFilter = Object.assign(
  (value1: string[], operator: opType, value2: number) =>
    filterNumber(value1.length, operator, value2),
  {
    invertOption: 'negate' as invertOptionType,
    toSummary: (operator: opType, value: string[] | number, invert?: boolean) =>
      `the number of colors is ${filterNumber.toSummary(operator, value, invert)}`,
  }
);

export const evalShortNum = (value1: number, operator: opType, value2: shorthandType): boolean => {
  const shortNum = shortToNum(operator, value2);
  if (value2 == 'c') {
    return filterNumber(value1, operator, shortNum);
  } else {
    switch (operator) {
      case '<':
      case '!=':
        return filterNumber(value1, '<', shortNum);
      case '<=':
        return true;
      case '=':
      case '>=':
        return filterNumber(value1, '>=', shortNum);
      case '>':
        return filterNumber(value1, operator, shortNum);
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
  (value1: string[], operator: opType, value2: number) =>
    filterNumber(value1.length, operator, value2),
  {
    invertOption: 'negate' as invertOptionType,
    toSummary: (operator: opType, value: string[] | number, invert?: boolean) =>
      `the number of identity colors is ${filterNumber.toSummary(operator, value, invert)}`,
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
    value1.some(set => filterNumber(set.length, operator, value2)),
  {
    invertOption: 'negate' as invertOptionType,
    toSummary: (operator: opType, value: string[] | number, invert?: boolean) =>
      `the number of indicator colors is ${filterNumber.toSummary(operator, value, invert)}`,
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
    canContainOp(operator, canContain, value1, value2),
  {
    invertOption: 'negate' as invertOptionType,
    toSummary: (operator: opType, value: string[], invert?: boolean) =>
      `the hybrid color identity is ${invert ? 'not' : ''} ${operator} ${value.join('')}`,
  }
);

const getSubsets = (set: string[], len: number): string[][] => {
  const result: string[][] = [];

  const backtrack = (start: number, current: string[]) => {
    if (current.length === len) {
      result.push([...current]);
      return;
    }

    for (let i = start; i < set.length; i++) {
      current.push(set[i]);
      backtrack(i + 1, current);
      current.pop();
    }
  };

  backtrack(0, []);
  return result;
};
const findMinNum = (hybridColors: string[][]): number => {
  const allColors = Array.from(new Set(hybridColors.flat()));
  if (!allColors.length) {
    return 0;
  }
  const isMatch = (colors: string[]) => hybridColors.every(s => colors.some(c => s.includes(c)));
  for (let i = 1; i < allColors.length; i++) {
    if (getSubsets(allColors, i).some(subset => isMatch(subset))) {
      return i;
    }
  }
  return allColors.length;
};
export const getHybridColorNumber = (hybrid: string[][]) => {
  const monoList = hybrid.flatMap(colors => (colors.length == 1 ? colors : []));
  const hybridColors = hybrid.filter(colors => colors.length > 1);
  return monoList.length + findMinNum(hybridColors);
};

/**
 * Compares two sets of colors using an operator and returns a bool.
 * @param value1 The set of hybrid colors to compare (must not include 'C'; can be empty)
 * @param operator The operator
 * @param value2 The second set or number of colors to compare
 * @returns boolean of whether the comparison is true
 */
export const filterHybridIdentityNumber: hybridNumFilter = Object.assign(
  (value1: string[][], operator: opType, value2: number) =>
    filterNumber(getHybridColorNumber(value1), operator, value2),
  {
    invertOption: 'negate' as invertOptionType,
    toSummary: (operator: opType, value: string[] | number, invert?: boolean) =>
      `the number of hybrid identity colors is ${filterNumber.toSummary(operator, value, invert)}`,
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

/**
 * Reduces down a card's colors to one compatible with search colors.
 * @param colors card's colors
 * @returns
 */
export const colorMiscReduce = (colors: HCColors | string[]): string[] => {
  const newColors: string[] = [];
  colors
    .map(c => (HCMiscColors.includes(c) ? MISC_BULLSHIT : c))
    .forEach(c => {
      if (!newColors.includes(c)) {
        newColors.push(c);
      }
    });
  return newColors;
};
/**
 * Reduces down a card's hybrid identity set to one compatible with search colors.
 * @param hybridColors hybrid color identity
 * @returns
 */
export const hybridIdentityMiscReduce = (hybridColors: HCColors[] | string[][]): string[][] => {
  const newColors: string[][] = [];
  hybridColors
    .map(set => {
      if (set.some(c => HCMiscColors.includes(c))) {
        const newSet: string[] = [MISC_BULLSHIT];
        set
          .filter(c => !HCMiscColors.includes(c))
          .forEach(c => {
            newSet.push(c);
          });
        return newSet;
      } else {
        return set;
      }
    })
    .forEach(colors => {
      if (!newColors.some(set => set.every(c => colors.includes(c)))) {
        for (let i = newColors.length - 1; i >= 0; i--) {
          // if the new set is completely inside the existing set, delete the existing one
          if (colors.every(c => newColors[i].includes(c))) {
            newColors.splice(i, 1);
          }
        }
        newColors.push(colors);
      }
    });
  return newColors;
};
