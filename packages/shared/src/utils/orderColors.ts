import { HCColors, HCCoreColors, HCMiscColors } from '@hellfall/shared/types';
import { listEquals, listShare, pushProp, removeIntersection, toUnion } from './listHandling';
const colorOrderList: string[] = [
  'W',
  'U',
  'B',
  'R',
  'G',
  'P',
  'WU',
  'UB',
  'BR',
  'RG',
  'GW',
  'WB',
  'BG',
  'GU',
  'UR',
  'RW',
  'WP',
  'UP',
  'PB',
  'PR',
  'PG',
  'GWU',
  'WUB',
  'UBR',
  'BRG',
  'RGW',
  'WBG',
  'URW',
  'BGU',
  'RWB',
  'GUR',
  'BGP',
  'BWP',
  'GPR',
  'PBR',
  'PGU',
  'PRU',
  'UPB',
  'WPG',
  'WPR',
  'WUP',
  'WUPB',
  'UPBR',
  'PBRG',
  'BRGW',
  'RGWU',
  'GWUP',
  'WPBR',
  'UBRG',
  'PRGW',
  'GWUB',
  'RWUP',
  'GUPB',
  'WUBR',
  'UPRG',
  'PBGW',
  'WUBRG',
  'UPBRG',
  'PBRGW',
  'RGWUP',
  'GWUPB',
  'WUPBR',
  'WUPBRG',
];

export const orderColors = (colors: string[]) => {
  if (colors.length < 2) {
    return colors;
  }
  const colorList: string[] = [];
  const coreList: string[] = [];
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
    });
    colorList.push(...ordered?.split('')!);
  }
  HCMiscColors.forEach(color => {
    if (colors.includes(color)) {
      colorList.push(color);
    }
  });
  return colorList;
};

export const orderColorGroups = (groupedColors: string[][], groupLen: number): string[][] => {
  const sortColors = (a: string[], b: string[]): number => {
    if (listShare(a, HCMiscColors) != listShare(b, HCMiscColors)) {
      return listShare(a, HCMiscColors) ? 1 : -1;
    }
    if (listShare(a, HCMiscColors)) {
      for (let i = 0; i < a.length; i++) {
        if (listShare(a[i], HCMiscColors) && listShare(b[i], HCMiscColors)) {
          if (a[i] == b[i]) {
            continue;
          }
          return HCMiscColors.indexOf(a[i]) - HCMiscColors.indexOf(b[i]);
        }
        if (listShare(a[i], HCMiscColors)) {
          return 1;
        }
        if (listShare(b[i], HCMiscColors)) {
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
        const first = colorOrderList.find(order => listEquals(order.split(''), all))?.[0]!;
        return a.includes(first) ? -1 : 1;
      }
      case 1: {
        // groupLen can be 2 or 3
        const all = toUnion(a, b);
        const order = colorOrderList.find(order => listEquals(order.split(''), all))!;
        switch (a.length) {
          case 2: {
            if (!listEquals(a, [order[0], order[2]]) && !listEquals(b, [order[0], order[2]])) {
              return listEquals(a, order.slice(0, 2).split('')) ? -1 : 1;
            }
            if (
              !listEquals(a, order.slice(0, 2).split('')) &&
              !listEquals(b, order.slice(0, 2).split(''))
            ) {
              return listEquals(a, order.slice(1, 3).split('')) ? -1 : 1;
            }
            return listEquals(a, [order[0], order[2]]) ? -1 : 1;
          }
          case 3: {
            for (const char of order) {
              if (a.includes(char) && b.includes(char)) {
                continue;
              }
              return a.includes(char) ? -1 : 1;
            }
          }
        }
        throw console.error(); // this should be impossible unless I got my logic wrong
      }
      case 2: {
        // groupLen can be 3 or 4
        switch (a.length) {
          case 3: {
            const { set1, set2 } = removeIntersection(a, b);
            const all = [set1[0], set2[0]];
            const order = colorOrderList.find(order => listEquals(order.split(''), all))!;
            return set1[0] == order[0] ? -1 : 1;
          }
          case 4: {
            const { set1, set2 } = removeIntersection(a, b);
            return sortColors(set1, set2);
          }
        }
        throw console.error(); // this should be impossible unless I got my logic wrong
      }
      case 3: {
        // groupLen is 4
        if (a.length == 4) {
          const { set1, set2 } = removeIntersection(a, b);
          const all = [set1[0], set2[0]];
          const order = colorOrderList.find(order => listEquals(order.split(''), all))!;
          return set1[0] == order[0] ? -1 : 1;
        }
        throw console.error(); // this should be impossible unless I got my logic wrong
      }
      case 4: {
        // groupLen is 5
        if (a.length == 5) {
          const { set1, set2 } = removeIntersection(a, b);
          const all = [set1[0], set2[0]];
          const order = colorOrderList.find(order => listEquals(order.split(''), all))!;
          return set1[0] == order[0] ? -1 : 1;
        }
        throw console.error(); // this should be impossible unless I got my logic wrong
      }
    }
    throw console.error(); // this should be impossible unless I got my logic wrong
  };
  const colors = groupedColors.map(colors => orderColors(colors)) as Array<
    { length: typeof groupLen } & string[]
  >;
  if (colors.length < 2 || groupLen < 1) {
    return colors;
  }
  if (groupLen == 1) {
    return orderColors(colors.flat()).map(color => [color]);
  }
  return colors.sort(sortColors);
};

export const orderHybrid = (hybridColors: string[][]): string[][] => {
  const colorNumberRecord: Record<number, string[][]> = {};
  if (!hybridColors.length) {
    return [];
  }
  hybridColors.forEach(colorSet => pushProp(colorNumberRecord, colorSet.length, colorSet));
  const colorNums = Object.keys(colorNumberRecord).map(Number).sort();
  const newHybrid: string[][] = [];
  colorNums.forEach(i => newHybrid.push(...orderColorGroups(colorNumberRecord[i], i)));
  return newHybrid;
};
