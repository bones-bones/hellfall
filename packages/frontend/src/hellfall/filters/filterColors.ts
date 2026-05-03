import { HCColors, HCMiscColors } from '@hellfall/shared/types';
import { colorFilter, hybridFilter, looseOpType, opType } from './types';
const MISC_BULLSHIT = 'Misc bullshit';
//Object.values(HCMiscColor); /**as unknown as HCColor[] */

/**
 * Checks whether two color sets are the same colors.
 * @param colors1 The first set of colors to compare
 * @param colors2 The second set of colors to compare
 * @returns boolean of whether the sets are the same colors.
 */
export const sameColors = (colors1: HCColors | string[], colors2: HCColors | string[]) => {
  return (
    colors1.length == colors2.length &&
    (colors1 as string[]).every(c => (colors2 as string[]).includes(c))
  );
};
const contains = (set1: string[], set2: string[]) => set2.every(c => set1.includes(c));
/**
 * Compares two sets of colors using an operator and returns a bool.
 * @param value1 The first set of colors to compare (must not include 'C' unless that is its only member; must not be empty)
 * @param operator The operator
 * @param value2 The second set of colors to compare (can include 'C' alongside other members, in which case 'C' is treated as the only member; must not be empty)
 * @returns boolean of whether the comparison is true
 */
export const filterColors: colorFilter = Object.assign(
  (value1: string[], operator: looseOpType, value2: string[]) => {
    const actualOp = operator === ':' ? filterColors.defaultOp : operator;
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
      switch (actualOp) {
        case '<': {
          return !contains(value1, value2) && contains(value2, value1);
        }
        case '<=': {
          return contains(value2, value1);
        }
        case '=': {
          return contains(value1, value2) && contains(value2, value1);
        }
        case '>=': {
          return contains(value1, value2);
        }
        case '>': {
          return contains(value1, value2) && !contains(value2, value1);
        }
        case '!=': {
          return !contains(value1, value2) || !contains(value2, value1);
        }
      }
    }
  },
  { defaultOp: '>=' as opType }
);

/**
 * Compares two sets of colors for a identity search using an operator and returns a bool.
 * @param value1 The first set of colors to compare (must not include 'C' unless that is its only member; must not be empty)
 * @param operator The operator
 * @param value2 The second set of colors to compare (can include 'C' alongside other members, in which case 'C' is treated as the only member; must not be empty)
 * @returns boolean of whether the comparison is true
 */
export const filterColorIdentity: colorFilter = Object.assign(
  (value1: string[], operator: looseOpType, value2: string[]) => {
    const actualOp = operator === ':' ? filterColorIdentity.defaultOp : operator;
    return filterColors(value1, actualOp, value2);
  },
  {
    defaultOp: '<=' as opType,
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
export const filterColorsMisc: colorFilter = Object.assign(
  (value1: string[], operator: looseOpType, value2: string[]) => {
    const actualOp = operator === ':' ? filterColorsMisc.defaultOp : operator;
    return filterColors(colorMiscReduce(value1), actualOp, value2);
  },
  {
    defaultOp: '>=' as opType,
  }
);
/**
 * Compares two sets of colors for a identity search converting to misc using an operator and returns a bool.
 * @param value1 The first set of colors to compare (must not include 'C' unless that is its only member; must not be empty)
 * @param operator The operator
 * @param value2 The second set of colors to compare (can include 'C' alongside other members, in which case 'C' is treated as the only member; must not be empty)
 * @returns boolean of whether the comparison is true
 */
export const filterColorIdentityMisc: colorFilter = Object.assign(
  (value1: string[], operator: looseOpType, value2: string[]) => {
    const actualOp = operator === ':' ? filterColorIdentityMisc.defaultOp : operator;
    return filterColors(colorMiscReduce(value1), actualOp, value2);
  },
  {
    defaultOp: '<=' as opType,
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
export const filterHybridIdentity: hybridFilter = Object.assign(
  (value1: string[][], operator: looseOpType, value2: string[]) => {
    const actualOp = operator === ':' ? filterColors.defaultOp : operator;
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
      switch (actualOp) {
        case '<': {
          return !canContain(value1, value2) && canContain(value2, value1);
        }
        case '<=': {
          return canContain(value2, value1);
        }
        case '=': {
          return canContain(value1, value2) && canContain(value2, value1);
        }
        case '>=': {
          return canContain(value1, value2);
        }
        case '>': {
          return canContain(value1, value2) && !canContain(value2, value1);
        }
        case '!=': {
          return !canContain(value1, value2) || !canContain(value2, value1);
        }
      }
    }
  },
  { defaultOp: '<=' as opType }
);

/**
 * Compares two sets of colors using an operator and returns a bool.
 * @param value1 The set of hybrid colors to compare (must not include 'C'; can be empty)
 * @param operator The operator
 * @param value2 The set of colors to compare (can include 'C' alongside other members, in which case 'C' is treated as the only member; must not be empty)
 * @returns boolean of whether the comparison is true
 */
export const filterHybridIdentityMisc: hybridFilter = Object.assign(
  (value1: string[][], operator: looseOpType, value2: string[]) => {
    const actualOp = operator === ':' ? filterHybridIdentityMisc.defaultOp : operator;
    return filterHybridIdentity(hybridIdentityMiscReduce(value1), actualOp, value2);
  },
  {
    defaultOp: '<=' as opType,
  }
);
