import { HCCard, HCColor, HCColors, HCMiscColors } from '@hellfall/shared/types';
import { listsShare } from './listHandling';

/**
 * The list of shorthands
 */
const shorthandList = ['c', 'm'] as const;
/**
 * A color search shorthand
 */
export type shorthandType = (typeof shorthandList)[number];
export const isShorthandType = (value: any): value is shorthandType =>
  shorthandList.includes(value);
/**
 * A union of the types that can be the value for a color filter
 */
export type colorSearch = string[] | number | shorthandType;

const MISC_BULLSHIT = 'Misc';

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
 * Reduces down a card's colors to one compatible with search colors.
 * @param colors card's colors
 * @returns
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
 * Reduces down a card's hybrid identity set to one compatible with search colors.
 * @param hybridColors hybrid color identity
 * @returns
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

export const shouldChoose2 = (card: HCCard.Any) => listsShare(choose2List, card.tags);

/**
 * Correctly handles cards with unusual values for color props
 * @param card card to get the colors of
 * @param normalColors the normal colors for the prop
 * @param value the value that the colors will be compared to
 * @returns the colors to compare
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
 * @returns the hybrid colors to compare
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
