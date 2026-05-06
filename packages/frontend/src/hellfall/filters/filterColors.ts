import { HCColors, HCMiscColors } from '@hellfall/shared/types';
import {
  colorContentFilter,
  colorContentListFilter,
  colorFilter,
  colorListFilter,
  containsOp,
  getActualOp,
  hybridContentFilter,
  hybridFilter,
  looseOpType,
  NOPRINT,
  opType,
} from './types';
import { filterNumber } from './filterNumber';
const MISC_BULLSHIT = 'Misc bullshit';
//Object.values(HCMiscColor); /**as unknown as HCColor[] */

/**
 * Checks whether two color sets are the same colors.
 * @param colors1 The first set of colors to compare
 * @param colors2 The second set of colors to compare
 * @returns boolean of whether the sets are the same colors.
 */
export const sameColors = (colors1: HCColors | string[], colors2: HCColors | string[]) => {
  const colorsToUse = colors1.filter(c => c != 'C') as string[];
  contains(colorsToUse, colors2) && contains(colors2, colorsToUse);
};
const contains = (set1: string[], set2: string[]) => set2.every(c => set1.includes(c));
/**
 * Compares two sets of colors using an operator and returns a bool.
 * @param value1 The first set of colors to compare (must not include 'C' unless that is its only member; must not be empty)
 * @param operator The operator
 * @param value2 The second set of colors to compare (can include 'C' alongside other members, in which case 'C' is treated as the only member; must not be empty)
 * @returns boolean of whether the comparison is true
 */
export const filterColorContents: colorContentFilter = Object.assign(
  function (this: colorContentFilter, value1: string[], operator: looseOpType, value2: string[]) {
    const actualOp = getActualOp(this, operator);
    if (value2.includes('C')) {
      switch (actualOp) {
        case '<': {
          return false;
        }
        case '<=': {
          return value1.length == 0;
        }
        case '=': {
          return value1.length == 0;
        }
        case '>=': {
          return true;
        }
        case '>': {
          return value1.length != 0;
        }
        case '!=': {
          return value1.length != 0;
        }
      }
    } else {
      return containsOp(actualOp, contains, value1, value2);
    }
  },
  {
    defaultOp: '>=' as opType,
    toSummary: (value: string[], operator: looseOpType) =>
      `the colors are ${getActualOp(filterColorContents, operator)} ${value.join('')}`,
  }
);

/**
 * Compares two sets of colors using an operator and returns a bool.
 * @param value1 The first set of colors to compare (must not include 'C' unless that is its only member; must not be empty)
 * @param operator The operator
 * @param value2 The second set or number of colors to compare
 * @returns boolean of whether the comparison is true
 */
