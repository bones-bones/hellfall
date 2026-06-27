import { HCMiscColors } from '@hellfall/shared/types';
import { isInteger } from '@hellfall/shared/utils';
import { shorthandType } from '../types';

const shorthands: Record<string, shorthandType> = {
  colorless: 'c',
  multicolored: 'm',
  multi: 'm',
};
const colorNicknames: Record<string, string> = {
  white: 'W',
  blue: 'U',
  black: 'B',
  red: 'R',
  green: 'G',
  purple: 'P',
  azorius: 'WU',
  ojutai: 'WU',
  fatehold: 'WU',
  dimir: 'UB',
  silumgar: 'UB',
  theorix: 'UB',
  rakdos: 'BR',
  kolaghan: 'BR',
  stingerquill: 'BR',
  gruul: 'RG',
  atarka: 'RG',
  konstrari: 'RG',
  selesnya: 'GW',
  dromoka: 'GW',
  vigorbloom: 'GW',
  orzhov: 'WB',
  silverquill: 'WB',
  golgari: 'BG',
  witherbloom: 'BG',
  simic: 'GU',
  quandrix: 'GU',
  izzet: 'UR',
  prismari: 'UR',
  boros: 'RW',
  lorehold: 'RW',
  bant: 'GWU',
  esper: 'WUB',
  grixis: 'UBR',
  jund: 'BRG',
  naya: 'RGW',
  abzan: 'WBG',
  jeskai: 'URW',
  sultai: 'BGU',
  mardu: 'RWB',
  temur: 'GUR',
  chaos: 'UBRG',
  aggression: 'BRGW',
  altruism: 'RGWU',
  growth: 'GWUB',
  artifice: 'WUBR',
};

export const parseColorText = (text: string): string[] | number | shorthandType | undefined => {
  if (isInteger(text)) {
    return parseInt(text);
  }
  if (text.toLowerCase() in shorthands) {
    return shorthands[text.toLowerCase()];
  }
  if (Object.values(shorthands).includes(text.toLowerCase() as shorthandType)) {
    return text.toLowerCase() as shorthandType;
  }
  const colorList: string[] = [];
  let currentText = text.toLowerCase();
  if (currentText in colorNicknames) {
    currentText = colorNicknames[currentText];
  } else {
    HCMiscColors.forEach(color => {
      if (text.includes(color.toLowerCase())) {
        colorList.push(color);
        currentText = currentText.replaceAll(color.toLowerCase(), '');
      }
    });
    if (text.includes('misc')) {
      colorList.push('Misc');
      currentText = currentText.replaceAll('misc', '');
    }
  }
  const finalText = currentText.toUpperCase();
  const validColors = ['W', 'U', 'B', 'R', 'G', 'P'];
  for (const color of finalText) {
    if (!validColors.includes(color)) {
      return undefined;
    }
    if (!colorList.includes(color)) {
      colorList.push(color);
    }
  }
  return colorList;
};
