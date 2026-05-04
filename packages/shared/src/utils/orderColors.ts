import { HCColors, HCCoreColors, HCMiscColors } from '../types';
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