export const filterColors: colorFilter = Object.assign(
  (value1: string[], operator: looseOpType, value2: string[] | number) => {
    if (typeof value2 == 'number') {
      return filterNumber(value1.length, operator, value2);
    } else {
      return filterColorContents(value1, operator, value2);
    }
  },
  {
    defaultOp: '>=' as opType,
    toSummary: (value: string[] | number, operator: looseOpType) => {
      if (Array.isArray(value)) {
        return filterColorContents.toSummary(value, operator);
      } else {
        return `the number of colors is ${filterNumber.toSummary(value, operator)}`;
      }
    },
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
  function (this: colorContentFilter, value1: string[], operator: looseOpType, value2: string[]) {
    const actualOp = getActualOp(this, operator);
    return filterColorContents(value1, actualOp, value2);
  },
  {
    defaultOp: '<=' as opType,
    toSummary: (value: string[], operator: looseOpType) =>
      `the color identity is ${getActualOp(filterColorIdentityContents, operator)} ${value.join(
        ''
      )}`,
  }
);

export const filterColorContentsList: colorContentListFilter = Object.assign(
  (value1: string[][] | undefined, operator: looseOpType, value2: string[]) => {
    if (!value1) {
      return false;
    }
    const actualOp = operator === ':' ? filterColorIdentityContents.defaultOp : operator;
    return value1.some(set => filterColorContents(set, actualOp, value2));
  },
  {
    defaultOp: '=' as opType,
    toSummary: (value: string[], operator: looseOpType) => NOPRINT,
  }
);

/**
 * Compares two sets of colors for an identity search using an operator and returns a bool.
 * @param value1 The first set of colors to compare (must not include 'C' unless that is its only member; must not be empty)
 * @param operator The operator
 * @param value2 The second set or number of colors to compare
 * @returns boolean of whether the comparison is true
 */
export const filterColorIdentity: colorFilter = Object.assign(
  (value1: string[], operator: looseOpType, value2: string[] | number) => {
    if (typeof value2 == 'number') {
      return filterNumber(value1.length, operator, value2);
    } else {
      return filterColorIdentityContents(value1, operator, value2);
    }
  },
  {
    defaultOp: '<=' as opType,
    toSummary: (value: string[] | number, operator: looseOpType) => {
      if (Array.isArray(value)) {
        return filterColorIdentityContents.toSummary(value, operator);
      } else {
        return `the number of identity colors is ${filterNumber.toSummary(value, operator)}`;
      }
    },
  }
);

export const filterColorIndicator: colorListFilter = Object.assign(
  (value1: string[][] | undefined, operator: looseOpType, value2: string[] | number) => {
    if (!value1) {
      return false;
    }
    if (typeof value2 == 'number') {
      return value1.some(set => filterNumber(set.length, operator, value2));
    } else {
      return filterColorContentsList(value1, operator, value2);
    }
  },
  {
    defaultOp: '=' as opType,
    toSummary: (value: string[] | number, operator: looseOpType) => {
      if (Array.isArray(value)) {
        return `the color indicator is ${getActualOp(filterColorIndicator, operator)} ${value.join(
          ''
        )}`;
      } else {
        return `the number of indicator colors is ${filterNumber.toSummary(value, operator)}`;
      }
    },
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
 * Compares two sets of colors converting to misc using an operator and returns a bool.
 * @param value1 The first set of colors to compare (must not include 'C' unless that is its only member; must not be empty)
 * @param operator The operator
 * @param value2 The second set of colors to compare (can include 'C' alongside other members, in which case 'C' is treated as the only member; must not be empty)
 * @returns boolean of whether the comparison is true
 */
export const filterColorContentsMisc: colorContentFilter = Object.assign(
  function (this: colorContentFilter, value1: string[], operator: looseOpType, value2: string[]) {
    const actualOp = getActualOp(this, operator);
    return filterColorContents(colorMiscReduce(value1), actualOp, value2);
  },
  {
    defaultOp: '>=' as opType,
    toSummary: (value: string[], operator: looseOpType) => NOPRINT,
  }
);

/**
 * Compares two sets of colors for a identity search converting to misc using an operator and returns a bool.
 * @param value1 The first set of colors to compare (must not include 'C' unless that is its only member; must not be empty)
 * @param operator The operator
 * @param value2 The second set of colors to compare (can include 'C' alongside other members, in which case 'C' is treated as the only member; must not be empty)
 * @returns boolean of whether the comparison is true
 */
export const filterColorIdentityContentsMisc: colorContentFilter = Object.assign(
  function (this: colorContentFilter, value1: string[], operator: looseOpType, value2: string[]) {
    const actualOp = getActualOp(this, operator);
    return filterColorContents(colorMiscReduce(value1), actualOp, value2);
  },
  {
    defaultOp: '<=' as opType,
    toSummary: (value: string[], operator: looseOpType) => NOPRINT,
  }
);

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

const canContain = <T extends string[][] | string[]>(
  set1: T,
  set2: Exclude<string[][] | string[], T>
) => {
  if (set1.length && typeof set1[0] != 'string') {
    return (set2 as string[]).every(c => set1.some(set => (set as string[]).includes(c)));
  }
  if (set2.length && typeof set2[0] != 'string') {
    return (set2 as string[][]).every(set => set.some(c => (set1 as string[]).includes(c)));
  }
  return contains(set1 as string[], set2 as string[]);
};
/**
 * Compares two sets of colors using an operator and returns a bool.
 * @param value1 The set of hybrid colors to compare (must not include 'C'; can be empty)
 * @param operator The operator
 * @param value2 The set of colors to compare (can include 'C' alongside other members, in which case 'C' is treated as the only member; must not be empty)
 * @returns boolean of whether the comparison is true
 */
export const filterHybridIdentityContents: hybridContentFilter = Object.assign(
  function (
    this: hybridContentFilter,
    value1: string[][],
    operator: looseOpType,
    value2: string[]
  ) {
    const actualOp = getActualOp(this, operator);
    if (value2.includes('C')) {
      switch (actualOp) {
        case '<': {
          return false;
        }
        case '<=': {
          return value1.length == 0;
        }
        case '=': {
          return value1.length == 0;
        }
        case '>=': {
          return true;
        }
        case '>': {
          return value1.length != 0;
        }
        case '!=': {
          return value1.length != 0;
        }
      }
    } else {
      return containsOp(
        actualOp,
        canContain as (value1: any, value2: any) => boolean,
        value1,
        value2
      );
    }
  },
  {
    defaultOp: '<=' as opType,
    toSummary: (value: string[], operator: looseOpType) =>
      `the hybrid color identity is ${getActualOp(
        filterHybridIdentityContents,
        operator
      )} ${value.join('')}`,
  }
);

/**
 * Compares two sets of colors using an operator and returns a bool.
 * @param value1 The set of hybrid colors to compare (must not include 'C'; can be empty)
 * @param operator The operator
 * @param value2 The set of colors to compare (can include 'C' alongside other members, in which case 'C' is treated as the only member; must not be empty)
 * @returns boolean of whether the comparison is true
 */
export const filterHybridIdentityContentsMisc: hybridContentFilter = Object.assign(
  function (
    this: hybridContentFilter,
    value1: string[][],
    operator: looseOpType,
    value2: string[]
  ) {
    const actualOp = getActualOp(this, operator);
    return filterHybridIdentityContents(hybridIdentityMiscReduce(value1), actualOp, value2);
  },
  {
    defaultOp: '<=' as opType,
    toSummary: (value: string[], operator: looseOpType) => NOPRINT,
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
export const filterHybridIdentity: hybridFilter = Object.assign(
  (value1: string[][], operator: looseOpType, value2: string[] | number) => {
    if (typeof value2 == 'number') {
      return filterNumber(getHybridColorNumber(value1), operator, value2);
    } else {
      return filterHybridIdentityContents(value1, operator, value2);
    }
  },
  {
    defaultOp: '<=' as opType,
    toSummary: (value: string[] | number, operator: looseOpType) => {
      if (Array.isArray(value)) {
        return filterHybridIdentityContents.toSummary(value, operator);
      } else {
        return `the number of hybrid identity colors is ${filterNumber.toSummary(value, operator)}`;
      }
    },
  }
);
