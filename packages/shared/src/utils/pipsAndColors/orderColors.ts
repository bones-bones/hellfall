import { HCColors, HCCoreColors, HCMiscColors } from '@hellfall/shared/types';
import {
  listsAreLooselyEqual,
  listsOrValuesShare,
  listsShare,
  pushProp,
  removeIntersection,
  toUnion,
} from '../listHandling';
const colorOrderList: HCColors[] = [
  ['W'],
  ['U'],
  ['B'],
  ['R'],
  ['G'],
  ['P'],
  ['W', 'U'],
  ['U', 'B'],
  ['B', 'R'],
  ['R', 'G'],
  ['G', 'W'],
  ['W', 'B'],
  ['B', 'G'],
  ['G', 'U'],
  ['U', 'R'],
  ['R', 'W'],
  ['W', 'P'],
  ['U', 'P'],
  ['P', 'B'],
  ['P', 'R'],
  ['P', 'G'],
  ['G', 'W', 'U'],
  ['W', 'U', 'B'],
  ['U', 'B', 'R'],
  ['B', 'R', 'G'],
  ['R', 'G', 'W'],
  ['W', 'B', 'G'],
  ['U', 'R', 'W'],
  ['B', 'G', 'U'],
  ['R', 'W', 'B'],
  ['G', 'U', 'R'],
  ['B', 'G', 'P'],
  ['B', 'W', 'P'],
  ['G', 'P', 'R'],
  ['P', 'B', 'R'],
  ['P', 'G', 'U'],
  ['P', 'R', 'U'],
  ['U', 'P', 'B'],
  ['W', 'P', 'G'],
  ['W', 'P', 'R'],
  ['W', 'U', 'P'],
  ['W', 'U', 'P', 'B'],
  ['U', 'P', 'B', 'R'],
  ['P', 'B', 'R', 'G'],
  ['B', 'R', 'G', 'W'],
  ['R', 'G', 'W', 'U'],
  ['G', 'W', 'U', 'P'],
  ['W', 'P', 'B', 'R'],
  ['U', 'B', 'R', 'G'],
  ['P', 'R', 'G', 'W'],
  ['G', 'W', 'U', 'B'],
  ['R', 'W', 'U', 'P'],
  ['G', 'U', 'P', 'B'],
  ['W', 'U', 'B', 'R'],
  ['U', 'P', 'R', 'G'],
  ['P', 'B', 'G', 'W'],
  ['W', 'U', 'B', 'R', 'G'],
  ['U', 'P', 'B', 'R', 'G'],
  ['P', 'B', 'R', 'G', 'W'],
  ['R', 'G', 'W', 'U', 'P'],
  ['G', 'W', 'U', 'P', 'B'],
  ['W', 'U', 'P', 'B', 'R'],
  ['W', 'U', 'P', 'B', 'R', 'G'],
];

/**
 * Orders a set of colors. Also eliminates duplicates
 * @param colors colors to order
 */
export const orderColors = (colors: HCColors): HCColors => {
  if (colors.length < 2) {
    return colors;
  }
  const colorList: HCColors = [];
  const coreList: HCColors = [];
  colors.forEach(color => {
    if (HCCoreColors.includes(color) && !coreList.includes(color)) {
      coreList.push(color);
    }
  });
  if (coreList.length) {
    const ordered = colorOrderList.find(order => {
      if (order.length != coreList.length) {
        return false;
      }
      for (const color of order) {
        if (!coreList.includes(color)) {
          return false;
        }
      }
      return true;
    })!;
    colorList.push(...ordered);
  }
  HCMiscColors.forEach(color => {
    if (colors.includes(color)) {
      colorList.push(color);
    }
  });
  return colorList;
};

