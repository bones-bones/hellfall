import { colors } from '@workday/canvas-kit-react';
import { HCColors } from '@hellfall/shared/types';
const MISC_BULLSHIT = 'Misc bullshit';
const miscColors = [
  'Pickle',
  'Yellow',
  'Brown',
  'Pink',
  'Teal',
  'Orange',
  'TEMU',
  'Cyan',
  'Gold',
  'Beige',
  'Grey',
]; //Object.values(HCMiscColor); /**as unknown as HCColor[] */

/**
 * Checks whether two color sets are the same colors.
 * @param colors1 The first set of colors to compare
 * @param colors2 The second set of colors to compare
 * @returns boolean of whether the sets are the same colors.
 */
export const sameColors = (colors1: HCColors | string[], colors2: HCColors | string[]) => {
  return (
    colors1.length == colors2.length &&
    (colors1 as string[]).every(color => (colors2 as string[]).includes(color))
  );
};
/**
 * Compares two sets of colors using an operator and returns a bool.
 * @param colors1 The first set of colors to compare (must not include 'C' unless that is its only member; must not be empty)
 * @param operator The operator
 * @param colors2 The second set of colors to compare (can include 'C' alongside other members, in which case 'C' is treated as the only member; must not be empty)
 * @returns boolean of whether the comparison is true
 */
export const colorCompOp = (
  colors1: HCColors | string[],
  operator: '<' | '<=' | '=' | '>=' | '>',
  colors2: HCColors | string[]
) => {
  if (colors2.includes('C')) {
    switch (operator) {
      case '<': {
        return false;
      }
      case '<=': {
        return colors1.length == 0;
      }
      case '=': {
        return colors1.length == 0;
      }
      case '>=': {
        return true;
      }
      case '>': {
        return colors1.length != 0;
      }
    }
  } else if (colors1.length == 0) {
    switch (operator) {
      case '<': {
        return true;
      }
      case '<=': {
        return true;
      }
      case '=': {
        return false;
      }
      case '>=': {
        return false;
      }
      case '>': {
        return false;
      }
    }
  } else {
    switch (operator) {
      case '<': {
        return (
          colors1.length < colors2.length &&
          (colors1 as string[]).every(color => (colors2 as string[]).includes(color))
        );
      }
      case '<=': {
        return (colors1 as string[]).every(color => (colors2 as string[]).includes(color));
      }
      case '=': {
        return (
          colors1.length == colors2.length &&
          (colors1 as string[]).every(color => (colors2 as string[]).includes(color))
        );
      }
      case '>=': {
        return (colors2 as string[]).every(color => (colors1 as string[]).includes(color));
      }
      case '>': {
        return (
          colors1.length > colors2.length &&
          (colors2 as string[]).every(color => (colors1 as string[]).includes(color))
        );
      }
    }
  }
};

/**
 * Reduces down a card's colors to one compatible with search colors.
 * @param colors card's colors
 * @returns
 */
export const colorMiscReduce = (colors: HCColors | string[]): string[] => {
  const newColors: string[] = [];
  colors
    .map(color => (miscColors.includes(color) ? MISC_BULLSHIT : color))
    .forEach(color => {
      if (!newColors.includes(color)) {
        newColors.push(color);
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
    .map(colorSet => {
      if (colorSet.some(color => miscColors.includes(color))) {
        const newSet: string[] = [MISC_BULLSHIT];
        colorSet
          .filter(color => !miscColors.includes(color))
          .forEach(color => {
            newSet.push(color);
          });
        return newSet;
      } else {
        return colorSet;
      }
    })
    .forEach(colors => {
      if (!newColors.some(colorSet => colorSet.every(color => colors.includes(color)))) {
        for (let i = newColors.length - 1; i >= 0; i--) {
          // if the new colorSet is completely inside the existing colorSet, delete the existing one
          if (colors.every(color => newColors[i].includes(color))) {
            newColors.splice(i, 1);
          }
        }
        newColors.push(colors);
      }
    });
  return newColors;
};

/**
 * Compares two sets of colors using an operator and returns a bool.
 * @param hybridColors The set of hybrid colors to compare (must not include 'C'; can be empty)
 * @param operator The operator
 * @param colors The set of colors to compare (can include 'C' alongside other members, in which case 'C' is treated as the only member; must not be empty)
 * @returns boolean of whether the comparison is true
 */
export const hybridColorCompOp = (
  hybridColors: HCColors[] | string[][],
  operator: '<' | '<=' | '=' | '>=' | '>',
  colors: HCColors | string[]
) => {
  if (colors.includes('C')) {
    switch (operator) {
      case '<': {
        return false;
      }
      case '<=': {
        return hybridColors.length == 0;
      }
      case '=': {
        return hybridColors.length == 0;
      }
      case '>=': {
        return true;
      }
      case '>': {
        return hybridColors.length != 0;
      }
    }
  } else if (hybridColors.length == 0) {
    switch (operator) {
      case '<': {
        return true;
      }
      case '<=': {
        return true;
      }
      case '=': {
        return false;
      }
      case '>=': {
        return false;
      }
      case '>': {
        return false;
      }
    }
  } else {
    const colorSet = [];

    switch (operator) {
      case '<': {
        return (
          (hybridColors as string[][]).every(colorSet =>
            colorSet.some(color => (colors as string[]).includes(color))
          ) &&
          !(colors as string[]).every(color =>
            (hybridColors as string[][]).some(colorSet => colorSet.includes(color))
          )
        );
      }
      case '<=': {
        return (hybridColors as string[][]).every(colorSet =>
          colorSet.some(color => (colors as string[]).includes(color))
        );
      }
      case '=': {
        return (
          (hybridColors as string[][]).every(colorSet =>
            colorSet.some(color => (colors as string[]).includes(color))
          ) &&
          (colors as string[]).every(color =>
            (hybridColors as string[][]).some(colorSet => colorSet.includes(color))
          )
        );
      }
      case '>=': {
        return (colors as string[]).every(color =>
          (hybridColors as string[][]).some(colorSet => colorSet.includes(color))
        );
      }
      case '>': {
        return (
          !(hybridColors as string[][]).every(colorSet =>
            colorSet.some(color => (colors as string[]).includes(color))
          ) &&
          (colors as string[]).every(color =>
            (hybridColors as string[][]).some(colorSet => colorSet.includes(color))
          )
        );
      }
    }
  }
};
