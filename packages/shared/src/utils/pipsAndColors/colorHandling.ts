import { HCCard, HCColor, HCColors, HCMiscColors } from '@hellfall/shared/types';
import { listsShare } from '../listHandling';

/**
 * The list of shorthands
 */
const shorthandList = ['c', 'm'] as const;
/**
 * A color search shorthand
 */
export type shorthandType = (typeof shorthandList)[number];
/**
 * Checks if a value is {@linkcode shorthandType}
 * @param value value to check
 */
export const isShorthandType = (value: any): value is shorthandType =>
  shorthandList.includes(value);
/**
 * A union of the types that can be the value for a color filter
 */
export type colorSearch = string[] | number | shorthandType;

const MISC_BULLSHIT = 'Misc';

/**
 * Gets all subsets of a given length from a set
 * @param set set to get the subsets of
 * @param len length of subsets to get
 */
const getSubsets = (set: string[], len?: number): string[][] => {
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
/**
 * Finds the minimum number of colors that can match a hybrid identity
 * @param hybridColors hybrid identity to check
 */
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
/**
 * Gets the number of colors from a hybrid identity for number comparisons
 * @param hybrid hybrid identity array to get the number from
 */
export const getHybridColorNumber = (hybrid: string[][]) => {
  const monoList = hybrid.flatMap(colors => (colors.length == 1 ? colors : []));
  const hybridColors = hybrid.filter(colors => colors.length > 1);
  return monoList.length + findMinNum(hybridColors);
};

/**
 * Reduces down a set of colors to one compatible with misc searches by replacing all misc colors with {@linkcode MISC_BULLSHIT} and removing resultant duplicates
 * @param colors colors to reduce
 */
export const colorMiscReduce = (colors: HCColors | string[]): string[] => {
  const newColors: string[] = [];
  colors
    .map(c => (HCMiscColors.includes(c as HCColor) ? MISC_BULLSHIT : c))
    .forEach(c => {
      if (!newColors.includes(c)) {
        newColors.push(c);
      }
    });
  return newColors;
};

/**
 * Reduces down a hybrid identity set to one compatible with misc searches by replacing all misc colors with {@linkcode MISC_BULLSHIT} and removing resultant duplicates
 * @param hybridColors hybrid identity to reduce
 */
export const hybridIdentityMiscReduce = (hybridColors: HCColors[] | string[][]): string[][] => {
  const newColors: string[][] = [];
  hybridColors
    .map(set => {
      if (set.some(c => HCMiscColors.includes(c as HCColor))) {
        const newSet: string[] = [MISC_BULLSHIT];
        set
          .filter(c => !HCMiscColors.includes(c as HCColor))
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

const choose2List = ['choose-2-colors', 'choose-2-allied-colors'];

/**
 * Checks if a card has unusual values for color props
 * @param card card to check
 */
export const shouldChoose2 = (card: HCCard.Any) => listsShare(choose2List, card.tags);

/**
 * Correctly handles cards with unusual values for color props
 * @param card card to get the colors of
 * @param normalColors the normal colors for the prop
 * @param value the value that the colors will be compared to
 * @returns the colors to compare; if {@linkcode shouldChoose2 | !shouldChoose2(card)}, will return `normalColors`
 */
export const handleChooseColors = (
  card: HCCard.Any,
  normalColors: HCColors,
  value: string[] | number | shorthandType
): HCColors => {
  if (!shouldChoose2(card)) {
    return normalColors;
  }
  if (!Array.isArray(value)) {
    return ['W', 'U'];
  }
  const colors: HCColors = ['W', 'U', 'B', 'R', 'G'];
  const retList: HCColors = [];
  if (!card.tags?.includes('choose-2-colors')) {
    for (const color of value as HCColors) {
      const pos = colors.indexOf(color);
      if (pos == -1) continue;
      if (value.includes(colors[(pos - 1) % 5])) {
        retList.push(colors[(pos - 1) % 5]);
        retList.push(color);
        return retList;
      }
      if (value.includes(colors[(pos + 1) % 5])) {
        retList.push(color);
        retList.push(colors[(pos + 1) % 5]);
        return retList;
      }
    }
    for (const color of value as HCColors) {
      const pos = colors.indexOf(color);
      if (pos == -1) continue;
      retList.push(color);
      retList.push(colors[(pos + 1) % 5]);
      return retList;
    }
    return ['W', 'U'];
  }
  for (const color of value as HCColors) {
    if (!colors.includes(color)) continue;
    const otherColor = colors.find(other => other != color && value.includes(other));
    if (otherColor) {
      return [color, otherColor];
    }
  }
  for (const color of value as HCColors) {
    const pos = colors.indexOf(color);
    if (pos == -1) continue;
    retList.push(color);
    retList.push(colors[(pos + 1) % 5]);
    return retList;
  }
  return ['W', 'U'];
};

/**
 * Correctly handles cards with unusual values for color props
 * @param card card to get the colors of
 * @param normalColors the normal hybrid colors for the prop
 * @param value the value that the colors will be compared to
 * @returns the hybrid colors to compare; if {@linkcode shouldChoose2 | !shouldChoose2(card)}, will return `normalColors`
 */
export const handleChooseHybrid = (
  card: HCCard.Any,
  normalColors: HCColors[],
  value: string[] | number | shorthandType
): HCColors[] => {
  if (!listsShare(choose2List, card.tags)) {
    return normalColors;
  }
  return handleChooseColors(card, [], value).map(color => [color]);
};