const orderColorGroups = (groupedColors: HCColors[], groupLen: number): HCColors[] => {
  const sortColors = (a: HCColors, b: HCColors): number => {
    if (listsShare(a, HCMiscColors) != listsShare(b, HCMiscColors)) {
      return listsShare(a, HCMiscColors) ? 1 : -1;
    }
    if (listsShare(a, HCMiscColors)) {
      for (let i = 0; i < a.length; i++) {
        if (listsOrValuesShare(a[i], HCMiscColors) && listsOrValuesShare(b[i], HCMiscColors)) {
          if (a[i] == b[i]) {
            continue;
          }
          return HCMiscColors.indexOf(a[i]) - HCMiscColors.indexOf(b[i]);
        }
        if (listsOrValuesShare(a[i], HCMiscColors)) {
          return 1;
        }
        if (listsOrValuesShare(b[i], HCMiscColors)) {
          return -1;
        }
      }
      const first = a.findIndex(color => HCMiscColors.includes(color));
      return sortColors(a.slice(0, first), b.slice(0, first));
    }
    const shareNum = a.reduce((acc, color) => (b.includes(color) ? acc + 1 : acc), 0);
    switch (shareNum) {
      case 0: {
        // groupLen can be 2 or 3
        const all = toUnion(a, b);
        const first = colorOrderList.find(order => listsAreLooselyEqual(order, all))?.[0]!;
        return a.includes(first) ? -1 : 1;
      }
      case 1: {
        // groupLen can be 2 or 3
        const all = toUnion(a, b);
        const order = colorOrderList.find(order => listsAreLooselyEqual(order, all))!;
        switch (a.length) {
          case 2: {
            if (
              !listsAreLooselyEqual(a, [order[0], order[2]]) &&
              !listsAreLooselyEqual(b, [order[0], order[2]])
            ) {
              return listsAreLooselyEqual(a, order.slice(0, 2)) ? -1 : 1;
            }
            if (
              !listsAreLooselyEqual(a, order.slice(0, 2)) &&
              !listsAreLooselyEqual(b, order.slice(0, 2))
            ) {
              return listsAreLooselyEqual(a, order.slice(1, 3)) ? -1 : 1;
            }
            return listsAreLooselyEqual(a, [order[0], order[2]]) ? -1 : 1;
          }
          case 3: {
            for (const color of order) {
              if (a.includes(color) && b.includes(color)) {
                continue;
              }
              return a.includes(color) ? -1 : 1;
            }
          }
        }
        console.error(); // this should be impossible unless I got my logic wrong
        return 0;
      }
      case 2: {
        // groupLen can be 3 or 4
        switch (a.length) {
          case 3: {
            const { set1, set2 } = removeIntersection(a, b);
            const all = [set1[0], set2[0]];
            const order = colorOrderList.find(order => listsAreLooselyEqual(order, all))!;
            return set1[0] == order[0] ? -1 : 1;
          }
          case 4: {
            const { set1, set2 } = removeIntersection(a, b);
            return sortColors(set1, set2);
          }
        }
        console.error(); // this should be impossible unless I got my logic wrong
        return 0;
      }
      case 3: {
        // groupLen is 4
        if (a.length == 4) {
          const { set1, set2 } = removeIntersection(a, b);
          const all = [set1[0], set2[0]];
          const order = colorOrderList.find(order => listsAreLooselyEqual(order, all))!;
          return set1[0] == order[0] ? -1 : 1;
        }
        console.error(); // this should be impossible unless I got my logic wrong
        return 0;
      }
      case 4: {
        // groupLen is 5
        if (a.length == 5) {
          const { set1, set2 } = removeIntersection(a, b);
          const all = [set1[0], set2[0]];
          const order = colorOrderList.find(order => listsAreLooselyEqual(order, all))!;
          return set1[0] == order[0] ? -1 : 1;
        }
        console.error(); // this should be impossible unless I got my logic wrong
        return 0;
      }
    }
    console.error(); // this should be impossible unless I got my logic wrong
    return 0;
  };
  const colors = groupedColors.map(colors => orderColors(colors)) as Array<
    { length: typeof groupLen } & HCColors
  >;
  if (colors.length < 2 || groupLen < 1) {
    return colors;
  }
  if (groupLen == 1) {
    return orderColors(colors.flat()).map(color => [color]);
  }
  return colors.sort(sortColors);
};

/**
 * Orders a set of hybrid colors. Also eliminates duplicates
 * @param hybridColors hybrid colors to order
 */
export const orderHybrid = (hybridColors: HCColors[]): HCColors[] => {
  const colorNumberRecord: Record<number, HCColors[]> = {};
  if (!hybridColors.length) {
    return [];
  }
  hybridColors.forEach(colorSet => pushProp(colorNumberRecord, colorSet.length, colorSet));
  const colorNums = Object.keys(colorNumberRecord).map(Number).sort();
  const newHybrid: HCColors[] = [];
  colorNums.forEach(i => newHybrid.push(...orderColorGroups(colorNumberRecord[i], i)));
  return newHybrid;
};
